import { getSupabaseAdmin } from "@/lib/supabase-server";

// Characters that are easy to read and share aloud.
// Excluded: 0/O (zero vs oh), 1/I/L (one vs I vs L)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_PARTICIPANTS = 8;

/** Generate a random 6-char code like "HK7T4N" */
function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

/**
 * Generate a unique session code. Retries up to 5 times if a collision
 * is detected (extremely unlikely with 30^6 = 729 million combinations).
 */
export async function generateUniqueCode(): Promise<string> {
  const supabase = getSupabaseAdmin();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { data } = await supabase
      .from("sessions")
      .select("id")
      .eq("code", code)
      .single();

    // No match means this code is available
    if (!data) return code;
  }

  throw new Error("Failed to generate unique code");
}

export { MAX_PARTICIPANTS };
