import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

// Server-side Supabase client using the service role key.
// This has full database access — only used inside API routes, never in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}
