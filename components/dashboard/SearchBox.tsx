"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Film } from "@/lib/types";

const BROWSE_CATEGORIES = [
  {
    id: "trending",
    label: "Trending",
    icon: (
      <span style={{ color: "var(--ember)", display: "flex" }}>
        <svg
          width="13"
          height="13"
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
          width="13"
          height="13"
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
          width="13"
          height="13"
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
          width="13"
          height="13"
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
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
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
          width="13"
          height="13"
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
          width="13"
          height="13"
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
] as const;

type BrowseCategory = (typeof BROWSE_CATEGORIES)[number]["id"];

const GENRES = [
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
];

// Simple genre lookup for the trending list display
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

interface TrendingItem {
  id: number;
  title: string;
  genre_ids: number[];
}

interface SearchBoxProps {
  onResults?: (films: Film[], keepOpen?: boolean) => void;
  onLabel?: (label: string) => void;
  onActiveCategory?: (category: string | null, genreId?: number | null) => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export default function SearchBox({
  onResults,
  onLabel,
  onActiveCategory,
  onExpand,
  isExpanded,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BrowseCategory | null>(
    null,
  );
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync active category/genre up to parent so the panel tabs stay in sync
  useEffect(() => {
    onActiveCategory?.(activeCategory, activeGenre);
  }, [activeCategory, activeGenre]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch trending movies on mount
  useEffect(() => {
    fetch("/api/movies/trending")
      .then((res) => res.json())
      .then((data) => setTrending(data.films ?? []))
      .catch(() => {});
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        onResults?.([]);
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      setActiveCategory(null);
      try {
        const res = await fetch(
          `/api/movies/search?query=${encodeURIComponent(q.trim())}&type=all`,
          { signal: controller.signal },
        );
        const data = await res.json();
        const films = data.films ?? [];
        onResults?.(films);
        onLabel?.(
          `Search results — ${films.length} film${films.length !== 1 ? "s" : ""}`,
        );
        onExpand?.();
      } catch (err) {
        if ((err as Error).name !== "AbortError") onResults?.([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onResults, onLabel, onExpand],
  );

  const doBrowse = useCallback(
    async (category: BrowseCategory, genreId?: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ category });
        if (genreId) params.set("genre", String(genreId));
        const res = await fetch(`/api/movies/browse?${params.toString()}`);
        const data = await res.json();
        const films = data.films ?? [];
        onResults?.(films, true);
        const catLabel =
          BROWSE_CATEGORIES.find((c) => c.id === category)?.label ?? category;
        const genreLabel = genreId
          ? GENRES.find((g) => g.id === genreId)?.label
          : undefined;
        onLabel?.(
          genreLabel
            ? `${catLabel} — ${genreLabel} — ${films.length} film${films.length !== 1 ? "s" : ""}`
            : `${catLabel} — ${films.length} film${films.length !== 1 ? "s" : ""}`,
        );
      } catch {
        onResults?.([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onResults, onLabel],
  );

  // Debounced search on typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      onResults?.([]);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryClick = (categoryId: BrowseCategory) => {
    if (categoryId === "by-genre") {
      if (activeCategory === "by-genre") {
        setActiveCategory(null);
        setActiveGenre(null);
        onResults?.([]);
      } else {
        setActiveCategory("by-genre");
        setQuery("");
        onExpand?.();
      }
      return;
    }
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      onResults?.([]);
      return;
    }
    setActiveCategory(categoryId);
    setQuery("");
    onExpand?.();
    doBrowse(categoryId);
  };

  const handleGenreClick = (genreId: number) => {
    setActiveGenre(genreId);
    onExpand?.();
    doBrowse("by-genre", genreId);
  };

  // When panel opens and nothing is active, load trending into the panel
  const handleSectionClick = () => {
    onExpand?.();
    if (!query && !activeCategory) {
      doBrowse("trending");
    }
  };

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={handleSectionClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSectionClick(); } }}
      aria-expanded={isExpanded}
      aria-label="Find anything — search by film, actor, or director"
      className="relative overflow-hidden cursor-pointer"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isExpanded ? "var(--blue)" : "var(--border)"}`,
        borderRadius: "16px",
        padding: "22px",
        transition: "border-color 0.3s, box-shadow 0.3s",
        boxShadow: isExpanded
          ? "0 0 0 1px var(--blue), 0 0 16px var(--blue-glow)"
          : "none",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.8px",
          color: "var(--blue)",
          marginBottom: "12px",
        }}
      >
        Search
      </div>

      <h2
        className="font-serif"
        style={{
          fontSize: "clamp(20px, 2.2vw, 26px)",
          fontWeight: 600,
          color: "var(--t1)",
          lineHeight: 1.2,
          marginBottom: "6px",
        }}
      >
        Find anything
      </h2>

      <p
        style={{
          fontSize: "13px",
          color: "var(--t2)",
          lineHeight: 1.5,
          marginBottom: "16px",
        }}
      >
        Search by film title, actor, or director.
      </p>

      {/* Search Input */}
      <div className="relative mb-3.5" onClick={(e) => e.stopPropagation()}>
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--t3)" }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="search-box-input"
          name="search-box-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setInputFocused(true);
            if (!query && !activeCategory) doBrowse("trending");
            onExpand?.();
          }}
          onBlur={() => setInputFocused(false)}
          placeholder="Film, actor, director..."
          aria-label="Search films, actors, or directors"
          style={{
            width: "100%",
            borderRadius: "12px",
            background: "var(--surface2)",
            border: `1px solid ${inputFocused ? "var(--blue)" : "var(--border)"}`,
            boxShadow: inputFocused ? "0 0 0 3px var(--blue-soft)" : "none",
            color: "var(--t1)",
            padding: "11px 14px 11px 40px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />
        {isLoading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>

      {/* Browse category buttons */}
      <div
        className="mb-4 flex flex-wrap gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {BROWSE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryClick(cat.id)}
            style={{
              borderRadius: "999px",
              border: `1px solid ${
                activeCategory === cat.id
                  ? "var(--border-active)"
                  : "var(--border)"
              }`,
              background:
                activeCategory === cat.id ? "var(--surface2)" : "var(--bg)",
              color: activeCategory === cat.id ? "var(--t1)" : "var(--t2)",
              fontSize: "12px",
              lineHeight: 1,
              padding: "8px 11px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Genre sub-buttons (shown when By Genre is active) */}
      {activeCategory === "by-genre" && (
        <div
          className="mb-4 flex flex-wrap gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {GENRES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => handleGenreClick(g.id)}
              style={{
                borderRadius: "999px",
                border: `1px solid ${activeGenre === g.id ? "var(--border-active)" : "var(--border)"}`,
                background:
                  activeGenre === g.id ? "var(--surface2)" : "var(--bg)",
                color: activeGenre === g.id ? "var(--t1)" : "var(--t3)",
                fontSize: "11px",
                lineHeight: 1,
                padding: "6px 10px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Trending Today list (shown when no search/browse active) */}
      {!query && !activeCategory && (
        <div>
          <div
            style={{
              color: "var(--t3)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Trending Today
          </div>

          <div className="flex flex-col">
            {trending.map((item, i) => (
              <Link
                key={item.id}
                href={`/film/${item.id}`}
                onClick={(e) => e.stopPropagation()}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-2.5 rounded-lg"
                style={{
                  padding: "7px 8px",
                  margin: "0 -8px",
                  textDecoration: "none",
                  transition: "background 0.18s",
                  animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onFocus={(e) =>
                  (e.currentTarget.style.background = "var(--surface2)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span
                  style={{
                    color: "var(--t3)",
                    fontSize: "12px",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: "20px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    color: "var(--t1)",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "color 0.18s",
                  }}
                  className="group-hover:text-white"
                >
                  {item.title}
                </span>
                <span style={{ color: "var(--t3)", fontSize: "12px" }}>
                  {GENRE_MAP[item.genre_ids?.[0]] ?? "Film"}
                </span>
              </Link>
            ))}
            {trending.length === 0 && (
              <span
                style={{
                  color: "var(--t3)",
                  fontSize: "12px",
                  padding: "4px 8px",
                }}
              >
                Loading...
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
