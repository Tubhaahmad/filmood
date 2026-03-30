import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";

// DELETE /api/watchlist/remove
// Removes a film from the user's watchlist.
// Body: { movie_id: number }
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { movie_id } = body;

  if (!movie_id || typeof movie_id !== "number") {
    return NextResponse.json(
      { error: "movie_id is required and must be a number" },
      { status: 400 },
    );
  }

  // Delete only the row matching this user + this movie
  const { error } = await getSupabaseAdmin()
    .from("watchlists")
    .delete()
    .eq("user_id", user.id)
    .eq("movie_id", movie_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
