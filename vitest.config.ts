import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    // Default to node; jsdom is opt-in per folder so existing lib tests stay fast
    environment: "node",
    // Per-file environment is set via /** @vitest-environment jsdom */ docblocks.
    // Existing lib/__tests__/*.test.ts files stay on the node default.
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
