-- Migration: add flight origin, group type, and departure-time preference to trips.
-- Replaces the old free-form `age` column with a structured `group_type`.
-- Run this in the Supabase SQL editor against an existing database. Safe to
-- re-run (uses IF [NOT] EXISTS / IF EXISTS guards).

alter table public.trips
  add column if not exists origin text not null default '';

alter table public.trips
  add column if not exists group_type text not null default 'solo'
    check (group_type in ('solo', 'couple', 'family', 'friends'));

alter table public.trips
  add column if not exists departure_time text not null default 'either'
    check (departure_time in ('morning', 'night', 'either'));

-- `age` is no longer written by the app. Keep existing data, just drop the column
-- once you've confirmed nothing else depends on it:
alter table public.trips drop column if exists age;
