"use client";

import { useState, useCallback } from "react";
import MoodBox from "./MoodBox";
import MoodPanel from "./MoodPanel";
import ExploreBox from "./ExploreBox";
import ExplorePanel from "./ExplorePanel";

export default function DashboardShell() {
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
  const [openPanel, setOpenPanel] = useState<string | null>(null);

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
      </div>

      <div style={{ padding: "0 28px" }}>
        <MoodPanel
          isOpen={openPanel === "mood"}
          selectedMoods={selectedMoods}
          onSelectMood={handleSelectMood}
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
