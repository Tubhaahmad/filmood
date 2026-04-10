import type { Page } from "@playwright/test";

// Deterministic fixtures for E2E — mockTmdb() serves these instead of real TMDB.
// IDs use 9900xx range so they're obvious in logs.

export const fakeFilms = [
  {
    id: 990001,
    title: "Midnight Harvest",
    poster_path: "/fake-poster-1.jpg",
    backdrop_path: "/fake-backdrop-1.jpg",
    release_date: "2024-09-12",
    vote_average: 8.2,
    overview: "A retired chef chases an old recipe across three countries.",
    genre_ids: [18, 10749],
  },
  {
    id: 990002,
    title: "The Quiet Algorithm",
    poster_path: "/fake-poster-2.jpg",
    backdrop_path: "/fake-backdrop-2.jpg",
    release_date: "2023-04-20",
    vote_average: 7.6,
    overview: "A lonely coder teaches a language model to grieve.",
    genre_ids: [18, 878],
  },
  {
    id: 990003,
    title: "Paper Lanterns",
    poster_path: "/fake-poster-3.jpg",
    backdrop_path: "/fake-backdrop-3.jpg",
    release_date: "2022-11-03",
    vote_average: 7.1,
    overview: "Two siblings reopen their grandmother's failing noodle shop.",
    genre_ids: [35, 10751],
  },
  {
    id: 990004,
    title: "North Sea Static",
    poster_path: "/fake-poster-4.jpg",
    backdrop_path: "/fake-backdrop-4.jpg",
    release_date: "2024-02-17",
    vote_average: 6.9,
    overview: "A lighthouse keeper picks up a signal that shouldn't exist.",
    genre_ids: [53, 9648],
  },
  {
    id: 990005,
    title: "Weekend Physics",
    poster_path: "/fake-poster-5.jpg",
    backdrop_path: "/fake-backdrop-5.jpg",
    release_date: "2023-07-28",
    vote_average: 7.4,
    overview: "Three friends try to recreate a famous experiment in a garage.",
    genre_ids: [35, 18],
  },
];

export const fakeFilmDetail = {
  id: 990001,
  title: "Midnight Harvest",
  overview: "A retired chef chases an old recipe across three countries.",
  poster_path: "/fake-poster-1.jpg",
  backdrop_path: "/fake-backdrop-1.jpg",
  release_date: "2024-09-12",
  runtime: 118,
  vote_average: 8.2,
  genres: [
    { id: 18, name: "Drama" },
    { id: 10749, name: "Romance" },
  ],
  credits: {
    cast: [
      {
        id: 1,
        name: "Alma Berger",
        character: "Mira",
        profile_path: "/fake-cast-1.jpg",
      },
      {
        id: 2,
        name: "Tomas Reyes",
        character: "Owen",
        profile_path: "/fake-cast-2.jpg",
      },
    ],
  },
};

export const fakeProviders = [
  { provider_id: 8, provider_name: "Netflix", logo_path: "/fake-netflix.jpg" },
];

export const fakeTrailer = {
  key: "dQw4w9WgXcQ",
  name: "Official Trailer",
  site: "YouTube",
  type: "Trailer",
};

/**
 * Intercepts movie API routes with fixtures. Call before `page.goto()`.
 * Uses regex (not globs) to prevent `**\/api/movies/*` from swallowing sub-routes.
 */
export async function mockTmdb(page: Page) {
  await page.route(/\/api\/movies\/trending(\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        films: fakeFilms.slice(0, 4).map((f) => ({
          id: f.id,
          title: f.title,
          genre_ids: f.genre_ids,
          backdrop_path: f.backdrop_path,
        })),
      }),
    }),
  );

  await page.route(/\/api\/movies\/discover(\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mood: "laugh",
        moods: ["Laugh until it hurts"],
        films: fakeFilms,
        total: fakeFilms.length,
      }),
    }),
  );

  await page.route(/\/api\/movies\/search(\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      // Must match real shape `{ films }` — SearchBox reads `data.films ?? []`.
      body: JSON.stringify({ films: fakeFilms }),
    }),
  );

  await page.route(/\/api\/movies\/browse(\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ films: fakeFilms, page: 1, totalPages: 1 }),
    }),
  );

  await page.route(/\/api\/movies\/\d+\/providers$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ providers: fakeProviders }),
    }),
  );

  await page.route(/\/api\/movies\/\d+\/trailer$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeTrailer),
    }),
  );

  // Film detail — `$` anchor keeps /providers and /trailer from matching here.
  await page.route(/\/api\/movies\/\d+$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeFilmDetail),
    }),
  );
}
