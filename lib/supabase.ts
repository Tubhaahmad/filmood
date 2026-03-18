import { createClient } from "@supabase/supabase-js";

// Read from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export the client
// This is a singleton — one instance shared across the whole app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
