import { NextRequest, NextResponse } from "next/server";
import { buildTMDBParams, moodMap } from "@/lib/moodMap";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moodParam = searchParams.get("mood");

  if (!moodParam) {
    return NextResponse.json(
      { error: "Missing 'mood' query parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  // Support comma-separated moods: ?mood=laugh,escape
  const moodKeys = moodParam.split(",").filter((k) => k in moodMap);
  if (moodKeys.length === 0) {
    return NextResponse.json(
      { error: "No valid moods provided" },
      { status: 400 }
    );
  }

  try {
    // Fetch results for each mood in parallel
    const fetches = moodKeys.map(async (key) => {
      const moodParams = buildTMDBParams(key);
      const url = new URL("https://api.themoviedb.org/3/discover/movie");
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("language", "en-US");
      url.searchParams.set("page", "1");

      for (const [k, v] of Object.entries(moodParams)) {
        url.searchParams.set(k, v);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      return data.results ?? [];
    });

    const allResults = await Promise.all(fetches);

    // Merge and deduplicate by movie ID, keep first occurrence
    const seen = new Set<number>();
    const films = allResults
      .flat()
      .filter((film: { id: number }) => {
        if (seen.has(film.id)) return false;
        seen.add(film.id);
        return true;
      })
      .slice(0, 20);

    const labels = moodKeys.map((k) => moodMap[k].label);

    return NextResponse.json({
      mood: moodParam,
      moods: labels,
      films,
      total: films.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch films";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
