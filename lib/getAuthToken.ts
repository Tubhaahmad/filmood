import { supabase } from "@/lib/supabase";

/**
 * Get a fresh access token directly from the Supabase client.
 * Avoids stale-token issues where React state holds an expired JWT
 * while Supabase has already auto-refreshed internally.
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Build request headers with a fresh auth token.
 * Includes Content-Type and Authorization (if logged in).
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = await getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
