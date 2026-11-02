-- Geo Quiz update: lets the admin choose between the country outline and a
-- map in the capitals quizzes (Settings -> Capitals quizzes).
--
-- Run once in the Supabase SQL Editor if your database was created before
-- this setting existed. Safe to run more than once; it changes no data.
alter table public.settings add column if not exists
  capitals_prompt text not null default 'outline' check (capitals_prompt in ('outline', 'map'));
