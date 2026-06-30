-- =====================================================
-- Profit Clients Web App - No Login Shared Sync Setup
-- Run this once in Supabase SQL Editor
-- This creates one shared cloud row for your app.
-- WARNING: anyone with your website link can read/write this shared row.
-- Use this only for a private personal link.
-- =====================================================

create table if not exists public.shared_app_state (
  id text primary key default 'main',
  settings_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.shared_app_state enable row level security;

drop policy if exists "Public can read shared app state" on public.shared_app_state;
create policy "Public can read shared app state"
on public.shared_app_state
for select
to anon, authenticated
using (id = 'main');

drop policy if exists "Public can insert shared app state" on public.shared_app_state;
create policy "Public can insert shared app state"
on public.shared_app_state
for insert
to anon, authenticated
with check (id = 'main');

drop policy if exists "Public can update shared app state" on public.shared_app_state;
create policy "Public can update shared app state"
on public.shared_app_state
for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

insert into public.shared_app_state (id, settings_json, updated_at)
values ('main', '{}'::jsonb, now())
on conflict (id) do nothing;
