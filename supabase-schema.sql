-- ============================================================
-- Leafy Plant Tracker – Supabase Schema
-- Run this in your Supabase project → SQL Editor → New Query
-- ============================================================

-- Plants table: stores each plant in the household
create table if not exists plants (
  id          uuid default gen_random_uuid() primary key,
  template_id text not null,           -- matches PlantTemplate.id in lib/plants.ts
  name        text not null,           -- display name (can be customised)
  emoji       text not null,
  added_at    timestamptz default now(),
  archived    boolean default false,   -- soft delete
  notes       text                     -- free-form notes per plant
);

-- Care logs table: every time someone waters, repots, etc.
create table if not exists care_logs (
  id          uuid default gen_random_uuid() primary key,
  plant_id    uuid references plants(id) on delete cascade,
  task_type   text not null,           -- 'water' | 'repot' | 'fertilise' | 'mist' | 'wipe_leaves' | 'check'
  done_at     timestamptz default now(),
  done_by     text,                    -- optional name of who did it
  notes       text
);

-- Push subscriptions table: stores Web Push subscriber endpoints per browser
create table if not exists push_subscriptions (
  id          uuid default gen_random_uuid() primary key,
  endpoint    text unique not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz default now(),
  label       text                     -- e.g. "Kai's iPhone"
);

-- Indexes for common queries
create index if not exists care_logs_plant_id_idx on care_logs(plant_id);
create index if not exists care_logs_task_type_idx on care_logs(plant_id, task_type);
create index if not exists care_logs_done_at_idx on care_logs(done_at desc);

-- Enable Row Level Security but keep open (no auth required per spec)
alter table plants enable row level security;
alter table care_logs enable row level security;
alter table push_subscriptions enable row level security;

-- Open policies (anyone with the URL can read/write — no login required)
create policy "public read plants"  on plants  for select using (true);
create policy "public write plants" on plants  for all    using (true) with check (true);

create policy "public read logs"    on care_logs  for select using (true);
create policy "public write logs"   on care_logs  for all    using (true) with check (true);

create policy "public read subs"    on push_subscriptions for select using (true);
create policy "public write subs"   on push_subscriptions for all    using (true) with check (true);
