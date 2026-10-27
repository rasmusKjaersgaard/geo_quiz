-- =============================================================================
-- Geo Quiz - database setup for Supabase.
-- Run this whole file once in the Supabase SQL Editor (Dashboard -> SQL Editor
-- -> New query -> paste -> Run). It is safe to run again: it only creates
-- what is missing and replaces functions/policies.
--
-- BEFORE RUNNING: set your admin username and first invite code just below.
-- =============================================================================

-- ---------------------------------------------------------------- config ----
-- The account with this username (case-insensitive) becomes the admin.
create or replace function public.admin_username() returns text
language sql immutable as $$ select lower('Radmud') $$;

-- ----------------------------------------------------------------- tables ---
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

-- Public settings: everyone can read, only the admin can change.
create table if not exists public.settings (
  id                int primary key default 1 check (id = 1),
  time_limits       jsonb not null default '{}'::jsonb,  -- { "<quiz id>": seconds }
  leaderboard_size  int not null default 25 check (leaderboard_size between 1 and 500),
  leaderboard_mode  text not null default 'best' check (leaderboard_mode in ('best', 'all')),
  updated_at        timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- The invite code lives in its own table that only the admin can read.
-- Sign-up checks it through check_signup() and the handle_new_user() trigger.
create table if not exists public.settings_private (
  id           int primary key default 1 check (id = 1),
  invite_code  text not null check (length(invite_code) >= 3)
);
-- First invite code (change it here, or later on the admin Settings page).
insert into public.settings_private (id, invite_code) values (1, 'farshat') on conflict (id) do nothing;

create table if not exists public.scores (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  quiz_id        text not null check (quiz_id in (
                   'countries', 'flags', 'capitals',
                   'capitals-africa', 'capitals-asia', 'capitals-europe',
                   'capitals-north-america', 'capitals-south-america', 'capitals-oceania')),
  score          int not null check (score >= 0),
  correct        int not null check (correct >= 0),
  total          int not null check (total > 0 and correct <= total),
  best_streak    int not null default 0 check (best_streak >= 0),
  completed_all  boolean not null default false,
  time_ms        int not null check (time_ms >= 0),
  created_at     timestamptz not null default now()
);
create index if not exists scores_quiz_idx on public.scores (quiz_id);
create index if not exists scores_user_idx on public.scores (user_id);

-- -------------------------------------------------------------- helpers ----
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false)
$$;

-- Sort key for leaderboards (smaller = better). Mirrors src/lib/ranking.ts.
--   countries: finished everything first (fastest first), then most named, then time
--   flags/capitals: highest score, then most correct, then time
create or replace function public.score_sort_key(
  p_quiz_id text, p_completed_all boolean, p_correct int, p_score int, p_time_ms int
) returns bigint[] language sql immutable as $$
  select case when p_quiz_id = 'countries' then
    array[case when p_completed_all then 0 else 1 end,
          case when p_completed_all then 0 else -p_correct end,
          p_time_ms]::bigint[]
  else
    array[-p_score, -p_correct, p_time_ms]::bigint[]
  end
$$;

-- ---------------------------------------------------------------- sign-up --
-- Called by the sign-up form before creating the account, to show a clear
-- message. Returns 'ok', 'invalid_username', 'bad_invite' or 'username_taken'.
create or replace function public.check_signup(p_username text, p_invite_code text) returns text
language plpgsql stable security definer set search_path = public as $$
begin
  if p_username is null or p_username !~ '^[A-Za-z0-9_]{3,20}$' then
    return 'invalid_username';
  end if;
  if coalesce(trim(p_invite_code), '') <> (select invite_code from public.settings_private where id = 1) then
    return 'bad_invite';
  end if;
  if exists (select 1 from public.profiles where lower(username) = lower(p_username)) then
    return 'username_taken';
  end if;
  return 'ok';
end $$;

-- Runs for every new auth user. This is the real gate: without a valid invite
-- code and username the account is not created at all.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_username text := trim(new.raw_user_meta_data ->> 'username');
  v_invite   text := trim(new.raw_user_meta_data ->> 'invite_code');
begin
  if v_username is null or v_username !~ '^[A-Za-z0-9_]{3,20}$' then
    raise exception 'Invalid username';
  end if;
  if split_part(lower(new.email), '@', 1) <> lower(v_username) then
    raise exception 'Email does not match username';
  end if;
  if v_invite is null or v_invite <> (select invite_code from public.settings_private where id = 1) then
    raise exception 'Invalid invite code';
  end if;
  if exists (select 1 from public.profiles where lower(username) = lower(v_username)) then
    raise exception 'Username taken';
  end if;
  insert into public.profiles (id, username, is_admin)
  values (new.id, v_username, lower(v_username) = public.admin_username());
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------- leaderboards --
-- Ranked leaderboard for one quiz, using the admin's size and mode settings.
create or replace function public.get_leaderboard(p_quiz_id text)
returns table (
  id uuid, user_id uuid, username text, quiz_id text, score int, correct int, total int,
  best_streak int, completed_all boolean, time_ms int, created_at timestamptz
)
language sql stable security invoker set search_path = public as $$
  with cfg as (
    select leaderboard_size as lim, leaderboard_mode as mode from public.settings where id = 1
  ),
  ranked as (
    select s.*,
           public.score_sort_key(s.quiz_id, s.completed_all, s.correct, s.score, s.time_ms) as k,
           row_number() over (
             partition by s.user_id
             order by public.score_sort_key(s.quiz_id, s.completed_all, s.correct, s.score, s.time_ms), s.created_at
           ) as user_rank
    from public.scores s
    where s.quiz_id = p_quiz_id
  )
  select r.id, r.user_id, p.username, r.quiz_id, r.score, r.correct, r.total,
         r.best_streak, r.completed_all, r.time_ms, r.created_at
  from ranked r
  join public.profiles p on p.id = r.user_id
  cross join cfg
  where cfg.mode = 'all' or r.user_rank = 1
  order by r.k, r.created_at
  limit (select lim from cfg)
$$;

-- Position (1-based) that one attempt holds on its quiz's leaderboard.
create or replace function public.get_rank(p_score_id uuid) returns int
language sql stable security invoker set search_path = public as $$
  with cfg as (select leaderboard_mode as mode from public.settings where id = 1),
  me as (
    select s.*, public.score_sort_key(s.quiz_id, s.completed_all, s.correct, s.score, s.time_ms) as k
    from public.scores s where s.id = p_score_id
  ),
  others as (
    select s.created_at,
           public.score_sort_key(s.quiz_id, s.completed_all, s.correct, s.score, s.time_ms) as k,
           row_number() over (
             partition by s.user_id
             order by public.score_sort_key(s.quiz_id, s.completed_all, s.correct, s.score, s.time_ms), s.created_at
           ) as user_rank
    from public.scores s, me, cfg
    where s.quiz_id = me.quiz_id
      and s.id <> me.id
      and (cfg.mode = 'all' or s.user_id <> me.user_id)
  )
  select (1 + count(*))::int
  from others o, me, cfg
  where (cfg.mode = 'all' or o.user_rank = 1)
    and (o.k, o.created_at) < (me.k, me.created_at)
$$;

-- ----------------------------------------------------- row level security --
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.settings_private enable row level security;
alter table public.scores enable row level security;

-- profiles: logged-in users can read; nobody can edit through the API
-- (rows are created by the sign-up trigger).
drop policy if exists "profiles readable by members" on public.profiles;
create policy "profiles readable by members" on public.profiles
  for select to authenticated using (true);

-- settings: everyone can read, only the admin can update.
drop policy if exists "settings readable by everyone" on public.settings;
create policy "settings readable by everyone" on public.settings
  for select to anon, authenticated using (true);
drop policy if exists "settings editable by admin" on public.settings;
create policy "settings editable by admin" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- settings_private (invite code): admin only.
drop policy if exists "invite readable by admin" on public.settings_private;
create policy "invite readable by admin" on public.settings_private
  for select to authenticated using (public.is_admin());
drop policy if exists "invite editable by admin" on public.settings_private;
create policy "invite editable by admin" on public.settings_private
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- scores: logged-in users read all, insert only their own, admin can delete.
drop policy if exists "scores readable by members" on public.scores;
create policy "scores readable by members" on public.scores
  for select to authenticated using (true);
drop policy if exists "insert own scores" on public.scores;
create policy "insert own scores" on public.scores
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "admin deletes scores" on public.scores;
create policy "admin deletes scores" on public.scores
  for delete to authenticated using (public.is_admin());

-- ------------------------------------------------------------- privileges --
revoke all on public.settings_private from anon;
revoke update, delete on public.scores from anon, authenticated;
grant delete on public.scores to authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;

revoke execute on function public.check_signup(text, text) from public;
grant execute on function public.check_signup(text, text) to anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.get_leaderboard(text) to authenticated;
grant execute on function public.get_rank(uuid) to authenticated;
