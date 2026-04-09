"use client";

import Link from "next/link";
import type { MatchResult } from "@/lib/types";
import VoteBreakdown from "./VoteBreakdown";

interface ResultMovieCardProps {
  result: MatchResult;
  /** Dimmed visual for "not tonight" tier */
  dimmed?: boolean;
}

export default function ResultMovieCard({
  result,
  dimmed = false,
}: ResultMovieCardProps) {
  const { movie, yesCount, maybeCount, noCount, votes } = result;
  const year = movie.release_date?.split("-")[0] || "";
  const rating = movie.vote_average?.toFixed(1) || "---";
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <Link
      href={`/film/${movie.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        opacity: dimmed ? 0.55 : 1,
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-h)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.opacity = dimmed ? "0.55" : "1";
      }}
    >
      {/* Poster */}
      <div
        role="img"
        aria-label={`${movie.title} poster`}
        style={{
          width: "100%",
          aspectRatio: "2 / 3",
          backgroundImage: posterUrl
            ? `url(${posterUrl})`
            : "linear-gradient(160deg, #1a1520, #2a1f35 30%, #0d1520)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {/* Rating badge — top right, matches v9 result-card pattern */}
        <div
          className="font-sans"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 8px",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            fontSize: "10px",
            fontWeight: 700,
            color: "var(--gold)",
          }}
        >
          <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 .5l1.55 3.6 3.95.5-2.9 2.7.7 3.9L6 9.3 2.7 11.2l.7-3.9L.5 4.6l3.95-.5z" />
          </svg>
          {rating}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px 12px", flex: 1 }}>
        <h4
          className="font-serif"
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--t1)",
            lineHeight: 1.25,
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {movie.title}
        </h4>
        <p
          className="font-sans"
          style={{
            fontSize: "10px",
            color: "var(--t3)",
            marginBottom: "10px",
          }}
        >
          {year}
        </p>

        {/* Vote counts — tiny pill row */}
        <div
          className="font-sans"
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "10px",
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {yesCount > 0 && (
            <span style={{ color: "var(--teal)" }}>{yesCount} yes</span>
          )}
          {maybeCount > 0 && (
            <span style={{ color: "var(--gold)" }}>{maybeCount} maybe</span>
          )}
          {noCount > 0 && (
            <span style={{ color: "var(--rose)" }}>{noCount} no</span>
          )}
        </div>

        <VoteBreakdown votes={votes} variant="compact" />
      </div>
    </Link>
  );
}
