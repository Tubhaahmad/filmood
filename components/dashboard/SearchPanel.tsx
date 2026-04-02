"use client";

import FilmGrid from "@/components/film/FilmGrid";
import type { Film } from "@/lib/types";

interface SearchPanelProps {
  isOpen: boolean;
  films: Film[];
  onClose: () => void;
}

export default function SearchPanel({
  isOpen,
  films,
  onClose,
}: SearchPanelProps) {
  return (
    <div
      style={{
        maxHeight: isOpen ? "1200px" : "0",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition:
          "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s, padding 0.4s",
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
        {/* Label */}
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.8px",
            color: "#527bc7",
            marginBottom: "16px",
          }}
        >
          Search results — {films.length} film{films.length !== 1 ? "s" : ""}
        </div>

        {/* Film grid */}
        <FilmGrid films={films} />

        {/* Close row */}
        <div
          className="flex items-center gap-2.5"
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "14px",
            marginTop: "16px",
          }}
        >
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
        </div>
      </div>
    </div>
  );
}
