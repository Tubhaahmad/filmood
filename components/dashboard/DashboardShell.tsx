"use client";

import { useState, useCallback } from "react";
import MoodBox from "./MoodBox";
import MoodPanel from "./MoodPanel";
import SearchBox from "./SearchBox";
import SearchPanel from "./SearchPanel";
import ExploreBox from "./ExploreBox";
import ExplorePanel from "./ExplorePanel";
import type { Film } from "@/lib/types";

export default function DashboardShell() {
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Film[]>([]);
  const [panelCategory, setPanelCategory] = useState<string | null>(null);
  const [panelGenre, setPanelGenre] = useState<number | null>(null);

  const handleSelectMood = useCallback((key: string) => {
    setSelectedMoods((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const togglePanel = (panel: string) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  const handleSearchResults = useCallback(
    (films: Film[], keepOpen?: boolean) => {
      setSearchResults(films);
      if (films.length === 0 && !keepOpen) {
        setOpenPanel((prev) => (prev === "search" ? null : prev));
      }
    },
    [],
  );

  // Called from SearchBox pills to keep panel tabs in sync
  const handleActiveCategory = useCallback(
    (category: string | null, genreId?: number | null) => {
      setPanelCategory(category);
      setPanelGenre(genreId ?? null);
    },
    [],
  );

  // Called from SearchPanel tabs — fetches data and updates results
  const handlePanelCategoryChange = useCallback(
    async (category: string, genreId?: number) => {
      setPanelCategory(category);
      setPanelGenre(genreId ?? null);
      setOpenPanel("search");
      try {
        const params = new URLSearchParams({ category });
        if (genreId) params.set("genre", String(genreId));
        const res = await fetch(`/api/movies/browse?${params.toString()}`);
        const data = await res.json();
        setSearchResults(data.films ?? []);
      } catch {
        // silently ignore network errors
      }
    },
    [],
  );

  return (
    <div className="mx-auto" style={{ maxWidth: "1400px" }}>
      <div
        className="grid grid-cols-1 min-[900px]:grid-cols-3"
        style={{ gap: "10px", padding: "10px 28px" }}
      >
        <MoodBox
          selectedMoods={selectedMoods}
          onSelectMood={handleSelectMood}
          onExpand={() => togglePanel("mood")}
          isExpanded={openPanel === "mood"}
        />
        <ExploreBox
          onExpand={() => togglePanel("explore")}
          isExpanded={openPanel === "explore"}
        />
        <SearchBox
          onResults={handleSearchResults}
          onActiveCategory={handleActiveCategory}
          onExpand={() => setOpenPanel("search")}
          isExpanded={openPanel === "search"}
        />
      </div>

      <div style={{ padding: "0 28px" }}>
        <MoodPanel
          isOpen={openPanel === "mood"}
          selectedMoods={selectedMoods}
          onSelectMood={handleSelectMood}
          onClose={() => setOpenPanel(null)}
        />
        <SearchPanel
          isOpen={openPanel === "search"}
          films={searchResults}
          activeCategory={panelCategory}
          activeGenre={panelGenre}
          onCategoryChange={handlePanelCategoryChange}
          onClose={() => setOpenPanel(null)}
        />
        <ExplorePanel
          isOpen={openPanel === "explore"}
          onClose={() => setOpenPanel(null)}
        />
      </div>
    </div>
  );
}
