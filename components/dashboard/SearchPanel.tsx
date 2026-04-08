"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import FilmGrid from "@/components/film/FilmGrid";
import type { Film } from "@/lib/types";

type SortOrder = "popularity" | "rating" | "newest" | "title";
type BrowseCategory =
  | "trending"
  | "top-rated"
  | "new-releases"
  | "in-cinemas"
  | "by-genre"
  | "streaming-norway";

const PANEL_CATEGORIES: { id: BrowseCategory; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "top-rated", label: "Top Rated" },
  { id: "new-releases", label: "New Releases" },
  { id: "in-cinemas", label: "In Cinemas" },
  { id: "by-genre", label: "By Genre" },
  { id: "streaming-norway", label: "Streaming in Norway" },
];

const PANEL_GENRES = [
  { id: 28, label: "Action" },
  { id: 35, label: "Comedy" },
  { id: 18, label: "Drama" },
  { id: 27, label: "Horror" },
  { id: 878, label: "Sci-Fi" },
  { id: 10749, label: "Romance" },
  { id: 53, label: "Thriller" },
  { id: 16, label: "Animation" },
  { id: 80, label: "Crime" },
  { id: 14, label: "Fantasy" },
  { id: 99, label: "Documentary" },
  { id: 9648, label: "Mystery" },
];

function sortFilms(films: Film[], order: SortOrder): Film[] {
  const sorted = [...films];
  switch (order) {
    case "rating":
      return sorted.sort(
        (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0),
      );
    case "newest":
      return sorted.sort((a, b) =>
        (b.release_date ?? "").localeCompare(a.release_date ?? ""),
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted; // popularity = API order
  }
}

interface SearchPanelProps {
  isOpen: boolean;
  films: Film[];
  activeCategory?: string | null;
  activeGenre?: number | null;
  onCategoryChange?: (category: BrowseCategory, genreId?: number) => void;
  onClose: () => void;
  embedded?: boolean;
}

export default function SearchPanel({
  isOpen,
  films,
  activeCategory,
  activeGenre,
  onCategoryChange,
  onClose,
  embedded,
}: SearchPanelProps) {
  const content = (
    <>
      {/* Label */}
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.8px",
          color: "var(--blue)",
          marginBottom: "16px",
        }}
      >
        {label ?? `Search results — ${films.length} film${films.length !== 1 ? "s" : ""}`}
      </div>

      {/* Film grid */}
      <FilmGrid films={films} />

      {/* Close row */}
      <div
        className="flex items-center gap-2.5"
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "14px",
          marginTop: "16px",
        }}
      >
        <button
          onClick={onClose}
          className="btn-panel-outline cursor-pointer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "9px 18px",
            borderRadius: "10px",
            background: "none",
            color: "var(--t1)",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1,
            border: "1px solid var(--border-h)",
            transition: "all 0.25s",
          }}
        >
          Close
        </button>
      </div>
    </>
  );

  // Inside bottom sheet: render content directly
  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <div
      style={{
        maxHeight: isOpen ? "1200px" : "0",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition:
          "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s, padding 0.4s",
        paddingBottom: isOpen ? "10px" : "0",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "22px",
        }}
      >
        {content}
      </div>
    </div>
  );
}
