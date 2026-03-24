import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 },
    );
  }

  try {
    //  Call TMDB for videos (trailers, teasers, etc.)
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`,
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch trailer" },
        { status: response.status },
      );
    }
    const data = await response.json();

    //  Find the first YouTube "Trailer" video
    const trailer = (data.results || []).find(
      (v: any) => v.site === "YouTube" && v.type === "Trailer",
    );
    if (!trailer) {
      return NextResponse.json({ trailer: null });
    }

    //  Return the trailer data (matches TrailerData type)
    return NextResponse.json({
      trailer: {
        key: trailer.key,
        name: trailer.name,
        site: trailer.site,
        type: trailer.type,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
