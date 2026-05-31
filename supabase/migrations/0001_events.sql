-- PRE-005 — Tier 2 schema: a single `events` table for the dynamic-content demo.
-- Version-controlled so the schema is reproducible (foundation for the future
-- scaffold script, PRE-007). See decisions.md ADR-011.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  event_date  date not null,
  description text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.events is
  'Client-editable operational content (PRE-005 demo). Public read; authenticated write.';

-- Keep updated_at honest on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- RLS is on from day one. Policy model for this demo:
--   * Anyone (anon) may READ events  -> the public /events page renders them.
--   * Only AUTHENTICATED users may INSERT/UPDATE/DELETE -> the edit page.
-- A real multi-client deployment would add a client_id column + ownership
-- checks; that is the natural next layer (noted in PRE-005 lessons).
alter table public.events enable row level security;

create policy "events are publicly readable"
  on public.events
  for select
  using (true);

create policy "authenticated users can insert events"
  on public.events
  for insert
  to authenticated
  with check (true);

create policy "authenticated users can update events"
  on public.events
  for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can delete events"
  on public.events
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Seed data (so the page has something to show immediately)
-- ---------------------------------------------------------------------------
insert into public.events (title, event_date, description) values
  ('Summer Tasting Menu Launch', current_date + 14, 'Five-course seasonal menu featuring local produce.'),
  ('Live Jazz Night',            current_date + 21, 'An evening of live music with the house quartet.'),
  ('Wine Pairing Dinner',        current_date + 35, 'Curated pairings across four courses.');
