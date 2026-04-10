import type { Page } from "@playwright/test";

/** Logs in the E2E user. Creds loaded from .env.test.local via playwright.config.ts. */
export async function loginAsTestUser(page: Page) {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing E2E_USER_EMAIL / E2E_USER_PASSWORD. Add them to .env.test.local at the repo root.",
    );
  }

  await page.goto("/login");
  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /^log in$/i }).click();

  // Match "not /login" instead of "/" to tolerate trailing-slash/query differences.
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 10_000,
  });

  // Wait for "Sign out" — proxy for AuthProvider's async INITIAL_SESSION propagating.
  await page
    .getByRole("button", { name: /sign out/i })
    .waitFor({ state: "visible", timeout: 10_000 });
}
