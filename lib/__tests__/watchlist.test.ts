import { vi } from "vitest";
import {
  createMockSupabase,
  mockRequest,
  mockUser,
  readResponse,
} from "./helpers/supabase-mock";

// Mock supabase-server before importing routes
const mockGetAuthUser = vi.fn();
const mockGetSupabaseAdmin = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
  getAuthUser: (...args: unknown[]) => mockGetAuthUser(...args),
  getSupabaseAdmin: () => mockGetSupabaseAdmin(),
}));

// Import route handlers AFTER mocking
import { POST as addToWatchlist } from "@/app/api/watchlist/add/route";
import { DELETE as removeFromWatchlist } from "@/app/api/watchlist/remove/route";
import { GET as getWatchlist } from "@/app/api/watchlist/route";

// ─── POST /api/watchlist/add ────────────────────────

describe("POST /api/watchlist/add", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = mockRequest("POST", "/api/watchlist/add", {
      movie_id: 550,
      movie_title: "Fight Club",
      poster_path: "/poster.jpg",
    });

    const { status, json } = await readResponse(await addToWatchlist(req));
    expect(status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when movie_id is missing", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);

    const req = mockRequest("POST", "/api/watchlist/add", {
      movie_title: "Fight Club",
    });

    const { status } = await readResponse(await addToWatchlist(req));
    expect(status).toBe(400);
  });

  it("returns 400 when movie_title is missing", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);

    const req = mockRequest("POST", "/api/watchlist/add", {
      movie_id: 550,
    });

    const { status } = await readResponse(await addToWatchlist(req));
    expect(status).toBe(400);
  });

  it("returns 409 when film is already in watchlist", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);

    const supabase = createMockSupabase([
      { data: { id: "existing-row" }, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/watchlist/add", {
      movie_id: 550,
      movie_title: "Fight Club",
      poster_path: "/poster.jpg",
    });

    const { status, json } = await readResponse(await addToWatchlist(req));
    expect(status).toBe(409);
    expect(json.error).toBe("Film already in watchlist");
  });

  it("returns 201 with the new entry on success", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);

    const newEntry = { id: "entry-1", movie_id: 550, movie_title: "Fight Club" };
    const supabase = createMockSupabase([
      { data: null, error: null },
      { data: newEntry, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("POST", "/api/watchlist/add", {
      movie_id: 550,
      movie_title: "Fight Club",
      poster_path: "/poster.jpg",
    });

    const { status, json } = await readResponse(await addToWatchlist(req));
    expect(status).toBe(201);
    expect(json.entry).toEqual(newEntry);
  });
});

// ─── DELETE /api/watchlist/remove ────────────────────

describe("DELETE /api/watchlist/remove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = mockRequest("DELETE", "/api/watchlist/remove", {
      movie_id: 550,
    });

    const { status } = await readResponse(await removeFromWatchlist(req));
    expect(status).toBe(401);
  });

  it("returns 400 when movie_id is missing", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);

    const req = mockRequest("DELETE", "/api/watchlist/remove", {});

    const { status } = await readResponse(await removeFromWatchlist(req));
    expect(status).toBe(400);
  });

  it("returns 200 on successful removal", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);

    const supabase = createMockSupabase([
      { data: null, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("DELETE", "/api/watchlist/remove", {
      movie_id: 550,
    });

    const { status, json } = await readResponse(await removeFromWatchlist(req));
    expect(status).toBe(200);
    expect(json.success).toBe(true);
  });
});

// ─── GET /api/watchlist ─────────────────────────────

describe("GET /api/watchlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = mockRequest("GET", "/api/watchlist");
    const { status } = await readResponse(await getWatchlist(req));
    expect(status).toBe(401);
  });

  it("returns the user's watchlist on success", async () => {
    mockGetAuthUser.mockResolvedValue(mockUser);

    const films = [
      { id: "1", movie_id: 550, movie_title: "Fight Club" },
      { id: "2", movie_id: 680, movie_title: "Pulp Fiction" },
    ];
    const supabase = createMockSupabase([
      { data: films, error: null },
    ]);
    mockGetSupabaseAdmin.mockReturnValue(supabase);

    const req = mockRequest("GET", "/api/watchlist");
    const { status, json } = await readResponse(await getWatchlist(req));
    expect(status).toBe(200);
    expect(json.watchlist).toEqual(films);
  });
});
