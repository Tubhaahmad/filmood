import { vi } from "vitest";
import {
  createMockSupabase,
  mockRequest,
  mockUser,
  readResponse,
} from "./helpers/supabase-mock";

const mockGetAuthUser = vi.fn();
const mockGetSupabaseAdmin = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
  getAuthUser: (...args: unknown[]) => mockGetAuthUser(...args),
  getSupabaseAdmin: () => mockGetSupabaseAdmin(),
}));

vi.mock("@/lib/group", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/group")>();
  return {
    ...actual,
    generateUniqueCode: vi.fn().mockResolvedValue("ABC123"),
  };
});

import { POST as createSession } from "@/app/api/group/create/route";
import { POST as joinSession } from "@/app/api/group/join/route";
import { GET as getSession } from "@/app/api/group/[code]/route";
import { POST as toggleReady } from "@/app/api/group/[code]/ready/route";
import { POST as startSession } from "@/app/api/group/[code]/start/route";
import { POST as kickParticipant } from "@/app/api/group/[code]/kick/route";
import { DELETE as leaveSession } from "@/app/api/group/[code]/leave/route";

function routeParams(code: string) {
  return { params: Promise.resolve({ code }) };
}

// ─── POST /api/group/create ─────────────────────────

describe("POST /api/group/create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const req = mockRequest("POST", "/api/group/create");
    const { status } = await readResponse(await createSession(req));
    expect(status).toBe(401);
  });

  it("returns 201 with code, sessionId, and participantId", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);

    const supabase = createMockSupabase([
      { data: { id: "session-1", code: "ABC123" }, error: null },
      { data: { id: "part-1" }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/create");
    const { status, json } = await readResponse(await createSession(req));
    expect(status).toBe(201);
    expect(json.code).toBe("ABC123");
    expect(json.sessionId).toBe("session-1");
    expect(json.participantId).toBe("part-1");
  });
});

// ─── POST /api/group/join ───────────────────────────

describe("POST /api/group/join", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 for invalid code format", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const req = mockRequest("POST", "/api/group/join", { code: "AB", nickname: "Guest" });
    const { status } = await readResponse(await joinSession(req));
    expect(status).toBe(400);
  });

  it("returns 400 when guest has no nickname", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const req = mockRequest("POST", "/api/group/join", { code: "ABC123" });
    const { status } = await readResponse(await joinSession(req));
    expect(status).toBe(400);
  });

  it("returns 400 when nickname is too short", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const req = mockRequest("POST", "/api/group/join", { code: "ABC123", nickname: "A" });
    const { status } = await readResponse(await joinSession(req));
    expect(status).toBe(400);
  });

  it("returns 400 when nickname is too long", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const req = mockRequest("POST", "/api/group/join", { code: "ABC123", nickname: "A".repeat(21) });
    const { status } = await readResponse(await joinSession(req));
    expect(status).toBe(400);
  });

  it("returns 404 when session not found", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const supabase = createMockSupabase([
      { data: null, error: { message: "not found" } },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/join", { code: "XXXXXX", nickname: "Guest" });
    const { status } = await readResponse(await joinSession(req));
    expect(status).toBe(404);
  });

  it("returns 410 when session is expired", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "lobby", created_at: fiveHoursAgo }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/join", { code: "ABC123", nickname: "Guest" });
    const { status } = await readResponse(await joinSession(req));
    expect(status).toBe(410);
  });

  it("returns 400 when session is not in lobby", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "swiping", created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/join", { code: "ABC123", nickname: "Guest" });
    const { status } = await readResponse(await joinSession(req));
    expect(status).toBe(400);
  });

  it("returns 400 when session is full", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: null, error: null, count: 10 },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/join", { code: "ABC123", nickname: "Guest" });
    const { status } = await readResponse(await joinSession(req));
    expect(status).toBe(400);
  });

  it("returns existing participant when auth user re-joins", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: null, error: null, count: 3 },
      { data: { id: "part-1" }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/join", { code: "ABC123" });
    const { status, json } = await readResponse(await joinSession(req));
    expect(status).toBe(200);
    expect(json.participantId).toBe("part-1");
  });

  it("creates new participant for guest", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: null, error: null, count: 3 },
      { data: { id: "part-new" }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/join", { code: "ABC123", nickname: "Guest" });
    const { status, json } = await readResponse(await joinSession(req));
    expect(status).toBe(200);
    expect(json.participantId).toBe("part-new");
    expect(json.code).toBe("ABC123");
  });
});

// ─── GET /api/group/[code] ──────────────────────────

describe("GET /api/group/[code]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 for invalid code", async () => {
    const supabase = createMockSupabase([]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/group/AB");
    const { status } = await readResponse(await getSession(req, routeParams("AB")));
    expect(status).toBe(400);
  });

  it("returns session and participants on success", async () => {
    const session = { id: "s-1", code: "ABC123", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() };
    const participants = [{ id: "p-1", nickname: "Sergiu", user_id: "user-1", is_ready: true }];

    const supabase = createMockSupabase([
      { data: session, error: null },
      { data: participants, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/group/ABC123");
    const { status, json } = await readResponse(await getSession(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.session.code).toBe("ABC123");
    expect(json.participants).toHaveLength(1);
  });
});

// ─── POST /api/group/[code]/ready ───────────────────

describe("POST /api/group/[code]/ready", () => {
  beforeEach(() => vi.clearAllMocks());

  it("toggles ready state and returns new value", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", is_ready: false }, error: null },
      { data: null, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/ready", {});
    const { status, json } = await readResponse(await toggleReady(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.is_ready).toBe(true);
  });

  it("returns 400 when session is not in lobby", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "swiping", created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/ready", {});
    const { status } = await readResponse(await toggleReady(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });
});

// ─── POST /api/group/[code]/start ───────────────────

describe("POST /api/group/[code]/start", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const req = mockRequest("POST", "/api/group/ABC123/start");
    const { status } = await readResponse(await startSession(req, routeParams("ABC123")));
    expect(status).toBe(401);
  });

  it("returns 403 when non-host tries to start", async () => {
    mockGetAuthUser.mockResolvedValue({ ...mockUser, id: "other-user" });
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/start");
    const { status } = await readResponse(await startSession(req, routeParams("ABC123")));
    expect(status).toBe(403);
  });

  it("returns 400 when fewer than 2 participants", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: [{ id: "p-1", is_ready: true }], error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/start");
    const { status } = await readResponse(await startSession(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 400 when participants are not all ready", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: [{ id: "p-1", is_ready: true }, { id: "p-2", is_ready: false }], error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/start");
    const { status } = await readResponse(await startSession(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("transitions session to mood phase on success", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: [{ id: "p-1", is_ready: true }, { id: "p-2", is_ready: true }], error: null },
      { data: null, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/start");
    const { status, json } = await readResponse(await startSession(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.status).toBe("mood");
  });
});

// ─── POST /api/group/[code]/kick ────────────────────

describe("POST /api/group/[code]/kick", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const req = mockRequest("POST", "/api/group/ABC123/kick", { participantId: "p-2" });
    const { status } = await readResponse(await kickParticipant(req, routeParams("ABC123")));
    expect(status).toBe(401);
  });

  it("returns 400 when participantId is missing", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const req = mockRequest("POST", "/api/group/ABC123/kick", {});
    const { status } = await readResponse(await kickParticipant(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 403 when non-host tries to kick", async () => {
    mockGetAuthUser.mockResolvedValue({ ...mockUser, id: "other-user" });
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/kick", { participantId: "p-2" });
    const { status } = await readResponse(await kickParticipant(req, routeParams("ABC123")));
    expect(status).toBe(403);
  });

  it("returns 400 when host tries to kick themselves", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", user_id: "user-1" }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/kick", { participantId: "p-1" });
    const { status } = await readResponse(await kickParticipant(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("kicks another participant successfully", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-2", user_id: "other-user" }, error: null },
      { data: null, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/kick", { participantId: "p-2" });
    const { status, json } = await readResponse(await kickParticipant(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.kicked).toBe(true);
  });
});

// ─── DELETE /api/group/[code]/leave ─────────────────

describe("DELETE /api/group/[code]/leave", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when session is not in lobby", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "swiping", created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("DELETE", "/api/group/ABC123/leave", {});
    const { status } = await readResponse(await leaveSession(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("disbands session when host leaves", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", user_id: "user-1" }, error: null },
      { data: null, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("DELETE", "/api/group/ABC123/leave", {});
    const { status, json } = await readResponse(await leaveSession(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.disbanded).toBe(true);
  });

  it("removes participant when non-host leaves", async () => {
    mockGetAuthUser.mockResolvedValue({ ...mockUser, id: "other-user" });
    const supabase = createMockSupabase([
      { data: { id: "s-1", host_id: "user-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-2", user_id: "other-user" }, error: null },
      { data: null, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("DELETE", "/api/group/ABC123/leave", {});
    const { status, json } = await readResponse(await leaveSession(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.left).toBe(true);
  });
});
