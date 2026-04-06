import { NextRequest, NextResponse } from "next/server";

type FilmRaw = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
};

function mapFilm(film: FilmRaw) {
  return {
    id: film.id,
    title: film.title,
    poster_path: film.poster_path,
    release_date: film.release_date,
    vote_average: film.vote_average,
    overview: film.overview,
  };
}

// Search by film title using TMDB /search/movie
async function searchByTitle(query: string, apiKey: string) {
  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("query", query);
  url.searchParams.set("page", "1");
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch from TMDB");
  const data = await res.json();
  return (data.results ?? []).slice(0, 20).map(mapFilm);
}

// Search by actor or director:
// 1. Find the person via /search/person
// 2. Fetch their movie credits
// 3. Return cast credits for actor, crew credits (directed) for director
async function searchByPerson(
  query: string,
  apiKey: string,
  role: "actor" | "director",
) {
  // Step 1: find the person
  const personUrl = new URL("https://api.themoviedb.org/3/search/person");
  personUrl.searchParams.set("api_key", apiKey);
  personUrl.searchParams.set("language", "en-US");
  personUrl.searchParams.set("query", query);
  personUrl.searchParams.set("page", "1");
  personUrl.searchParams.set("include_adult", "false");

  const personRes = await fetch(personUrl.toString());
  if (!personRes.ok) throw new Error("Failed to fetch person from TMDB");
  const personData = await personRes.json();

  const person = personData.results?.[0];
  if (!person) return [];

  // Step 2: fetch their movie credits
  const creditsUrl = new URL(
    `https://api.themoviedb.org/3/person/${person.id}/movie_credits`,
  );
  creditsUrl.searchParams.set("api_key", apiKey);
  creditsUrl.searchParams.set("language", "en-US");

  const creditsRes = await fetch(creditsUrl.toString());
  if (!creditsRes.ok) throw new Error("Failed to fetch credits from TMDB");
  const creditsData = await creditsRes.json();

  // Step 3: return relevant credits
  if (role === "actor") {
    return (creditsData.cast ?? [])
      .sort(
        (a: { popularity: number }, b: { popularity: number }) =>
          b.popularity - a.popularity,
      )
      .slice(0, 20)
      .map(mapFilm);
  }

  // director — filter crew by job
  return (creditsData.crew ?? [])
    .filter((c: { job: string }) => c.job === "Director")
    .sort(
      (a: { popularity: number }, b: { popularity: number }) =>
        b.popularity - a.popularity,
    )
    .slice(0, 20)
    .map(mapFilm);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const type = searchParams.get("type") ?? "title"; // "title" | "actor" | "director"

  if (!query || query.trim() === "") {
    return NextResponse.json(
      { error: "Missing 'query' query parameter" },
      { status: 400 },
    );
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 },
    );
  }

  try {
    let films;

    if (type === "actor") {
      films = await searchByPerson(query.trim(), apiKey, "actor");
    } else if (type === "director") {
      films = await searchByPerson(query.trim(), apiKey, "director");
    } else if (type === "all") {
      const [titleFilms, actorFilms, directorFilms] = await Promise.all([
        searchByTitle(query.trim(), apiKey),
        searchByPerson(query.trim(), apiKey, "actor"),
        searchByPerson(query.trim(), apiKey, "director"),
      ]);
      const seen = new Set<number>();
      films = [...titleFilms, ...actorFilms, ...directorFilms]
        .filter((f: { id: number }) => {
          if (seen.has(f.id)) return false;
          seen.add(f.id);
          return true;
        })
        .slice(0, 20);
    } else {
      films = await searchByTitle(query.trim(), apiKey);
    }

    return NextResponse.json({ films });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
