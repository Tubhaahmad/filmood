"use client";

import { allMoods } from "@/lib/moodMap";
import MoodCard from "./MoodCard";

const PREVIEW_KEYS = ["laugh", "escape", "unsettled", "thoughtful"];
const previewMoods = allMoods.filter((m) => PREVIEW_KEYS.includes(m.key));

interface MoodBoxProps {
  selectedMoods: Set<string>;
  onSelectMood: (key: string) => void;
  onExpand: () => void;
  isExpanded: boolean;
}

export default function MoodBox({
  selectedMoods,
  onSelectMood,
  onExpand,
  isExpanded,
}: MoodBoxProps) {
  return (
    <section
      onClick={onExpand}
      className="relative overflow-hidden cursor-pointer"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isExpanded ? "var(--border-active)" : "var(--border)"}`,
        borderRadius: "16px",
        padding: "22px",
        transition: "border-color 0.3s, box-shadow 0.3s",
        boxShadow: isExpanded ? "0 0 0 1px var(--border-active)" : "none",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.8px",
          color: "var(--gold)",
          marginBottom: "12px",
        }}
      >
        What to watch
      </div>

      {/* Heading */}
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
        Pick your mood
      </h2>

      {/* Subtext */}
      <p style={{ fontSize: "13px", color: "var(--t2)", lineHeight: 1.5, marginBottom: "16px" }}>
        Select how you want to feel — we&apos;ll find the film.
      </p>

      {/* 2x2 preview grid */}
      <div
        className="grid grid-cols-2 gap-[8px] mb-[10px]"
        onClick={(e) => e.stopPropagation()}
      >
        {previewMoods.map((mood) => (
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

      {/* See all moods button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className="flex w-full items-center justify-center gap-[6px] cursor-pointer"
        style={{
          padding: "9px",
          borderRadius: "10px",
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          color: "var(--t2)",
          fontSize: "12px",
          fontWeight: 500,
          transition: "all 0.25s",
        }}
      >
        <span>See all moods</span>
        <span
          style={{
            fontSize: "11px",
            transition: "transform 0.3s",
            transform: isExpanded ? "rotate(180deg)" : "none",
            display: "inline-block",
          }}
        >
          ↓
        </span>
      </button>
    </section>
  );
}
