import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isSessionExpired } from "@/lib/group";

// GET /api/group/[code]
// Returns session details + participant list for the lobby.
// Auth is not required — guests need to see the lobby too.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { error: "Invalid session code" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const upperCode = code.toUpperCase();

    // Fetch the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, code, host_id, status, created_at")
      .eq("code", upperCode)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      );
    }

    if (isSessionExpired(session.created_at)) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 410 },
      );
    }

    // Fetch participants ordered by join time (host will be first)
    const { data: participants, error: participantsError } = await supabase
      .from("session_participants")
      .select("id, nickname, user_id, is_ready, mood_selections, has_swiped, joined_at")
      .eq("session_id", session.id)
      .order("joined_at", { ascending: true });

    if (participantsError) {
      return NextResponse.json(
        { error: "Failed to load participants" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        host_id: session.host_id,
        status: session.status,
        created_at: session.created_at,
      },
      participants: participants ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
