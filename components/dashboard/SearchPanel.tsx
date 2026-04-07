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
}

export default function SearchPanel({
  isOpen,
  films,
  activeCategory,
  activeGenre,
  onCategoryChange,
  onClose,
}: SearchPanelProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("popularity");
  const [panelQuery, setPanelQuery] = useState("");

  const { displayFilms, totalCount } = useMemo(() => {
    let f = films;
    if (panelQuery.trim()) {
      const q = panelQuery.trim().toLowerCase();
      f = f.filter((film) => film.title.toLowerCase().includes(q));
    }
    const sorted = sortFilms(f, sortOrder);
    return { displayFilms: sorted.slice(0, 12), totalCount: sorted.length };
  }, [films, sortOrder, panelQuery]);

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
        {/* Panel label */}
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.8px",
            color: "#527bc7",
            marginBottom: "14px",
          }}
        >
          Browse
        </div>

        {/* Search + Sort top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <svg
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--t3)",
                pointerEvents: "none",
              }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={panelQuery}
              onChange={(e) => setPanelQuery(e.target.value)}
              placeholder="Search films, directors, actors..."
              style={{
                width: "100%",
                padding: "9px 12px 9px 32px",
                borderRadius: "10px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                color: "var(--t1)",
                fontSize: "13px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-h)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            />
          </div>

          {/* Sort dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--t2)",
              fontSize: "12px",
              fontWeight: 500,
              outline: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          {PANEL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange?.(cat.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: 1,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: "1px solid",
                  borderColor: isActive ? "transparent" : "var(--tag-border)",
                  background: isActive ? "var(--t1)" : "var(--tag-bg)",
                  color: isActive ? "var(--bg)" : "var(--t2)",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Genre chips — shown on By Genre tab */}
        {activeCategory === "by-genre" && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "14px",
            }}
          >
            {PANEL_GENRES.map((g) => {
              const isActive = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onCategoryChange?.("by-genre", g.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "100px",
                    fontSize: "11px",
                    fontWeight: 500,
                    lineHeight: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: "1px solid",
                    borderColor: isActive
                      ? "rgba(91,143,212,0.3)"
                      : "var(--tag-border)",
                    background: isActive ? "var(--blue-soft)" : "var(--tag-bg)",
                    color: isActive ? "var(--blue)" : "var(--t2)",
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Film grid */}
        <FilmGrid films={displayFilms} />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--border)",
            paddingTop: "14px",
            marginTop: "16px",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--t3)" }}>
            Showing{" "}
            <strong style={{ color: "var(--t2)", fontWeight: 600 }}>
              {displayFilms.length}
            </strong>
            {totalCount > displayFilms.length ? (
              <>
                {" "}
                of{" "}
                <strong style={{ color: "var(--t2)", fontWeight: 600 }}>
                  {totalCount}
                </strong>
              </>
            ) : null}{" "}
            film{totalCount !== 1 ? "s" : ""}
            {panelQuery.trim() ? ` matching "${panelQuery.trim()}"` : ""}
          </span>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={onClose}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 18px",
                borderRadius: "10px",
                background: "none",
                color: "var(--t2)",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: 1,
                border: "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.25s",
              }}
            >
              Close
            </button>
            <Link
              href="/browse"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 18px",
                borderRadius: "10px",
                background: "var(--gold)",
                color: "#0a0a0c",
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: 1,
                cursor: "pointer",
                transition: "filter 0.2s",
                textDecoration: "none",
              }}
            >
              Full browse
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
