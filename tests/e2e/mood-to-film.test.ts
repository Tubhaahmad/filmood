import { test, expect } from "@playwright/test";
import { mockTmdb } from "./fixtures/tmdb";

// Core user journey: dashboard → mood → results → film detail. TMDB fully stubbed.

test.describe("Mood → results → film detail", () => {
  test.beforeEach(async ({ page }) => {
    await mockTmdb(page);
  });

  test("guest can pick a mood and reach a film detail page", async ({
    page,
  }) => {
    await page.goto("/");

    // Expand full MoodPanel — picking from the 2x2 preview would cause
    // strict-mode duplicate matches with the expanded panel.
    await page.getByRole("button", { name: /see all moods/i }).click();

    // "A good cry" is only in the expanded panel, so no duplicate match.
    await page.getByRole("button", { name: /a good cry/i }).click();

    await page.getByRole("button", { name: /find films/i }).click();
    await page.waitForURL(/\/results\?mood=/);

    await expect(
      page.getByRole("heading", { level: 1, name: /your matches/i }),
    ).toBeVisible();

    // "Midnight Harvest" is the highest-rated fixture — confirms data pipeline reached UI.
    await expect(
      page.getByRole("heading", { level: 2, name: /midnight harvest/i }),
    ).toBeVisible();

    // Assert href only — the /film/{id} page is an RSC that fetches server-side,
    // which page.route() can't intercept, so a fake ID would 404 at real TMDB.
    const href = await page
      .getByRole("link", { name: /view details/i })
      .getAttribute("href");
    expect(href).toMatch(/^\/film\/\d+$/);
  });
});
