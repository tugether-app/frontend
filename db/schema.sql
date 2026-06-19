-- Supabase schema for Tugether. Metadata only, non-custodial: value + lock
-- rules live on-chain (GoalVault), never here. Mirrors docs/SCHEMA.md.
-- To go live, run this in Supabase and replace lib/store.ts with queries.

create table if not exists goals (
  id               uuid primary key default gen_random_uuid(),
  join_slug        text unique not null,
  name             text not null,
  target_display   text not null,
  target_amount    numeric not null,
  collected_amount numeric not null default 0,  -- mirror of on-chain balance
  status           text not null default 'open', -- open | reached | closed
  vault_addr       text,
  creator_addr     text,
  created_at       timestamptz not null default now(),
  reached_at       timestamptz
);

create table if not exists members (
  id              uuid primary key default gen_random_uuid(),
  goal_id         uuid not null references goals(id) on delete cascade,
  member_addr     text not null,                 -- UA address (7702)
  display_name    text,
  avatar_seed     text,
  total_deposited numeric not null default 0,
  joined_at       timestamptz not null default now(),
  unique (goal_id, member_addr)
);

create index if not exists members_goal_id_idx on members(goal_id);
