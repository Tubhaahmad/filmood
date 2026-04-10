/**
 * Idempotent: provisions the E2E Supabase user for tests/e2e/.
 * Reads admin creds from .env/.env.local, test creds from .env.test.local.
 * Run: npm run seed:e2e-user
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import path from "path";

const repoRoot = path.resolve(__dirname, "..");

// Admin creds first, test creds layered on top.
loadEnv({ path: path.join(repoRoot, ".env") });
loadEnv({ path: path.join(repoRoot, ".env.local"), override: false });
loadEnv({ path: path.join(repoRoot, ".env.test.local"), override: false });

function must(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Aborting.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const supabaseUrl = must("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = must("SUPABASE_SERVICE_ROLE_KEY");
  const email = must("E2E_USER_EMAIL");
  const password = must("E2E_USER_PASSWORD");

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // First page only — switch to filter API if users ever exceed 200.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error("Failed to list users:", listErr.message);
    process.exit(1);
  }

  const existing = list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );

  if (existing) {
    console.log(`E2E user already exists: ${email} (id: ${existing.id})`);
    console.log("Nothing to do.");
    return;
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Filmood E2E", seeded: true },
  });

  if (createErr) {
    console.error("Failed to create E2E user:", createErr.message);
    process.exit(1);
  }

  console.log(`Created E2E user: ${email} (id: ${created.user?.id})`);
  console.log("Auto-confirmed email — tests can log in immediately.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
