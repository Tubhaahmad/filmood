"use client";

import { useState, useEffect, useRef } from "react";
import type { Film } from "@/lib/types";

type FilterType = "title" | "actor" | "director";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "Film Title", value: "title" },
  { label: "Actor", value: "actor" },
  { label: "Director", value: "director" },
];

interface SearchInputProps {
  onResults: (films: Film[]) => void;
  onLoading?: (loading: boolean) => void;
}

export default function SearchInput({ onResults, onLoading }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("title");
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      onResults([]);
      onLoading?.(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      onLoading?.(true);
      try {
        const res = await fetch(
          `/api/movies/search?query=${encodeURIComponent(query.trim())}&type=${filter}`
        );
        const data = await res.json();
        onResults(data.films ?? []);
      } catch {
        onResults([]);
      } finally {
        setIsLoading(false);
        onLoading?.(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const placeholders: Record<FilterType, string> = {
    title: "Search for a film title...",
    actor: "Search by actor name...",
    director: "Search by director name...",
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-4 w-5 h-5 pointer-events-none"
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
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholders[filter]}
          aria-label={`Search by ${filter}`}
          className="w-full rounded-xl py-3 pl-12 pr-10 text-base transition-all duration-200"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t1)", outline: "none" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-soft)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onResults([]);
            }}
            className="absolute right-4 transition-colors"
            style={{ color: "var(--t3)" }}
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {/* Loading spinner */}
        {isLoading && !query === false && (
          <span className="absolute right-4 w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--t1)" }} />
        )}
      </div>

      {/* Quick-filter tag buttons */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer"
            style={{
              background: filter === value ? "var(--gold)" : "transparent",
              color: filter === value ? "#0a0a0c" : "var(--t3)",
              borderColor: filter === value ? "var(--gold)" : "var(--border)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
