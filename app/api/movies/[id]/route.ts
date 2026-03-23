
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  //  Get the movie ID from the URL
  const { id } = await params;

  //  Get the TMDB API key from environment variables
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 },
    );
  }

  try {
    //  Call the TMDB API for movie details + credits
    //  append_to_response=credits adds the cast/crew data to the response
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits`,
    );

    //  If TMDB returns an error (e.g. movie not found), pass it through
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch movie details" },
        { status: response.status },
      );
    }

    //  Parse the JSON response from TMDB
    const data = await response.json();

    //  Return only the fields we need (matching our FilmDetail type)
    return NextResponse.json({
      id: data.id,
      title: data.title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      runtime: data.runtime,
      vote_average: data.vote_average,
      genres: data.genres,
      credits: {
        cast: data.credits.cast
          .slice(0, 10)
          .map(
            (member: {
              id: number;
              name: string;
              character: string;
              profile_path: string | null;
            }) => ({
              id: member.id,
              name: member.name,
              character: member.character,
              profile_path: member.profile_path,
            }),
          ),
      },
    });
  } catch {
    //  If something unexpected goes wrong, return a 500 error
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
