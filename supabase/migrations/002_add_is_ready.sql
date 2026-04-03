-- Allows each person to signal they're ready before the host starts the session.
-- This table already exists in Supabase. File kept for documentation.
alter table public.session_participants
  add column if not exists is_ready boolean not null default false;
