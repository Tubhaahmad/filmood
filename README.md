# Filmood

**Tell Filmood how you want to feel. It tells you what to watch — alone or as a group.**

Filmood is a film discovery and decision-making web app that starts from the user's emotional state rather than from content catalogs. Users pick a mood, and Filmood returns films that match it. The app supports both solo discovery and a real-time group session where several people swipe on a shared film deck and the app picks a winner based on everyone's votes.

**Live:** [filmood.app](https://filmood-three.vercel.app/)

**Course:** Agency 2 (FM2AJA205) — Noroff

---

## Features

### Solo experience

- **Mood-based discovery.** Pick one or more moods (laugh, escape, cry, thrilling, thoughtful, and six more) and get a curated film list from TMDB. Refine by runtime, language, or excluded genres.
- **Search and browse.** Search films by title, actor, or director. Browse by category (trending, top rated, new releases, in cinemas, by genre, streaming in Norway).
- **Film details.** Full cast, Norwegian streaming providers, YouTube trailer, overview, and metadata for every film.
- **Watchlist.** Save films to a personal watchlist (w.i.p.).
- **Guest-friendly.** Everything except the watchlist works without an account. A gentle prompt appears when a feature needs one.

### Group sessions

- **Create a session.** One person (the host) creates a session and shares a 6-character code.
- **Join with a nickname.** Guests can join without creating an account.
- **Private mood selection.** Each participant picks their moods in private. The app merges everyone's picks into a balanced 15-film deck.
- **Swipe deck.** Everyone swipes yes / no / maybe on the shared deck with real-time updates via Supabase Realtime.
- **Ranked results.** The app aggregates votes into three tiers — Perfect Match, Strong Contenders, and Not Tonight — and picks a Top Pick.

### Design

- **Dual theme.** Full dark and light themes built on CSS custom properties. The theme toggle is accessible and hydration-safe.
- **Responsive.** Works on desktop, tablet, and mobile with a bottom-sheet pattern on small screens.
- **v9 design system.** Lora (serif) for headings, Plus Jakarta Sans for body. Six accent color families map to moods and phases of the app.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.1.6 | App Router, server-side rendering, API routes |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety (strict mode) |
| Tailwind CSS | 4.x | Utility styling (used alongside CSS custom properties) |
| Supabase | 2.99.1 | Authentication, PostgreSQL, Realtime |
| Zod | 4.3.6 | Form validation |
| TMDB API | v3 | Movie data (discover, search, details, providers, trailers) |
| Vitest | 4.1.3 | Unit and component tests |
| React Testing Library | 16.3.2 | Component rendering and interaction tests |
| Playwright | 1.59.1 | End-to-end tests |
| Vercel | — | Hosting, auto-deploys from `main` |

---

## Getting Started

### Prerequisites

- Node.js 20 or higher (Next.js 16 dropped Node 18 support)
- npm
- A [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- A [Supabase project](https://supabase.com) (free tier)

### Installation

```bash
git clone https://github.com/Tubhaahmad/filmood.git
cd filmood
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in the values. The `.env.local` file is gitignored and must never be committed.

```bash
cp .env.example .env.local
```

The required variables are:

```env
# Supabase — get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TMDB — get this from themoviedb.org/settings/api
TMDB_API_KEY=your_tmdb_api_key

# NextAuth — only used for secret generation, auth runs through Supabase directly
NEXTAUTH_SECRET=generate_with_openssl
NEXTAUTH_URL=http://localhost:3000
```

Generate the NextAuth secret with:

```bash
openssl rand -base64 32
```

### Database setup

Run the SQL migrations in `supabase/migrations/` against your Supabase project in order:

1. `000_watchlists.sql` — watchlists table
2. `001_group_sessions.sql` — sessions, session_participants, swipes tables with RLS and Realtime
3. `002_add_is_ready.sql` — adds `is_ready` flag to session_participants

Run them in the Supabase SQL Editor or via the Supabase CLI. An optional `supabase/seed_group_session.sql` file is included with sample data for testing the group flow locally.

### E2E test user (optional, only if you plan to run Playwright)

The Playwright suite logs in as a dedicated Supabase user. To provision it, copy the template and run the seed script:

```bash
cp .env.test.example .env.test.local
# Edit .env.test.local and pick a strong password
npm run seed:e2e-user
```

The seed script is idempotent — running it again when the user already exists is a no-op. `.env.test.local` is gitignored and must never be committed.

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint issues

# Unit and component tests (Vitest)
npm test                 # Run all Vitest suites once
npm run test:watch       # Watch mode

# End-to-end tests (Playwright)
npm run test:e2e         # Run Playwright suite (boots dev server automatically)
npm run test:e2e:ui      # Playwright UI mode
npm run test:e2e:debug   # Debug mode with inspector

# One-off setup
npm run seed:e2e-user    # Provision the Supabase user used by the E2E suite
```

---

## Project Structure

```
app/                        # Next.js App Router
├── layout.tsx              # Root layout (AuthProvider, Navbar, Footer, fonts)
├── page.tsx                # Dashboard homepage
├── globals.css             # CSS custom properties, keyframes, global styles
├── results/                # Solo results page
├── film/[id]/              # Film detail (server component)
├── browse/                 # Full browse/search page
├── login/ · signup/        # Auth pages
├── watchlist/ · profile/   # Protected pages
├── group/                  # Group session flow
│   ├── page.tsx            # Create or join
│   └── [code]/
│       ├── page.tsx        # Lobby
│       ├── mood/           # Private mood selection
│       ├── swipe/          # Swipe deck
│       └── results/        # Group results
└── api/                    # Server-side route handlers
    ├── movies/             # TMDB proxy routes (discover, search, browse, [id], etc.)
    ├── watchlist/          # Watchlist CRUD
    └── group/              # Group session lifecycle + gameplay

components/                 # React components
├── dashboard/              # MoodBox, SearchBox, ExploreBox, panels, HeroSection
├── group/                  # Session create/join, lobby, swipe deck, results
├── film/                   # FilmCard, FilmGrid, WatchProviders, TrailerEmbed
├── __tests__/              # Component tests (React Testing Library)
├── Navbar.tsx · Footer.tsx · Breadcrumb.tsx
└── AuthProvider.tsx · AuthGuard.tsx

lib/
├── types.ts                # TypeScript interfaces
├── moodMap.ts              # Mood-to-TMDB parameter mapping
├── group.ts · group-api.ts # Group session helpers
├── deck.ts                 # Shared deck builder
├── supabase.ts · supabase-server.ts  # Supabase clients
├── getAuthToken.ts         # Fresh JWT helper for API calls
├── useGroupRealtime.ts · useParticipantId.ts · useMediaQuery.ts
└── __tests__/              # Unit tests for lib modules and API routes

supabase/
├── migrations/             # Version-controlled SQL migrations
└── seed_group_session.sql  # Optional sample data for local group-flow testing

scripts/
└── seed-e2e-user.ts        # Provisions the Playwright test user via Supabase admin API

tests/
├── setup.ts                # Vitest global setup
└── e2e/                    # Playwright end-to-end tests
    ├── fixtures/           # TMDB mocks, auth helpers
    └── *.test.ts           # E2E specs

public/                     # Static assets
```

---

## Architecture Notes

**Authentication runs through Supabase directly.** `AuthProvider` wraps the app in React Context and listens to `supabase.auth.onAuthStateChange`. For API requests, components use `getAuthHeaders()` from `lib/getAuthToken.ts` which calls `supabase.auth.getSession()` at request time to get a fresh JWT — never reading the token from React state, which can hold stale values after Supabase auto-refreshes.

**Group sessions support guest participants.** Most `/api/group/[code]/*` routes are auth-optional. Guests identify themselves with a `participantId` stored in `localStorage`. Authenticated users identify themselves with a Supabase JWT in the `Authorization` header. The shared helpers `resolveSession()` and `resolveParticipant()` in `lib/group-api.ts` handle both paths.

**Realtime with a polling fallback.** The `useGroupRealtime` hook subscribes to Supabase `postgres_changes` on sessions, participants, and swipes. It also polls every 2 seconds as a safety net for unreliable connections. Callbacks are stored in refs so subscriptions don't thrash on every render.

**Optimistic voting.** When a user swipes on a card, the vote is applied to local state immediately. If the POST fails, the vote is retried once after 800ms rather than rolled back — the card is already visually gone and reverting would be jarring. A `Math.max` guard on the card index prevents polling from snapping the deck backwards.

**TMDB API key never reaches the client.** All TMDB calls go through `/api/movies/*` route handlers on the server. The client only ever talks to our own API.

**Tailwind v4 layer workaround.** Custom CSS classes for layout are unreliable in Tailwind v4 production builds because of how layer specificity works. Layout-critical styles use inline `style={}` props, and `useMediaQuery` (hydration-safe) handles responsive breakpoints. CSS classes are reserved for animations and hide/show toggles.

---

## Team

Filmood was built by a team of four for the Noroff Agency 2 course.

| Name | GitHub |
|------|--------|
| Thuba Ahmad | [@Tubhaahmad](https://github.com/Tubhaahmad) |
| Muhammad Khan | [@Hammadniazi](https://github.com/Hammadniazi) |
| Sergiu Sarbu | [@sergiu-sa](https://github.com/sergiu-sa) |
| Kasper Poniewierski | [@Arly24h](https://github.com/Arly24h) |

Individual contributions are documented in each team member's reflection report.

---

## AI Usage

All AI usage is documented in [`AI_LOG.md`](./AI_LOG.md) as required by the course assignment brief. Per the Noroff AI policy, AI assistance is allowed for brainstorming, explaining concepts, debugging, and placeholder content; but not for generating core application logic without understanding and attribution.

---

## License

This project is a student submission and is not licensed for commercial use. Movie data is provided by [The Movie Database (TMDB)](https://www.themoviedb.org) — this product uses the TMDB API but is not endorsed or certified by TMDB.
