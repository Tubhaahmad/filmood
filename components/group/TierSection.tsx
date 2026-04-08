"use client";

import { useState } from "react";
import type { MatchResult } from "@/lib/types";
import { useMediaQuery } from "@/lib/useMediaQuery";
import ResultMovieCard from "./ResultMovieCard";

interface TierSectionProps {
  label: string;
  subLabel?: string;
  results: MatchResult[];
  /** Gold, teal, rose, etc — drives the label dot color */
  accent: "gold" | "teal" | "rose" | "violet";
  /** "Not Tonight" section collapses by default */
  collapsible?: boolean;
  dimmed?: boolean;
}

const ACCENT_MAP: Record<string, string> = {
  gold: "var(--gold)",
  teal: "var(--teal)",
  rose: "var(--rose)",
  violet: "var(--violet)",
};

export default function TierSection({
  label,
  subLabel,
  results,
  accent,
  collapsible = false,
  dimmed = false,
}: TierSectionProps) {
  const [open, setOpen] = useState(!collapsible);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  if (results.length === 0) return null;

  const accentColor = ACCENT_MAP[accent] ?? "var(--gold)";
  const gridCols = isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr";

  return (
    <section style={{ width: "100%", marginTop: "40px" }}>
      {/* Section header */}
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          padding: "0 0 16px",
          background: "none",
          border: "none",
          cursor: collapsible ? "pointer" : "default",
          textAlign: "left",
        }}
      >
        {/* Accent dot */}
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 12px ${accentColor}`,
            flexShrink: 0,
          }}
        />
        <h3
          className="font-serif"
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--t1)",
            letterSpacing: "-0.3px",
          }}
        >
          {label}
        </h3>
        <span
          className="font-sans"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--t3)",
            padding: "3px 9px",
            borderRadius: "100px",
            background: "var(--tag-bg)",
            border: "1px solid var(--tag-border)",
          }}
        >
          {results.length}
        </span>
        {subLabel && !isMobile && (
          <span
            className="font-sans"
            style={{
              fontSize: "11px",
              color: "var(--t3)",
              marginLeft: "4px",
            }}
          >
            {subLabel}
          </span>
        )}
        {collapsible && (
          <span
            className="font-sans"
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              color: "var(--t3)",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {open ? "Hide" : "Show"}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path d="M2 3.5l3 3 3-3" />
            </svg>
          </span>
        )}
      </button>

      {/* Grid of cards */}
      {open && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: isMobile ? "12px" : "16px",
            animation: "fadeUp 0.35s ease both",
          }}
        >
          {results.map((r) => (
            <ResultMovieCard key={r.movie.id} result={r} dimmed={dimmed} />
          ))}
        </div>
      )}
    </section>
  );
}
