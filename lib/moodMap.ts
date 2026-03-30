// =============================================
// MOOD-TO-TMDB MAPPING CONFIG
// =============================================
// This is the brain of Filmood.
// Each mood the user picks maps to specific TMDB query parameters.
// When a user selects "Laugh until it hurts", this file tells the app:
//   → Search for Comedy (genre 35)
//   → Exclude Horror (genre 27)
//   → Sort by popularity
//   → Only show films with 500+ votes
//
// TMDB Genre IDs reference:
// 28=Action, 16=Animation, 35=Comedy, 18=Drama, 14=Fantasy,
// 36=History, 27=Horror, 10749=Romance, 878=Sci-Fi,
// 53=Thriller, 10751=Family, 9648=Mystery

// ---------- TypeScript Interface ----------
// MoodConfig is now defined in lib/types.ts (our shared types file)
// so it can be reused across multiple files.
import type { MoodConfig } from "@/lib/types";

// ---------- The Mapping Table ----------
// Record<string, MoodConfig> means: an object where every key is a string
// and every value follows the MoodConfig shape.
export const moodMap: Record<string, MoodConfig> = {
  laugh: {
    key: "laugh",
    tagLabel: "Need to laugh",
    label: "Laugh until it hurts",
    description: "Comedy, feel-good, absurd",
    accentColor: "gold",
    genres: [35],
    excludeGenres: [27],
    sortBy: "popularity.desc",
    voteCountGte: 500,
  },
  beautiful: {
    key: "beautiful",
    tagLabel: "Feel something beautiful",
    label: "Something beautiful",
    description: "Gorgeous drama, visual poetry",
    accentColor: "rose",
    genres: [18, 10749],
    sortBy: "vote_average.desc",
    voteCountGte: 200,
    voteAverageGte: 7.0,
  },
  unsettled: {
    key: "unsettled",
    tagLabel: "Feel uneasy",
    label: "Slow-burn tension",
    description: "Gets under your skin",
    accentColor: "rose",
    genres: [53, 27, 9648],
    sortBy: "vote_average.desc",
    voteCountGte: 300,
    voteAverageGte: 6.5,
  },
  thrilling: {
    key: "thrilling",
    tagLabel: "Need a rush",
    label: "Pure adrenaline",
    description: "Non-stop action, high octane",
    accentColor: "ember",
    genres: [28, 53],
    excludeGenres: [35],
    sortBy: "popularity.desc",
    voteCountGte: 400,
  },
  thoughtful: {
    key: "thoughtful",
    tagLabel: "Mind needs feeding",
    label: "Layers on layers",
    description: "Changes how you see things",
    accentColor: "violet",
    genres: [878, 18],
    sortBy: "vote_average.desc",
    voteCountGte: 200,
    voteAverageGte: 7.5,
  },
  easy: {
    key: "easy",
    tagLabel: "Need a hug",
    label: "Warm & familiar",
    description: "Comforting, wholesome",
    accentColor: "teal",
    genres: [35, 10751, 16],
    sortBy: "popularity.desc",
    voteCountGte: 300,
    voteAverageGte: 7.0,
  },
  cry: {
    key: "cry",
    tagLabel: "Need to let it out",
    label: "A good cry",
    description: "Emotional, cathartic",
    accentColor: "blue",
    genres: [18, 10749],
    sortBy: "vote_average.desc",
    voteCountGte: 200,
    voteAverageGte: 7.0,
  },
  escape: {
    key: "escape",
    tagLabel: "Want to disappear",
    label: "Sweeping visuals await",
    description: "Films that transport you",
    accentColor: "blue",
    genres: [878, 14, 16],
    sortBy: "vote_average.desc",
    voteCountGte: 200,
    voteAverageGte: 7.0,
  },
  family: {
    key: "family",
    tagLabel: "Everyone's watching",
    label: "Watch with family",
    description: "Fun for all ages",
    accentColor: "teal",
    genres: [10751, 16, 35],
    sortBy: "popularity.desc",
    voteCountGte: 300,
  },
  inspiring: {
    key: "inspiring",
    tagLabel: "Want to dream",
    label: "Something inspiring",
    description: "Stories that lift you up",
    accentColor: "gold",
    genres: [18, 36],
    sortBy: "vote_average.desc",
    voteCountGte: 200,
    voteAverageGte: 7.5,
  },
};

// ---------- Helper: Get all moods as an array ----------
// Used to loop over moods in the UI (e.g. rendering mood cards)
export const allMoods = Object.values(moodMap);

// ---------- Helper: Build TMDB query params from a mood key ----------
// This takes a mood key like "laugh" and returns an object like:
// { with_genres: "35", sort_by: "popularity.desc", "vote_count.gte": "500", ... }
// These params get appended to the TMDB API URL.
export function buildTMDBParams(moodKey: string): Record<string, string> {
  const mood = moodMap[moodKey];
  if (!mood) throw new Error(`Unknown mood: ${moodKey}`);

  const params: Record<string, string> = {
    with_genres: mood.genres.join(","),
    sort_by: mood.sortBy,
    "vote_count.gte": mood.voteCountGte.toString(),
    watch_region: "NO", // Norway — shows only films available for streaming here
    with_watch_monetization_types: "flatrate", // Subscription streaming only
  };

  if (mood.excludeGenres) {
    params.without_genres = mood.excludeGenres.join(",");
  }
  if (mood.voteAverageGte) {
    params["vote_average.gte"] = mood.voteAverageGte.toString();
  }

  return params;
}
