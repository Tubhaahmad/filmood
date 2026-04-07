import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { resolveSession } from "@/lib/group-api";

// POST /api/group/[code]/kick
// Host removes a participant from the session.
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

  let targetId: string | null = null;
  try {
    const body = await request.json();
    targetId = body.participantId ?? null;
  } catch {
    // Missing body
  }

  if (!targetId) {
    return NextResponse.json(
      { error: "participantId is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; host_id: string; status: string; created_at: string;
    }>(supabase, code, "id, host_id, status, created_at");
    if (sessionErr) return sessionErr;

    // Only the host can kick
    if (session.host_id !== user.id) {
      return NextResponse.json(
        { error: "Only the host can remove participants" },
        { status: 403 },
      );
    }

    if (session.status !== "lobby") {
      return NextResponse.json(
        { error: "Cannot kick participants after the session has started" },
        { status: 400 },
      );
    }

    // Find the target participant
    const { data: target, error: targetError } = await supabase
      .from("session_participants")
      .select("id, user_id")
      .eq("id", targetId)
      .eq("session_id", session.id)
      .single();

    if (targetError || !target) {
      return NextResponse.json(
        { error: "Participant not found in this session" },
        { status: 404 },
      );
    }

    // Can't kick yourself — use leave/disband instead
    if (target.user_id === user.id) {
      return NextResponse.json(
        { error: "Cannot kick yourself. Use leave instead." },
        { status: 400 },
      );
    }

    // Remove the participant
    const { error: deleteError } = await supabase
      .from("session_participants")
      .delete()
      .eq("id", target.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to remove participant" },
        { status: 500 },
      );
    }

    return NextResponse.json({ kicked: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to kick participant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
