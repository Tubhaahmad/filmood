import { vi } from "vitest";

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { classifyTier, isSessionExpired, MAX_PARTICIPANTS, SESSION_EXPIRY_HOURS } from "@/lib/group";

// ─── classifyTier ───────────────────────────────────

describe("classifyTier", () => {
  it('returns "perfect" when all participants voted yes', () => {
    expect(classifyTier(4, 0, 4)).toBe("perfect");
  });

  it('returns "perfect" for a solo participant who voted yes', () => {
    expect(classifyTier(1, 0, 1)).toBe("perfect");
  });

  it('returns "strong" when no nays and majority voted yes', () => {
    expect(classifyTier(2, 0, 3)).toBe("strong");
  });

  it('returns "strong" at the exact threshold (ceil half)', () => {
    expect(classifyTier(2, 0, 4)).toBe("strong");
  });

  it('returns "strong" for 5 participants with 3 yes (ceil(5/2)=3)', () => {
    expect(classifyTier(3, 0, 5)).toBe("strong");
  });

  it('returns "miss" when there are nay votes even if majority yes', () => {
    expect(classifyTier(3, 1, 4)).toBe("miss");
  });

  it('returns "miss" when yes count is below threshold', () => {
    expect(classifyTier(1, 0, 4)).toBe("miss");
  });

  it('returns "miss" when 0 participants (edge case)', () => {
    expect(classifyTier(0, 0, 0)).toBe("miss");
  });

  it('returns "miss" when everyone voted no', () => {
    expect(classifyTier(0, 4, 4)).toBe("miss");
  });

  it('returns "perfect" not "strong" when 10/10 vote yes', () => {
    expect(classifyTier(10, 0, 10)).toBe("perfect");
  });
});

// ─── isSessionExpired ───────────────────────────────

describe("isSessionExpired", () => {
  function timeAgo(ms: number): string {
    return new Date(Date.now() - ms).toISOString();
  }

  const ONE_HOUR = 60 * 60 * 1000;

  it("returns false for a session created just now", () => {
    expect(isSessionExpired(new Date().toISOString())).toBe(false);
  });

  it("returns true for a session created 5 hours ago", () => {
    expect(isSessionExpired(timeAgo(5 * ONE_HOUR))).toBe(true);
  });

  it("returns false for a session created 3 hours ago", () => {
    expect(isSessionExpired(timeAgo(3 * ONE_HOUR))).toBe(false);
  });

  it("returns true for a session created 4 hours and 1 second ago", () => {
    expect(isSessionExpired(timeAgo(4 * ONE_HOUR + 1000))).toBe(true);
  });

  it("returns false for a session created 3h 59m 59s ago (just under boundary)", () => {
    expect(isSessionExpired(timeAgo(4 * ONE_HOUR - 1000))).toBe(false);
  });

  it("returns true for a session created 24 hours ago", () => {
    expect(isSessionExpired(timeAgo(24 * ONE_HOUR))).toBe(true);
  });
});

// ─── Constants ──────────────────────────────────────

describe("group constants", () => {
  it("MAX_PARTICIPANTS is 10", () => {
    expect(MAX_PARTICIPANTS).toBe(10);
  });

  it("SESSION_EXPIRY_HOURS is 4", () => {
    expect(SESSION_EXPIRY_HOURS).toBe(4);
  });
});
