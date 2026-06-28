-- Voyagent Supabase schema.
-- Run this in the Supabase SQL editor (or `supabase db push`) before first use.

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ─── users ───────────────────────────────────────────────────
-- id is the Auth0 `sub` (a text identifier, e.g. "auth0|abc123"),
-- stored as the primary key.
create table if not exists public.users (
  id          text primary key,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- ─── trips ───────────────────────────────────────────────────
create table if not exists public.trips (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null references public.users (id) on delete cascade,
  destination    text not null,
  origin         text not null default '',
  start_date     date not null,
  end_date       date not null,
  num_travelers  integer not null default 1,
  group_type     text not null default 'solo' check (group_type in ('solo', 'couple', 'family', 'friends')),
  departure_time text not null default 'either' check (departure_time in ('morning', 'night', 'either')),
  budget_tier    text not null check (budget_tier in ('budget', 'mid', 'luxury')),
  vibe           text not null check (vibe in ('relaxed', 'packed', 'adventurous')),
  dietary_notes  text,
  must_haves     text,
  created_at     timestamptz not null default now()
);

create index if not exists trips_user_id_idx on public.trips (user_id);

-- ─── events ──────────────────────────────────────────────────
create table if not exists public.events (
  id                  uuid primary key default gen_random_uuid(),
  trip_id             uuid not null references public.trips (id) on delete cascade,
  day_number          integer not null,
  date                date not null,
  time_start          text not null,  -- "HH:MM"
  time_end            text not null,  -- "HH:MM"
  title               text not null,
  category            text not null check (category in ('flight', 'hotel', 'restaurant', 'activity', 'transport')),
  location_name       text not null default '',
  location_address    text not null default '',
  description         text not null default '',
  booking_url         text,
  estimated_cost_usd  integer,
  created_at          timestamptz not null default now()
);

create index if not exists events_trip_id_idx on public.events (trip_id);
create index if not exists events_date_idx on public.events (date);

-- Note: writes go through the service-role key from server code
-- (lib/supabase/server.ts), so row-level security is intentionally not
-- relied upon here. If you expose the anon key to authenticated browser
-- reads, add RLS policies scoping rows to the Auth0 user id.
