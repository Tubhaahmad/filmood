import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

// Lazy singleton — avoids crashing during Next.js static page collection
// when env vars aren't available yet. The client is only created on first use.
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing Supabase env vars");
    }
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Reads the Authorization header from an incoming request,
// extracts the Bearer token, and asks Supabase to verify it.
// Returns the authenticated user object, or null if invalid/missing.
export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  // "Bearer abc123..." → "abc123..."
  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await getSupabaseAdmin().auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}
