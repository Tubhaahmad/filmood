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

vi.mock("@/lib/deck", () => ({
  buildSharedDeck: vi.fn().mockResolvedValue([
    { id: 1, title: "Film 1", poster_path: "/p1.jpg", release_date: "2025-01-01", vote_average: 7.5, overview: "Overview", genre_ids: [35], mood_keys: ["laugh"] },
    { id: 2, title: "Film 2", poster_path: "/p2.jpg", release_date: "2025-01-01", vote_average: 8.0, overview: "Overview", genre_ids: [18], mood_keys: ["cry"] },
  ]),
}));

import { POST as submitMood } from "@/app/api/group/[code]/mood/route";
import { GET as getSwipeState, POST as submitSwipe } from "@/app/api/group/[code]/swipe/route";
import { GET as getResults } from "@/app/api/group/[code]/results/route";

function routeParams(code: string) {
  return { params: Promise.resolve({ code }) };
}

const fakeDeck = [
  { id: 1, title: "Film 1", poster_path: "/p1.jpg", release_date: "2025-01-01", vote_average: 7.5, overview: "Overview", genre_ids: [35], mood_keys: ["laugh"] },
  { id: 2, title: "Film 2", poster_path: "/p2.jpg", release_date: "2025-01-01", vote_average: 8.0, overview: "Overview", genre_ids: [18], mood_keys: ["cry"] },
];

// ─── POST /api/group/[code]/mood ────────────────────

describe("POST /api/group/[code]/mood", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when moods array is empty", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const req = mockRequest("POST", "/api/group/ABC123/mood", { moods: [] });
    const { status } = await readResponse(await submitMood(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 400 when no valid moods provided", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const req = mockRequest("POST", "/api/group/ABC123/mood", { moods: ["invalid_mood", "another_bad"] });
    const { status } = await readResponse(await submitMood(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 400 when session is not in mood phase", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "lobby", created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/mood", { moods: ["laugh"] });
    const { status } = await readResponse(await submitMood(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 409 when moods already submitted", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "mood", created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", mood_selections: ["laugh"] }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/mood", { moods: ["cry"] });
    const { status } = await readResponse(await submitMood(req, routeParams("ABC123")));
    expect(status).toBe(409);
  });

  it("saves moods and returns allDone:false when not all submitted", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "mood", created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", mood_selections: null }, error: null },
      { data: null, error: null },
      { data: [{ mood_selections: ["laugh"] }, { mood_selections: null }], error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/mood", { moods: ["laugh"] });
    const { status, json } = await readResponse(await submitMood(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.submitted).toBe(true);
    expect(json.allDone).toBe(false);
  });

  it("builds deck and returns allDone:true when all submitted", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "mood", created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", mood_selections: null }, error: null },
      { data: null, error: null },
      { data: [{ mood_selections: ["laugh"] }, { mood_selections: ["cry"] }], error: null },
      { data: null, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/mood", { moods: ["laugh"] });
    const { status, json } = await readResponse(await submitMood(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.allDone).toBe(true);
    expect(json.deckSize).toBeGreaterThan(0);
  });
});

// ─── GET /api/group/[code]/swipe ────────────────────

describe("GET /api/group/[code]/swipe", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when session is not in swiping or done phase", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "mood", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/group/ABC123/swipe");
    const { status } = await readResponse(await getSwipeState(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns swipe state for swiping session", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "swiping", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", has_swiped: false }, error: null },
      { data: [{ movie_id: 1, vote: "yes" }], error: null },
      { data: [{ id: "p-1", user_id: "user-1", nickname: "Sergiu", has_swiped: false }], error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/group/ABC123/swipe");
    const { status, json } = await readResponse(await getSwipeState(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.sessionId).toBe("s-1");
    expect(json.deck).toHaveLength(2);
    expect(json.swipes).toHaveLength(1);
    expect(json.sessionStatus).toBe("swiping");
  });

  it("returns swipe state for done session", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "done", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", has_swiped: true }, error: null },
      { data: [], error: null },
      { data: [{ id: "p-1", user_id: "user-1", nickname: "Sergiu", has_swiped: true }], error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/group/ABC123/swipe");
    const { status, json } = await readResponse(await getSwipeState(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.sessionStatus).toBe("done");
  });
});

// ─── POST /api/group/[code]/swipe ───────────────────

describe("POST /api/group/[code]/swipe", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 for invalid vote value", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const req = mockRequest("POST", "/api/group/ABC123/swipe", { movieId: 1, vote: "love" });
    const { status } = await readResponse(await submitSwipe(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 400 when movieId is missing", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const req = mockRequest("POST", "/api/group/ABC123/swipe", { vote: "yes" });
    const { status } = await readResponse(await submitSwipe(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 400 when session is not in swiping phase", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "lobby", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/swipe", { movieId: 1, vote: "yes" });
    const { status } = await readResponse(await submitSwipe(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 400 when movie is not in deck", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "swiping", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/swipe", { movieId: 9999, vote: "yes" });
    const { status } = await readResponse(await submitSwipe(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 409 when participant already finished swiping", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "swiping", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", has_swiped: true }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/swipe", { movieId: 1, vote: "yes" });
    const { status } = await readResponse(await submitSwipe(req, routeParams("ABC123")));
    expect(status).toBe(409);
  });

  it("records vote and returns progress on success", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", status: "swiping", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
      { data: { id: "p-1", has_swiped: false }, error: null },
      { data: null, error: null },
      { data: null, error: null, count: 1 },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/group/ABC123/swipe", { movieId: 1, vote: "yes" });
    const { status, json } = await readResponse(await submitSwipe(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.recorded).toBe(true);
    expect(json.progress.swiped).toBe(1);
  });
});

// ─── GET /api/group/[code]/results ──────────────────

describe("GET /api/group/[code]/results", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no auth and no participantId", async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const req = mockRequest("GET", "/api/group/ABC123/results");
    const { status } = await readResponse(await getResults(req, routeParams("ABC123")));
    expect(status).toBe(401);
  });

  it("returns 400 when session is not done", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const supabase = createMockSupabase([
      { data: { id: "s-1", code: "ABC123", status: "swiping", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/group/ABC123/results");
    const { status } = await readResponse(await getResults(req, routeParams("ABC123")));
    expect(status).toBe(400);
  });

  it("returns 403 when caller is not a participant", async () => {
    mockGetAuthUser.mockResolvedValue({ ...mockUser, id: "outsider" });
    const supabase = createMockSupabase([
      { data: { id: "s-1", code: "ABC123", status: "done", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
      { data: [{ id: "p-1", user_id: "user-1", nickname: "Sergiu" }], error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/group/ABC123/results");
    const { status } = await readResponse(await getResults(req, routeParams("ABC123")));
    expect(status).toBe(403);
  });

  it("returns tiered results with topPick on success", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);
    const participants = [
      { id: "p-1", user_id: "user-1", nickname: "Sergiu" },
      { id: "p-2", user_id: "user-2", nickname: "Alex" },
    ];
    const swipes = [
      { participant_id: "p-1", movie_id: 1, vote: "yes" },
      { participant_id: "p-2", movie_id: 1, vote: "yes" },
      { participant_id: "p-1", movie_id: 2, vote: "no" },
      { participant_id: "p-2", movie_id: 2, vote: "maybe" },
    ];

    const supabase = createMockSupabase([
      { data: { id: "s-1", code: "ABC123", status: "done", movie_deck: fakeDeck, created_at: new Date().toISOString() }, error: null },
      { data: participants, error: null },
      { data: swipes, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/group/ABC123/results");
    const { status, json } = await readResponse(await getResults(req, routeParams("ABC123")));
    expect(status).toBe(200);
    expect(json.participantCount).toBe(2);
    expect(json.perfect.length).toBe(1);
    expect(json.perfect[0].movie.id).toBe(1);
    expect(json.miss.length).toBe(1);
    expect(json.topPick.movie.id).toBe(1);
  });
});
