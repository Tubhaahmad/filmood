-- ============================================================
-- Filmood Stage 2 — Group Session Tables
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This table already exists in Supabase. File kept for documentation.
-- ============================================================

-- 1. SESSIONS
-- Holds each group session. The host creates it, participants join via code.
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,                        -- 6-char join code
  host_id     uuid not null references auth.users(id),     -- who created it
  status      text not null default 'lobby'                -- lobby | mood | swiping | done
                check (status in ('lobby','mood','swiping','done')),
  movie_deck  jsonb,                                       -- populated after mood phase
  created_at  timestamptz not null default now()
);

-- 2. SESSION PARTICIPANTS
-- One row per person in a session. user_id is null for guests.
create table if not exists public.session_participants (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.sessions(id) on delete cascade,
  user_id          uuid references auth.users(id),          -- null for guests
  nickname         text not null,
  mood_selections  jsonb,                                    -- e.g. ["laugh","chill"]
  has_swiped       boolean not null default false,
  joined_at        timestamptz not null default now()
);

-- 3. SWIPES
-- Each participant's vote on each movie in the deck.
create table if not exists public.swipes (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.sessions(id) on delete cascade,
  participant_id  uuid not null references public.session_participants(id) on delete cascade,
  movie_id        integer not null,
  vote            text not null check (vote in ('yes','no','maybe')),
  created_at      timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

-- Fast lookup when joining by code (unique constraint already creates an index,
-- but being explicit for clarity)
create index if not exists idx_sessions_code on public.sessions(code);

-- Participant lookups by session
create index if not exists idx_participants_session on public.session_participants(session_id);

-- Swipe queries: "all votes in this session" and "this participant's votes"
create index if not exists idx_swipes_session_participant on public.swipes(session_id, participant_id);

-- Prevent duplicate votes: one vote per participant per movie
create unique index if not exists idx_swipes_unique_vote on public.swipes(session_id, participant_id, movie_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- All mutations go through API routes using the service-role key (bypasses RLS).
-- These policies secure direct client access and Supabase Realtime subscriptions.

-- SESSIONS ----
alter table public.sessions enable row level security;

-- Authenticated users can read sessions they host or participate in
create policy "Users can read own sessions"
  on public.sessions for select
  to authenticated
  using (
    host_id = auth.uid()
    or id in (
      select session_id from public.session_participants
      where user_id = auth.uid()
    )
  );

-- Anon users can read a session by code (needed for guests + Realtime)
create policy "Anon can read session by code"
  on public.sessions for select
  to anon
  using (true);

-- SESSION PARTICIPANTS ----
alter table public.session_participants enable row level security;

-- Authenticated users can read participants in their sessions
create policy "Users can read session participants"
  on public.session_participants for select
  to authenticated
  using (
    session_id in (
      select id from public.sessions
      where host_id = auth.uid()
    )
    or session_id in (
      select session_id from public.session_participants
      where user_id = auth.uid()
    )
  );

-- Anon can read participants (needed for guest Realtime subscriptions)
create policy "Anon can read participants"
  on public.session_participants for select
  to anon
  using (true);

-- SWIPES ----
alter table public.swipes enable row level security;

-- Authenticated users can read swipes in their sessions (for results page)
create policy "Users can read session swipes"
  on public.swipes for select
  to authenticated
  using (
    session_id in (
      select session_id from public.session_participants
      where user_id = auth.uid()
    )
  );

-- Anon can read swipes (guests need to see results)
create policy "Anon can read swipes"
  on public.swipes for select
  to anon
  using (true);


-- ============================================================
-- REALTIME
-- ============================================================
-- Enable Realtime on sessions (status changes) and session_participants (joins, mood submissions)
-- Run these as separate statements in the SQL editor:

alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.session_participants;
