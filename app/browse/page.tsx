"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
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

const TABS: { id: BrowseCategory; label: string; heading: string }[] = [
  { id: "trending", label: "Trending", heading: "Trending today" },
  { id: "top-rated", label: "Top Rated", heading: "Top rated of all time" },
  { id: "new-releases", label: "New Releases", heading: "New releases" },
  { id: "in-cinemas", label: "In Cinemas", heading: "Now in cinemas (Norway)" },
  { id: "by-genre", label: "By Genre", heading: "Browse by genre" },
  {
    id: "streaming-norway",
    label: "Streaming in Norway",
    heading: "Streaming in Norway",
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

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<BrowseCategory>("trending");
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("popularity");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
        setTotalPages(Math.min(data.totalPages ?? 1, 20)); // cap at 20 pages
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

  // Client-side search filter + sort applied on top of loaded films
  const [searchFiltered, setSearchFiltered] = useState<Film[]>([]);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!searchQuery.trim()) {
        setSearchFiltered(sortFilms(films, sortOrder));
        return;
      }
      const q = searchQuery.trim().toLowerCase();
      setSearchFiltered(
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

  const displayFilms = searchFiltered;

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  // Build pagination page numbers
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <main>
        {/* Breadcrumb */}
        <div
          className="bs"
          style={{
            padding: "14px 0 0",
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--t3)",
          }}
        >
          <Link
            href="/"
            style={{ color: "var(--t3)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--t1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
          >
            Home
          </Link>
          <span style={{ fontSize: "10px" }}>›</span>
          <span style={{ color: "var(--t2)" }}>{currentTab.heading}</span>
        </div>

        {/* Page header */}
        <div
          className="bs"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "16px 0 0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 600,
              color: "var(--t1)",
              lineHeight: 1.2,
            }}
          >
            {currentTab.heading}
          </h1>
        </div>

        {/* Search bar */}
        <div
          className="bs"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "14px 0 0",
          }}
        >
          <div style={{ position: "relative", maxWidth: "480px" }}>
            <svg
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--t3)",
                pointerEvents: "none",
              }}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            >
              <circle cx="7" cy="7" r="4" />
              <path d="M10 10l3.5 3.5" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search films, actors, directors..."
              style={{
                width: "100%",
                padding: "12px 14px 12px 40px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
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
        </div>

        {/* Category tabs */}
        <div
          className="bs"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "16px 0 0",
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
                  padding: "8px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
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
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Genre chips */}
        {activeTab === "by-genre" && (
          <div
            className="bs"
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "12px 0 0",
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {GENRES.map((g) => {
              const isActive = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => selectGenre(g.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "100px",
                    fontSize: "11px",
                    fontWeight: 500,
                    lineHeight: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border: "1px solid",
                    borderColor: isActive
                      ? "rgba(91,143,212,0.3)"
                      : "var(--border)",
                    background: isActive
                      ? "var(--blue-soft)"
                      : "var(--surface)",
                    color: isActive ? "var(--blue)" : "var(--t2)",
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Toolbar: count + sort */}
        <div
          className="bs"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "14px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--t3)" }}>
            <strong style={{ color: "var(--t2)", fontWeight: 600 }}>
              {displayFilms.length}
            </strong>{" "}
            film{displayFilms.length !== 1 ? "s" : ""}
            {searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : ""}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--t3)" }}>
              Sort by
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              style={{
                padding: "6px 28px 6px 12px",
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

        {/* Film grid */}
        <div
          className="bs browse-film-grid"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            paddingTop: "14px",
          }}
        >
          {isLoading
            ? Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    aspectRatio: "2/3",
                    animation: "pulse 1.8s ease-in-out infinite",
                  }}
                />
              ))
            : displayFilms.map((film) => (
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

        {/* Pagination */}
        {!isLoading && !searchQuery.trim() && totalPages > 1 && (
          <div
            className="bs"
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "28px 0 48px",
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
              style={{
                width: "36px",
                height: "36px",
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
                  key={`ellipsis-${i}`}
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
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: page === p ? "var(--t1)" : "var(--surface)",
                    border:
                      page === p
                        ? "1px solid transparent"
                        : "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: page === p ? "var(--bg)" : "var(--t2)",
                    cursor: "pointer",
                    transition: "all 0.2s",
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
              style={{
                width: "36px",
                height: "36px",
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
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .bs { padding-left: 28px; padding-right: 28px; }
        .browse-film-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        @media (max-width: 1100px) {
          .browse-film-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 900px) {
          .bs { padding-left: 14px; padding-right: 14px; }
          .browse-film-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
        }
        @media (max-width: 560px) {
          .bs { padding-left: 12px; padding-right: 12px; }
          .browse-film-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }
      `}</style>
    </div>
  );
}
