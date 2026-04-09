import { NextRequest, NextResponse } from "next/server";
import { buildTMDBParams, buildMergedTMDBParams, moodMap } from "@/lib/moodMap";

// Shared helper: build a TMDB discover URL from param object + refinements
function buildDiscoverURL(
  apiKey: string,
  moodParams: Record<string, string>,
  refinements: { runtime: string | null; language: string | null; exclude: string | null },
): URL {
  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  for (const [k, v] of Object.entries(moodParams)) {
    url.searchParams.set(k, v);
  }

  if (refinements.runtime === "short") {
    url.searchParams.set("with_runtime.lte", "100");
  } else if (refinements.runtime === "long") {
    url.searchParams.set("with_runtime.gte", "150");
  }

  if (refinements.language === "en") {
    url.searchParams.set("with_original_language", "en");
  } else if (refinements.language === "scand") {
    url.searchParams.set("with_original_language", "en|no|sv|da|fi|is");
  }

  if (refinements.exclude) {
    const existing = url.searchParams.get("without_genres");
    const merged = existing ? `${existing},${refinements.exclude}` : refinements.exclude;
    url.searchParams.set("without_genres", merged);
  }

  return url;
}

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

  // Optional refinement params
  const runtime = searchParams.get("runtime");   // "short" | "long"
  const language = searchParams.get("language");  // "en" | "scand"
  const exclude = searchParams.get("exclude");    // comma-separated genre IDs
  const refinements = { runtime, language, exclude };

  try {
    // ── Primary: merged mood query ──
    // For a single mood this behaves identically to the old per-mood fetch.
    // For multiple moods it builds a single TMDB query that targets the
    // genre intersection (or cross-genre AND), so results genuinely match
    // the *combination* of moods rather than being a shuffled concat.
    const mergedParams = buildMergedTMDBParams(moodKeys);
    const mergedURL = buildDiscoverURL(apiKey, mergedParams, refinements);

    const mergedRes = await fetch(mergedURL.toString());
    if (!mergedRes.ok) throw new Error(`TMDB error: ${mergedRes.status}`);
    const mergedData = await mergedRes.json();
    let films: { id: number }[] = mergedData.results ?? [];

    // ── Fallback: if the merged query returned < 5 films and we have
    //    multiple moods, supplement with per-mood results so the page
    //    never feels empty. The blended results stay at the top. ──
    if (films.length < 5 && moodKeys.length > 1) {
      const seen = new Set(films.map((f) => f.id));

      const fallbackFetches = moodKeys.map(async (key) => {
        const params = buildTMDBParams(key);
        const url = buildDiscoverURL(apiKey, params, refinements);
        const res = await fetch(url.toString());
        if (!res.ok) return [];
        const data = await res.json();
        return (data.results ?? []) as { id: number }[];
      });

      const fallbackResults = await Promise.all(fallbackFetches);
      const extras = fallbackResults.flat().filter((f) => {
        if (seen.has(f.id)) return false;
        seen.add(f.id);
        return true;
      });

      // Merged (blended) results first, then individual mood results
      films = [...films, ...extras];
    }

    films = films.slice(0, 20);

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
