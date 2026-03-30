import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";

// GET /api/watchlist
// Returns all saved films for the logged-in user, newest first.
export async function GET(request: NextRequest) {
  // Step 1: Check if the user is logged in
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2: Query the watchlists table — only rows belonging to this user
  const { data, error } = await getSupabaseAdmin()
    .from("watchlists")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ watchlist: data });
}
