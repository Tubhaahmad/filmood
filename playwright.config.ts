import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "path";

// Load E2E credentials from untracked file.
loadEnv({ path: path.resolve(__dirname, ".env.test.local") });

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  // Vitest is scoped to lib/__tests__ and app/__tests__, so no overlap.
  testMatch: "**/*.test.ts",
  // Extra headroom for slow Next 16 dev cold compiles.
  expect: { timeout: 7_000 },
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  // HTML report enables `npx playwright show-report` after any local run.
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium-desktop",
      testIgnore: "**/mobile.test.ts",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "chromium-mobile",
      testMatch: "**/mobile.test.ts",
      use: { ...devices["Pixel 5"] },
    },
  ],

  // Auto-boot `next dev`; reuse existing server on 3000 locally.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
