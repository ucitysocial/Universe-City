-- Universe City. Initial schema.
--
-- Two rules the shape of this file exists to enforce.
--   A correction revises a record and keeps what was believed before it.
--   Nothing the AI interprets reaches the file until it is approved.
--
-- Everything a member owns is protected by row level security at the
-- database, not in the query. An agent reads through a policy, not a bypass.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums
create type uc_role         as enum ('member','agent');
create type uc_block_status as enum ('observed','required','planned','suggested','estimated');
create type uc_paid         as enum ('paid','unpaid','none');
create type uc_source       as enum ('member','agent','ai');
create type uc_standard      as enum ('active','paused','retired');
create type uc_proposal      as enum ('proposed','confirmed','rejected','superseded');
create type uc_review        as enum ('scheduled','open','closed','missed');
create type uc_membership    as enum ('none','active','past_due','canceled');

-- ---------------------------------------------------------------- people
create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  case_no       text unique not null default 'UC-0000',   -- replaced by a sequence in 0002
  name          text,
  email         text,
  city          text,
  role          uc_role not null default 'member',
  membership    uc_membership not null default 'none',
  represented_since date,
  created_at    timestamptz not null default now()
);

create table subscriptions (
  user_id                uuid primary key references profiles on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text,
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

-- ---------------------------------------------------------------- I. Time
-- A block is one record of time. Times are stored as local wall clock,
-- because a schedule is lived locally. An end past 24:00 crosses midnight.
create table blocks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles on delete cascade,
  date        date not null,
  starts_at   text not null,                 -- 'HH:MM'
  ends_at     text,                          -- 'HH:MM', may exceed 24:00
  label       text not null,
  kind        text not null,                 -- one of the twelve kinds of time
  status      uc_block_status not null default 'estimated',
  paid        uc_paid not null default 'none',
  cost_of     uuid references blocks(id) on delete cascade,
  source      uc_source not null default 'member',
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index blocks_user_date on blocks (user_id, date);
create index blocks_cost_of on blocks (cost_of);

-- The canonical history of a correction. "I actually left at 10:45" revises
-- the Thursday block and keeps what was believed before it, and why.
create table block_revisions (
  id          uuid primary key default gen_random_uuid(),
  block_id    uuid not null references blocks on delete cascade,
  user_id     uuid not null references profiles on delete cascade,
  before      jsonb not null,
  after       jsonb not null,
  reason      text,
  changed_by  uuid references profiles,
  origin      uc_source not null default 'member',
  at          timestamptz not null default now()
);
create index block_revisions_block on block_revisions (block_id, at desc);

-- ---------------------------------------------------------------- IV. Standards
create table standards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles on delete cascade,
  wording       text not null,               -- their exact words
  state         uc_standard not null default 'active',
  applies_to    text,                        -- folder name, when useful
  exceptions    text,
  amended_from  uuid references standards(id),
  created_at    timestamptz not null default now(),
  retired_at    timestamptz
);
create index standards_user on standards (user_id, state);

-- ---------------------------------------------------------------- II. Inventory
create type uc_stock as enum ('have','low','need','purchased');
create table inventory_items (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  item            text not null,
  category        text,
  state           uc_stock not null default 'have',
  qty             numeric,
  usual_qty       numeric,
  cost            numeric,
  last_purchased  date,
  est_replacement date,
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------- III. Salary
-- One row per member. Honest about what is not established yet.
create table salary (
  user_id          uuid primary key references profiles on delete cascade,
  listed_rate      numeric,
  pay_cadence      text,
  current_income   numeric,
  cost_of_life     numeric,
  required_income  numeric,
  desired_income   numeric,
  established      boolean not null default false,
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------- the record at large
-- Anything a member said that belongs to a folder. All 48 stay in the
-- taxonomy even while only four are operational.
create table entries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles on delete cascade,
  folder         text not null,
  note           text not null,
  said_verbatim  text,
  source         uc_source not null default 'member',
  established_at timestamptz not null default now()
);
create index entries_user_folder on entries (user_id, folder);

-- Things the member raised. Surfaced in the brief, never interpreted into fact.
create table statements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles on delete cascade,
  said        text not null,
  channel     text not null default 'thread',   -- thread, inbox, meeting
  folder      text,
  resolved_at timestamptz,
  at          timestamptz not null default now()
);

-- ---------------------------------------------------------------- proposals
-- The gate between interpretation and the file. Nothing skips it.
create table proposals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles on delete cascade,
  kind          text not null,              -- block.create, block.revise, standard.create, ...
  target_table  text,
  target_id     uuid,
  payload       jsonb not null,
  reason        text,
  origin        uc_source not null default 'ai',
  state         uc_proposal not null default 'proposed',
  decided_by    uuid references profiles,
  decided_at    timestamptz,
  review_id     uuid,
  created_at    timestamptz not null default now()
);
create index proposals_open on proposals (user_id, state, created_at desc);

-- ---------------------------------------------------------------- reviews
-- A review is a meeting, not a calendar week. One a week is the cadence,
-- not the constraint, so an extra meeting is always possible.
create table reviews (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles on delete cascade,
  agent_id            uuid references profiles,
  scheduled_for       timestamptz,
  status              uc_review not null default 'scheduled',
  period_start        date not null,
  period_end          date not null,
  brief               jsonb,                -- cached, always regenerable
  brief_generated_at  timestamptz,
  transcript_ref      text,
  agent_notes         text,
  decisions           jsonb,
  unresolved          jsonb,
  next_concentration  text,
  summary             jsonb,                -- confirmed, changed, decided, unresolved, next
  approved_at         timestamptz,
  created_at          timestamptz not null default now()
);
create index reviews_user on reviews (user_id, period_end desc);

alter table proposals
  add constraint proposals_review_fk foreign key (review_id) references reviews(id) on delete set null;

-- ---------------------------------------------------------------- row level security
alter table profiles        enable row level security;
alter table subscriptions   enable row level security;
alter table blocks          enable row level security;
alter table block_revisions enable row level security;
alter table standards       enable row level security;
alter table inventory_items enable row level security;
alter table salary          enable row level security;
alter table entries         enable row level security;
alter table statements      enable row level security;
alter table proposals       enable row level security;
alter table reviews         enable row level security;

create or replace function uc_is_agent() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'agent');
$$;

create policy profiles_self on profiles
  for select using (id = auth.uid() or uc_is_agent());
create policy profiles_update_self on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_insert_self on profiles
  for insert with check (id = auth.uid());

-- every member owned table reads the same way
do $$
declare t text;
begin
  foreach t in array array['subscriptions','blocks','block_revisions','standards',
                           'inventory_items','salary','entries','statements','proposals','reviews']
  loop
    execute format($f$
      create policy %1$s_owner_select on %1$s for select
        using (user_id = auth.uid() or uc_is_agent());
      create policy %1$s_owner_write on %1$s for insert
        with check (user_id = auth.uid() or uc_is_agent());
      create policy %1$s_owner_update on %1$s for update
        using (user_id = auth.uid() or uc_is_agent())
        with check (user_id = auth.uid() or uc_is_agent());
      create policy %1$s_owner_delete on %1$s for delete
        using (user_id = auth.uid() or uc_is_agent());
    $f$, t);
  end loop;
end $$;

-- ---------------------------------------------------------------- a profile on sign up
create or replace function uc_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', null));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function uc_handle_new_user();

-- ---------------------------------------------------------------- a correction writes its own history
create or replace function uc_block_revision() returns trigger
language plpgsql as $$
begin
  if to_jsonb(old) is distinct from to_jsonb(new) then
    insert into block_revisions (block_id, user_id, before, after, changed_by, origin)
    values (old.id, old.user_id, to_jsonb(old), to_jsonb(new), auth.uid(), new.source);
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger blocks_revise before update on blocks
  for each row execute function uc_block_revision();
