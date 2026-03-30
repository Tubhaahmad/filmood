"use client";

import { useRouter } from "next/navigation";
import { allMoods } from "@/lib/moodMap";
import MoodCard from "./MoodCard";

interface MoodPanelProps {
  isOpen: boolean;
  selectedMoods: Set<string>;
  onSelectMood: (key: string) => void;
  onClose: () => void;
}

export default function MoodPanel({
  isOpen,
  selectedMoods,
  onSelectMood,
  onClose,
}: MoodPanelProps) {
  const router = useRouter();
  const count = selectedMoods.size;

  const handleFindFilms = () => {
    if (count === 0) return;
    const moods = Array.from(selectedMoods).join(",");
    router.push(`/results?mood=${moods}`);
  };

  return (
    <div
      style={{
        maxHeight: isOpen ? "800px" : "0",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s, padding 0.4s",
        paddingBottom: isOpen ? "10px" : "0",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "22px",
        }}
      >
        {/* Panel label */}
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.8px",
            color: "var(--gold)",
            marginBottom: "16px",
          }}
        >
          All moods
        </div>

        {/* Full mood grid */}
        <div className="grid grid-cols-2 gap-[8px] mb-[16px] sm:grid-cols-3 min-[900px]:grid-cols-4 xl:grid-cols-5">
          {allMoods.map((mood) => (
            <MoodCard
              key={mood.key}
              moodKey={mood.key}
              tagLabel={mood.tagLabel}
              label={mood.label}
              description={mood.description}
              accentColor={mood.accentColor}
              isSelected={selectedMoods.has(mood.key)}
              onSelect={onSelectMood}
            />
          ))}
        </div>

        {/* Action row */}
        <div
          className="flex items-center gap-[10px] flex-wrap"
          style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}
        >
          {count > 0 && (
            <button
              onClick={handleFindFilms}
              className="cursor-pointer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 20px",
                borderRadius: "10px",
                background: "var(--gold)",
                color: "#0a0a0c",
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: 1,
                border: "none",
                transition: "all 0.25s",
              }}
            >
              Find films →
            </button>
          )}

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
          >
            Close
          </button>

          <span className="ml-auto" style={{ fontSize: "12px", color: "var(--t3)" }}>
            {count > 0
              ? `${count} mood${count > 1 ? "s" : ""} selected`
              : "Select your moods, then find films"}
          </span>
        </div>
      </div>
    </div>
  );
}
