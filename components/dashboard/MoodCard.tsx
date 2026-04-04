"use client";

import type { AccentColor } from "@/lib/types";

interface MoodCardProps {
  moodKey: string;
  tagLabel: string;
  label: string;
  description: string;
  accentColor: AccentColor;
  isSelected: boolean;
  onSelect: (key: string) => void;
}

// Maps accent name to its CSS variable names
const accentVars: Record<AccentColor, { base: string; soft: string; glow: string }> = {
  gold:   { base: "var(--gold)",   soft: "var(--gold-soft)",   glow: "var(--gold-glow)" },
  blue:   { base: "var(--blue)",   soft: "var(--blue-soft)",   glow: "var(--blue-glow)" },
  rose:   { base: "var(--rose)",   soft: "var(--rose-soft)",   glow: "var(--rose-glow)" },
  violet: { base: "var(--violet)", soft: "var(--violet-soft)", glow: "var(--violet-glow)" },
  teal:   { base: "var(--teal)",   soft: "var(--teal-soft)",   glow: "var(--teal-glow)" },
  ember:  { base: "var(--ember)",  soft: "var(--ember-soft)",  glow: "var(--ember-glow)" },
};

export default function MoodCard({
  moodKey,
  tagLabel,
  label,
  description,
  accentColor,
  isSelected,
  onSelect,
}: MoodCardProps) {
  const accent = accentVars[accentColor];

  return (
    <button
      onClick={() => onSelect(moodKey)}
      className="group relative flex flex-col overflow-hidden text-left cursor-pointer"
      style={{
        background: "var(--surface2)",
        border: `1px solid ${isSelected ? accent.base : "var(--border)"}`,
        borderRadius: "12px",
        padding: "14px 13px",
        minHeight: "95px",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Glow — fades in on hover or when selected */}
      <div
        className={`pointer-events-none absolute -top-[40%] -left-[20%] h-[80%] w-[140%]
          rounded-full transition-opacity duration-500
          ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{ background: accent.glow, filter: "blur(25px)" }}
        aria-hidden="true"
      />

      {/* Tag pill */}
      <span
        className="relative z-1 mb-auto inline-flex w-fit"
        style={{
          padding: "4px 8px",
          borderRadius: "100px",
          fontSize: "9px",
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: "0.2px",
          color: accent.base,
          background: accent.soft,
          border: `1px solid ${accent.soft}`,
        }}
      >
        {tagLabel}
      </span>

      {/* Title */}
      <div
        className="relative z-1"
        style={{
          marginTop: "10px",
          marginBottom: "3px",
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: 1.2,
          color: "var(--t1)",
        }}
      >
        {label}
      </div>

      {/* Subtitle */}
      <div
        className="relative z-1"
        style={{
          fontSize: "11px",
          fontWeight: 400,
          lineHeight: 1.3,
          color: "var(--t3)",
        }}
      >
        {description}
      </div>
    </button>
  );
}
