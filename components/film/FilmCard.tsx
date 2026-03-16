// =============================================
// FILMCARD COMPONENT
// =============================================
// Displays a single film as a card with:
// - Poster image (from TMDB)
// - Title
// - Year and rating
// - Short overview (2 lines max)
//
// This component is REUSABLE — it will be used on:
// - /results page (grid of mood-matched films)
// - /watchlist page (saved films)
//
// It's a Link — clicking the card navigates to /film/[id]

import Image from "next/image";
import Link from "next/link";

// ---------- Props Interface ----------
// These are the values the parent component must pass in.
// They come directly from the TMDB API response.
interface FilmCardProps {
  id: number; // TMDB movie ID (used for the link)
  title: string; // Film title
  posterPath: string | null; // TMDB poster path (e.g. "/abc123.jpg") — can be null
  releaseDate: string; // e.g. "2024-05-15"
  voteAverage: number; // Rating out of 10 (e.g. 7.8)
  overview: string; // Short film description
}

export default function FilmCard({
  id,
  title,
  posterPath,
  releaseDate,
  voteAverage,
  overview,
}: FilmCardProps) {
  // Extract just the year from "2024-05-15" → 2024
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  // Round rating to 1 decimal: 7.812 → "7.8"
  const rating = voteAverage?.toFixed(1);

  return (
    // The whole card is a link to the film detail page
    <Link href={`/film/${id}`} className="group">
      <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-200">
        {/* ---------- Poster Image ---------- */}
        {/* aspect-[2/3] keeps the movie poster ratio (portrait) */}
        <div className="relative aspect-[2/3] bg-white/10">
          {posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${posterPath}`}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            // Fallback when TMDB has no poster for this film
            <div className="w-full h-full flex items-center justify-center text-white/30">
              No Poster
            </div>
          )}
        </div>

        {/* ---------- Film Info ---------- */}
        <div className="p-3">
          {/* truncate: cuts off long titles with "..." */}
          <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/50 text-xs">{year}</span>
            <span className="text-yellow-400 text-xs">★ {rating}</span>
          </div>
          {/* line-clamp-2: shows max 2 lines of overview text */}
          <p className="text-white/40 text-xs mt-2 line-clamp-2">{overview}</p>
        </div>
      </div>
    </Link>
  );
}
