// =============================================
// WATCH PROVIDERS API ROUTE — /api/movies/[id]/providers
// =============================================
// Fetches streaming providers for a movie from TMDB.
// Only returns providers available in Norway (country code: NO).
//
// Example: GET /api/movies/550/providers
// → Returns streaming options for "Fight Club" in Norway

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
    //  Call TMDB for watch providers
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apiKey}`,
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch watch providers" },
        { status: response.status },
      );
    }
    const data = await response.json();

    //  Only return providers for Norway (NO)
    const results = data.results?.NO;
    if (!results) {
      return NextResponse.json({ providers: [] });
    }

    //  Combine flatrate (streaming), rent, and buy providers into one array
    const allProviders = [
      ...(results.flatrate || []),
      ...(results.rent || []),
      ...(results.buy || []),
    ];

    //  Remove duplicates by provider_id
    const uniqueProviders = Array.from(
      new Map(allProviders.map((p: any) => [p.provider_id, p])).values(),
    );

    //  Return as array of Provider objects
    return NextResponse.json({ providers: uniqueProviders });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
