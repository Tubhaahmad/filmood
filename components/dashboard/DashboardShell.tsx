"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import MoodBox from "./MoodBox";
import MoodPanel from "./MoodPanel";
import SearchBox from "./SearchBox";
import SearchPanel from "./SearchPanel";
import ExploreBox from "./ExploreBox";
import ExplorePanel from "./ExplorePanel";
import BottomSheet from "./BottomSheet";
import type { Film } from "@/lib/types";

export default function DashboardShell() {
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Film[]>([]);
  const [searchLabel, setSearchLabel] = useState<string | undefined>(undefined);

  const isMobile = useMediaQuery("(max-width: 899px)");
  const panelsRef = useRef<HTMLDivElement>(null);

  // Close bottom sheet if viewport flips from mobile to desktop mid-open
  useEffect(() => {
    if (!isMobile) setOpenPanel(null);
  }, [isMobile]);

  // Desktop: scroll to panel area when a panel opens
  useEffect(() => {
    if (isMobile || !openPanel || !panelsRef.current) return;
    // Small delay so the max-height animation has started expanding
    const timeout = setTimeout(() => {
      panelsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timeout);
  }, [openPanel, isMobile]);

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

  const closePanel = () => setOpenPanel(null);

  const handleSearchResults = useCallback((films: Film[], keepOpen?: boolean) => {
    setSearchResults(films);
    if (films.length === 0 && !keepOpen) {
      setOpenPanel((prev) => (prev === "search" ? null : prev));
    }
  }, []);

  const handleSearchLabel = useCallback((label: string) => {
    setSearchLabel(label);
  }, []);

  // Panel content for bottom sheet (embedded mode, no animation wrapper)
  const moodPanelContent = (
    <MoodPanel
      isOpen={true}
      embedded
      selectedMoods={selectedMoods}
      onSelectMood={handleSelectMood}
      onClose={closePanel}
    />
  );

  const searchPanelContent = (
    <SearchPanel
      isOpen={true}
      embedded
      films={searchResults}
      label={searchLabel}
      onClose={closePanel}
    />
  );

  const explorePanelContent = (
    <ExplorePanel
      isOpen={true}
      embedded
      onClose={closePanel}
    />
  );

  return (
    <div id="dashboard" className="mx-auto" style={{ maxWidth: "1400px" }}>
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
          onLabel={handleSearchLabel}
          onExpand={() => setOpenPanel("search")}
          isExpanded={openPanel === "search"}
        />
      </div>

      {/* Desktop: inline panels below the grid */}
      {!isMobile && (
        <div ref={panelsRef} style={{ padding: "0 28px" }}>
          <MoodPanel
            isOpen={openPanel === "mood"}
            selectedMoods={selectedMoods}
            onSelectMood={handleSelectMood}
            onClose={closePanel}
          />
          <SearchPanel
            isOpen={openPanel === "search"}
            films={searchResults}
            label={searchLabel}
            onClose={closePanel}
          />
          <ExplorePanel
            isOpen={openPanel === "explore"}
            onClose={closePanel}
          />
        </div>
      )}

      {/* Mobile: bottom sheet overlay */}
      {isMobile && (
        <BottomSheet
          isOpen={openPanel !== null}
          onClose={closePanel}
          accentColor={
            openPanel === "mood"
              ? "var(--gold)"
              : openPanel === "explore"
                ? "var(--teal)"
                : openPanel === "search"
                  ? "var(--blue)"
                  : undefined
          }
        >
          {openPanel === "mood" && moodPanelContent}
          {openPanel === "search" && searchPanelContent}
          {openPanel === "explore" && explorePanelContent}
        </BottomSheet>
      )}
    </div>
  );
}
