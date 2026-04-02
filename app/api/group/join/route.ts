import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { MAX_PARTICIPANTS, isSessionExpired } from "@/lib/group";

// POST /api/group/join
// Joins an existing group session by code.
// Auth is optional — guests provide a nickname, logged-in users use their name.
// Body: { code: string, nickname?: string }
// Returns: { sessionId, participantId, code }
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  const body = await request.json();
  const { code, nickname } = body;

  // Validate code format
  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json(
      { error: "A valid 6-character session code is required" },
      { status: 400 },
    );
  }

  // Guests must provide a nickname
  if (!user && (!nickname || typeof nickname !== "string")) {
    return NextResponse.json(
      { error: "Nickname is required for guests" },
      { status: 400 },
    );
  }

  // Validate nickname length
  const trimmedNickname = nickname?.trim();
  if (trimmedNickname && (trimmedNickname.length < 2 || trimmedNickname.length > 20)) {
    return NextResponse.json(
      { error: "Nickname must be between 2 and 20 characters" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const upperCode = code.toUpperCase();

    // Find the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, status, created_at")
      .eq("code", upperCode)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found. Check the code and try again." },
        { status: 404 },
      );
    }

    if (isSessionExpired(session.created_at)) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 410 },
      );
    }

    // Only allow joining during lobby phase
    if (session.status !== "lobby") {
      return NextResponse.json(
        { error: "This session has already started" },
        { status: 400 },
      );
    }

    // Check participant count
    const { count } = await supabase
      .from("session_participants")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session.id);

    if (count !== null && count >= MAX_PARTICIPANTS) {
      return NextResponse.json(
        { error: "This session is full" },
        { status: 400 },
      );
    }

    // Prevent duplicate joins for authenticated users
    if (user) {
      const { data: existing } = await supabase
        .from("session_participants")
        .select("id")
        .eq("session_id", session.id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        // Already in session — return existing participant info
        return NextResponse.json({
          sessionId: session.id,
          participantId: existing.id,
          code: upperCode,
        });
      }
    }

    // Determine the display name
    const displayName = user
      ? (user.user_metadata?.name || user.email?.split("@")[0] || "User")
      : trimmedNickname!;

    // Add participant
    const { data: participant, error: participantError } = await supabase
      .from("session_participants")
      .insert({
        session_id: session.id,
        user_id: user?.id ?? null,
        nickname: displayName,
      })
      .select()
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: participantError?.message ?? "Failed to join session" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      participantId: participant.id,
      code: upperCode,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to join session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
