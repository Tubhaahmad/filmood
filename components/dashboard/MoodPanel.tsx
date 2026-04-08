"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { allMoods } from "@/lib/moodMap";
import MoodCard from "./MoodCard";

// Genre IDs for exclusion chips
const EXCLUSION_OPTIONS = [
  { id: 27, label: "Horror" },
  { id: 10749, label: "Romance" },
  { id: 16, label: "Animation" },
  { id: 99, label: "Docs" },
];

interface MoodPanelProps {
  isOpen: boolean;
  selectedMoods: Set<string>;
  onSelectMood: (key: string) => void;
  onClose: () => void;
  embedded?: boolean;
}

export default function MoodPanel({
  isOpen,
  selectedMoods,
  onSelectMood,
  onClose,
  embedded,
}: MoodPanelProps) {
  const router = useRouter();
  const count = selectedMoods.size;

  // Refinement state
  const [showRefine, setShowRefine] = useState(false);
  const [runtime, setRuntime] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [excludedGenres, setExcludedGenres] = useState<Set<number>>(new Set());

  const toggleExclusion = (genreId: number) => {
    setExcludedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genreId)) {
        next.delete(genreId);
      } else {
        next.add(genreId);
      }
      return next;
    });
  };

  const hasRefinements = runtime !== null || language !== null || excludedGenres.size > 0;

  const handleFindFilms = () => {
    if (count === 0) return;

    const params = new URLSearchParams();
    params.set("mood", Array.from(selectedMoods).join(","));

    if (runtime) params.set("runtime", runtime);
    if (language) params.set("language", language);
    if (excludedGenres.size > 0) {
      params.set("exclude", Array.from(excludedGenres).join(","));
    }

    router.push(`/results?${params.toString()}`);
  };

  const chipStyle = (isActive: boolean, variant?: "exclusion") => ({
    padding: "7px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 500 as const,
    cursor: "pointer" as const,
    border: "1px solid",
    transition: "all 0.2s",
    userSelect: "none" as const,
    ...(variant === "exclusion" && isActive
      ? {
          background: "var(--rose-soft)",
          color: "var(--rose)",
          borderColor: "rgba(196, 107, 124, 0.25)",
        }
      : isActive
        ? {
            background: "var(--t1)",
            color: "var(--bg)",
            borderColor: "transparent",
          }
        : {
            background: "var(--surface)",
            color: "var(--t2)",
            borderColor: "var(--border)",
          }),
  });

  const content = (
    <>
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
      <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-3 min-[900px]:grid-cols-4 xl:grid-cols-5">
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

      {/* Refine toggle + area */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "14px",
          marginBottom: "4px",
        }}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowRefine((p) => !p)}
            className={`cursor-pointer font-sans ${!showRefine ? "btn-panel-refine" : ""}`}
            style={{
              padding: "8px 16px",
              borderRadius: "9px",
              fontSize: "12px",
              fontWeight: 500,
              border: "1px solid",
              transition: "all 0.25s",
              ...(showRefine
                ? {
                    background: "var(--t1)",
                    color: "var(--bg)",
                    borderColor: "transparent",
                  }
                : {
                    background: "var(--gold-soft)",
                    color: "var(--gold)",
                    borderColor: "rgba(196, 163, 90, 0.2)",
                  }),
            }}
          >
            Refine results
          </button>

          {hasRefinements && !showRefine && (
            <span style={{ fontSize: "11px", color: "var(--t3)" }}>
              Filters active
            </span>
          )}
        </div>

        {/* Refinement chips */}
        <div
          style={{
            maxHeight: showRefine ? "300px" : "0",
            opacity: showRefine ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s, margin 0.3s",
            marginTop: showRefine ? "14px" : "0",
          }}
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{
              padding: "16px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
          >
            {/* Runtime */}
            <div>
              <div
                className="font-sans"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--t2)",
                  marginBottom: "8px",
                }}
              >
                How long do you have?
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "short", label: "Under 100 min" },
                  { value: "long", label: "Epic (150+)" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRuntime(runtime === opt.value ? null : opt.value)}
                    className="cursor-pointer font-sans"
                    style={chipStyle(runtime === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <div
                className="font-sans"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--t2)",
                  marginBottom: "8px",
                }}
              >
                Subtitles okay?
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "en", label: "English only" },
                  { value: "scand", label: "Nordic + EN" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLanguage(language === opt.value ? null : opt.value)}
                    className="cursor-pointer font-sans"
                    style={chipStyle(language === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div>
              <div
                className="font-sans"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--t2)",
                  marginBottom: "8px",
                }}
              >
                Not in the mood for...
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EXCLUSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleExclusion(opt.id)}
                    className="cursor-pointer font-sans"
                    style={chipStyle(excludedGenres.has(opt.id), "exclusion")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div
        className="flex items-center gap-2.5 flex-wrap"
        style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "10px" }}
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
          className="btn-panel-outline cursor-pointer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "9px 18px",
            borderRadius: "10px",
            background: "none",
            color: "var(--t1)",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1,
            border: "1px solid var(--border-h)",
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
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <div
      style={{
        maxHeight: isOpen ? "1200px" : "0",
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
        {content}
      </div>
    </div>
  );
}
