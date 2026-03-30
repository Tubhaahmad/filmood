export interface Film {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export type AccentColor = "gold" | "blue" | "rose" | "violet" | "teal" | "ember";

export interface MoodConfig {
  key: string;
  tagLabel: string;
  label: string;
  description: string;
  accentColor: AccentColor;
  genres: number[];
  excludeGenres?: number[];
  sortBy: "popularity.desc" | "vote_average.desc";
  voteCountGte: number;
  voteAverageGte?: number;
}

// ─── Film Detail Types ─────────────────────────────

/** Full movie data returned by TMDB /movie/{id}?append_to_response=credits */
export interface FilmDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
}

/** A single streaming provider (e.g. Netflix, Viaplay) */
export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

/** A YouTube trailer from TMDB /movie/{id}/videos */
export interface TrailerData {
  key: string;
  name: string;
  site: string;
  type: string;
}
