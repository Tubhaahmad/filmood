// =============================================
// RESULTS PAGE — /results?mood=laugh
// =============================================
// This page:
// 1. Reads the "mood" from the URL (e.g. ?mood=laugh)
// 2. Calls our /api/movies/discover API route
// 3. Shows the films in a grid using FilmGrid
//
// "use client" is needed because we use useState, useEffect, and useSearchParams
// (these only work in the browser, not on the server)

"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import FilmGrid from "@/components/film/FilmGrid";
import Link from "next/link";

// ---------- Film type ----------
// Matches the TMDB response shape
interface Film {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

// ---------- Inner component ----------
// useSearchParams() must be wrapped in <Suspense> in Next.js App Router
function ResultsContent() {
  // Read ?mood=laugh from the URL
  const searchParams = useSearchParams();
  const mood = searchParams.get("mood");

  // State: films array, loading flag, error message
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect runs ONCE when the page loads (or when mood changes)
  // It calls our API route and stores the films in state
  useEffect(() => {
    if (!mood) {
      setLoading(false);
      return;
    }

    const fetchFilms = async () => {
      try {
        // Call OUR API route (not TMDB directly — keeps key hidden)
        const res = await fetch(`/api/movies/discover?mood=${mood}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        setFilms(data.films);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load films");
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [mood]);

  // ---------- Render ----------

  // No mood in URL
  if (!mood) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50 mb-4">No mood selected.</p>
        <Link href="/mood" className="text-white underline">
          Pick a mood first
        </Link>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <p className="text-white/50 py-12">Loading films...</p>;
  }

  // Error state
  if (error) {
    return <p className="text-red-400 py-12">{error}</p>;
  }

  // Success — show the films!
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Your Matches</h1>
      <p className="text-white/50 mb-8">Mood: {mood}</p>
      <FilmGrid films={films} />
      <Link
        href="/mood"
        className="mt-8 text-white/50 hover:text-white transition underline text-sm"
      >
        ← Try a different mood
      </Link>
    </>
  );
}

// ---------- Page component ----------
// Wraps ResultsContent in Suspense (required by Next.js for useSearchParams)
export default function ResultsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 pt-24 pb-12 bg-black">
      <Suspense fallback={<p className="text-white/50">Loading...</p>}>
        <ResultsContent />
      </Suspense>
    </main>
  );
}
