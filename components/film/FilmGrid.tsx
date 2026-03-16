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

// ---------- Props ----------
// The parent passes in the array of films.
// Film type is imported from lib/types.ts (our shared types file)
interface FilmGridProps {
  films: Film[];
}

export default function FilmGrid({ films }: FilmGridProps) {
  // If no films match the mood, show a message instead of an empty grid
  if (films.length === 0) {
    return (
      <p className="text-center text-white/50 py-12">
        No films found. Try a different mood!
      </p>
    );
  }

  return (
    // Tailwind responsive grid:
    // grid-cols-2 → 2 columns on mobile
    // sm:grid-cols-3 → 3 columns on screens ≥640px
    // lg:grid-cols-4 → 4 columns on screens ≥1024px
    // gap-4 → spacing between cards
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {films.map((film) => (
        // For each film, render a FilmCard.
        // We map TMDB's snake_case fields to FilmCard's camelCase props.
        <FilmCard
          key={film.id}
          id={film.id}
          title={film.title}
          posterPath={film.poster_path}
          releaseDate={film.release_date}
          voteAverage={film.vote_average}
          overview={film.overview}
        />
      ))}
    </div>
  );
}
