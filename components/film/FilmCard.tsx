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
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
  overview: string;
  accentBase?: string;
}

export default function FilmCard({
  id,
  title,
  posterPath,
  releaseDate,
  voteAverage,
  overview,
  accentBase,
}: FilmCardProps) {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  const rating = voteAverage?.toFixed(1) ?? "N/A";
  const accent = accentBase ?? "var(--gold)";

  return (
    <Link
      href={`/film/${id}`}
      className="group"
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          borderRadius: "var(--r)",
          overflow: "hidden",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          transition:
            "border-color var(--t-fast), transform var(--t-fast), box-shadow var(--t-fast)",
        }}
        onMouseEnter={(e) => {
          const card = e.currentTarget as HTMLDivElement;
          card.style.borderColor = accent;
          card.style.transform = "translateY(-2px)";
          card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          const card = e.currentTarget as HTMLDivElement;
          card.style.borderColor = "var(--border)";
          card.style.transform = "none";
          card.style.boxShadow = "none";
        }}
      >
        <div
          className="relative"
          style={{ aspectRatio: "2/3", background: "var(--surface2)" }}
        >
          {posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${posterPath}`}
              alt={title}
              fill
              className="object-cover"
              style={{ transition: "transform var(--t-slow)" }}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ color: "var(--t3)", fontSize: "12px" }}
            >
              No Poster
            </div>
          )}

          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 9px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              lineHeight: 1,
              color: "#FFD84D",
              background: "rgba(10,10,12,0.82)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.24)",
              zIndex: 2,
            }}
          >
            ★ {rating}
          </div>
        </div>

        <div style={{ padding: "10px 12px 12px", minHeight: "90px" }}>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--t1)",
              margin: 0,
              marginBottom: "6px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--t3)" }}>{year}</span>
          </div>

          <p
            style={{
              fontSize: "11px",
              color: "var(--t2)",
              marginTop: "6px",
              lineHeight: "1.5",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {overview || "\u00A0"}
          </p>
        </div>
      </div>
    </Link>
  );
}
