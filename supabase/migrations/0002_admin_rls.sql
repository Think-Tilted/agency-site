-- Security hardening (ported from project-scaffold tier2). The original 0001
-- granted write to ANY authenticated user, and auth allowed open self-signup —
-- meaning any visitor could register and edit events. This migration closes that
-- hole by gating writes behind an `admins` allowlist.
--
-- New model:
--   * Anyone (anon) may READ events             -> public /events page.
--   * Only ADMINS may INSERT/UPDATE/DELETE       -> /admin/events editor.
-- "Admin" = the caller's auth email is in public.admins. Being merely
-- authenticated is NOT enough.

-- ---------------------------------------------------------------------------
-- Admin allowlist
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: invisible to the Data API. is_admin() reads it via
-- SECURITY DEFINER.
alter table public.admins enable row level security;

-- Backfill from existing auth users. Before this migration signup was open, so
-- review this table after pushing and remove any address that should not be an
-- admin:  select * from public.admins;
insert into public.admins (email)
  select email from auth.users where email is not null
  on conflict (email) do nothing;

-- True when the current caller's auth email is in the admin allowlist.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- ---------------------------------------------------------------------------
-- Replace the permissive write policies with admin-gated ones
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated users can insert events" on public.events;
drop policy if exists "authenticated users can update events" on public.events;
drop policy if exists "authenticated users can delete events" on public.events;

create policy "admins can insert events"
  on public.events
  for insert
  to authenticated
  with check (public.is_admin());

create policy "admins can update events"
  on public.events
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can delete events"
  on public.events
  for delete
  to authenticated
  using (public.is_admin());
