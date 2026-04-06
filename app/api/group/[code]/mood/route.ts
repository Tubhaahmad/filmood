import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { isSessionExpired } from "@/lib/group";
import { moodMap, buildTMDBParams } from "@/lib/moodMap";
import type { DeckFilm } from "@/lib/types";

const DECK_SIZE = 15;

// POST /api/group/[code]/mood
// Save a participant's private mood selections.
// When all participants have submitted, build the shared movie deck
// and transition the session to "swiping".
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { error: "Invalid session code" },
      { status: 400 },
    );
  }

  const upperCode = code.toUpperCase();

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

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, status, created_at")
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

    if (session.status !== "mood") {
      return NextResponse.json(
        { error: "Session is not in mood selection phase" },
        { status: 400 },
      );
    }

    // Find the participant — auth user by user_id, guest by participantId
    const participantQuery = supabase
      .from("session_participants")
      .select("id, mood_selections")
      .eq("session_id", session.id);

    if (user) {
      participantQuery.eq("user_id", user.id);
    } else if (participantId) {
      participantQuery.eq("id", participantId);
    } else {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data: participant } = await participantQuery.single();

    if (!participant) {
      return NextResponse.json(
        { error: "You are not in this session" },
        { status: 403 },
      );
    }

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

// TMDB discover result shape — includes genre_ids which we now capture
interface TMDBDiscoverResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

// Aggregate all participants' moods with weighted frequency,
// fetch films from TMDB, and build a balanced deck.
// Each film is tagged with genre_ids and the mood(s) it was sourced from.
async function buildSharedDeck(
  participants: { mood_selections: string[] | null }[],
): Promise<DeckFilm[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB API key not configured");

  // Count mood frequency across all participants
  const moodCounts: Record<string, number> = {};
  for (const p of participants) {
    if (!p.mood_selections) continue;
    for (const mood of p.mood_selections) {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }
  }

  const totalWeight = Object.values(moodCounts).reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return [];

  // Allocate film slots proportionally
  const allocations: { mood: string; count: number }[] = [];
  let allocated = 0;

  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);

  for (const [mood, weight] of sortedMoods) {
    const share = Math.max(1, Math.round((weight / totalWeight) * DECK_SIZE));
    allocations.push({ mood, count: share });
    allocated += share;
  }

  // Adjust to hit exactly DECK_SIZE — trim from smallest or add to largest
  while (allocated > DECK_SIZE) {
    const smallest = allocations[allocations.length - 1];
    if (smallest.count > 1) {
      smallest.count--;
      allocated--;
    } else {
      break;
    }
  }
  while (allocated < DECK_SIZE) {
    allocations[0].count++;
    allocated++;
  }

  // Fetch TMDB results for each unique mood in parallel
  const fetchResults = allocations.map(async ({ mood, count }) => {
    const moodParams = buildTMDBParams(mood);
    const url = new URL("https://api.themoviedb.org/3/discover/movie");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", "1");

    for (const [k, v] of Object.entries(moodParams)) {
      url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString());
    const data = await res.json();
    const results: (DeckFilm & { _raw_genre_ids: number[] })[] =
      (data.results ?? []).map((r: TMDBDiscoverResult) => ({
        id: r.id,
        title: r.title,
        poster_path: r.poster_path,
        release_date: r.release_date,
        vote_average: r.vote_average,
        overview: r.overview,
        genre_ids: r.genre_ids ?? [],
        mood_keys: [mood],
        _raw_genre_ids: r.genre_ids ?? [],
      }));

    return { mood, count, results };
  });

  const moodResults = await Promise.all(fetchResults);

  // Build deck: pick films per mood allocation, dedup across moods.
  // If a film appears under multiple moods, merge the mood_keys.
  const seen = new Map<number, DeckFilm>();
  const deck: DeckFilm[] = [];

  for (const { mood, count, results } of moodResults) {
    let picked = 0;
    for (const film of results) {
      if (picked >= count) break;
      const existing = seen.get(film.id);
      if (existing) {
        // Film already in deck from another mood — add this mood tag
        if (!existing.mood_keys.includes(mood)) {
          existing.mood_keys.push(mood);
        }
        continue;
      }
      const deckFilm: DeckFilm = {
        id: film.id,
        title: film.title,
        poster_path: film.poster_path,
        release_date: film.release_date,
        vote_average: film.vote_average,
        overview: film.overview,
        genre_ids: film.genre_ids,
        mood_keys: [mood],
      };
      seen.set(film.id, deckFilm);
      deck.push(deckFilm);
      picked++;
    }
  }

  // If any mood couldn't fill its allocation, backfill from others
  if (deck.length < DECK_SIZE) {
    for (const { mood, results } of moodResults) {
      for (const film of results) {
        if (deck.length >= DECK_SIZE) break;
        if (seen.has(film.id)) continue;
        const deckFilm: DeckFilm = {
          id: film.id,
          title: film.title,
          poster_path: film.poster_path,
          release_date: film.release_date,
          vote_average: film.vote_average,
          overview: film.overview,
          genre_ids: film.genre_ids,
          mood_keys: [mood],
        };
        seen.set(film.id, deckFilm);
        deck.push(deckFilm);
      }
    }
  }

  return deck;
}
