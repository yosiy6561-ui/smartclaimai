-- ═══════════════════════════════════════════════════════════════════
-- ClaimSmart AI — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Users (mirrors Clerk users, synced via webhook) ──────────────
create table if not exists public.users (
  id            text primary key,           -- Clerk user ID
  email         text unique not null,
  name          text,
  plan          text default 'starter',     -- starter | professional | business
  stripe_customer_id text,
  stripe_subscription_id text,
  analyses_used int default 0,
  analyses_limit int default 5,            -- 5 for starter, unlimited = -1
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── Cases ────────────────────────────────────────────────────────
create table if not exists public.cases (
  id            uuid primary key default uuid_generate_v4(),
  user_id       text references public.users(id) on delete cascade,
  title         text not null default 'Untitled Case',
  claim_type    text not null,
  story         text not null,
  jurisdiction  text default 'United States',
  amount        text,
  language      text default 'English',
  score         numeric(3,1),
  recommended   text,
  result        jsonb,                      -- full AI result object
  status        text default 'complete',   -- draft | processing | complete | error
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── Case files (evidence uploads) ───────────────────────────────
create table if not exists public.case_files (
  id            uuid primary key default uuid_generate_v4(),
  case_id       uuid references public.cases(id) on delete cascade,
  user_id       text references public.users(id) on delete cascade,
  filename      text not null,
  storage_path  text not null,             -- Supabase Storage path
  size_bytes    int,
  mime_type     text,
  created_at    timestamptz default now()
);

-- ─── Chat messages (per case) ─────────────────────────────────────
create table if not exists public.chat_messages (
  id            uuid primary key default uuid_generate_v4(),
  case_id       uuid references public.cases(id) on delete cascade,
  user_id       text references public.users(id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  created_at    timestamptz default now()
);

-- ─── Billing events ───────────────────────────────────────────────
create table if not exists public.billing_events (
  id            uuid primary key default uuid_generate_v4(),
  user_id       text references public.users(id) on delete set null,
  stripe_event_id text unique,
  event_type    text not null,             -- checkout.completed, invoice.paid, etc
  amount_cents  int,
  currency      text default 'usd',
  plan          text,
  created_at    timestamptz default now()
);

-- ─── Waitlist (for pre-launch) ────────────────────────────────────
create table if not exists public.waitlist (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  name          text,
  use_case      text,
  created_at    timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — critical for user data isolation
-- ═══════════════════════════════════════════════════════════════════

alter table public.users enable row level security;
alter table public.cases enable row level security;
alter table public.case_files enable row level security;
alter table public.chat_messages enable row level security;

-- Users can only read/update their own profile
create policy "users: own row only"
  on public.users for all
  using (id = auth.uid()::text);

-- Cases: users see only their own
create policy "cases: own only"
  on public.cases for all
  using (user_id = auth.uid()::text);

-- Files: users see only their own
create policy "files: own only"
  on public.case_files for all
  using (user_id = auth.uid()::text);

-- Chat: users see only their own
create policy "chat: own only"
  on public.chat_messages for all
  using (user_id = auth.uid()::text);

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES — for performance
-- ═══════════════════════════════════════════════════════════════════

create index if not exists cases_user_id_idx on public.cases(user_id);
create index if not exists cases_created_at_idx on public.cases(created_at desc);
create index if not exists chat_case_id_idx on public.chat_messages(case_id);
create index if not exists files_case_id_idx on public.case_files(case_id);

-- ═══════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cases_updated_at before update on public.cases
  for each row execute function public.handle_updated_at();

create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════
-- Run separately in Supabase Storage dashboard:
-- 1. Create bucket: "case-files" (private)
-- 2. Create bucket: "pdf-exports" (private)

-- Storage policy: users can only access their own files
-- (configure in Supabase Storage → Policies)
