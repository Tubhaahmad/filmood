// =============================================
// FILMGRID COMPONENT
// =============================================
// A responsive grid that displays multiple FilmCards.
// It receives an array of films and renders one FilmCard per film.
//
// Responsive layout:
// - Mobile: 2 columns
// - Tablet (sm): 3 columns
// - Desktop (lg): 4 columns
//
// If there are no films, it shows a friendly message.

import FilmCard from "./FilmCard";
import type { Film } from "@/lib/types";

interface FilmGridProps {
  films: Film[];
  accentBase?: string;
}

export default function FilmGrid({ films, accentBase }: FilmGridProps) {
  if (films.length === 0) {
    return (
      <p className="text-center py-12 text-t-2">
        No films found. Try a different mood!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
      {films.map((film) => (
        <FilmCard
          key={film.id}
          id={film.id}
          title={film.title}
          posterPath={film.poster_path}
          releaseDate={film.release_date}
          voteAverage={film.vote_average}
          overview={film.overview}
          accentBase={accentBase}
        />
      ))}
    </div>
  );
}
