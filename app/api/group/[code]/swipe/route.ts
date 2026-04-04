import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { isSessionExpired } from "@/lib/group";
import type { Film, SwipeVote } from "@/lib/types";

const VALID_VOTES: SwipeVote[] = ["yes", "no", "maybe"];

// GET /api/group/[code]/swipe
// Returns the current participant's swipe progress for this session.
// Used to resume swiping after a page refresh
// movies that have already been voted on.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  const user = await getAuthUser(request);
  const participantId = request.nextUrl.searchParams.get("participantId");

  if (!user && !participantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Fetch session with movie deck
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, status, movie_deck, created_at")
      .eq("code", upperCode)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      );
    }

    if (isSessionExpired(session.created_at)) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 410 },
      );
    }

    if (session.status !== "swiping" && session.status !== "done") {
      return NextResponse.json(
        { error: "Session is not in swiping phase" },
        { status: 400 },
      );
    }

    // Find the participant
    const participantQuery = supabase
      .from("session_participants")
      .select("id, has_swiped")
      .eq("session_id", session.id);

    if (user) {
      participantQuery.eq("user_id", user.id);
    } else {
      participantQuery.eq("id", participantId!);
    }

    const { data: participant } = await participantQuery.single();

    if (!participant) {
      return NextResponse.json(
        { error: "You are not in this session" },
        { status: 403 },
      );
    }

    // Fetch this participant's existing swipes
    const { data: swipes } = await supabase
      .from("swipes")
      .select("movie_id, vote")
      .eq("session_id", session.id)
      .eq("participant_id", participant.id);

    // Fetch all participants' completion status
    const { data: allParticipants } = await supabase
      .from("session_participants")
      .select("id, nickname, has_swiped")
      .eq("session_id", session.id);

    const deck: Film[] = session.movie_deck ?? [];
    const votedIds = new Set((swipes ?? []).map((s) => s.movie_id));

    return NextResponse.json({
      deck,
      swipes: swipes ?? [],
      progress: {
        swiped: votedIds.size,
        total: deck.length,
      },
      participants: (allParticipants ?? []).map((p) => ({
        id: p.id,
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
  const upperCode = code.toUpperCase();

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

  if (!user && !participantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Fetch session with movie deck
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, status, movie_deck, created_at")
      .eq("code", upperCode)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      );
    }

    if (isSessionExpired(session.created_at)) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 410 },
      );
    }

    if (session.status !== "swiping") {
      return NextResponse.json(
        { error: "Session is not in swiping phase" },
        { status: 400 },
      );
    }

    // Validate movie exists in the deck
    const deck: Film[] = session.movie_deck ?? [];
    const movieExists = deck.some((film) => film.id === movieId);

    if (!movieExists) {
      return NextResponse.json(
        { error: "Movie is not in this session's deck" },
        { status: 400 },
      );
    }

    // Find the participant
    const participantQuery = supabase
      .from("session_participants")
      .select("id, has_swiped")
      .eq("session_id", session.id);

    if (user) {
      participantQuery.eq("user_id", user.id);
    } else {
      participantQuery.eq("id", participantId!);
    }

    const { data: participant } = await participantQuery.single();

    if (!participant) {
      return NextResponse.json(
        { error: "You are not in this session" },
        { status: 403 },
      );
    }

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
