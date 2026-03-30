import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";

// POST /api/watchlist/add
// Saves a film to the user's watchlist.
// Body: { movie_id: number, movie_title: string, poster_path: string | null }
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Read the request body
  const body = await request.json();
  const { movie_id, movie_title, poster_path } = body;

  // Validate required fields
  if (!movie_id || typeof movie_id !== "number") {
    return NextResponse.json(
      { error: "movie_id is required and must be a number" },
      { status: 400 },
    );
  }
  if (!movie_title || typeof movie_title !== "string") {
    return NextResponse.json(
      { error: "movie_title is required" },
      { status: 400 },
    );
  }

  // Check if this film is already in the user's watchlist
  const { data: existing } = await getSupabaseAdmin()
    .from("watchlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("movie_id", movie_id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Film already in watchlist" },
      { status: 409 },
    );
  }

  // Insert the new watchlist entry
  const { data, error } = await getSupabaseAdmin()
    .from("watchlists")
    .insert({
      user_id: user.id,
      movie_id,
      movie_title,
      poster_path: poster_path || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data }, { status: 201 });
}
