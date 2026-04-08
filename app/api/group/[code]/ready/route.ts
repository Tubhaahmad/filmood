import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { resolveSession, resolveParticipant } from "@/lib/group-api";

// POST /api/group/[code]/ready
// Toggles the is_ready flag for the calling participant.
// Auth optional — guests identify via participantId in the body.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getAuthUser(request);
  const { code } = await params;

  let participantId: string | null = null;
  try {
    const body = await request.json();
    participantId = body.participantId ?? null;
  } catch {
    // No body is fine for authenticated users
  }

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; status: string; created_at: string;
    }>(supabase, code);
    if (sessionErr) return sessionErr;

    if (session.status !== "lobby") {
      return NextResponse.json(
        { error: "Session is not in lobby state" },
        { status: 400 },
      );
    }

    const { participant, error: partErr } = await resolveParticipant<{
      id: string; is_ready: boolean;
    }>(supabase, session.id, user, participantId, "id, is_ready");
    if (partErr) return partErr;

    // Toggle the ready state
    const newReady = !participant.is_ready;

    const { error: updateError } = await supabase
      .from("session_participants")
      .update({ is_ready: newReady })
      .eq("id", participant.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update ready state" },
        { status: 500 },
      );
    }

    return NextResponse.json({ is_ready: newReady });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle ready";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
