import { test, expect } from "@playwright/test";
import { mockTmdb } from "./fixtures/tmdb";

// Mobile-only (chromium-mobile project, Pixel 5). Below 900px, DashboardShell
// swaps inline panels for a BottomSheet dialog — this covers its open/close lifecycle.

test.describe("Mobile — BottomSheet dashboard panel", () => {
  test.beforeEach(async ({ page }) => {
    await mockTmdb(page);
  });

  test("tapping See all moods opens the bottom sheet and Close dismisses it", async ({
    page,
  }) => {
    await page.goto("/");

    // MoodCards inside MoodBox stopPropagation, so use "See all moods"
    // (calls onExpand directly) to reliably open the panel on mobile.
    await page.getByRole("button", { name: /see all moods/i }).tap();

    const sheet = page.getByRole("dialog", { name: /panel/i });
    await expect(sheet).toBeVisible();

    // Sanity check that the mood panel (not search/explore) is embedded.
    await expect(sheet.getByText(/all moods/i)).toBeVisible();

    // Close detection via body scroll lock: BottomSheet slides off-screen via
    // transform, so toBeHidden() is unreliable. Body `overflow: hidden` is set
    // on open and cleared on close — a direct readout of sheet state.
    await sheet.getByRole("button", { name: /^close$/i }).tap();

    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
});
