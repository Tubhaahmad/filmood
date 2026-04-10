import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    // Default node; opt into jsdom per-file via /** @vitest-environment jsdom */.
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // Excludes tests/e2e/ (Playwright specs use a different runner).
    include: [
      "lib/__tests__/**/*.test.{ts,tsx}",
      "app/__tests__/**/*.test.{ts,tsx}",
      "components/__tests__/**/*.test.{ts,tsx}",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
