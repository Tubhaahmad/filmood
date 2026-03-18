export interface Film {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export interface MoodConfig {
  key: string;
  label: string;
  description: string;
  genres: number[];
  excludeGenres?: number[];
  sortBy: "popularity.desc" | "vote_average.desc";
  voteCountGte: number;
  voteAverageGte?: number;
}
