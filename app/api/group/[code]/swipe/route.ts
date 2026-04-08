import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { resolveSession, resolveParticipant } from "@/lib/group-api";
import type { DeckFilm, SwipeVote } from "@/lib/types";

const VALID_VOTES: SwipeVote[] = ["yes", "no", "maybe"];

// GET /api/group/[code]/swipe
// Returns the current participant's swipe progress for this session.
// Used to resume swiping after a page refresh.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const user = await getAuthUser(request);
  const participantId = request.nextUrl.searchParams.get("participantId");

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; status: string; movie_deck: DeckFilm[] | null; created_at: string;
    }>(supabase, code, "id, status, movie_deck, created_at");
    if (sessionErr) return sessionErr;

    if (session.status !== "swiping" && session.status !== "done") {
      return NextResponse.json(
        { error: "Session is not in swiping phase" },
        { status: 400 },
      );
    }

    const { participant, error: partErr } = await resolveParticipant<{
      id: string; has_swiped: boolean;
    }>(supabase, session.id, user, participantId, "id, has_swiped");
    if (partErr) return partErr;

    // Fetch this participant's existing swipes
    const { data: swipes } = await supabase
      .from("swipes")
      .select("movie_id, vote")
      .eq("session_id", session.id)
      .eq("participant_id", participant.id);

    // Fetch all participants' completion status
    const { data: allParticipants } = await supabase
      .from("session_participants")
      .select("id, user_id, nickname, has_swiped")
      .eq("session_id", session.id);

    const deck: DeckFilm[] = session.movie_deck ?? [];
    const votedIds = new Set((swipes ?? []).map((s) => s.movie_id));

    return NextResponse.json({
      sessionId: session.id,
      deck,
      swipes: swipes ?? [],
      progress: {
        swiped: votedIds.size,
        total: deck.length,
      },
      participants: (allParticipants ?? []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        nickname: p.nickname,
        has_swiped: p.has_swiped,
      })),
      sessionStatus: session.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load swipe state";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/group/[code]/swipe
// Records an individual vote (yes/no/maybe) on a movie.
// Tracks completion: marks participant as done when they've swiped all cards.
// Transitions session to "done" when every participant finishes.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const user = await getAuthUser(request);
  let body: { participantId?: string; movieId?: number; vote?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { participantId, movieId, vote } = body;

  // Validate vote
  if (!vote || !VALID_VOTES.includes(vote as SwipeVote)) {
    return NextResponse.json(
      { error: "Vote must be yes, no, or maybe" },
      { status: 400 },
    );
  }

  if (movieId === undefined || movieId === null) {
    return NextResponse.json(
      { error: "movieId is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; status: string; movie_deck: DeckFilm[] | null; created_at: string;
    }>(supabase, code, "id, status, movie_deck, created_at");
    if (sessionErr) return sessionErr;

    if (session.status !== "swiping") {
      return NextResponse.json(
        { error: "Session is not in swiping phase" },
        { status: 400 },
      );
    }

    // Validate movie exists in the deck
    const deck: DeckFilm[] = session.movie_deck ?? [];
    const movieExists = deck.some((film) => film.id === movieId);

    if (!movieExists) {
      return NextResponse.json(
        { error: "Movie is not in this session's deck" },
        { status: 400 },
      );
    }

    const { participant, error: partErr } = await resolveParticipant<{
      id: string; has_swiped: boolean;
    }>(supabase, session.id, user, participantId ?? null, "id, has_swiped");
    if (partErr) return partErr;

    if (participant.has_swiped) {
      return NextResponse.json(
        { error: "You have already finished swiping" },
        { status: 409 },
      );
    }

    // Insert the swipe vote — unique constraint (session_id, participant_id, movie_id)
    // prevents duplicate votes on the same movie
    const { error: swipeError } = await supabase.from("swipes").insert({
      session_id: session.id,
      participant_id: participant.id,
      movie_id: movieId,
      vote: vote as SwipeVote,
    });

    if (swipeError) {
      // Unique constraint violation = duplicate vote
      if (swipeError.code === "23505") {
        return NextResponse.json(
          { error: "Already voted on this movie" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 },
      );
    }

    // Count how many movies this participant has now swiped
    const { count: swipeCount } = await supabase
      .from("swipes")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session.id)
      .eq("participant_id", participant.id);

    const totalInDeck = deck.length;
    const participantDone = (swipeCount ?? 0) >= totalInDeck;

    // Mark participant as done if they've swiped all cards
    if (participantDone) {
      await supabase
        .from("session_participants")
        .update({ has_swiped: true })
        .eq("id", participant.id);
    }

    // Check if all participants are now done
    let allDone = false;

    if (participantDone) {
      const { data: allParticipants } = await supabase
        .from("session_participants")
        .select("has_swiped")
        .eq("session_id", session.id);

      allDone = (allParticipants ?? []).every((p) => p.has_swiped);

      if (allDone) {
        await supabase
          .from("sessions")
          .update({ status: "done" })
          .eq("id", session.id);
      }
    }

    return NextResponse.json({
      recorded: true,
      progress: {
        swiped: swipeCount ?? 0,
        total: totalInDeck,
      },
      participantDone,
      allDone,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record vote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
