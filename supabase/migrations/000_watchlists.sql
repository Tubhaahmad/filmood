-- ============================================================
-- Filmood Stage 1 — Watchlists Table
-- This table already exists in Supabase. File kept for documentation.
-- ============================================================

create table if not exists public.watchlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  movie_id    integer not null,
  movie_title text not null,
  poster_path text,
  added_at    timestamptz not null default now()
);
