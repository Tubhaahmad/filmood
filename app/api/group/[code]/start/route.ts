import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { resolveSession } from "@/lib/group-api";

// POST /api/group/[code]/start
// Host transitions the session from "lobby" to "mood".
// Only the session host can call this. Requires at least 2 participants.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { code } = await params;

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; host_id: string; status: string; created_at: string;
    }>(supabase, code, "id, host_id, status, created_at");
    if (sessionErr) return sessionErr;

    // Only the host can start
    if (session.host_id !== user.id) {
      return NextResponse.json(
        { error: "Only the host can start the session" },
        { status: 403 },
      );
    }

    // Must be in lobby phase
    if (session.status !== "lobby") {
      return NextResponse.json(
        { error: "Session is not in lobby state" },
        { status: 400 },
      );
    }

    // Need at least 2 participants, all must be ready
    const { data: allParticipants } = await supabase
      .from("session_participants")
      .select("id, is_ready")
      .eq("session_id", session.id);

    const count = allParticipants?.length ?? 0;

    if (count < 2) {
      return NextResponse.json(
        { error: "Need at least 2 participants to start" },
        { status: 400 },
      );
    }

    const notReady = allParticipants!.filter((p) => !p.is_ready);
    if (notReady.length > 0) {
      return NextResponse.json(
        { error: `${notReady.length} participant${notReady.length > 1 ? "s" : ""} not ready yet` },
        { status: 400 },
      );
    }

    // Transition to mood phase
    const { error: updateError } = await supabase
      .from("sessions")
      .update({ status: "mood" })
      .eq("id", session.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to start session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "mood" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
