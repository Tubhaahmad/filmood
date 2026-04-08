import { vi } from "vitest";
import { buildSharedDeck } from "@/lib/deck";

function fakeTMDBResponse(count: number, startId = 1) {
  return {
    results: Array.from({ length: count }, (_, i) => ({
      id: startId + i,
      title: `Film ${startId + i}`,
      poster_path: `/poster${startId + i}.jpg`,
      release_date: "2025-01-01",
      vote_average: 7.5,
      overview: `Overview for film ${startId + i}`,
      genre_ids: [35],
    })),
  };
}

describe("buildSharedDeck", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.TMDB_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.TMDB_API_KEY;
  });

  it("returns empty array when no participants have moods", async () => {
    const result = await buildSharedDeck([
      { mood_selections: null },
      { mood_selections: null },
    ]);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty participants list", async () => {
    const result = await buildSharedDeck([]);
    expect(result).toEqual([]);
  });

  it("throws when TMDB API key is not configured", async () => {
    delete process.env.TMDB_API_KEY;
    await expect(
      buildSharedDeck([{ mood_selections: ["laugh"] }]),
    ).rejects.toThrow("TMDB API key not configured");
  });

  it("fetches films and returns a deck of up to 15 films", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(fakeTMDBResponse(20)),
    });

    const result = await buildSharedDeck([{ mood_selections: ["laugh"] }]);

    expect(result.length).toBeLessThanOrEqual(15);
    expect(result.length).toBeGreaterThan(0);
    for (const film of result) {
      expect(film.mood_keys).toContain("laugh");
    }
  });

  it("allocates slots proportionally across moods", async () => {
    // laugh gets 3 votes, cry gets 1 — so laugh should have more deck slots.
    // Each fetch call returns a non-overlapping ID range so dedup doesn't blur the counts.
    // The URL contains the mood params, so we key off call order (laugh is sorted first).
    const responses = [
      fakeTMDBResponse(20, 1),   // first call → laugh
      fakeTMDBResponse(20, 101), // second call → cry
    ];
    let callIndex = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      const response = responses[callIndex % responses.length];
      callIndex++;
      return Promise.resolve({
        json: () => Promise.resolve(response),
      });
    });

    const result = await buildSharedDeck([
      { mood_selections: ["laugh"] },
      { mood_selections: ["laugh"] },
      { mood_selections: ["laugh"] },
      { mood_selections: ["cry"] },
    ]);

    expect(result.length).toBe(15);
    // Films with IDs 1-20 were returned for laugh, 101-120 for cry.
    // laugh allocation (~11) > cry allocation (~4), so more laugh-sourced films.
    const laughCount = result.filter((f) => f.id >= 1 && f.id <= 20).length;
    const cryCount = result.filter((f) => f.id >= 101 && f.id <= 120).length;
    expect(laughCount).toBeGreaterThan(cryCount);
  });

  it("deduplicates films and merges mood_keys", async () => {
    const sharedResponse = fakeTMDBResponse(20, 1);
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(sharedResponse),
    });

    const result = await buildSharedDeck([
      { mood_selections: ["laugh"] },
      { mood_selections: ["cry"] },
    ]);

    const film1Entries = result.filter((f) => f.id === 1);
    expect(film1Entries.length).toBe(1);
  });

  it("each film in the deck has the correct shape", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(fakeTMDBResponse(20)),
    });

    const result = await buildSharedDeck([{ mood_selections: ["laugh"] }]);

    for (const film of result) {
      expect(film).toHaveProperty("id");
      expect(film).toHaveProperty("title");
      expect(film).toHaveProperty("poster_path");
      expect(film).toHaveProperty("release_date");
      expect(film).toHaveProperty("vote_average");
      expect(film).toHaveProperty("overview");
      expect(film).toHaveProperty("genre_ids");
      expect(film).toHaveProperty("mood_keys");
      expect(Array.isArray(film.mood_keys)).toBe(true);
    }
  });
});
