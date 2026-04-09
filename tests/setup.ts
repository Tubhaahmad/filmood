// Extend Vitest's expect with jest-dom matchers
// (toBeInTheDocument, toBeDisabled, toHaveAttribute, etc.)
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Stub the global fetch so components that call TMDB/API on mount
// (e.g. login/signup backdrop carousel, SessionJoin) don't throw.
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ results: [], films: [] }),
} as unknown as Response);
