"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import FilmGrid from "@/components/film/FilmGrid";
import Link from "next/link";
import type { Film } from "@/lib/types";

function ResultsContent() {
  const searchParams = useSearchParams();
  const mood = searchParams.get("mood");

  const [films, setFilms] = useState<Film[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mood) {
      setLoading(false);
      return;
    }

    const fetchFilms = async () => {
      try {
        const res = await fetch(`/api/movies/discover?mood=${mood}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        setFilms(data.films);
        setMoods(data.moods || [mood]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load films");
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [mood]);

  if (!mood) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--t2)" }} className="mb-4">No mood selected.</p>
        <Link href="/" style={{ color: "var(--t1)", textDecoration: "underline" }}>
          Pick a mood first
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p style={{ color: "var(--t2)" }} className="py-12">Loading films...</p>;
  }

  if (error) {
    return <p style={{ color: "var(--rose)" }} className="py-12">{error}</p>;
  }

  return (
    <>
      <h1
        className="font-serif mb-2"
        style={{ fontSize: "28px", fontWeight: 600, color: "var(--t1)" }}
      >
        Your Matches
      </h1>
      <p style={{ color: "var(--t2)", marginBottom: "32px" }}>
        {moods.length > 1
          ? `Moods: ${moods.join(" + ")}`
          : `Mood: ${moods[0]}`}
      </p>
      <FilmGrid films={films} />
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

export default function ResultsPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center px-4 pt-24 pb-12"
      style={{ background: "var(--bg)" }}
    >
      <Suspense fallback={<p style={{ color: "var(--t2)" }}>Loading...</p>}>
        <ResultsContent />
      </Suspense>
    </main>
  );
}
