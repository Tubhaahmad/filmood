import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { classifyTier } from "@/lib/group";
import { resolveSession } from "@/lib/group-api";
import type {
  DeckFilm,
  SwipeVote,
  MatchResult,
  GroupResultsPayload,
} from "@/lib/types";

// Point values for each vote type
const VOTE_POINTS: Record<SwipeVote, number> = {
  yes: 2,
  maybe: 1,
  no: 0,
};

// GET /api/group/[code]/results
// Calculates match results for a finished group session.
// Requires: session in "done" status, caller must be a participant.
// Returns films grouped into three tiers with a top pick.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const user = await getAuthUser(request);
  const participantIdParam = request.nextUrl.searchParams.get("participantId");

  if (!user && !participantIdParam) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; code: string; status: string; movie_deck: DeckFilm[] | null; created_at: string;
    }>(supabase, code, "id, code, status, movie_deck, created_at");
    if (sessionErr) return sessionErr;

    if (session.status !== "done") {
      return NextResponse.json(
        { error: "Results are not ready yet" },
        { status: 400 },
      );
    }

    // Fetch participants — we need them to verify membership and to label votes
    const { data: participants, error: participantsError } = await supabase
      .from("session_participants")
      .select("id, user_id, nickname")
      .eq("session_id", session.id)
      .order("joined_at", { ascending: true });

    if (participantsError || !participants) {
      return NextResponse.json(
        { error: "Failed to load participants" },
        { status: 500 },
      );
    }

    // Verify the caller is a participant in this session
    const isParticipant = user
      ? participants.some((p) => p.user_id === user.id)
      : participants.some((p) => p.id === participantIdParam);

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not in this session" },
        { status: 403 },
      );
    }

    // Fetch every swipe for the session in one query
    const { data: swipes, error: swipesError } = await supabase
      .from("swipes")
      .select("participant_id, movie_id, vote")
      .eq("session_id", session.id);

    if (swipesError) {
      return NextResponse.json(
        { error: "Failed to load votes" },
        { status: 500 },
      );
    }

    const deck: DeckFilm[] = session.movie_deck ?? [];
    const participantCount = participants.length;

    // Build a lookup: movieId → (participantId → vote)
    // Lets us produce per-participant vote breakdown per film without N+1 queries
    const votesByMovie = new Map<number, Map<string, SwipeVote>>();
    for (const s of swipes ?? []) {
      if (!votesByMovie.has(s.movie_id)) {
        votesByMovie.set(s.movie_id, new Map());
      }
      votesByMovie
        .get(s.movie_id)!
        .set(s.participant_id, s.vote as SwipeVote);
    }

    // Score every film in the deck
    const scored: MatchResult[] = deck.map((film) => {
      const movieVotes = votesByMovie.get(film.id) ?? new Map();

      let yesCount = 0;
      let maybeCount = 0;
      let noCount = 0;
      let points = 0;

      const votes = participants.map((p) => {
        const vote = movieVotes.get(p.id) ?? null;
        if (vote === "yes") {
          yesCount++;
          points += VOTE_POINTS.yes;
        } else if (vote === "maybe") {
          maybeCount++;
          points += VOTE_POINTS.maybe;
        } else if (vote === "no") {
          noCount++;
          points += VOTE_POINTS.no;
        }
        return { participant_id: p.id, nickname: p.nickname, vote };
      });

      // Normalized 0–1 - max possible = participantCount × 2
      const score =
        participantCount > 0 ? points / (participantCount * 2) : 0;

      const tier = classifyTier(yesCount, noCount, participantCount);

      return {
        movie: film,
        tier,
        score,
        yesCount,
        maybeCount,
        noCount,
        votes,
      };
    });

    // Sort within a tier: more yes votes > higher score > higher TMDB rating
    const sortResults = (a: MatchResult, b: MatchResult) => {
      if (b.yesCount !== a.yesCount) return b.yesCount - a.yesCount;
      if (b.score !== a.score) return b.score - a.score;
      return (b.movie.vote_average ?? 0) - (a.movie.vote_average ?? 0);
    };

    const perfect = scored
      .filter((r) => r.tier === "perfect")
      .sort(sortResults);
    const strong = scored.filter((r) => r.tier === "strong").sort(sortResults);
    const miss = scored.filter((r) => r.tier === "miss").sort(sortResults);

    // Top pick: best perfect match, or best strong contender, or null if everything's a miss
    const topPick = perfect[0] ?? strong[0] ?? null;

    const payload: GroupResultsPayload = {
      code: session.code,
      participantCount,
      topPick,
      perfect,
      strong,
      miss,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load results";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

