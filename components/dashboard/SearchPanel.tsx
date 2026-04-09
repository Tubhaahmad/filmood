"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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

const PANEL_CATEGORIES: {
  id: BrowseCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "trending",
    label: "Trending",
    icon: (
      <span style={{ color: "var(--ember)", display: "flex" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </span>
    ),
  },
  {
    id: "top-rated",
    label: "Top Rated",
    icon: (
      <span style={{ color: "var(--gold)", display: "flex" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </span>
    ),
  },
  {
    id: "new-releases",
    label: "New Releases",
    icon: (
      <span style={{ color: "var(--blue)", display: "flex" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
    ),
  },
  {
    id: "in-cinemas",
    label: "In Cinemas",
    icon: (
      <span style={{ color: "var(--rose)", display: "flex" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      </span>
    ),
  },
  {
    id: "by-genre",
    label: "By Genre",
    icon: (
      <span style={{ color: "var(--violet)", display: "flex" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </span>
    ),
  },
  {
    id: "streaming-norway",
    label: "Streaming in Norway",
    icon: (
      <span style={{ color: "var(--teal)", display: "flex" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
      </span>
    ),
  },
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
      return sorted;
  }
}

// Skeleton grid shown while loading
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 50}ms` }}>
          <div
            style={{
              borderRadius: "var(--r)",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="search-skeleton-bar"
              style={{ aspectRatio: "2/3", width: "100%" }}
            />
            <div style={{ padding: "10px 12px 12px" }}>
              <div
                className="search-skeleton-bar"
                style={{ height: "13px", width: "75%", marginBottom: "8px" }}
              />
              <div
                className="search-skeleton-bar"
                style={{ height: "10px", width: "40%" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SearchPanelProps {
  isOpen: boolean;
  embedded?: boolean;
  films: Film[];
  isLoading?: boolean;
  activeCategory?: string | null;
  activeGenre?: number | null;
  onCategoryChange?: (category: BrowseCategory, genreId?: number) => void;
  onClose: () => void;
}

export default function SearchPanel({
  isOpen,
  embedded = false,
  films,
  isLoading = false,
  activeCategory,
  activeGenre,
  onCategoryChange,
  onClose,
}: SearchPanelProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("popularity");
  const [panelQuery, setPanelQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [gridKey, setGridKey] = useState(0);
  const prevFilmsRef = useRef(films);

  // Bump the grid key when films change to trigger a fade-in
  useEffect(() => {
    if (films !== prevFilmsRef.current && films.length > 0) {
      setGridKey((k) => k + 1);
      prevFilmsRef.current = films;
    }
  }, [films]);

  const { displayFilms, totalCount } = useMemo(() => {
    let f = films;
    if (panelQuery.trim()) {
      const q = panelQuery.trim().toLowerCase();
      f = f.filter((film) => film.title.toLowerCase().includes(q));
    }
    const sorted = sortFilms(f, sortOrder);
    return { displayFilms: sorted.slice(0, 18), totalCount: sorted.length };
  }, [films, sortOrder, panelQuery]);

  const handleCategoryClick = (catId: BrowseCategory) => {
    if (catId === "by-genre") {
      if (activeCategory === "by-genre") {
        onCategoryChange?.("trending" as BrowseCategory);
      } else {
        onCategoryChange?.(catId);
      }
      return;
    }
    onCategoryChange?.(catId);
  };

  const handleGenreClick = (genreId: number) => {
    onCategoryChange?.("by-genre", genreId);
  };

  // Get the active category label for the heading
  const activeCatLabel = PANEL_CATEGORIES.find(
    (c) => c.id === activeCategory,
  )?.label;
  const activeGenreLabel = PANEL_GENRES.find(
    (g) => g.id === activeGenre,
  )?.label;

  // Build the "Full search" URL carrying current state
  const browseHref = (() => {
    const p = new URLSearchParams();
    if (activeCategory) p.set("category", activeCategory);
    if (activeGenre) p.set("genre", String(activeGenre));
    if (panelQuery.trim()) p.set("q", panelQuery.trim());
    const qs = p.toString();
    return qs ? `/browse?${qs}` : "/browse";
  })();

  const inner = (
    <div
      style={{
        background: "var(--surface)",
        border: embedded ? "none" : "1px solid var(--border)",
        borderRadius: embedded ? "0" : "16px",
        padding: embedded ? "18px 0 0" : "22px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient blue glow — top corner atmosphere */}
      {!embedded && (
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-40px",
            width: "280px",
            height: "180px",
            background:
              "radial-gradient(ellipse at center, var(--blue-glow) 0%, transparent 70%)",
            opacity: 0.6,
            pointerEvents: "none",
            filter: "blur(30px)",
          }}
        />
      )}

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "18px",
          position: "relative",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.8px",
              color: "var(--blue)",
              marginBottom: "8px",
            }}
          >
            Search
          </div>
          <h3
            className="font-serif"
            style={{
              fontSize: "clamp(18px, 2vw, 24px)",
              fontWeight: 600,
              color: "var(--t1)",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {activeCatLabel
              ? activeGenreLabel
                ? `${activeCatLabel} — ${activeGenreLabel}`
                : activeCatLabel
              : "Browse & Search"}
          </h3>
        </div>

        {/* Result count badge */}
        {displayFilms.length > 0 && !isLoading && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--blue)",
              background: "var(--blue-soft)",
              padding: "4px 10px",
              borderRadius: "100px",
              border: "1px solid rgba(91,143,212,0.15)",
              whiteSpace: "nowrap",
            }}
          >
            {totalCount} film{totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Search + Sort row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <svg
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: inputFocused ? "var(--blue)" : "var(--t3)",
              pointerEvents: "none",
              transition: "color 0.2s",
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
            id="panel-filter"
            name="panel-filter"
            type="text"
            value={panelQuery}
            onChange={(e) => setPanelQuery(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Filter results by title..."
            aria-label="Filter results by title"
            style={{
              width: "100%",
              padding: "10px 12px 10px 34px",
              borderRadius: "10px",
              background: "var(--surface2)",
              border: `1px solid ${inputFocused ? "var(--blue)" : "var(--border)"}`,
              boxShadow: inputFocused ? "0 0 0 3px var(--blue-soft)" : "none",
              color: "var(--t1)",
              fontSize: "13px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          />
          {panelQuery && (
            <button
              onClick={() => setPanelQuery("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "var(--surface3)",
                border: "none",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--t2)",
                fontSize: "11px",
                lineHeight: 1,
                padding: 0,
                transition: "background 0.15s",
              }}
              aria-label="Clear filter"
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--blue-soft)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--surface3)")
              }
            >
              ✕
            </button>
          )}
        </div>

        <label htmlFor="panel-sort" className="sr-only">Sort by</label>
        <select
          id="panel-sort"
          name="panel-sort"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            color: "var(--t2)",
            fontSize: "12px",
            fontWeight: 500,
            outline: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "border-color 0.2s",
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
          gap: "5px",
          flexWrap: "wrap",
          marginBottom: "14px",
        }}
      >
        {PANEL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "7px 13px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 500,
                lineHeight: 1,
                cursor: "pointer",
                transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
                border: "1px solid",
                borderColor: isActive
                  ? "rgba(91,143,212,0.3)"
                  : "var(--tag-border)",
                background: isActive ? "var(--blue-soft)" : "var(--tag-bg)",
                color: isActive ? "var(--blue)" : "var(--t2)",
                boxShadow: isActive ? "0 0 12px var(--blue-glow)" : "none",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--border-h)";
                  e.currentTarget.style.color = "var(--t1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--tag-border)";
                  e.currentTarget.style.color = "var(--t2)";
                  e.currentTarget.style.transform = "none";
                }
              }}
            >
              {cat.icon}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Genre chips (visible when By Genre is active) */}
      {activeCategory === "by-genre" && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "16px",
            paddingBottom: "14px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {PANEL_GENRES.map((g, i) => {
            const isActive = activeGenre === g.id;
            return (
              <button
                key={g.id}
                type="button"
                className="search-genre-chip"
                onClick={() => handleGenreClick(g.id)}
                style={{
                  padding: "6px 13px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  fontWeight: 500,
                  lineHeight: 1,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: "1px solid",
                  animationDelay: `${i * 30}ms`,
                  borderColor: isActive
                    ? "rgba(91,143,212,0.35)"
                    : "var(--tag-border)",
                  background: isActive ? "var(--blue-soft)" : "var(--tag-bg)",
                  color: isActive ? "var(--blue)" : "var(--t3)",
                  boxShadow: isActive ? "0 0 8px var(--blue-glow)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "var(--border-h)";
                    e.currentTarget.style.color = "var(--t2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "var(--tag-border)";
                    e.currentTarget.style.color = "var(--t3)";
                  }
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Film grid / Loading / Empty state */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : displayFilms.length > 0 ? (
        <div key={gridKey} className="search-grid-enter">
          <FilmGrid films={displayFilms} accentBase="var(--blue)" />
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "var(--t3)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "var(--blue-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--blue)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.7 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--t2)",
              marginBottom: "6px",
            }}
          >
            {panelQuery
              ? `No films matching "${panelQuery}"`
              : "Pick a category to start browsing"}
          </p>
          <p style={{ fontSize: "12px", color: "var(--t3)", lineHeight: 1.5 }}>
            {panelQuery
              ? "Try a different search term"
              : "Or type in the search bar above to filter"}
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          borderTop: "1px solid var(--border)",
          paddingTop: "14px",
          marginTop: "18px",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--t3)" }}>
          {isLoading ? (
            "Loading..."
          ) : displayFilms.length > 0 ? (
            <>
              Showing{" "}
              <strong style={{ color: "var(--t2)", fontWeight: 600 }}>
                {displayFilms.length}
              </strong>
              {totalCount > displayFilms.length && (
                <>
                  {" "}
                  of{" "}
                  <strong style={{ color: "var(--t2)", fontWeight: 600 }}>
                    {totalCount}
                  </strong>
                </>
              )}{" "}
              film{totalCount !== 1 ? "s" : ""}
              {panelQuery.trim() ? ` matching "${panelQuery.trim()}"` : ""}
            </>
          ) : (
            "No results"
          )}
        </span>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={onClose}
            className="cursor-pointer"
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
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-h)";
              e.currentTarget.style.color = "var(--t1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--t2)";
            }}
          >
            Close
          </button>
          <Link
            href={browseHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: "var(--blue)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              lineHeight: 1,
              transition: "filter 0.2s, transform 0.2s",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.12)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            Full search
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
  );

  return embedded ? (
    inner
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateRows: isOpen ? "1fr" : "0fr",
        opacity: isOpen ? 1 : 0,
        transition:
          "grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s, padding 0.4s",
        paddingBottom: isOpen ? "10px" : "0",
      }}
    >
      <div style={{ overflow: "hidden", minHeight: 0 }}>{inner}</div>
    </div>
  );
}
