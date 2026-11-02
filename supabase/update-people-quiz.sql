-- Geo Quiz update: the Danish Actors quiz.
--   - a private storage bucket for the photos (admin uploads them on the
--     Settings page; only logged-in players can view them)
--   - lets the scores table accept the new quiz (and any future quiz)
--
-- Run once in the Supabase SQL Editor (New query -> paste -> Run).
-- Safe to run more than once; it changes no accounts, scores or settings.

-- (From the previous update, included in case it wasn't run.)
alter table public.settings add column if not exists
  capitals_prompt text not null default 'outline' check (capitals_prompt in ('outline', 'map'));

alter table public.scores drop constraint if exists scores_quiz_id_check;
alter table public.scores add constraint scores_quiz_id_check check (quiz_id ~ '^[a-z0-9-]{1,40}$');

-- ------------------------------------------------------- people photos --
-- Photos for the Danish Actors quiz live in a private storage bucket.
-- Logged-in players can view them (through short-lived links); only the
-- admin can add, replace or remove them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('people-photos', 'people-photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "people photos readable by members" on storage.objects;
create policy "people photos readable by members" on storage.objects
  for select to authenticated using (bucket_id = 'people-photos');
drop policy if exists "people photos added by admin" on storage.objects;
create policy "people photos added by admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'people-photos' and public.is_admin());
drop policy if exists "people photos replaced by admin" on storage.objects;
create policy "people photos replaced by admin" on storage.objects
  for update to authenticated using (bucket_id = 'people-photos' and public.is_admin())
  with check (bucket_id = 'people-photos' and public.is_admin());
drop policy if exists "people photos removed by admin" on storage.objects;
create policy "people photos removed by admin" on storage.objects
  for delete to authenticated using (bucket_id = 'people-photos' and public.is_admin());
