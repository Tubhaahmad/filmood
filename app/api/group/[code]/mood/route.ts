import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { moodMap } from "@/lib/moodMap";
import { resolveSession, resolveParticipant } from "@/lib/group-api";
import { buildSharedDeck } from "@/lib/deck";

// POST /api/group/[code]/mood
// Save a participant's private mood selections.
// When all participants have submitted, build the shared movie deck
// and transition the session to "swiping".
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const user = await getAuthUser(request);
  let body: { moods?: string[]; participantId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { moods, participantId } = body;

  // Validate moods array
  if (!Array.isArray(moods) || moods.length === 0) {
    return NextResponse.json(
      { error: "At least one mood is required" },
      { status: 400 },
    );
  }

  const validMoods = moods.filter((m) => m in moodMap);
  if (validMoods.length === 0) {
    return NextResponse.json(
      { error: "No valid moods provided" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; status: string; created_at: string;
    }>(supabase, code);
    if (sessionErr) return sessionErr;

    if (session.status !== "mood") {
      return NextResponse.json(
        { error: "Session is not in mood selection phase" },
        { status: 400 },
      );
    }

    const { participant, error: partErr } = await resolveParticipant<{
      id: string; mood_selections: string[] | null;
    }>(supabase, session.id, user, participantId ?? null, "id, mood_selections");
    if (partErr) return partErr;

    if (participant.mood_selections && participant.mood_selections.length > 0) {
      return NextResponse.json(
        { error: "You have already submitted your moods" },
        { status: 409 },
      );
    }

    // Save mood selections
    const { error: updateError } = await supabase
      .from("session_participants")
      .update({ mood_selections: validMoods })
      .eq("id", participant.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save moods" },
        { status: 500 },
      );
    }

    // Check if all participants have now submitted
    const { data: allParticipants } = await supabase
      .from("session_participants")
      .select("mood_selections")
      .eq("session_id", session.id);

    const total = allParticipants?.length ?? 0;
    const submitted = allParticipants?.filter(
      (p) => p.mood_selections && p.mood_selections.length > 0,
    ).length ?? 0;

    if (submitted < total) {
      return NextResponse.json({
        submitted: true,
        allDone: false,
        progress: { submitted, total },
      });
    }

    // All done — build the shared deck
    const deck = await buildSharedDeck(allParticipants!);

    // Save deck and transition to swiping
    const { error: deckError } = await supabase
      .from("sessions")
      .update({ movie_deck: deck, status: "swiping" })
      .eq("id", session.id);

    if (deckError) {
      return NextResponse.json(
        { error: "Failed to build deck" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      submitted: true,
      allDone: true,
      deckSize: deck.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit moods";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

