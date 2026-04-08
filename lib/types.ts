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

// ─── Deck Film (enriched for swipe cards) ────────────

/** A film inside a group session deck — carries genre IDs and the mood(s) it was sourced from */
export interface DeckFilm extends Film {
  genre_ids: number[];
  mood_keys: string[];
}

// ─── Group Session Types ──────────────────────────────

export type SessionStatus = "lobby" | "mood" | "swiping" | "done";
export type SwipeVote = "yes" | "no" | "maybe";

/** A group session row from the sessions table */
export interface GroupSession {
  id: string;
  code: string;
  host_id: string;
  status: SessionStatus;
  movie_deck: DeckFilm[] | null;
  created_at: string;
}

/** A participant row from session_participants */
export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string | null;
  nickname: string;
  mood_selections: string[] | null;
  has_swiped: boolean;
  is_ready: boolean;
  joined_at: string;
}

/** A swipe vote row from the swipes table */
export interface Swipe {
  id: string;
  session_id: string;
  participant_id: string;
  movie_id: number;
  vote: SwipeVote;
  created_at: string;
}

/** Tier a film falls into after vote aggregation on the results page */
export type ResultTier = "perfect" | "strong" | "miss";

/** A film from the deck with its aggregated vote breakdown and tier */
export interface MatchResult {
  movie: DeckFilm;
  tier: ResultTier;
  /** Normalized 0–1: sum of points / (participantCount * 2) */
  score: number;
  yesCount: number;
  maybeCount: number;
  noCount: number;
  /** Individual votes keyed by participant — useful for "who voted what" UI */
  votes: { participant_id: string; nickname: string; vote: SwipeVote | null }[];
}

/** Response shape for GET /api/group/[code]/results */
export interface GroupResultsPayload {
  code: string;
  participantCount: number;
  topPick: MatchResult | null;
  perfect: MatchResult[];
  strong: MatchResult[];
  miss: MatchResult[];
}
