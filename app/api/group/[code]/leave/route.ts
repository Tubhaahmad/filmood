import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { resolveSession, resolveParticipant } from "@/lib/group-api";

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

  try {
    const supabase = getSupabaseAdmin();

    const { session, error: sessionErr } = await resolveSession<{
      id: string; host_id: string; status: string; created_at: string;
    }>(supabase, code, "id, host_id, status, created_at");
    if (sessionErr) return sessionErr;

    if (session.status !== "lobby") {
      return NextResponse.json(
        { error: "Cannot leave a session that has already started" },
        { status: 400 },
      );
    }

    const { participant, error: partErr } = await resolveParticipant<{
      id: string; user_id: string | null;
    }>(supabase, session.id, user, participantId, "id, user_id");
    if (partErr) return partErr;

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
