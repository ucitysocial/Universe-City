-- Founder test. NOT a migration. This file does not belong in supabase/migrations.
--
-- It builds one separate schema, uc_pilot, that holds the founder test of the
-- conversation, its memory, and its Time entries. It changes no table in public
-- and no table in auth. The whole test is removed with:
--
--   drop schema uc_pilot cascade;
--   drop role uc_pilot_server;
--   drop role uc_pilot_resident;
--
-- How access works
--   The website's public key reaches the schemas listed in the API settings.
--   uc_pilot is not one of them, and anon and authenticated hold no grant here.
--   The test server logs in as uc_pilot_server. That role holds no privilege of
--   its own. Inside each transaction it becomes uc_pilot_resident and states
--   which resident it is working for. Row level security then limits every
--   statement in that transaction to that one resident's rows.
--
--   uc.user_id     the resident, set by the server from the verified login
--   uc.actor       who is writing: resident, software, or agent
--   uc.message_id  the resident message the write rests on
--   uc.turn_id     the reply in progress
--   uc.reason      why an entry changed, kept with its history

create schema if not exists uc_pilot;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'uc_pilot_resident') then
    create role uc_pilot_resident nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'uc_pilot_server') then
    create role uc_pilot_server login noinherit;   -- the password is set outside this file
  end if;
end $$;

grant uc_pilot_resident to uc_pilot_server;
revoke all on schema uc_pilot from public;
grant usage on schema uc_pilot to uc_pilot_resident;

-- ---------------------------------------------------------------- context

create or replace function uc_pilot.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('uc.user_id', true), '')::uuid
$$;

create or replace function uc_pilot.actor() returns text
language sql stable as $$
  select case nullif(current_setting('uc.actor', true), '')
           when 'software' then 'software'
           when 'agent'    then 'agent'
           else 'resident' end
$$;

create or replace function uc_pilot.msg() returns uuid
language sql stable as $$
  select nullif(current_setting('uc.message_id', true), '')::uuid
$$;

create or replace function uc_pilot.turn() returns uuid
language sql stable as $$
  select nullif(current_setting('uc.turn_id', true), '')::uuid
$$;

-- ---------------------------------------------------------------- who may use the test

create table if not exists uc_pilot.access (
  user_id        uuid primary key,
  label          text not null,
  synthetic      boolean not null default false,          -- a made up resident used for testing
  timezone       text not null default 'America/Denver',
  display_name   text,
  notice_seen_at timestamptz,
  decides_proposals boolean not null default false,       -- the person who decides proposals in this test
  added_at       timestamptz not null default now()
);

create or replace function uc_pilot.allowed() returns boolean
language sql stable security definer set search_path = uc_pilot, pg_temp as $$
  select exists (select 1 from uc_pilot.access a where a.user_id = uc_pilot.uid())
$$;

-- ---------------------------------------------------------------- the conversation

create table if not exists uc_pilot.sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default uc_pilot.uid(),
  started_at timestamptz not null default now(),
  last_at    timestamptz not null default now()
);

create table if not exists uc_pilot.messages (
  id          uuid primary key default gen_random_uuid(),
  seq         bigint generated always as identity,
  user_id     uuid not null default uc_pilot.uid(),
  session_id  uuid not null references uc_pilot.sessions(id),
  speaker     text not null default 'resident' check (speaker in ('resident','software','agent')),
  body        text not null check (length(body) between 1 and 8000),
  request_key uuid,                                   -- from the browser. A resend is the same message
  reply_to    uuid references uc_pilot.messages(id),  -- a software reply answers one resident message
  removed     text[],                                 -- kinds of number taken out before the message was kept
  created_at  timestamptz not null default now(),
  search      tsvector generated always as (to_tsvector('english', body)) stored,
  unique (user_id, request_key)
);
create unique index if not exists messages_one_reply on uc_pilot.messages (reply_to) where reply_to is not null;
create index if not exists messages_user_seq on uc_pilot.messages (user_id, seq desc);
create index if not exists messages_search on uc_pilot.messages using gin (search);

create table if not exists uc_pilot.turns (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default uc_pilot.uid(),
  message_id         uuid not null unique references uc_pilot.messages(id),
  state              text not null default 'running' check (state in ('running','done','failed')),
  started_at         timestamptz not null default now(),
  finished_at        timestamptz,
  error              text,
  model              text,
  prompt_version     text,
  steps              int not null default 0,
  input_tokens       int not null default 0,
  output_tokens      int not null default 0,
  cache_read_tokens  int not null default 0,
  cache_write_tokens int not null default 0,
  cost_micro         bigint not null default 0,       -- millionths of a United States dollar
  transcript         jsonb not null default '[]'::jsonb,  -- what the model asked for and what the server answered, so an interrupted reply continues where it stopped
  reply_id           uuid references uc_pilot.messages(id)
);
create index if not exists turns_user_day on uc_pilot.turns (user_id, started_at desc);

-- ---------------------------------------------------------------- the File: what the resident said

create table if not exists uc_pilot.statements (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default uc_pilot.uid(),
  said                text not null check (length(said) between 1 and 1000),   -- the resident's own words
  topic               text not null check (length(topic) between 1 and 80),    -- a label for finding the entry
  folder              text not null,
  about_date          date,
  state               text not null default 'current' check (state in ('current','superseded','withdrawn')),
  supersedes          uuid references uc_pilot.statements(id),
  source_message_id   uuid references uc_pilot.messages(id),
  basis               text not null check (basis in ('resident_statement','resident_confirmation','agent_decision')),
  filed_by            text not null default 'resident',
  created_at          timestamptz not null default now(),
  ended_at            timestamptz,
  ended_by_message_id uuid references uc_pilot.messages(id),
  search              tsvector generated always as (to_tsvector('english', said || ' ' || topic || ' ' || folder)) stored
);
create index if not exists statements_user on uc_pilot.statements (user_id, state, created_at desc);
create index if not exists statements_search on uc_pilot.statements using gin (search);

-- ---------------------------------------------------------------- the File: Time

-- The recurring week. One row is one thing that repeats on named days.
create table if not exists uc_pilot.schedule_items (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default uc_pilot.uid(),
  label               text not null check (length(label) between 1 and 120),
  days                smallint[] not null check (days <@ array[0,1,2,3,4,5,6]::smallint[] and cardinality(days) between 1 and 7),  -- 0 is Sunday
  start_min           int check (start_min between 0 and 1439),     -- minutes after midnight, local. NULL is not established
  end_min             int check (end_min between 1 and 2880),       -- past 1440 crosses midnight and belongs to the day it started
  state               text not null default 'current' check (state in ('current','ended')),
  folder              text,                          -- the folder of the forty eight the activity belongs to. NULL is not set
  said                text,
  source_message_id   uuid references uc_pilot.messages(id),
  basis               text not null check (basis in ('resident_statement','resident_confirmation','agent_decision')),
  filed_by            text not null default 'resident',
  created_at          timestamptz not null default now(),
  ended_at            timestamptz,
  ended_by_message_id uuid references uc_pilot.messages(id),
  check (end_min is null or start_min is null or end_min > start_min)
);

-- A Plan is the list of commitments for one day. The resident confirms it.
create table if not exists uc_pilot.plans (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default uc_pilot.uid(),
  plan_date            date not null,
  state                text not null default 'draft' check (state in ('draft','confirmed')),
  confirmed_at         timestamptz,
  confirmed_via        text check (confirmed_via in ('conversation','screen')),
  confirmed_message_id uuid references uc_pilot.messages(id),
  confirmed_items      jsonb,                         -- the list as it read when the resident confirmed it
  realism              text,                          -- how realistic the resident said it feels. NULL is not asked
  source_message_id    uuid references uc_pilot.messages(id),
  filed_by             text not null default 'resident',
  created_at           timestamptz not null default now(),
  unique (user_id, plan_date),
  check ((state = 'confirmed') = (confirmed_at is not null))
);

create table if not exists uc_pilot.commitments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default uc_pilot.uid(),
  label                text not null check (length(label) between 1 and 120),
  on_date              date not null,
  start_min            int check (start_min between 0 and 1439),
  end_min              int check (end_min between 1 and 2880),
  completion           text,                          -- what counts as done, in the resident's words. NULL is not established
  folder               text,                          -- the folder of the forty eight the activity belongs to. NULL is not set
  schedule_item_id     uuid references uc_pilot.schedule_items(id),
  execution            text not null default 'planned' check (execution in ('planned','executed','partly_executed','did_not_happen')),
  actual_start_min     int check (actual_start_min between 0 and 1439),
  actual_end_min       int check (actual_end_min between 1 and 2880),
  timing               text check (timing in ('as_planned','changed')),      -- NULL is not established
  time_is_estimate     boolean not null default false,                        -- the resident gave the time as a rough one
  outcome_said         text,
  outcome_message_id   uuid references uc_pilot.messages(id),
  outcome_at           timestamptz,
  withdrawn_at         timestamptz,                   -- taken off before any outcome. It is a change. It is no outcome
  withdrawn_said       text,
  withdrawn_message_id uuid references uc_pilot.messages(id),
  said                 text,
  source_message_id    uuid references uc_pilot.messages(id),
  basis                text not null check (basis in ('resident_statement','resident_confirmation','agent_decision','schedule')),
  filed_by             text not null default 'resident',
  created_at           timestamptz not null default now(),
  unique (user_id, schedule_item_id, on_date),
  check (end_min is null or start_min is null or end_min > start_min),
  check (execution = 'planned' or outcome_message_id is not null),           -- an outcome rests on a resident message
  check (withdrawn_at is null or execution = 'planned')                      -- a withdrawn commitment takes no outcome
);
create index if not exists commitments_user_date on uc_pilot.commitments (user_id, on_date);
-- An entry in Time also belongs to one folder. The calendar colors it by the department of that folder.
alter table uc_pilot.schedule_items add column if not exists folder text;
alter table uc_pilot.commitments    add column if not exists folder text;
-- A note on a commitment is a statement that names the commitment it is about.
alter table uc_pilot.statements     add column if not exists commitment_id uuid references uc_pilot.commitments(id);
create index if not exists statements_commitment on uc_pilot.statements (commitment_id) where commitment_id is not null;
-- How a statement reads in the File: one short sentence the agent writes from the resident's words. The words
-- themselves stay in said, so each entry still shows what it rests on.
alter table uc_pilot.statements     add column if not exists entry text check (entry is null or length(entry) between 1 and 200);

-- ---------------------------------------------------------------- waiting for a decision

-- decider = resident: software prepared it and the resident decides.
-- decider = agent:    it required interpretation. It is a proposal and a person decides. Software never does.
create table if not exists uc_pilot.pending (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default uc_pilot.uid(),
  decider            text not null check (decider in ('resident','agent')),
  kind               text not null,
  summary            text not null check (length(summary) between 1 and 600),
  payload            jsonb not null default '{}'::jsonb,
  rests_on           text,
  state              text not null default 'open' check (state in ('open','confirmed','declined','withdrawn')),
  source_message_id  uuid references uc_pilot.messages(id),
  created_by         text not null default 'software',
  created_at         timestamptz not null default now(),
  decided_at         timestamptz,
  decided_via        text check (decided_via in ('conversation','screen','desk')),
  decided_message_id uuid references uc_pilot.messages(id),
  decided_actor      text,
  result             jsonb,
  check ((state = 'open') = (decided_at is null))
);
create index if not exists pending_user_state on uc_pilot.pending (user_id, state, created_at desc);

create table if not exists uc_pilot.follow_ups (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default uc_pilot.uid(),
  owner             text not null check (owner in ('resident','agent','software')),
  kind              text not null check (kind in ('information','decision','permission','action','person')),
  what              text not null check (length(what) between 1 and 400),
  due_on            date,
  state             text not null default 'open' check (state in ('open','done','dropped')),
  source_message_id uuid references uc_pilot.messages(id),
  created_by        text not null default 'software',
  created_at        timestamptz not null default now(),
  closed_at         timestamptz,
  closed_said       text,
  closed_message_id uuid references uc_pilot.messages(id),
  closed_by         text,
  check ((state = 'open') = (closed_at is null))
);

-- A piece of work the resident asked for help with, in the resident's own words. It stays open across messages
-- and days, so the guide keeps the purpose of the conversation and the resident never has to state it twice.
-- docs/systems/TIME.md 3.5 names this ongoing work.
create table if not exists uc_pilot.work (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default uc_pilot.uid(),
  label             text not null check (length(label) between 1 and 120),   -- a short name for finding it
  said              text not null check (length(said) between 1 and 1000),   -- the resident's own words
  folder            text not null default 'General',
  state             text not null default 'open' check (state in ('open','done','dropped')),
  source_message_id uuid references uc_pilot.messages(id),
  created_by        text not null default 'software',
  created_at        timestamptz not null default now(),
  closed_at         timestamptz,
  closed_said       text,
  closed_message_id uuid references uc_pilot.messages(id),
  closed_by         text,
  check ((state = 'open') = (closed_at is null))
);
create index if not exists work_user_state on uc_pilot.work (user_id, state, created_at desc);

-- ---------------------------------------------------------------- what software did, and what changed

create table if not exists uc_pilot.actions (
  id         uuid primary key default gen_random_uuid(),
  seq        bigint generated always as identity,
  user_id    uuid not null default uc_pilot.uid(),
  turn_id    uuid references uc_pilot.turns(id),
  message_id uuid references uc_pilot.messages(id),
  tool       text not null,
  args       jsonb not null default '{}'::jsonb,
  outcome    text not null check (outcome in ('filed','unchanged','prepared','proposed','refused','failed','read','decided')),
  detail     text,                                   -- the full account: the words it rests on, and what the entry said before
  brief      text,                                   -- one short line for the conversation
  target     text,
  target_id  uuid,
  idem_key   text not null,
  actor      text not null default 'software',
  at         timestamptz not null default now(),
  unique (user_id, idem_key)
);
create index if not exists actions_user_seq on uc_pilot.actions (user_id, seq desc);
alter table uc_pilot.actions add column if not exists brief text;

create table if not exists uc_pilot.revisions (
  id         uuid primary key default gen_random_uuid(),
  seq        bigint generated always as identity,
  user_id    uuid not null,
  table_name text not null,
  row_id     uuid not null,
  before     jsonb not null,
  after      jsonb not null,
  changed    text[] not null,
  actor      text not null,
  message_id uuid,
  reason     text,
  at         timestamptz not null default now()
);
create index if not exists revisions_row on uc_pilot.revisions (table_name, row_id, seq);

-- ---------------------------------------------------------------- rules the database keeps

-- Who wrote a row comes from the server's verified context. It never comes from the row that was sent.
create or replace function uc_pilot.stamp() returns trigger
language plpgsql as $$
begin
  if uc_pilot.uid() is null then
    raise exception 'No resident is set for this write.';
  end if;
  new.user_id := uc_pilot.uid();
  if tg_table_name = 'messages' then
    new.speaker := uc_pilot.actor();
    new.created_at := now();
  elsif tg_table_name in ('statements','schedule_items','commitments','plans') then
    new.filed_by := uc_pilot.actor();
    if new.source_message_id is null then new.source_message_id := uc_pilot.msg(); end if;
  elsif tg_table_name in ('pending','follow_ups','work') then
    new.created_by := uc_pilot.actor();
    if new.source_message_id is null then new.source_message_id := uc_pilot.msg(); end if;
  elsif tg_table_name = 'actions' then
    new.actor := uc_pilot.actor();
    new.at := now();
  end if;
  return new;
end $$;

-- An entry that rests on what the resident said points at a message the resident wrote.
create or replace function uc_pilot.rests_on_resident() returns trigger
language plpgsql as $$
declare
  who text;
begin
  if new.basis = 'agent_decision' and uc_pilot.actor() <> 'agent' then
    raise exception 'An entry that states an agent decision is filed by a person.';
  end if;
  if new.basis = 'resident_statement' then
    if new.source_message_id is null then
      raise exception 'An entry filed as the resident''s statement names the message that holds the words.';
    end if;
    select speaker into who from uc_pilot.messages where id = new.source_message_id;
    if who is distinct from 'resident' then
      raise exception 'An entry filed as the resident''s statement names a message the resident wrote.';
    end if;
  end if;
  return new;
end $$;

-- An outcome rests on a message the resident wrote. Software never supplies one.
create or replace function uc_pilot.outcome_guard() returns trigger
language plpgsql as $$
declare
  who text;
begin
  if new.execution <> 'planned' then
    select speaker into who from uc_pilot.messages where id = new.outcome_message_id;
    if who is distinct from 'resident' then
      raise exception 'An outcome names a message the resident wrote.';
    end if;
  end if;
  if tg_op = 'UPDATE' then
    if old.withdrawn_at is not null and new.execution <> 'planned' then
      raise exception 'A commitment that was taken off takes no outcome.';
    end if;
    if old.execution <> 'planned' and new.execution = 'planned' then
      raise exception 'An outcome on file is changed by a correction. It is never emptied.';
    end if;
  end if;
  return new;
end $$;

-- A change keeps what the entry said before. A database trigger writes it, so no code path skips it.
create or replace function uc_pilot.keep_revision() returns trigger
language plpgsql security definer set search_path = uc_pilot, pg_temp as $$
declare
  b jsonb := to_jsonb(old) - 'search';
  a jsonb := to_jsonb(new) - 'search';
  keys text[];
begin
  select coalesce(array_agg(k order by k), '{}') into keys
  from (select key as k from jsonb_each(a) where a -> key is distinct from b -> key) d;
  if cardinality(keys) = 0 then return new; end if;
  insert into uc_pilot.revisions (user_id, table_name, row_id, before, after, changed, actor, message_id, reason)
  values (old.user_id, tg_table_name, old.id, b, a, keys, uc_pilot.actor(), uc_pilot.msg(),
          nullif(current_setting('uc.reason', true), ''));
  return new;
end $$;

-- The owner of a row and its first source never change.
create or replace function uc_pilot.fixed_columns() returns trigger
language plpgsql as $$
begin
  if new.user_id is distinct from old.user_id then raise exception 'The owner of an entry never changes.'; end if;
  if new.created_at is distinct from old.created_at then raise exception 'The time an entry was filed never changes.'; end if;
  return new;
end $$;

-- A reference to a message, a statement, a weekly item, or a reply names a row of the same resident.
-- The function reads as the working role, so row level security hides every other resident's rows from it.
create or replace function uc_pilot.refs_guard() returns trigger
language plpgsql as $$
declare
  k text;
  v text;
begin
  for k, v in select key, value #>> '{}' from jsonb_each(to_jsonb(new) - 'search')
               where (key like '%message_id' or key = 'reply_to') and jsonb_typeof(value) = 'string' loop
    if not exists (select 1 from uc_pilot.messages m where m.id = v::uuid) then
      raise exception 'An entry names only a message in the same resident''s conversation.';
    end if;
  end loop;
  if tg_table_name = 'statements' then
    if new.supersedes is not null and not exists (select 1 from uc_pilot.statements x where x.id = new.supersedes) then
      raise exception 'A statement replaces only a statement of the same resident.';
    end if;
    if new.commitment_id is not null and not exists (select 1 from uc_pilot.commitments x where x.id = new.commitment_id) then
      raise exception 'A note is about a commitment of the same resident.';
    end if;
  elsif tg_table_name = 'commitments' then
    if new.schedule_item_id is not null and not exists (select 1 from uc_pilot.schedule_items x where x.id = new.schedule_item_id) then
      raise exception 'A commitment comes only from a weekly item of the same resident.';
    end if;
  elsif tg_table_name = 'actions' then
    if new.turn_id is not null and not exists (select 1 from uc_pilot.turns x where x.id = new.turn_id) then
      raise exception 'An action belongs only to a reply of the same resident.';
    end if;
  elsif tg_table_name = 'messages' then
    if not exists (select 1 from uc_pilot.sessions x where x.id = new.session_id) then
      raise exception 'A message belongs only to a session of the same resident.';
    end if;
  end if;
  return new;
end $$;

-- A waiting item is decided once. A proposal is decided by a person. Who decided comes from the server's context.
create or replace function uc_pilot.pending_guard() returns trigger
language plpgsql as $$
begin
  if old.state <> 'open' then
    raise exception 'A waiting item is decided once.';
  end if;
  if new.state <> 'open' then
    if old.decider = 'agent' and uc_pilot.actor() <> 'agent' then
      raise exception 'A proposal is decided by a person. Software and the resident do not decide it.';
    end if;
    new.decided_actor := uc_pilot.actor();
    new.decided_at := now();
  end if;
  return new;
end $$;

-- Who closed a follow up comes from the server's context. A follow up for the agent is finished by the agent.
create or replace function uc_pilot.follow_up_guard() returns trigger
language plpgsql as $$
begin
  if old.state <> 'open' then
    raise exception 'A follow up is closed once.';
  end if;
  if new.state <> 'open' then
    if old.owner = 'agent' and new.state = 'done' and uc_pilot.actor() <> 'agent' then
      raise exception 'A follow up that belongs to the agent is finished by the agent.';
    end if;
    new.closed_by := uc_pilot.actor();
    new.closed_at := now();
  end if;
  return new;
end $$;

-- Who closed a piece of work comes from the server's context. It is closed once.
create or replace function uc_pilot.work_guard() returns trigger
language plpgsql as $$
begin
  if old.state <> 'open' then
    raise exception 'A piece of work is closed once.';
  end if;
  if new.state <> 'open' then
    new.closed_by := uc_pilot.actor();
    new.closed_at := now();
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['sessions','turns','messages','statements','schedule_items','commitments','plans','pending','follow_ups','work','actions'] loop
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_10_stamp', t);
    execute format('create trigger %I before insert on uc_pilot.%I for each row execute function uc_pilot.stamp()', t || '_10_stamp', t);
  end loop;
  foreach t in array array['statements','schedule_items','commitments'] loop
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_20_rests', t);
    execute format('create trigger %I before insert on uc_pilot.%I for each row execute function uc_pilot.rests_on_resident()', t || '_20_rests', t);
  end loop;
  foreach t in array array['statements','schedule_items','commitments','plans','pending','follow_ups','work'] loop
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_10_fixed', t);
    execute format('create trigger %I before update on uc_pilot.%I for each row execute function uc_pilot.fixed_columns()', t || '_10_fixed', t);
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_90_revision', t);
    execute format('create trigger %I after update on uc_pilot.%I for each row execute function uc_pilot.keep_revision()', t || '_90_revision', t);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array['turns','messages','statements','schedule_items','commitments','plans','pending','follow_ups','work','actions'] loop
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_15_refs', t);
    execute format('create trigger %I before insert or update on uc_pilot.%I for each row execute function uc_pilot.refs_guard()', t || '_15_refs', t);
  end loop;
end $$;

drop trigger if exists pending_40_guard on uc_pilot.pending;
create trigger pending_40_guard before update on uc_pilot.pending
  for each row execute function uc_pilot.pending_guard();
drop trigger if exists follow_ups_40_guard on uc_pilot.follow_ups;
create trigger follow_ups_40_guard before update on uc_pilot.follow_ups
  for each row execute function uc_pilot.follow_up_guard();

drop trigger if exists work_40_guard on uc_pilot.work;
create trigger work_40_guard before update on uc_pilot.work
  for each row execute function uc_pilot.work_guard();

drop trigger if exists commitments_30_outcome on uc_pilot.commitments;
create trigger commitments_30_outcome before insert or update on uc_pilot.commitments
  for each row execute function uc_pilot.outcome_guard();

-- ---------------------------------------------------------------- privileges and row level security

do $$
declare t text;
begin
  foreach t in array array['access','sessions','messages','turns','statements','schedule_items','plans','commitments','pending','follow_ups','work','actions','revisions'] loop
    execute format('alter table uc_pilot.%I enable row level security', t);
    execute format('alter table uc_pilot.%I force row level security', t);
    execute format('revoke all on uc_pilot.%I from public', t);
    execute format('drop policy if exists own_rows on uc_pilot.%I', t);
    execute format('create policy own_rows on uc_pilot.%I for all to uc_pilot_resident using (user_id = uc_pilot.uid() and uc_pilot.allowed()) with check (user_id = uc_pilot.uid() and uc_pilot.allowed())', t);
  end loop;
end $$;

-- No delete is granted on any table. Messages, actions, and revisions take no update.
-- An update reaches only the columns named here. Who filed an entry, what it rests on, and who owns it never change.
grant select                 on uc_pilot.access         to uc_pilot_resident;
grant update (notice_seen_at, display_name, timezone) on uc_pilot.access to uc_pilot_resident;
grant select, insert         on uc_pilot.sessions       to uc_pilot_resident;
grant update (last_at)       on uc_pilot.sessions       to uc_pilot_resident;
grant select, insert         on uc_pilot.messages       to uc_pilot_resident;
grant select, insert         on uc_pilot.turns          to uc_pilot_resident;
grant update (state, started_at, finished_at, error, model, steps, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_micro, reply_id, transcript)
                             on uc_pilot.turns          to uc_pilot_resident;
grant select, insert         on uc_pilot.statements     to uc_pilot_resident;
grant update (state, ended_at, ended_by_message_id)
                             on uc_pilot.statements     to uc_pilot_resident;
grant select, insert         on uc_pilot.schedule_items to uc_pilot_resident;
grant update (label, days, start_min, end_min, said, state, ended_at, ended_by_message_id, folder)
                             on uc_pilot.schedule_items to uc_pilot_resident;
grant select, insert         on uc_pilot.plans          to uc_pilot_resident;
grant update (state, confirmed_at, confirmed_via, confirmed_message_id, confirmed_items, realism)
                             on uc_pilot.plans          to uc_pilot_resident;
grant select, insert         on uc_pilot.commitments    to uc_pilot_resident;
grant update (label, on_date, start_min, end_min, completion, schedule_item_id, execution, actual_start_min, actual_end_min, timing,
              time_is_estimate, outcome_said, outcome_message_id, outcome_at, withdrawn_at, withdrawn_said, withdrawn_message_id, folder)
                             on uc_pilot.commitments    to uc_pilot_resident;
grant select, insert         on uc_pilot.pending        to uc_pilot_resident;
grant update (summary, payload, state, decided_via, decided_message_id, result)
                             on uc_pilot.pending        to uc_pilot_resident;
grant select, insert         on uc_pilot.follow_ups     to uc_pilot_resident;
grant update (what, due_on, state, closed_said, closed_message_id)
                             on uc_pilot.follow_ups     to uc_pilot_resident;
grant select, insert         on uc_pilot.work           to uc_pilot_resident;
grant update (label, state, closed_said, closed_message_id)
                             on uc_pilot.work           to uc_pilot_resident;
grant select, insert         on uc_pilot.actions        to uc_pilot_resident;
grant select                 on uc_pilot.revisions      to uc_pilot_resident;

-- Each function looks names up in this schema and in the built in catalog alone, whatever the caller's search path holds.
do $$
declare f text;
begin
  foreach f in array array['uid','actor','msg','turn','stamp','rests_on_resident','outcome_guard','fixed_columns','refs_guard','pending_guard','follow_up_guard','work_guard'] loop
    execute format('alter function uc_pilot.%I() set search_path = uc_pilot, pg_temp', f);
  end loop;
end $$;

-- A function is open only to the working role, and only the ones it calls by name.
-- The trigger functions are run by the triggers. No role calls them, so no role can attach one to a table of its own.
revoke execute on all functions in schema uc_pilot from public;
revoke execute on all functions in schema uc_pilot from uc_pilot_resident;
grant execute on function uc_pilot.uid(), uc_pilot.actor(), uc_pilot.msg(), uc_pilot.turn(), uc_pilot.allowed() to uc_pilot_resident;

-- ---------------------------------------------------------------- steps

-- The founder set on October 13, 2026 that a routine and an entry hold steps the resident sees, edits, and checks off,
-- and that the steps are the same on every screen, in Guided Life, and for the agent. A list of steps belongs to one
-- routine, one weekly item, or one entry. A step can hold smaller steps. A suggestion of the agent that the resident
-- took out is kept as a dismissed step, so it is not suggested again. A step is checked on one day, with the time it
-- was done, so each day keeps its own progress.
create table if not exists uc_pilot.step_lists (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default uc_pilot.uid(),
  routine           text check (routine is null or routine in ('Morning routine','Night routine')),
  schedule_item_id  uuid references uc_pilot.schedule_items(id),
  commitment_id     uuid references uc_pilot.commitments(id),
  done_when         text check (done_when is null or length(done_when) between 1 and 400),
  filed_by          text not null default 'resident',
  source_message_id uuid references uc_pilot.messages(id),
  created_at        timestamptz not null default now(),
  check (num_nonnulls(routine, schedule_item_id, commitment_id) = 1)
);
create unique index if not exists step_lists_routine on uc_pilot.step_lists (user_id, routine) where routine is not null;
create unique index if not exists step_lists_weekly on uc_pilot.step_lists (user_id, schedule_item_id) where schedule_item_id is not null;
create unique index if not exists step_lists_entry on uc_pilot.step_lists (user_id, commitment_id) where commitment_id is not null;

create table if not exists uc_pilot.steps (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default uc_pilot.uid(),
  list_id           uuid not null references uc_pilot.step_lists(id),
  parent_id         uuid references uc_pilot.steps(id),
  position          int not null check (position between 1 and 400),
  label             text not null check (length(label) between 1 and 120),
  group_name        text check (group_name is null or length(group_name) between 1 and 60),
  origin            text check (origin is null or length(origin) between 1 and 120),
  state             text not null default 'current' check (state in ('current','removed','dismissed')),
  filed_by          text not null default 'resident',
  source_message_id uuid references uc_pilot.messages(id),
  created_at        timestamptz not null default now()
);
create index if not exists steps_list on uc_pilot.steps (user_id, list_id, state);

create table if not exists uc_pilot.step_marks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default uc_pilot.uid(),
  step_id     uuid not null references uc_pilot.steps(id),
  on_date     date not null,
  done        boolean not null default true,
  marked_at   timestamptz not null default now(),
  marked_by   text not null default 'resident',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, step_id, on_date)
);

-- Who filed a step and who checked it come from the server's verified context.
create or replace function uc_pilot.step_stamp() returns trigger
language plpgsql as $$
begin
  if uc_pilot.uid() is null then
    raise exception 'No resident is set for this write.';
  end if;
  if tg_op = 'INSERT' then
    new.user_id := uc_pilot.uid();
    new.created_at := now();
  end if;
  if tg_table_name = 'step_marks' then
    new.marked_by := uc_pilot.actor();
    new.updated_at := now();
  elsif tg_op = 'INSERT' then
    new.filed_by := uc_pilot.actor();
    if new.source_message_id is null then new.source_message_id := uc_pilot.msg(); end if;
  end if;
  return new;
end $$;

-- A list, a step, and a check name only rows of the same resident.
create or replace function uc_pilot.step_refs() returns trigger
language plpgsql as $$
begin
  if tg_table_name = 'step_lists' then
    if new.schedule_item_id is not null and not exists (select 1 from uc_pilot.schedule_items x where x.id = new.schedule_item_id) then
      raise exception 'A list of steps belongs only to a weekly item of the same resident.';
    end if;
    if new.commitment_id is not null and not exists (select 1 from uc_pilot.commitments x where x.id = new.commitment_id) then
      raise exception 'A list of steps belongs only to an entry of the same resident.';
    end if;
  elsif tg_table_name = 'steps' then
    if not exists (select 1 from uc_pilot.step_lists x where x.id = new.list_id) then
      raise exception 'A step belongs only to a list of the same resident.';
    end if;
    if new.parent_id is not null and not exists (select 1 from uc_pilot.steps x where x.id = new.parent_id and x.list_id = new.list_id) then
      raise exception 'A smaller step belongs only to a step of the same list.';
    end if;
  elsif tg_table_name = 'step_marks' then
    if not exists (select 1 from uc_pilot.steps x where x.id = new.step_id) then
      raise exception 'A check belongs only to a step of the same resident.';
    end if;
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['step_lists','steps','step_marks'] loop
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_10_stamp', t);
    execute format('create trigger %I before insert or update on uc_pilot.%I for each row execute function uc_pilot.step_stamp()', t || '_10_stamp', t);
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_11_fixed', t);
    execute format('create trigger %I before update on uc_pilot.%I for each row execute function uc_pilot.fixed_columns()', t || '_11_fixed', t);
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_15_refs', t);
    execute format('create trigger %I before insert or update on uc_pilot.%I for each row execute function uc_pilot.refs_guard()', t || '_15_refs', t);
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_16_steprefs', t);
    execute format('create trigger %I before insert or update on uc_pilot.%I for each row execute function uc_pilot.step_refs()', t || '_16_steprefs', t);
    execute format('drop trigger if exists %I on uc_pilot.%I', t || '_90_revision', t);
    execute format('create trigger %I after update on uc_pilot.%I for each row execute function uc_pilot.keep_revision()', t || '_90_revision', t);
    execute format('alter table uc_pilot.%I enable row level security', t);
    execute format('alter table uc_pilot.%I force row level security', t);
    execute format('revoke all on uc_pilot.%I from public', t);
    execute format('drop policy if exists own_rows on uc_pilot.%I', t);
    execute format('create policy own_rows on uc_pilot.%I for all to uc_pilot_resident using (user_id = uc_pilot.uid() and uc_pilot.allowed()) with check (user_id = uc_pilot.uid() and uc_pilot.allowed())', t);
  end loop;
end $$;

-- No delete is granted. A step taken out keeps its row with the state removed or dismissed.
grant select, insert on uc_pilot.step_lists to uc_pilot_resident;
grant update (done_when) on uc_pilot.step_lists to uc_pilot_resident;
grant select, insert on uc_pilot.steps to uc_pilot_resident;
grant update (parent_id, position, label, group_name, state) on uc_pilot.steps to uc_pilot_resident;
grant select, insert on uc_pilot.step_marks to uc_pilot_resident;
grant update (done, marked_at, marked_by, updated_at) on uc_pilot.step_marks to uc_pilot_resident;

alter function uc_pilot.step_stamp() set search_path = uc_pilot, pg_temp;
alter function uc_pilot.step_refs() set search_path = uc_pilot, pg_temp;
revoke execute on function uc_pilot.step_stamp() from public;
revoke execute on function uc_pilot.step_refs() from public;
revoke execute on function uc_pilot.step_stamp() from uc_pilot_resident;
revoke execute on function uc_pilot.step_refs() from uc_pilot_resident;

-- ---------------------------------------------------------------- clearing the test

-- Removes every row the test holds for the resident who asks. The login in auth stays.
-- This is a control for a test. It states no rule for a resident's File.
create or replace function uc_pilot.clear_my_test_data() returns jsonb
language plpgsql security definer set search_path = uc_pilot, pg_temp as $$
declare
  u uuid := uc_pilot.uid();
  n jsonb := '{}'::jsonb;
  c bigint;
  t text;
begin
  if u is null or not uc_pilot.allowed() then
    raise exception 'No resident is set.';
  end if;
  update uc_pilot.turns set reply_id = null where user_id = u;
  foreach t in array array['revisions','actions','work','follow_ups','pending','step_marks','steps','step_lists','commitments','plans','schedule_items','statements','turns','messages','sessions'] loop
    execute format('delete from uc_pilot.%I where user_id = $1', t) using u;
    get diagnostics c = row_count;
    n := n || jsonb_build_object(t, c);
  end loop;
  update uc_pilot.access set notice_seen_at = null where user_id = u;
  return n;
end $$;
revoke all on function uc_pilot.clear_my_test_data() from public;
grant execute on function uc_pilot.clear_my_test_data() to uc_pilot_resident;
