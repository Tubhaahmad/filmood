import { test, expect } from "@playwright/test";

// Client-side zod validation + one real Supabase hit for "bad credentials". No TMDB mocks needed.

test.describe("Auth forms", () => {
  test("signup form shows zod errors when submitted empty", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: /^sign up$/i }).click();

    // Errors sourced from signupSchema in lib/validations.ts.
    await expect(
      page.getByText(/name must be at least 3 characters/i),
    ).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(
      page.getByText(/password must be at least 6 characters/i),
    ).toBeVisible();
  });

  test("signup form flags an invalid email format", async ({ page }) => {
    await page.goto("/signup");

    // Disable native email validation so zod's error can surface instead.
    await page.locator("form").evaluate((f) => {
      (f as HTMLFormElement).noValidate = true;
    });

    // Fill other fields so only the email error surfaces.
    await page.getByLabel(/full name/i).fill("Test User");
    await page.getByLabel(/email address/i).fill("not-an-email");
    // ^password$ anchors past "Confirm password".
    await page.getByLabel(/^password$/i).fill("secret123");
    await page.getByLabel(/confirm password/i).fill("secret123");

    await page.getByRole("button", { name: /^sign up$/i }).click();

    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  });

  test("login form shows Supabase error on bad credentials", async ({
    page,
  }) => {
    await page.goto("/login");

    // Fake account — Supabase returns 400 "Invalid login credentials".
    await page
      .getByLabel(/email address/i)
      .fill("nobody-e2e-fake@filmood.test");
    await page.getByLabel(/^password$/i).fill("definitely-wrong-123");

    await page.getByRole("button", { name: /^log in$/i }).click();

    await expect(
      page.getByText(/invalid login credentials/i),
    ).toBeVisible();
  });
});
