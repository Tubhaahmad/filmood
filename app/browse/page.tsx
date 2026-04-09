"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import FilmCard from "@/components/film/FilmCard";
import type { Film } from "@/lib/types";

type BrowseCategory =
  | "trending"
  | "top-rated"
  | "new-releases"
  | "in-cinemas"
  | "by-genre"
  | "streaming-norway";

type SortOrder = "popularity" | "rating" | "newest" | "title";

const TABS: {
  id: BrowseCategory;
  label: string;
  heading: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "trending",
    label: "Trending",
    heading: "Trending today",
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
    heading: "Top rated of all time",
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
    heading: "New releases",
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
    heading: "Now in cinemas (Norway)",
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
        </svg>
      </span>
    ),
  },
  {
    id: "by-genre",
    label: "By Genre",
    heading: "Browse by genre",
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
    heading: "Streaming in Norway",
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
];

const GENRES = [
  { id: 28, label: "Action" },
  { id: 12, label: "Adventure" },
  { id: 16, label: "Animation" },
  { id: 35, label: "Comedy" },
  { id: 80, label: "Crime" },
  { id: 99, label: "Documentary" },
  { id: 18, label: "Drama" },
  { id: 14, label: "Fantasy" },
  { id: 27, label: "Horror" },
  { id: 9648, label: "Mystery" },
  { id: 10749, label: "Romance" },
  { id: 878, label: "Sci-Fi" },
  { id: 53, label: "Thriller" },
  { id: 10752, label: "War" },
  { id: 37, label: "Western" },
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

function BrowseContent() {
  const searchParams = useSearchParams();

  // Read initial state from URL params (from SearchPanel "Full search" link)
  const validCategories: BrowseCategory[] = [
    "trending",
    "top-rated",
    "new-releases",
    "in-cinemas",
    "by-genre",
    "streaming-norway",
  ];
  const categoryParam = searchParams.get("category");
  const initialCategory: BrowseCategory = validCategories.includes(
    categoryParam as BrowseCategory,
  )
    ? (categoryParam as BrowseCategory)
    : "trending";
  const genreParam = Number(searchParams.get("genre"));
  const initialGenre =
    Number.isFinite(genreParam) && genreParam > 0 ? genreParam : null;
  const initialQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<BrowseCategory>(initialCategory);
  const [activeGenre, setActiveGenre] = useState<number | null>(initialGenre);
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("popularity");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputFocused, setInputFocused] = useState(false);
  const [gridKey, setGridKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFilms = useCallback(
    async (
      category: BrowseCategory,
      genreId: number | null,
      pageNum: number,
    ) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ category, page: String(pageNum) });
        if (genreId) params.set("genre", String(genreId));
        const res = await fetch(`/api/movies/browse?${params.toString()}`);
        const data = await res.json();
        setFilms(data.films ?? []);
        setTotalPages(Math.min(data.totalPages ?? 1, 20));
        setGridKey((k) => k + 1);
      } catch {
        setFilms([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchFilms(activeTab, activeGenre, page);
  }, [activeTab, activeGenre, page, fetchFilms]);

  const switchTab = (tab: BrowseCategory) => {
    setActiveTab(tab);
    setActiveGenre(null);
    setPage(1);
    setSearchQuery("");
  };

  const selectGenre = (genreId: number) => {
    setActiveGenre(genreId);
    setPage(1);
  };

  const goPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Client-side search filter + sort
  const [displayFilms, setDisplayFilms] = useState<Film[]>([]);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!searchQuery.trim()) {
        setDisplayFilms(sortFilms(films, sortOrder));
        return;
      }
      const q = searchQuery.trim().toLowerCase();
      setDisplayFilms(
        sortFilms(
          films.filter((f) => f.title.toLowerCase().includes(q)),
          sortOrder,
        ),
      );
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [films, searchQuery, sortOrder]);

  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const activeGenreLabel = GENRES.find((g) => g.id === activeGenre)?.label;

  // Pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero header area with blue atmosphere */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          paddingBottom: "8px",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "10%",
            width: "400px",
            height: "300px",
            background:
              "radial-gradient(ellipse at center, var(--blue-glow) 0%, transparent 70%)",
            opacity: 0.5,
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "5%",
            width: "250px",
            height: "200px",
            background:
              "radial-gradient(ellipse at center, var(--blue-glow) 0%, transparent 70%)",
            opacity: 0.3,
            pointerEvents: "none",
            filter: "blur(50px)",
          }}
        />

        <div className="browse-container" style={{ position: "relative" }}>
          {/* Breadcrumb */}
          <div style={{ paddingTop: "18px" }}>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                {
                  label: activeGenreLabel
                    ? `${currentTab.heading} — ${activeGenreLabel}`
                    : currentTab.heading,
                },
              ]}
            />
          </div>

          {/* Heading + count */}
          <div
            style={{
              paddingTop: "14px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
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
                  marginBottom: "6px",
                }}
              >
                Browse
              </div>
              <h1
                className="font-serif"
                style={{
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: 600,
                  color: "var(--t1)",
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                {activeGenreLabel
                  ? `${currentTab.heading} — ${activeGenreLabel}`
                  : currentTab.heading}
              </h1>
            </div>
            {!isLoading && displayFilms.length > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--blue)",
                  background: "var(--blue-soft)",
                  padding: "5px 12px",
                  borderRadius: "100px",
                  border: "1px solid rgba(91,143,212,0.15)",
                  whiteSpace: "nowrap",
                  marginBottom: "4px",
                }}
              >
                {displayFilms.length} film{displayFilms.length !== 1 ? "s" : ""}
                {searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : ""}
              </span>
            )}
          </div>

          {/* Search input */}
          <div style={{ paddingTop: "18px" }}>
            <div style={{ position: "relative", maxWidth: "520px" }}>
              <svg
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: inputFocused ? "var(--blue)" : "var(--t3)",
                  pointerEvents: "none",
                  transition: "color 0.2s",
                }}
                width="15"
                height="15"
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
                id="browse-search"
                name="browse-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Filter by title..."
                aria-label="Filter films by title"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  background: "var(--surface)",
                  border: `1px solid ${inputFocused ? "var(--blue)" : "var(--border)"}`,
                  borderRadius: "12px",
                  color: "var(--t1)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow: inputFocused
                    ? "0 0 0 3px var(--blue-soft)"
                    : "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "var(--surface3)",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--t2)",
                    fontSize: "12px",
                    lineHeight: 1,
                    padding: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--blue-soft)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--surface3)")
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.background = "var(--blue-soft)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.background = "var(--surface3)")
                  }
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div
            style={{
              paddingTop: "16px",
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "999px",
                    fontSize: "13px",
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
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Genre chips */}
          {activeTab === "by-genre" && (
            <div
              style={{
                paddingTop: "12px",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {GENRES.map((g, i) => {
                const isActive = activeGenre === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    className="search-genre-chip"
                    onClick={() => selectGenre(g.id)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: "1px solid",
                      animationDelay: `${i * 25}ms`,
                      borderColor: isActive
                        ? "rgba(91,143,212,0.35)"
                        : "var(--tag-border)",
                      background: isActive
                        ? "var(--blue-soft)"
                        : "var(--tag-bg)",
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
        </div>
      </div>

      {/* Toolbar: sort */}
      <div className="browse-container">
        <div
          style={{
            paddingTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            borderBottom: "1px solid var(--border)",
            marginBottom: "16px",
            paddingBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <label htmlFor="browse-sort" style={{ fontSize: "12px", color: "var(--t3)" }}>
              Sort by
            </label>
            <select
              id="browse-sort"
              name="browse-sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              style={{
                padding: "7px 30px 7px 12px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--t1)",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239e9e9a'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                transition: "border-color 0.2s",
              }}
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Film grid */}
      <div className="browse-container">
        <div className="browse-film-grid" key={gridKey}>
          {isLoading
            ? Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
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
                      style={{
                        height: "13px",
                        width: "75%",
                        marginBottom: "8px",
                      }}
                    />
                    <div
                      className="search-skeleton-bar"
                      style={{ height: "10px", width: "40%" }}
                    />
                  </div>
                </div>
              ))
            : displayFilms.map((film, i) => (
                <div
                  key={film.id}
                  className="search-grid-enter"
                  style={{
                    animationDelay: `${Math.min(i * 30, 400)}ms`,
                    minWidth: 0,
                  }}
                >
                  <FilmCard
                    id={film.id}
                    title={film.title}
                    posterPath={film.poster_path}
                    releaseDate={film.release_date}
                    voteAverage={film.vote_average}
                    overview={film.overview}
                    accentBase="var(--blue)"
                  />
                </div>
              ))}
        </div>

        {/* Empty state */}
        {!isLoading && displayFilms.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
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
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--t2)",
                marginBottom: "6px",
              }}
            >
              {searchQuery
                ? `No films matching "${searchQuery}"`
                : "No films found"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--t3)" }}>
              Try a different search term or switch categories
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !searchQuery.trim() && totalPages > 1 && (
          <div
            style={{
              padding: "32px 0 52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            {/* Prev arrow */}
            <button
              onClick={() => goPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--t2)",
                cursor: page === 1 ? "default" : "pointer",
                opacity: page === 1 ? 0.3 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.borderColor = "var(--border-h)";
                  e.currentTarget.style.transform = "translateX(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "none";
              }}
              onFocus={(e) => {
                if (page !== 1) e.currentTarget.style.borderColor = "var(--border-h)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  style={{
                    color: "var(--t3)",
                    fontSize: "14px",
                    padding: "0 4px",
                  }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goPage(p as number)}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: page === p ? "var(--blue)" : "var(--surface)",
                    border:
                      page === p
                        ? "1px solid transparent"
                        : "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: page === p ? 600 : 500,
                    color: page === p ? "#fff" : "var(--t2)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow:
                      page === p ? "0 0 12px var(--blue-glow)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (page !== p) {
                      e.currentTarget.style.borderColor = "var(--border-h)";
                      e.currentTarget.style.color = "var(--t1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== p) {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--t2)";
                    }
                  }}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next arrow */}
            <button
              onClick={() => goPage(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--t2)",
                cursor: page === totalPages ? "default" : "pointer",
                opacity: page === totalPages ? 0.3 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (page !== totalPages) {
                  e.currentTarget.style.borderColor = "var(--border-h)";
                  e.currentTarget.style.transform = "translateX(1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "none";
              }}
              onFocus={(e) => {
                if (page !== totalPages) e.currentTarget.style.borderColor = "var(--border-h)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .browse-container {
          max-width: 1400px;
          margin: 0 auto;
          padding-left: 28px;
          padding-right: 28px;
        }
        .browse-film-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        @media (max-width: 1100px) {
          .browse-film-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; }
        }
        @media (max-width: 900px) {
          .browse-container { padding-left: 14px; padding-right: 14px; }
          .browse-film-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
        }
        @media (max-width: 560px) {
          .browse-container { padding-left: 12px; padding-right: 12px; }
          .browse-film-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }
      `}</style>
    </main>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid var(--border)",
              borderTopColor: "var(--blue)",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
