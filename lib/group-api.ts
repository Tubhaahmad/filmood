import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { isSessionExpired } from "@/lib/group";

type ResolveResult<T> =
  | { session: T; error: null }
  | { session: null; error: NextResponse };

type ParticipantResult<T> =
  | { participant: T; error: null }
  | { participant: null; error: NextResponse };

/**
 * Validate the 6-char code, fetch the session, and check expiry.
 * Returns the session row or an error response ready to return.
 */
export async function resolveSession<
  T extends { created_at: string } = { created_at: string },
>(
  supabase: SupabaseClient,
  code: string,
  selectFields = "id, status, created_at",
): Promise<ResolveResult<T>> {
  if (!code || code.length !== 6) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Invalid session code" },
        { status: 400 },
      ),
    };
  }

  const upperCode = code.toUpperCase();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select(selectFields)
    .eq("code", upperCode)
    .single();

  if (sessionError || !session) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      ),
    };
  }

  if (isSessionExpired((session as unknown as { created_at: string }).created_at)) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Session expired" },
        { status: 410 },
      ),
    };
  }

  return { session: session as unknown as T, error: null };
}

/**
 * Find a participant by user_id (authenticated) or participantId (guest).
 * Returns the participant row or an error response.
 */
export async function resolveParticipant<
  T extends { id: string } = { id: string },
>(
  supabase: SupabaseClient,
  sessionId: string,
  user: User | null,
  participantId: string | null,
  selectFields = "id",
): Promise<ParticipantResult<T>> {
  if (!user && !participantId) {
    return {
      participant: null,
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  const baseQuery = supabase
    .from("session_participants")
    .select(selectFields)
    .eq("session_id", sessionId);

  const filteredQuery = user
    ? baseQuery.eq("user_id", user.id)
    : baseQuery.eq("id", participantId!);

  const { data: participant, error: participantError } =
    await filteredQuery.single();

  if (participantError || !participant) {
    return {
      participant: null,
      error: NextResponse.json(
        { error: "You are not in this session" },
        { status: 403 },
      ),
    };
  }

  return { participant: participant as unknown as T, error: null };
}
