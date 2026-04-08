import { buildTMDBParams, allMoods } from "@/lib/moodMap";

describe("buildTMDBParams", () => {
  it("returns correct params for 'laugh' mood", () => {
    const params = buildTMDBParams("laugh");
    expect(params.with_genres).toBe("35");
    expect(params.sort_by).toBe("popularity.desc");
    expect(params["vote_count.gte"]).toBe("500");
    expect(params.without_genres).toBe("27");
    expect(params.watch_region).toBe("NO");
    expect(params.with_watch_monetization_types).toBe("flatrate");
  });

  it("returns correct params for 'beautiful' mood (has voteAverageGte)", () => {
    const params = buildTMDBParams("beautiful");
    expect(params.with_genres).toBe("18,10749");
    expect(params.sort_by).toBe("vote_average.desc");
    expect(params["vote_average.gte"]).toBe("7");
    expect(params.without_genres).toBeUndefined();
  });

  it("returns correct params for 'thrilling' mood (has excludeGenres)", () => {
    const params = buildTMDBParams("thrilling");
    expect(params.with_genres).toBe("28,53");
    expect(params.without_genres).toBe("35");
  });

  it("throws on unknown mood key", () => {
    expect(() => buildTMDBParams("nonexistent")).toThrow("Unknown mood: nonexistent");
  });

  it("always includes watch_region and monetization type", () => {
    for (const mood of allMoods) {
      const params = buildTMDBParams(mood.key);
      expect(params.watch_region).toBe("NO");
      expect(params.with_watch_monetization_types).toBe("flatrate");
    }
  });

  it("only includes vote_average.gte when mood has voteAverageGte", () => {
    for (const mood of allMoods) {
      const params = buildTMDBParams(mood.key);
      if (mood.voteAverageGte) {
        expect(params["vote_average.gte"]).toBe(mood.voteAverageGte.toString());
      } else {
        expect(params["vote_average.gte"]).toBeUndefined();
      }
    }
  });

  it("only includes without_genres when mood has excludeGenres", () => {
    for (const mood of allMoods) {
      const params = buildTMDBParams(mood.key);
      if (mood.excludeGenres) {
        expect(params.without_genres).toBe(mood.excludeGenres.join(","));
      } else {
        expect(params.without_genres).toBeUndefined();
      }
    }
  });
});

describe("moodMap data integrity", () => {
  it("has 10 moods defined", () => {
    expect(allMoods.length).toBe(10);
  });

  it("every mood has required fields", () => {
    for (const mood of allMoods) {
      expect(mood.key).toBeTruthy();
      expect(mood.label).toBeTruthy();
      expect(mood.description).toBeTruthy();
      expect(mood.genres.length).toBeGreaterThan(0);
      expect(mood.voteCountGte).toBeGreaterThan(0);
      expect(["popularity.desc", "vote_average.desc"]).toContain(mood.sortBy);
      expect(["gold", "blue", "rose", "violet", "teal", "ember"]).toContain(mood.accentColor);
    }
  });

  it("every mood key is unique", () => {
    const keys = allMoods.map((m) => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
