"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import type { Film } from "@/lib/types";

type SearchType = "title" | "actor" | "director";

const browseTags: { label: string; type: SearchType }[] = [
  { label: "Film Title", type: "title" },
  { label: "Actor", type: "actor" },
  { label: "Director", type: "director" },
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
  onResults?: (films: Film[]) => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export default function SearchBox({
  onResults,
  onExpand,
  isExpanded,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [isLoading, setIsLoading] = useState(false);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch trending movies on mount
  useEffect(() => {
    fetch("/api/movies/trending")
      .then((res) => res.json())
      .then((data) => setTrending(data.films ?? []))
      .catch(() => {});
  }, []);

  const doSearch = useCallback(
    async (q: string, type: SearchType) => {
      if (!q.trim()) {
        onResults?.([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/movies/search?query=${encodeURIComponent(q.trim())}&type=${type}`,
        );
        const data = await res.json();
        onResults?.(data.films ?? []);
        onExpand?.();
      } catch {
        onResults?.([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onResults, onExpand],
  );

  // Debounced search on typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      onResults?.([]);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(query, searchType), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchType]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-active)",
        borderRadius: "16px",
        padding: "22px",
        boxShadow: "0 0 0 1px var(--border-active)",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.8px",
          color: "#527bc7",
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

      <div className="relative mb-3.5">
        <FiSearch
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--t3)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            searchType === "actor"
              ? "Search by actor name..."
              : searchType === "director"
                ? "Search by director name..."
                : "Search for a film..."
          }
          aria-label="Search films, actors, or directors"
          style={{
            width: "100%",
            borderRadius: "12px",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            color: "var(--t1)",
            padding: "11px 14px 11px 40px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        {isLoading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>

      <div className="mb-4.5 flex flex-wrap gap-2">
        {browseTags.map((tag) => (
          <button
            key={tag.type}
            type="button"
            onClick={() => setSearchType(tag.type)}
            style={{
              borderRadius: "999px",
              border: `1px solid ${searchType === tag.type ? "var(--border-active)" : "var(--border)"}`,
              background:
                searchType === tag.type ? "var(--surface2)" : "var(--bg)",
              color: searchType === tag.type ? "var(--t1)" : "var(--t2)",
              fontSize: "12px",
              lineHeight: 1,
              padding: "8px 11px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>

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

        <div className="flex flex-col gap-2.5">
          {trending.map((item, i) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5"
            >
              <span
                style={{
                  color: "var(--t3)",
                  fontSize: "12px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  color: "var(--t1)",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {item.title}
              </span>
              <span style={{ color: "var(--t3)", fontSize: "12px" }}>
                {GENRE_MAP[item.genre_ids?.[0]] ?? "Film"}
              </span>
            </div>
          ))}
          {trending.length === 0 && (
            <span style={{ color: "var(--t3)", fontSize: "12px" }}>
              Loading...
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
