import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./fixtures/auth";
import { mockTmdb } from "./fixtures/tmdb";

// Single-user smoke test: log in → create → verify lobby → disband.
// Realtime swipe matching is covered in lib/__tests__/group-gameplay.test.ts.
// TMDB is stubbed because the dashboard and lobby hit /api/movies on load.

test.describe("Group session — create and disband", () => {
  test.beforeEach(async ({ page }) => {
    await mockTmdb(page);
  });

  test("logged-in host can create a session and disband it", async ({
    page,
  }) => {
    await loginAsTestUser(page);

    await page.goto("/group");

    // Header confirms Suspense resolved.
    await expect(
      page.getByRole("heading", { level: 1, name: /group session/i }),
    ).toBeVisible();

    // Wait for CTA copy to ensure SessionCreator is in logged-in state.
    // Two "Create session" buttons exist (tab toggle + CTA); nth(1) = CTA.
    await expect(page.getByText(/start a private room/i)).toBeVisible();

    const creatorCta = page
      .getByRole("button", { name: /^create session$/i })
      .nth(1);
    await expect(creatorCta).toBeEnabled();
    await creatorCta.click();

    // Wait for the create POST to return.
    await page.waitForResponse(
      (res) =>
        res.url().includes("/api/group/create") && res.request().method() === "POST",
      { timeout: 10_000 },
    );

    // SessionCreator pushes to /group/{6-char code} on success.
    await page.waitForURL(/\/group\/[A-Z0-9]{6}$/i);

    const code = new URL(page.url()).pathname.split("/").pop()!;
    expect(code).toMatch(/^[A-Z0-9]{6}$/i);

    // Code is rendered somewhere in the lobby via <InviteStrip />.
    await expect(page.getByText(code).first()).toBeVisible();

    // Host sees "Disband session" (guests see "Leave"). Click flips to a Yes/No confirm.
    await page.getByRole("button", { name: /^disband session$/i }).click();
    await page.getByRole("button", { name: /^yes$/i }).click();

    // onDisbanded → router.replace("/group").
    await page.waitForURL(/\/group(\?.*)?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /group session/i }),
    ).toBeVisible();
  });
});
