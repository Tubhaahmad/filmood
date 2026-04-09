// Mood-to-TMDB mapping — each mood maps to TMDB query params (genres, sort, filters).
// TMDB Genre IDs: 28=Action, 16=Animation, 35=Comedy, 18=Drama, 14=Fantasy,
// 36=History, 27=Horror, 10749=Romance, 878=Sci-Fi, 53=Thriller, 10751=Family, 9648=Mystery

import type { MoodConfig } from "@/lib/types";
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

// All moods as an array for UI iteration
export const allMoods = Object.values(moodMap);

// Convert a mood key into TMDB API query params
export function buildTMDBParams(moodKey: string): Record<string, string> {
  const mood = moodMap[moodKey];
  if (!mood) throw new Error(`Unknown mood: ${moodKey}`);

  const params: Record<string, string> = {
    with_genres: mood.genres.join(","),
    sort_by: mood.sortBy,
    "vote_count.gte": mood.voteCountGte.toString(),
    watch_region: "NO",
    with_watch_monetization_types: "flatrate",
  };

  if (mood.excludeGenres) {
    params.without_genres = mood.excludeGenres.join(",");
  }
  if (mood.voteAverageGte) {
    params["vote_average.gte"] = mood.voteAverageGte.toString();
  }

  return params;
}

// Merge multiple moods into one TMDB query.
// Uses shared genres (or primary genre from each), strictest quality thresholds,
// rating sort for cross-genre gems, and union of exclusions (minus target genres).
export function buildMergedTMDBParams(moodKeys: string[]): Record<string, string> {
  if (moodKeys.length === 1) return buildTMDBParams(moodKeys[0]);

  const configs = moodKeys.map((k) => {
    const mood = moodMap[k];
    if (!mood) throw new Error(`Unknown mood: ${k}`);
    return mood;
  });

  // 1. Genre selection — find shared genres, or combine primary genres
  const genreCounts = new Map<number, number>();
  for (const cfg of configs) {
    for (const g of cfg.genres) {
      genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
    }
  }

  const sharedGenres = [...genreCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([genre]) => genre);

  let targetGenres: number[];
  if (sharedGenres.length > 0) {
    targetGenres = sharedGenres;
  } else {
    targetGenres = [...new Set(configs.map((c) => c.genres[0]))];
  }

  // 2. Quality thresholds (strictest wins)
  const voteCountGte = Math.max(...configs.map((c) => c.voteCountGte));
  const voteAverageGte = Math.max(...configs.map((c) => c.voteAverageGte ?? 0));

  const sortBy = "vote_average.desc";

  // 3. Exclusions (union, but never exclude target genres)
  const targetSet = new Set(targetGenres);
  const allExcludes = new Set<number>();
  for (const cfg of configs) {
    if (cfg.excludeGenres) {
      for (const g of cfg.excludeGenres) {
        if (!targetSet.has(g)) allExcludes.add(g);
      }
    }
  }

  // Build params
  const params: Record<string, string> = {
    with_genres: targetGenres.join(","),
    sort_by: sortBy,
    "vote_count.gte": voteCountGte.toString(),
    watch_region: "NO",
    with_watch_monetization_types: "flatrate",
  };

  if (allExcludes.size > 0) {
    params.without_genres = [...allExcludes].join(",");
  }
  if (voteAverageGte > 0) {
    params["vote_average.gte"] = voteAverageGte.toString();
  }

  return params;
}
