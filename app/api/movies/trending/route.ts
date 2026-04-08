import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 },
    );
  }

  try {
    const url = new URL("https://api.themoviedb.org/3/trending/movie/day");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "en-US");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch trending");
    const data = await res.json();

    const films = (data.results ?? [])
      .slice(0, 4)
      .map(
        (f: {
          id: number;
          title: string;
          genre_ids: number[];
          backdrop_path: string | null;
        }) => ({
          id: f.id,
          title: f.title,
          genre_ids: f.genre_ids,
          backdrop_path: f.backdrop_path,
        }),
      );

    return NextResponse.json({ films });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
