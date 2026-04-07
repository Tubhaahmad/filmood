"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import FilmGrid from "@/components/film/FilmGrid";
import type { Film, AccentColor } from "@/lib/types";
import { moodMap } from "@/lib/moodMap";

/* Accent system */
const accentVars: Record<
  AccentColor,
  { base: string; soft: string; glow: string }
> = {
  gold: {
    base: "var(--gold)",
    soft: "var(--gold-soft)",
    glow: "var(--gold-glow)",
  },
  blue: {
    base: "var(--blue)",
    soft: "var(--blue-soft)",
    glow: "var(--blue-glow)",
  },
  rose: {
    base: "var(--rose)",
    soft: "var(--rose-soft)",
    glow: "var(--rose-glow)",
  },
  violet: {
    base: "var(--violet)",
    soft: "var(--violet-soft)",
    glow: "var(--violet-glow)",
  },
  teal: {
    base: "var(--teal)",
    soft: "var(--teal-soft)",
    glow: "var(--teal-glow)",
  },
  ember: {
    base: "var(--ember)",
    soft: "var(--ember-soft)",
    glow: "var(--ember-glow)",
  },
};

function getMeta(moods: string[]) {
  const key = moods[0]?.trim().toLowerCase() ?? "";
  const mood = moodMap[key];

  return {
    accent: (mood?.accentColor ?? "gold") as AccentColor,
    tagline: mood?.description ?? "Films picked just for this moment.",
    label: mood?.label ?? "Your Matches",
  };
}

/* Hero */
function Hero({ moods, filmCount }: { moods: string[]; filmCount: number }) {
  const { accent: accentKey, tagline } = getMeta(moods);
  const accent = accentVars[accentKey];

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        marginBottom: "32px",
        padding: "clamp(28px, 5vw, 44px) clamp(20px, 5vw, 40px)",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--t3)",
          textDecoration: "none",
          marginBottom: "16px",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        ← Back
      </Link>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: "12px",
        }}
      >
        {moods.map((m) => {
          const moodKey = m.trim().toLowerCase();
          const moodAccentKey = moodMap[moodKey]?.accentColor ?? "gold";
          const moodAccent = accentVars[moodAccentKey];

          return (
            <span
              key={m}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: moodAccent.base,
                background: moodAccent.soft,
                border: `1px solid ${moodAccent.soft}`,
              }}
            >
              {moodMap[moodKey]?.tagLabel ?? moodMap[moodKey]?.label ?? m}
            </span>
          );
        })}
      </div>

      <h1
        className="font-serif"
        style={{
          fontSize: "clamp(24px, 4vw, 34px)",
          fontWeight: 700,
          color: "var(--t1)",
          margin: "0 0 8px",
          letterSpacing: "-0.5px",
          lineHeight: 1.1,
        }}
      >
        Your Matches
      </h1>

      <p
        style={{
          fontSize: "14px",
          color: "var(--t2)",
          margin: "0 0 18px",
          lineHeight: 1.6,
        }}
      >
        {tagline}
      </p>

      {filmCount > 0 && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "var(--r)",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            fontSize: "12px",
            color: "var(--t2)",
          }}
        >
          <span style={{ color: accent.base, fontWeight: 600 }}>
            {filmCount}
          </span>
          films found
        </div>
      )}
    </div>
  );
}

/* Results content */
function ResultsContent() {
  const searchParams = useSearchParams();
  const mood = searchParams.get("mood");
  const runtime = searchParams.get("runtime");
  const language = searchParams.get("language");
  const exclude = searchParams.get("exclude");

  const [films, setFilms] = useState<Film[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mood) {
      setLoading(false);
      return;
    }

    const parsedMoods = mood
      .split(",")
      .map((m) => m.trim().toLowerCase())
      .filter(Boolean);

    const fetchFilms = async () => {
      try {
        setLoading(true);
        setError(null);

        setMoods(parsedMoods);

        // Build API URL with mood
        const params = new URLSearchParams({ mood });
        if (runtime) params.set("runtime", runtime);
        if (language) params.set("language", language);
        if (exclude) params.set("exclude", exclude);

        const res = await fetch(
          `/api/movies/discover?${params.toString()}`,
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load films");
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setFilms(Array.isArray(data.films) ? data.films : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load films");
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [mood, runtime, language, exclude]);
  if (!mood) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--t2)" }} className="mb-4">
          No mood selected.
        </p>
        <Link
          href="/"
          style={{ color: "var(--t1)", textDecoration: "underline" }}
        >
          Pick a mood first
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <p style={{ color: "var(--t2)" }} className="py-12">
        Loading films...
      </p>
    );
  }

  if (error) {
    return (
      <p style={{ color: "var(--rose)" }} className="py-12">
        {error}
      </p>
    );
  }

  const { accent: accentKey } = getMeta(moods);
  const accentBase = accentVars[accentKey].base;

  return (
    <>
      <Hero moods={moods} filmCount={films.length} />
      <FilmGrid films={films} accentBase={accentBase} />
      <Link
        href="/"
        className="mt-8 text-sm"
        style={{ color: "var(--t2)", textDecoration: "underline" }}
      >
        ← Try different moods
      </Link>
    </>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function ResultsPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center px-4 pt-8 pb-12"
      style={{ background: "var(--bg)" }}
    >
      <Suspense fallback={<p style={{ color: "var(--t2)" }}>Loading...</p>}>
        <ResultsContent />
      </Suspense>
    </main>
  );
}
