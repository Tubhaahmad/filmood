-- ============================================================
-- Seed data for testing group sessions locally
-- Run AFTER 001_group_sessions.sql
-- Replace the UUIDs below with real auth.users IDs from your Supabase project
-- ============================================================

-- To find your user IDs, run:
--   select id, email from auth.users;

-- Then replace these placeholders:
--   HOST_USER_ID  = the user who creates the session
--   USER_2_ID     = a second test user (or leave null for guest)

-- Example session in "lobby" status
insert into public.sessions (id, code, host_id, status)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'FILM42',
  '00000000-0000-0000-0000-000000000000',  -- replace with HOST_USER_ID
  'lobby'
);

-- Host as participant
insert into public.session_participants (id, session_id, user_id, nickname)
values (
  'p1000000-0000-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',  -- replace with HOST_USER_ID
  'Host'
);

-- Guest participant (no user_id)
insert into public.session_participants (id, session_id, user_id, nickname)
values (
  'p1000000-0000-0000-0000-000000000002',
  'a1b2c3d4-0000-0000-0000-000000000001',
  null,
  'Guest Alex'
);

-- Second test user (replace UUID or set to null for another guest)
insert into public.session_participants (id, session_id, user_id, nickname)
values (
  'p1000000-0000-0000-0000-000000000003',
  'a1b2c3d4-0000-0000-0000-000000000001',
  null,
  'Guest Sam'
);
