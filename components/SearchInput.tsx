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
          className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none"
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
          className="w-full bg-white/10 border border-white/10 text-white placeholder-gray-500 rounded-xl py-3 pl-12 pr-10 text-base focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
        />
        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onResults([]);
            }}
            className="absolute right-4 text-gray-400 hover:text-white transition-colors"
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
          <span className="absolute right-4 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
      </div>

      {/* Quick-filter tag buttons */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
              filter === value
                ? "bg-white text-black border-white"
                : "bg-transparent text-gray-400 border-white/20 hover:border-white/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
