import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { resolveSession } from "@/lib/group-api";

// GET /api/group/[code]
// Returns session details + participant list for the lobby.
// Auth is not required — guests need to see the lobby too.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; code: string; host_id: string; status: string; created_at: string;
    }>(supabase, code, "id, code, host_id, status, created_at");
    if (sessionErr) return sessionErr;

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
