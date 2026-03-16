// =============================================
// DISCOVER API ROUTE — /api/movies/discover
// =============================================
// This is a Next.js API route (server-side only).
// It receives a mood key from the frontend, builds TMDB query params,
// calls the TMDB API, and returns the top 12 matching films.
//
// Example: GET /api/movies/discover?mood=laugh
//
// Why server-side?
// → The TMDB API key (process.env.TMDB_API_KEY) stays on the server.
// → The browser never sees it — only the results.

import { NextRequest, NextResponse } from "next/server";
import { buildTMDBParams } from "@/lib/moodMap";

// GET handler — Next.js calls this when someone visits /api/movies/discover
export async function GET(request: NextRequest) {
  // 1. Read the "mood" query parameter from the URL
  //    e.g. /api/movies/discover?mood=laugh → mood = "laugh"
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood");

  // 2. If no mood was provided, return an error
  if (!mood) {
    return NextResponse.json(
      { error: "Missing 'mood' query parameter" },
      { status: 400 }
    );
  }

  // 3. Get the TMDB API key from environment variables
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    // 4. Use buildTMDBParams() from moodMap.ts to convert the mood
    //    into TMDB query parameters
    //    e.g. "laugh" → { with_genres: "35", sort_by: "popularity.desc", ... }
    const moodParams = buildTMDBParams(mood);

    // 5. Build the full TMDB API URL
    const url = new URL("https://api.themoviedb.org/3/discover/movie");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", "1");

    // 6. Add all mood-specific params to the URL
    for (const [key, value] of Object.entries(moodParams)) {
      url.searchParams.set(key, value);
    }

    // 7. Call TMDB
    const response = await fetch(url.toString());
    const data = await response.json();

    // 8. Return only the first 12 films (curated, not a long scroll)
    const films = data.results?.slice(0, 12) ?? [];

    return NextResponse.json({ mood, films, total: films.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch films";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
