import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";

// DELETE /api/group/[code]/leave
// Removes a participant from the session.
// If the host leaves, the entire session is deleted.
// Auth optional — guests identify via participantId in the request body.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getAuthUser(request);
  const { code } = await params;

  // Guests send their participantId in the body
  let participantId: string | null = null;
  try {
    const body = await request.json();
    participantId = body.participantId ?? null;
  } catch {
    // No body is fine for authenticated users
  }

  // Must have some way to identify the participant
  if (!user && !participantId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const upperCode = code.toUpperCase();

    // Fetch the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, host_id, status")
      .eq("code", upperCode)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      );
    }

    // Can only leave during lobby phase
    if (session.status !== "lobby") {
      return NextResponse.json(
        { error: "Cannot leave a session that has already started" },
        { status: 400 },
      );
    }

    // Find the participant row
    let participantQuery = supabase
      .from("session_participants")
      .select("id, user_id")
      .eq("session_id", session.id);

    if (user) {
      participantQuery = participantQuery.eq("user_id", user.id);
    } else {
      participantQuery = participantQuery.eq("id", participantId!);
    }

    const { data: participant, error: participantError } =
      await participantQuery.single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: "You are not in this session" },
        { status: 404 },
      );
    }

    // Check if this participant is the host
    const isHost = participant.user_id === session.host_id;

    if (isHost) {
      // Host leaving = delete entire session (cascade removes participants)
      const { error: deleteError } = await supabase
        .from("sessions")
        .delete()
        .eq("id", session.id);

      if (deleteError) {
        return NextResponse.json(
          { error: "Failed to disband session" },
          { status: 500 },
        );
      }

      return NextResponse.json({ disbanded: true });
    }

    // Non-host: just remove their participant row
    const { error: deleteError } = await supabase
      .from("session_participants")
      .delete()
      .eq("id", participant.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to leave session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ left: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to leave session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
