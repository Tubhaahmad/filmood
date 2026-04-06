import { buildTMDBParams } from "@/lib/moodMap";
import type { DeckFilm } from "@/lib/types";

const DECK_SIZE = 15;

interface TMDBDiscoverResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

/**
 * Aggregate all participants' moods with weighted frequency,
 * fetch films from TMDB, and build a balanced deck.
 * Each film is tagged with genre_ids and the mood(s) it was sourced from.
 */
export async function buildSharedDeck(
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

  // Adjust to hit exactly DECK_SIZE films, trimming from the least popular moods first
  while (allocated > DECK_SIZE) {
    let trimmed = false;
    for (let i = allocations.length - 1; i >= 0; i--) {
      if (allocations[i].count > 1) {
        allocations[i].count--;
        allocated--;
        trimmed = true;
        break;
      }
    }
    // Every mood is at count=1, drop the least popular ones
    if (!trimmed) {
      allocations.pop();
      allocated--;
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
    const results: DeckFilm[] = (data.results ?? []).map(
      (r: TMDBDiscoverResult) => ({
        id: r.id,
        title: r.title,
        poster_path: r.poster_path,
        release_date: r.release_date,
        vote_average: r.vote_average,
        overview: r.overview,
        genre_ids: r.genre_ids ?? [],
        mood_keys: [mood],
      }),
    );

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
