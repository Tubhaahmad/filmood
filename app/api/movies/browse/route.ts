import { NextRequest, NextResponse } from "next/server";

type FilmRaw = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
};

function mapFilm(f: FilmRaw) {
  return {
    id: f.id,
    title: f.title,
    poster_path: f.poster_path,
    release_date: f.release_date,
    vote_average: f.vote_average,
    overview: f.overview,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const genreId = searchParams.get("genre");
  const page = searchParams.get("page") ?? "1";

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 },
    );
  }

  if (!category) {
    return NextResponse.json(
      { error: "Missing 'category' query parameter" },
      { status: 400 },
    );
  }

  try {
    let url: URL;

    switch (category) {
      case "trending": {
        url = new URL("https://api.themoviedb.org/3/trending/movie/day");
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("language", "en-US");
        url.searchParams.set("page", page);
        break;
      }
      case "top-rated": {
        url = new URL("https://api.themoviedb.org/3/movie/top_rated");
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("language", "en-US");
        url.searchParams.set("page", page);
        break;
      }
      case "new-releases": {
        url = new URL("https://api.themoviedb.org/3/discover/movie");
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("language", "en-US");
        url.searchParams.set("sort_by", "release_date.desc");
        url.searchParams.set("include_adult", "false");
        url.searchParams.set("include_video", "false");
        url.searchParams.set("page", page);
        url.searchParams.set("vote_count.gte", "10");
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        url.searchParams.set(
          "primary_release_date.gte",
          oneYearAgo.toISOString().split("T")[0],
        );
        url.searchParams.set(
          "primary_release_date.lte",
          today.toISOString().split("T")[0],
        );
        break;
      }
      case "in-cinemas": {
        url = new URL("https://api.themoviedb.org/3/movie/now_playing");
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("language", "en-US");
        url.searchParams.set("page", page);
        url.searchParams.set("region", "NO");
        break;
      }
      case "by-genre": {
        url = new URL("https://api.themoviedb.org/3/discover/movie");
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("language", "en-US");
        if (genreId) url.searchParams.set("with_genres", genreId);
        url.searchParams.set("sort_by", "popularity.desc");
        url.searchParams.set("page", page);
        break;
      }
      case "streaming-norway": {
        url = new URL("https://api.themoviedb.org/3/discover/movie");
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("language", "en-US");
        url.searchParams.set("sort_by", "popularity.desc");
        url.searchParams.set("watch_region", "NO");
        url.searchParams.set("with_watch_monetization_types", "flatrate");
        url.searchParams.set("page", page);
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 },
        );
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch from TMDB");
    const data = await res.json();

    const films = (data.results ?? []).map(mapFilm);
    const totalPages: number = data.total_pages ?? 1;
    return NextResponse.json({ films, totalPages });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
