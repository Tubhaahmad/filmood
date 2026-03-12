# Filmood

**The movie is a mood.**

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Next.js 14** (App Router) | Framework — file-based routing, server-side rendering, API routes |
| **React 18** + TypeScript | UI components with type safety |
| **Tailwind CSS** | Utility-first styling |
| **TMDB API** | All movie data: titles, genres, posters, trailers, cast, streaming providers |
| **NextAuth.js** | Authentication — signup, login, session management |
| **Supabase** | PostgreSQL database — accounts, watchlists, group sessions |
| **Vercel** | Hosting — auto-deploys on push to main |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- A [Supabase project](https://supabase.com) (free tier)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/sergiu-sa/filmood.git
cd filmood

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Fill in your keys in .env.local (see below)

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root (never commit this file):

```env
# TMDB
TMDB_API_KEY=your_tmdb_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
```

To generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

---

## Project Structure

```bash
src/
├── app/                            # Next.js App Router pages
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (SessionProvider, Navbar, fonts)
│   ├── globals.css                 # Global styles + Tailwind + CSS variables
│   ├── mood/
│   │   └── page.tsx                # Mood selection (core UX)
│   ├── results/
│   │   └── page.tsx                # Film results grid
│   ├── film/
│   │   └── [id]/
│   │       └── page.tsx            # Film detail (dynamic route)
│   ├── login/
│   │   └── page.tsx                # Login form
│   ├── signup/
│   │   └── page.tsx                # Create account
│   ├── watchlist/
│   │   └── page.tsx                # Saved films (protected)
│   ├── profile/
│   │   └── page.tsx                # User profile (protected)
│   ├── group/                      # Stage 2: Group sessions
│   │   ├── page.tsx                # Create or join session
│   │   └── [code]/
│   │       ├── page.tsx            # Lobby
│   │       ├── mood/
│   │       │   └── page.tsx        # Private mood selection
│   │       ├── swipe/
│   │       │   └── page.tsx        # Swipe deck
│   │       └── results/
│   │           └── page.tsx        # Group results
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts        # NextAuth handler
│       ├── movies/
│       │   ├── discover/
│       │   │   └── route.ts        # Mood → TMDB discover
│       │   └── [id]/
│       │       ├── route.ts        # Film detail
│       │       ├── providers/
│       │       │   └── route.ts    # Norwegian streaming providers
│       │       └── trailer/
│       │           └── route.ts    # YouTube trailer key
│       ├── watchlist/
│       │   ├── route.ts            # GET user watchlist
│       │   ├── add/
│       │   │   └── route.ts        # POST add film
│       │   └── remove/
│       │       └── route.ts        # DELETE remove film
│       └── group/                  # Stage 2 API routes
│           ├── create/
│           │   └── route.ts        # Create session
│           ├── join/
│           │   └── route.ts        # Join session
│           └── [code]/
│               ├── status/
│               │   └── route.ts    # Session status
│               ├── mood/
│               │   └── route.ts    # Save participant moods
│               ├── deck/
│               │   └── route.ts    # Generate shared deck
│               ├── swipe/
│               │   └── route.ts    # Save vote
│               └── results/
│                   └── route.ts    # Calculate results
├── components/
│   ├── Navbar.tsx                  # Global navigation
│   ├── MoodCard.tsx                # Single mood card
│   ├── MoodSelector.tsx            # Mood grid + selection logic
│   ├── FilmCard.tsx                # Movie card (poster, title, info)
│   ├── FilmGrid.tsx                # Responsive grid of FilmCards
│   ├── TrailerEmbed.tsx            # YouTube embed
│   ├── WatchProviders.tsx          # Streaming platform logos
│   ├── WatchlistButton.tsx         # Add/remove/guest prompt
│   ├── AuthGuard.tsx               # Protected route wrapper
│   ├── LoadingState.tsx            # Skeleton / spinner
│   ├── ErrorState.tsx              # Error message + retry
│   ├── EmptyState.tsx              # Empty content + CTA
│   ├── MobileMenu.tsx              # Hamburger menu overlay
│   ├── CreateSession.tsx           # Stage 2: create session
│   ├── JoinSession.tsx             # Stage 2: join session
│   ├── ParticipantList.tsx         # Stage 2: live participant list
│   ├── SwipeCard.tsx               # Stage 2: swipe card
│   ├── SwipeDeck.tsx               # Stage 2: card stack
│   ├── GroupResultCard.tsx         # Stage 2: result card
│   └── SessionStatus.tsx           # Stage 2: session state
├── config/
│   └── moods.ts                    # Mood-to-TMDB mapping (the core algorithm)
├── lib/
│   ├── tmdb.ts                     # TMDB API helper functions
│   ├── supabase.ts                 # Supabase client
│   ├── auth.ts                     # NextAuth configuration
│   └── groupLogic.ts              # Stage 2: mood merging + score calc
└── types/
    └── index.ts                    # TypeScript interfaces
```

---

## Git Workflow

We use feature branches and pull requests. Never push directly to `main`.

### Branch naming

```text
feat/mood-selector       # New feature
fix/navbar-mobile        # Bug fix
design/brand-tokens      # Design/styling work
test/guest-flow-e2e      # Tests
docs/readme-update       # Documentation
```

### Workflow

```bash
# 1. Create a branch from main
git checkout main
git pull origin main
git checkout -b feat/your-feature-name

# 2. Work on your feature, commit often
git add .
git commit -m "Add mood card component with selected state"

# 3. Push your branch
git push origin feat/your-feature-name

# 4. Open a Pull Request on GitHub
#    - Add a description of what you built
#    - Request a review from a teammate
#    - Wait for approval before merging

# 5. After merge, clean up
git checkout main
git pull origin main
git branch -d feat/your-feature-name
```

### Commit messages

Keep them clear and in present tense:

```text
Add mood selection page with card grid
Fix trailer embed not loading on mobile
Update Tailwind config with brand colors
Add unit tests for mood config mapping
```

---

## Two-Stage Development

### Stage 1 — MVP (Solo User)

The minimum deliverable. Must ship.

- Full mood flow for guests AND users (no account required to browse)
- TMDB film discovery based on mood mapping
- Film detail with trailer, synopsis, cast, Norwegian streaming providers
- Account system: signup, login, session persistence
- Watchlist: save, view, remove films
- Responsive on desktop and mobile

### Stage 2 — Full App (Group Sessions)

Built on top of Stage 1 with no rebuilding.

- Create a session with a shareable code
- Join as guest (nickname) or user (profile)
- Private mood selection per participant
- Shared swipe deck: Yes / No / Maybe voting
- Real-time lobby updates via Supabase
- Group results: Perfect Match, Strong Contenders, Not Tonight

---

## Database (Supabase)

### Stage 1 Tables

**users** — auto-managed by NextAuth + Supabase Auth (do not create manually)

**watchlists**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK → users) | |
| movie_id | INT | TMDB movie ID |
| movie_title | TEXT | |
| poster_path | TEXT | TMDB poster URL path |
| added_at | TIMESTAMP | Default: now() |

Unique constraint on (user_id, movie_id).

### Stage 2 Tables

**sessions** — one row per group session

**session_participants** — one row per person in a session

**swipes** — one row per vote

---

## Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
```

---

## AI Usage

All AI usage is documented in [AI_LOG.md](./AI_LOG.md) as required by the course assignment brief.

**Allowed:** Brainstorming, explaining concepts, debugging assistance, placeholder text.
**Not allowed:** Core application logic (TMDB fetching, state management, rendering).
