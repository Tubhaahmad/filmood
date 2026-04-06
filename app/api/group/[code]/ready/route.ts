import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { isSessionExpired } from "@/lib/group";

// POST /api/group/[code]/ready
// Toggles the is_ready flag for the calling participant.
// Auth optional — guests identify via participantId in the body.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getAuthUser(request);
  const { code } = await params;

  let participantId: string | null = null;
  try {
    const body = await request.json();
    participantId = body.participantId ?? null;
  } catch {
    // No body is fine for authenticated users
  }

  if (!user && !participantId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const upperCode = code.toUpperCase();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid session code" },
        { status: 400 },
      );
    }

    // Find the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, status, created_at")
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

    if (session.status !== "lobby") {
      return NextResponse.json(
        { error: "Session is not in lobby state" },
        { status: 400 },
      );
    }

    // Find the participant
    let query = supabase
      .from("session_participants")
      .select("id, is_ready")
      .eq("session_id", session.id);

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.eq("id", participantId!);
    }

    const { data: participant, error: participantError } =
      await query.single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: "You are not in this session" },
        { status: 404 },
      );
    }

    // Toggle the ready state
    const newReady = !participant.is_ready;

    const { error: updateError } = await supabase
      .from("session_participants")
      .update({ is_ready: newReady })
      .eq("id", participant.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update ready state" },
        { status: 500 },
      );
    }

    return NextResponse.json({ is_ready: newReady });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle ready";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
