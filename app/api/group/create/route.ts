import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getAuthUser } from "@/lib/supabase-server";
import { generateUniqueCode } from "@/lib/group";

// POST /api/group/create
// Creates a new group session. Requires authentication.
// Returns: { code, sessionId, participantId }
export async function POST(request: NextRequest) {
  // Only logged-in users can create sessions
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const code = await generateUniqueCode();

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        code,
        host_id: user.id,
        status: "lobby",
      })
      .select()
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: sessionError?.message ?? "Failed to create session" },
        { status: 500 },
      );
    }

    // Auto-add the host as the first participant
    const nickname =
      user.user_metadata?.name || user.email?.split("@")[0] || "Host";

    const { data: participant, error: participantError } = await supabase
      .from("session_participants")
      .insert({
        session_id: session.id,
        user_id: user.id,
        nickname,
      })
      .select()
      .single();

    if (participantError || !participant) {
      // Clean up the session if participant insert fails
      await supabase.from("sessions").delete().eq("id", session.id);
      return NextResponse.json(
        { error: participantError?.message ?? "Failed to add host as participant" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        code: session.code,
        sessionId: session.id,
        participantId: participant.id,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
