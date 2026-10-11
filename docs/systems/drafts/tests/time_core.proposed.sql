-- TECHNICAL PROPOSAL. Folder 01 Time Operations, Appendix A.
-- Not approved. Not applied to the Universe City database.
-- Written to run after migrations 0001 to 0004.
-- Part 1 is a candidate for two shared requirements. ARCHITECTURE.md decides both.
-- Parts 2 to 10 are the Time tables and the rules the database holds for them.
-- Five fields carry a recommendation that is still open, so that the whole could be tested:
-- withdrawn_at, planned_minutes, went_as_planned, schedule_on_file_at, controlled_minutes_target.

begin;

-- ================================================================
-- 1. CANDIDATE FOR SHARED REQUIREMENT SR-2. Revision history for
--    every File table. Follows the block_revisions pattern.
-- ================================================================
create table file_revisions (
  id            uuid primary key default gen_random_uuid(),
  table_name    text not null,
  row_id        uuid not null,
  user_id       uuid not null references profiles on delete cascade,
  before        jsonb not null,
  after         jsonb not null,
  changed_by    uuid references profiles,
  origin        uc_source not null,
  reason        text,                 -- why the change was made, in words
  basis         text,                 -- resident_decision | standing_permission | agreed_alternative | recurrence | correction
  basis_ref     uuid,                 -- the permission or the alternative
  statement_id  uuid references statements(id),
  session_id    uuid,                 -- the session the change was made in. SR-4
  actor         text,                 -- which software wrote it: guide, scheduler, or intake. NULL for a person
  at            timestamptz not null default now()
);
create index file_revisions_row on file_revisions (table_name, row_id, at desc);
create index file_revisions_user_at on file_revisions (user_id, at desc);
create index file_revisions_session on file_revisions (session_id) where session_id is not null;

alter table file_revisions enable row level security;
create policy file_revisions_read on file_revisions
  for select using (user_id = auth.uid() or uc_is_agent());
-- no insert, update or delete policy. The trigger is the only writer.

create trigger file_revisions_immutable before update or delete on file_revisions
  for each row execute function uc_revisions_immutable();

-- The caller states why. Each value is read from a setting that lasts one transaction.
create or replace function uc_setting(k text) returns text
language sql stable as $$ select nullif(current_setting(k, true), '') $$;

create or replace function uc_file_revision() returns trigger
language plpgsql security definer set search_path = public as $$
declare actor uuid := auth.uid();
declare who uc_source;
declare o jsonb := to_jsonb(old);
declare n jsonb;
begin
  new.updated_at := old.updated_at;
  n := to_jsonb(new);
  if o is distinct from n then
    if actor is null then who := 'ai';
    elsif uc_is_agent() then who := 'agent';
    else who := 'resident';
    end if;
    insert into public.file_revisions
      (table_name, row_id, user_id, before, after, changed_by, origin,
       reason, basis, basis_ref, statement_id, session_id, actor)
    values
      (tg_table_name, coalesce(o->>'id', o->>'user_id')::uuid, (o->>'user_id')::uuid, o, n, actor, who,
       uc_setting('uc.reason'), uc_setting('uc.basis'), uc_setting('uc.basis_ref')::uuid,
       uc_setting('uc.statement_id')::uuid, uc_setting('uc.session_id')::uuid,
       case when actor is null then uc_setting('uc.actor') end);
  end if;
  new.updated_at := now();
  return new;
end $$;

-- CANDIDATE FOR SHARED REQUIREMENT SR-16. Who wrote a row is set from the actor, for every writer.
-- The built uc_force_source sets it for a client alone. An agent and the service role can name it.
create or replace function uc_set_source() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.source := old.source;          -- who first wrote a row never changes. The history holds each later writer
    return new;
  end if;
  if auth.uid() is null then new.source := 'ai';
  elsif uc_is_agent() then new.source := 'agent';
  else new.source := 'resident';
  end if;
  return new;
end $$;

-- The client's current date and current minute of the day, in the client's own timezone.
create or replace function uc_today(uid uuid) returns date
language sql stable security definer set search_path = public as $$
  select (now() at time zone coalesce((select timezone from profiles where id = uid), 'America/Denver'))::date
$$;
create or replace function uc_now_minutes(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  select (extract(hour from t) * 60 + extract(minute from t))::int
    from (select now() at time zone coalesce((select timezone from profiles where id = uid), 'America/Denver') as t) x
$$;

-- ================================================================
-- 2. Codes
-- ================================================================
create type uc_execution       as enum ('planned', 'executed', 'partly_executed', 'did_not_happen');
create type uc_timing_outcome  as enum ('as_planned', 'changed', 'not_established');
create type uc_consequences    as enum ('reported', 'none_confirmed', 'not_established');
create type uc_step_state      as enum ('open', 'reported_done', 'not_needed');
create type uc_basis           as enum ('resident_decision', 'standing_permission', 'agreed_alternative', 'recurrence');

-- ================================================================
-- 3. The block. Changes to the table that exists.
-- ================================================================
alter table blocks
  add column schedule_item_id uuid,                -- foreign key added in part 4
  add column occurs_on        date,                -- the day of the occurrence the block was made for. A move does not change it
  add column removed_at       timestamptz,         -- taken off the schedule. The row stays
  add column removed_reason   text,
  add column statement_id     uuid references statements(id),   -- the client statement the block rests on
  add column driving          boolean,                          -- the client stated that this period is spent driving. NULL not stated
  add constraint blocks_starts_clock check (starts_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  add constraint blocks_ends_clock   check (ends_at is null or ends_at ~ '^([0-3][0-9]|4[0-7]):[0-5][0-9]$'),
  add constraint blocks_ends_after   check (ends_at is null or ends_at > starts_at),
  add constraint blocks_kind_known   check (kind in ('sleep', 'getting_ready', 'travel', 'paid_work', 'unpaid_work',
                                                     'household', 'caring', 'appointment', 'people', 'rest', 'building')),
  add constraint blocks_cost_not_self check (cost_of is null or cost_of <> id);

-- TIME.md 3.6.1. A block that has not started is never observed.
-- TIME.md 3.6.2. Only the client's statement makes a block observed.
create or replace function uc_block_not_future_observed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'observed' then
    if new.date > uc_today(new.user_id) then
      raise exception 'A block that has not started cannot be observed';
    end if;
    if new.date = uc_today(new.user_id) and new.starts_at ~ '^[0-2][0-9]:[0-5][0-9]$' then
      if split_part(new.starts_at, ':', 1)::int * 60 + split_part(new.starts_at, ':', 2)::int > uc_now_minutes(new.user_id) then
        raise exception 'A block that has not started cannot be observed';
      end if;
    end if;
    if auth.uid() is null or uc_is_agent() then
      if tg_op = 'INSERT' then
        if new.statement_id is null then
          raise exception 'A block is observed only on the statement of the client';
        end if;
      elsif new.status is distinct from old.status
            and (new.statement_id is null or new.statement_id is not distinct from old.statement_id) then
        -- the statement the block was first filed with does not prove what happened later
        raise exception 'A block is observed only on the statement of the client';
      end if;
    end if;
  end if;
  return new;
end $$;
create trigger blocks_not_future_observed before insert or update on blocks
  for each row execute function uc_block_not_future_observed();

-- Depends on shared requirement SR-3. A block is taken off the schedule. It is not deleted.
drop policy if exists blocks_resident_delete on blocks;

-- Who wrote a block is set from the actor.
drop trigger if exists blocks_source on blocks;
create trigger blocks_source before insert or update on blocks
  for each row execute function uc_set_source();

-- The built block history gains the five facts it lacks. The trigger fills them.
alter table block_revisions
  add column basis        text,
  add column basis_ref    uuid,
  add column statement_id uuid references statements(id),
  add column session_id   uuid,
  add column actor        text;
create or replace function uc_block_revision() returns trigger
language plpgsql security definer set search_path = public as $$
declare actor_id uuid := auth.uid();
declare who uc_source;
begin
  if to_jsonb(old) is distinct from to_jsonb(new) then
    if actor_id is null then who := 'ai';
    elsif uc_is_agent() then who := 'agent';
    else who := 'resident';
    end if;
    insert into public.block_revisions
      (block_id, user_id, before, after, changed_by, origin, reason, basis, basis_ref, statement_id, session_id, actor)
    values
      (old.id, old.user_id, to_jsonb(old), to_jsonb(new), actor_id, who,
       uc_setting('uc.reason'), uc_setting('uc.basis'), uc_setting('uc.basis_ref')::uuid,
       uc_setting('uc.statement_id')::uuid, uc_setting('uc.session_id')::uuid,
       case when actor_id is null then uc_setting('uc.actor') end);
  end if;
  new.updated_at := now();
  return new;
end $$;

-- ================================================================
-- 4. Ongoing work and the schedule
-- ================================================================
create table ongoing_work (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles on delete cascade,
  label            text not null check (length(trim(label)) > 0),
  recurrence_said  text,                           -- the client's words. NULL means not stated
  folder           text,                           -- the folder that owns the subject. NULL means Time alone
  ended_at         timestamptz,                    -- NULL means active
  source           uc_source not null default 'resident',
  statement_id     uuid references statements(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index ongoing_work_user on ongoing_work (user_id) where ended_at is null;

create table schedule_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles on delete cascade,
  label            text not null check (length(trim(label)) > 0),
  kind             text not null check (kind in ('sleep', 'getting_ready', 'travel', 'paid_work', 'unpaid_work',
                                                 'household', 'caring', 'appointment', 'people', 'rest', 'building')),
  paid             uc_paid not null default 'none',
  starts_at        text check (starts_at is null or starts_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ends_at          text check (ends_at is null or ends_at ~ '^([0-3][0-9]|4[0-7]):[0-5][0-9]$'),
  recurrence       text not null check (recurrence ~ '^FREQ=(DAILY|WEEKLY|MONTHLY)(;(INTERVAL|BYDAY|BYMONTHDAY|UNTIL)=[A-Z0-9,]+)*$'),
  recurrence_said  text,
  is_commitment    boolean not null default true,  -- false for a cost and for hours with no commitment
  movable          boolean,                        -- NULL not established. false cannot move
  driving          boolean,                        -- NULL not stated
  times_known_ahead_said text,                     -- how far ahead the client learns the times. Curriculum 18.8.3
  cost_of          uuid references schedule_items(id),
  ongoing_work_id  uuid references ongoing_work(id),
  effective_from   date not null default current_date,
  effective_to     date,
  source           uc_source not null default 'resident',
  statement_id     uuid references statements(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (cost_of is null or not is_commitment),
  check (ends_at is null or starts_at is not null),
  check (effective_to is null or effective_to >= effective_from)
);
create index schedule_items_user on schedule_items (user_id, effective_from);

alter table blocks
  add constraint blocks_schedule_item_fk foreign key (schedule_item_id) references schedule_items(id);
-- One block for one recurring item on one day. Making a day from the schedule twice writes it once.
-- A block that was taken off, and a block that was moved to a different day, still hold the place of
-- their occurrence, so a later run does not write the occurrence again.
alter table blocks add constraint blocks_occurrence check (schedule_item_id is null or occurs_on is not null);
create unique index blocks_one_per_item_per_day on blocks (user_id, schedule_item_id, occurs_on)
  where schedule_item_id is not null;

-- ================================================================
-- 5. The commitment, its conditions, and its steps
-- ================================================================
create table commitments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles on delete cascade,
  label              text not null check (length(trim(label)) > 0),
  block_id           uuid references blocks(id),            -- NULL while no time is set. TIME.md 4.3
  schedule_item_id   uuid references schedule_items(id),
  occurs_on          date,                                  -- the day of this occurrence of a recurring item
  ongoing_work_id    uuid references ongoing_work(id),
  continues_id       uuid references commitments(id),       -- the earlier commitment whose remaining work this one carries
  origin_folder      text,                                  -- the folder that produced the action. NULL means Time
  basis              uc_basis not null default 'resident_decision',   -- TIME.md 3.3.4
  basis_ref          uuid,

  -- Timing. Each value is NULL until the client states it.
  required_date      date,
  required_start     text check (required_start is null or required_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  deadline_date      date,
  deadline_time      text check (deadline_time is null or deadline_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  duration_minutes   int  check (duration_minutes is null or duration_minutes > 0),
  movable            boolean,
  latest_date        date,
  latest_time        text check (latest_time is null or latest_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  travel_needed      boolean,

  -- Completion
  completion_said    text,
  steps_are_whole    boolean,                               -- NULL means the client has not stated it

  -- Standards. NULL not established. false means the client stated that none applies.
  standards_apply    boolean,

  -- Contact for this commitment
  important          boolean not null default false,
  accountability     boolean not null default false,
  reminder_minutes   int check (reminder_minutes is null or reminder_minutes >= 0),
  speak_label        boolean not null default true,

  -- Outcome. Four separate fields. TIME.md 3.3.5 to 3.3.10
  execution          uc_execution not null default 'planned',
  timing_outcome     uc_timing_outcome,
  actual_date        date,
  actual_start       text check (actual_start is null or actual_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  actual_end         text check (actual_end is null or actual_end ~ '^([0-3][0-9]|4[0-7]):[0-5][0-9]$'),
  consequences       uc_consequences not null default 'not_established',
  alternative_id     uuid,                                  -- foreign key added below
  outcome_basis      text check (outcome_basis is null or outcome_basis in ('resident_report', 'evidence')),
  outcome_at         timestamptz,
  outcome_statement_id uuid references statements(id),
  outcome_evidence_table text,                              -- the entry that proves it. The form `proposals` uses for its target
  outcome_evidence_id    uuid,

  -- A time that software measured. Estimated until the client confirms it. TIME.md 3.6.9
  measured_start     timestamptz,
  measured_end       timestamptz,

  -- Taken off the Plan by the client's decision before any outcome
  withdrawn_at       timestamptz,
  withdrawn_basis    uc_basis,

  source             uc_source not null default 'resident',
  statement_id       uuid references statements(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  check (execution <> 'planned' or (timing_outcome is null and outcome_at is null and outcome_basis is null)),
  check (execution =  'planned' or (outcome_at is not null and outcome_basis is not null)),
  check (execution not in ('executed', 'partly_executed') or timing_outcome is not null),
  check (execution <> 'did_not_happen' or timing_outcome is null),
  check (timing_outcome is distinct from 'as_planned' or block_id is not null),
  check (withdrawn_at is null or execution = 'planned'),
  check (continues_id is null or continues_id <> id),
  check (outcome_basis is distinct from 'evidence' or (outcome_evidence_table is not null and outcome_evidence_id is not null)),
  check (schedule_item_id is null or occurs_on is not null)
);
-- One commitment for one recurring item on one day.
create unique index commitments_one_per_item_per_day on commitments (user_id, schedule_item_id, occurs_on)
  where schedule_item_id is not null;
create index commitments_user_block on commitments (user_id, block_id);
create index commitments_user_open  on commitments (user_id, execution) where withdrawn_at is null;
create index commitments_item       on commitments (schedule_item_id, created_at desc);
create index commitments_work       on commitments (ongoing_work_id);

create table commitment_steps (
  id               uuid primary key default gen_random_uuid(),
  commitment_id    uuid not null references commitments(id),
  user_id          uuid not null references profiles on delete cascade,
  label            text not null check (length(trim(label)) > 0),
  position         int  not null check (position > 0),
  state            uc_step_state not null default 'open',
  state_at         timestamptz,
  state_statement_id uuid references statements(id),   -- the statement the report rests on. It is not the statement the step was named in
  suggested        boolean not null default false,
  suggested_by     text,                           -- a folder name, or guide
  accepted_at      timestamptz,
  planned_minutes  int check (planned_minutes is null or planned_minutes > 0),   -- open ruling. Operations 10.8
  removed_at       timestamptz,
  source           uc_source not null default 'resident',
  statement_id     uuid references statements(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (not suggested or accepted_at is not null or state = 'open'),
  check (state = 'open' or state_at is not null)
);
create unique index commitment_steps_order on commitment_steps (commitment_id, position) where removed_at is null;

create table commitment_consequences (
  id                    uuid primary key default gen_random_uuid(),
  commitment_id         uuid not null references commitments(id),
  user_id               uuid not null references profiles on delete cascade,
  kind                  text not null check (kind in ('expected', 'reported')),   -- TIME.md 3.6.5
  said                  text not null,
  affects_commitment_id uuid references commitments(id),
  affects_standard_id   uuid references standards(id),
  source                uc_source not null default 'resident',
  statement_id          uuid references statements(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index commitment_consequences_c on commitment_consequences (commitment_id, kind);
create index commitment_consequences_affects on commitment_consequences (affects_commitment_id);

create table commitment_standards (
  id             uuid primary key default gen_random_uuid(),
  commitment_id  uuid not null references commitments(id),
  standard_id    uuid not null references standards(id),
  user_id        uuid not null references profiles on delete cascade,
  removed_at     timestamptz,                    -- the client stated that the minimum no longer applies
  source         uc_source not null default 'resident',
  statement_id   uuid references statements(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (commitment_id, standard_id)
);

create table commitment_alternatives (
  id             uuid primary key default gen_random_uuid(),
  commitment_id  uuid not null references commitments(id),
  user_id        uuid not null references profiles on delete cascade,
  said           text not null,
  source         uc_source not null default 'resident' check (source <> 'ai'),
  statement_id   uuid references statements(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table commitments
  add constraint commitments_alternative_fk foreign key (alternative_id) references commitment_alternatives(id);

-- ================================================================
-- 6. The follow up, and the Follow through condition
-- ================================================================
create table follow_ups (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles on delete cascade,
  owner              uc_role not null,                       -- resident or agent
  need               text not null check (need in ('information', 'confirmation', 'resident_action', 'agent_action')),
  next_action        text not null check (length(trim(next_action)) > 0),
  from_commitment_id uuid references commitments(id),
  from_statement_id  uuid references statements(id),
  from_session_id    uuid,
  ongoing_work_id    uuid references ongoing_work(id),
  folder             text,
  person_reason      text check (person_reason is null or person_reason in
                       ('not_covered', 'judgment', 'interpretation', 'resident_asked')),   -- TIME.md 5.6.6
  due_date           date,
  status             text not null default 'open' check (status in ('open', 'closed')),
  closed_at          timestamptz,
  closed_basis       text,
  asked_at           timestamptz,                            -- the last time the client was asked
  source             uc_source not null default 'resident',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (from_commitment_id is not null or from_statement_id is not null or from_session_id is not null),
  check ((status = 'closed') = (closed_at is not null)),
  check (status = 'open' or closed_basis is not null)
);
create index follow_ups_open on follow_ups (user_id, owner, due_date) where status = 'open';

create table commitment_follow_through (
  id                   uuid primary key default gen_random_uuid(),
  commitment_id        uuid not null references commitments(id),
  user_id              uuid not null references profiles on delete cascade,
  action               text not null,
  owner                uc_role not null,
  due_said             text,
  due_date             date,
  ongoing_work_id      uuid references ongoing_work(id),
  position             int,
  result_commitment_id uuid references commitments(id),
  result_follow_up_id  uuid references follow_ups(id),
  source               uc_source not null default 'resident',
  statement_id         uuid references statements(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index commitment_follow_through_c on commitment_follow_through (commitment_id);

-- ================================================================
-- 7. The Plan
-- ================================================================
create table plans (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles on delete cascade,
  date                   date not null,
  prepared_at            timestamptz not null default now(),
  confirmed_at           timestamptz,                        -- NULL means the client has not confirmed it
  confirmed_source       uc_source,
  confirmed_statement_id uuid references statements(id),
  realism                text check (realism is null or realism in ('very', 'mostly', 'ambitious', 'unlikely')),
  daily_close_at         text check (daily_close_at is null or daily_close_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  closed_at              timestamptz,                        -- Daily Close for this day was completed
  went_as_planned        boolean,                            -- the answer to the first question of Daily Close. NULL not answered
  closed_statement_id    uuid references statements(id),
  source                 uc_source not null default 'resident',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id, date),
  check (confirmed_at is null or confirmed_source = 'resident' or confirmed_statement_id is not null),
  check (confirmed_at is null or confirmed_source is not null)
);

create table plan_items (
  id             uuid primary key default gen_random_uuid(),
  plan_id        uuid not null references plans(id),
  commitment_id  uuid not null references commitments(id),
  user_id        uuid not null references profiles on delete cascade,
  position       int,                                        -- NULL means the Plan holds no order for it
  planned_start  text check (planned_start is null or planned_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  planned_end    text check (planned_end is null or planned_end ~ '^([0-3][0-9]|4[0-7]):[0-5][0-9]$'),
  state          text not null default 'on' check (state in ('on', 'moved', 'taken_off')),
  state_at       timestamptz,
  basis          uc_basis,
  basis_ref      uuid,
  moved_to       uuid references plan_items(id),
  source         uc_source not null default 'resident',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (plan_id, commitment_id),
  check (state = 'on' or (state_at is not null and basis is not null))
);
create index plan_items_commitment on plan_items (commitment_id);

-- ================================================================
-- 8. Standing permissions, recommendations, settings, lessons
-- ================================================================
create table standing_permissions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles on delete cascade,
  kind                   text not null check (kind in ('place_work', 'update_schedule', 'behind_schedule')),
  scope                  jsonb not null default '{}'::jsonb,
  wording_version        text not null,                       -- which approved wording the client read
  granted_at             timestamptz not null default now(),
  granted_statement_id   uuid references statements(id),
  withdrawn_at           timestamptz,
  withdrawn_statement_id uuid references statements(id),
  source                 uc_source not null default 'resident' check (source <> 'ai'),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  check (source = 'resident' or granted_statement_id is not null)
);
create index standing_permissions_active on standing_permissions (user_id, kind) where withdrawn_at is null;

create table recommendations (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles on delete cascade,
  made_by               uc_source not null default 'agent' check (made_by <> 'resident'),
  agent_id              uuid references profiles,
  session_id            uuid,
  conversation_key      text not null,
  action                text not null check (action in ('do_next', 'move', 'shorten', 'take_off')),
  commitment_id         uuid references commitments(id),
  step_id               uuid references commitment_steps(id),
  to_date               date,
  to_start              text,
  to_minutes            int,
  rests_on              text not null check (length(trim(rests_on)) > 0),
  rests_on_table        text,
  rests_on_id           uuid,
  response              text check (response is null or response in ('accepted', 'changed', 'declined')),
  responded_at          timestamptz,
  response_statement_id uuid references statements(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check ((response is null) = (responded_at is null)),
  check (commitment_id is not null or step_id is not null)
);
create index recommendations_user on recommendations (user_id, created_at desc);
create index recommendations_conversation on recommendations (user_id, conversation_key, action);

create table time_settings (
  user_id          uuid primary key references profiles on delete cascade,
  morning_plan     boolean not null default false,
  morning_plan_at  text check (morning_plan_at is null or morning_plan_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  reminders        boolean not null default false,
  reminder_minutes int check (reminder_minutes is null or reminder_minutes >= 0),
  updates          boolean not null default false,
  notices          boolean not null default false,
  follow_up        text check (follow_up is null or follow_up in ('none', 'before', 'after', 'both')),
  quiet_from       text check (quiet_from is null or quiet_from ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  quiet_to         text check (quiet_to is null or quiet_to ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  guided_voice     boolean not null default false,
  speech_level     text check (speech_level is null or speech_level in ('times', 'times_labels', 'times_labels_folders')),
  speech_folders   text[] not null default '{}',
  time_display     boolean not null default false,
  daily_close_at   text check (daily_close_at is null or daily_close_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),   -- the client's usual time of Daily Close. TIME.md 10.4
  controlled_minutes_target int check (controlled_minutes_target is null or controlled_minutes_target >= 0), -- open. Operations 9.7
  schedule_on_file_at timestamptz,                -- the first seven day schedule was filed as assembled. Operations 17.1
  source           uc_source not null default 'resident',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table lesson_deliveries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  folder          text not null,
  lesson_key      text not null,
  lesson_version  text not null,
  form            text not null check (form in ('text', 'voice', 'narration', 'screen')),
  session_id      uuid,
  commitment_id   uuid references commitments(id),
  delivered_at    timestamptz not null default now()
);
create index lesson_deliveries_user on lesson_deliveries (user_id, folder, lesson_key);

-- ================================================================
-- 9. Rules that hold in every form: screen, text, and voice
-- ================================================================

-- What changes an outcome field once Execution has left planned.
--   Execution: a correction alone, with its reason.
--   Timing: from not established to as planned or changed, when the client later states the time. Every other change is a correction.
--   Consequences: from not established to either value, and from none confirmed to reported, when the client later reports. Every other change is a correction.
-- No outcome carries a time later than the client's current date.
-- An agent and software file what the client reported only with the statement it rests on:
--   the outcome itself, in outcome_statement_id, at the write that files it;
--   a later time or a later answer about consequences, in the setting uc.statement_id, which the history keeps,
--   or in the reported consequence itself.
-- A write that changes no outcome field is not held to this rule.
create or replace function uc_commitment_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare correction boolean := uc_setting('uc.reason') is not null;
declare for_client boolean := auth.uid() is null or uc_is_agent();
begin
  if tg_op = 'UPDATE' then
    if old.execution <> 'planned' and not correction then
      if new.execution is distinct from old.execution then
        raise exception 'An outcome on file changes only as a correction that states its reason';
      end if;
      if new.timing_outcome is distinct from old.timing_outcome
         and old.timing_outcome is distinct from 'not_established' then
        raise exception 'An outcome on file changes only as a correction that states its reason';
      end if;
      if new.consequences is distinct from old.consequences
         and not (old.consequences = 'not_established'
                  or (old.consequences = 'none_confirmed' and new.consequences = 'reported')) then
        raise exception 'An outcome on file changes only as a correction that states its reason';
      end if;
    end if;
    if for_client then
      if new.execution is distinct from old.execution and new.execution <> 'planned'
         and new.outcome_basis = 'resident_report'
         and (new.outcome_statement_id is null or new.outcome_statement_id is not distinct from old.statement_id) then
        raise exception 'An agent and software file an outcome only with the statement it rests on';
      end if;
      if old.execution <> 'planned' and uc_setting('uc.statement_id') is null
         and (new.timing_outcome is distinct from old.timing_outcome
              or (new.consequences is distinct from old.consequences
                  and not (new.consequences = 'reported' and exists
                           (select 1 from commitment_consequences q
                             where q.commitment_id = new.id and q.kind = 'reported' and q.statement_id is not null)))) then
        raise exception 'An agent and software file what the client said later only with the statement it rests on';
      end if;
      if new.steps_are_whole is distinct from old.steps_are_whole and uc_setting('uc.statement_id') is null then
        raise exception 'An agent and software file that the steps are the whole only with the statement it rests on';
      end if;
    end if;
  else
    if for_client and new.execution <> 'planned' and new.outcome_basis = 'resident_report' and new.outcome_statement_id is null then
      raise exception 'An agent and software file an outcome only with the statement it rests on';
    end if;
    if for_client and new.statement_id is null and new.basis = 'resident_decision' then
      raise exception 'An agent and software file a commitment the client decided only with the statement it rests on';
    end if;
  end if;
  if new.actual_date is not null and new.actual_date > uc_today(new.user_id) then
    raise exception 'An outcome cannot carry a future date';
  end if;
  return new;
end $$;
create trigger commitments_guard before insert or update on commitments
  for each row execute function uc_commitment_guard();

-- TIME.md 3.3.16. Where the client stated that the steps are the whole of the
-- Completion condition, the commitment is executed when no step is open.
-- The rule runs when a step changes and when the client states that the steps are the whole.
create or replace function uc_evaluate_steps(p_commitment uuid, p_statement uuid) returns void
language plpgsql security definer set search_path = public as $$
declare c commitments%rowtype;
declare open_steps int;
declare live_steps int;
begin
  select * into c from commitments where id = p_commitment;
  if c.steps_are_whole is true and c.execution = 'planned' and c.withdrawn_at is null then
    select count(*) filter (where state = 'open'), count(*)
      into open_steps, live_steps
      from commitment_steps
     where commitment_id = p_commitment and removed_at is null
       and (not suggested or accepted_at is not null);
    if live_steps > 0 and open_steps = 0 then
      update commitments
         set execution = 'executed', timing_outcome = 'not_established',
             outcome_basis = 'resident_report', outcome_at = now(),
             outcome_statement_id = p_statement,
             measured_end = now()
       where id = c.id;
    end if;
  end if;
end $$;

create or replace function uc_steps_complete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform uc_evaluate_steps(new.commitment_id, new.state_statement_id);
  return null;
end $$;
create trigger commitment_steps_complete after insert or update of state, removed_at, accepted_at on commitment_steps
  for each row execute function uc_steps_complete();

create or replace function uc_steps_whole_stated() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.steps_are_whole is true and old.steps_are_whole is distinct from true then
    perform uc_evaluate_steps(new.id, uc_setting('uc.statement_id')::uuid);
  end if;
  return null;
end $$;
create trigger commitments_steps_whole after update of steps_are_whole on commitments
  for each row execute function uc_steps_whole_stated();

-- TIME.md 3.3.14. The client sets the state of a step. An agent and software file the client's report with its statement.
create or replace function uc_step_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.state <> 'open' and (auth.uid() is null or uc_is_agent()) then
    if tg_op = 'INSERT' then
      if new.state_statement_id is null then
        raise exception 'An agent and software file a step report only with the statement it rests on';
      end if;
    elsif new.state is distinct from old.state
          and (new.state_statement_id is null or new.state_statement_id is not distinct from old.state_statement_id) then
      raise exception 'An agent and software file a step report only with the statement it rests on';
    end if;
  end if;
  return new;
end $$;
create trigger commitment_steps_guard before insert or update on commitment_steps
  for each row execute function uc_step_guard();

-- A reported consequence sets the outcome field. An expected one never does. TIME.md 3.6.5
create or replace function uc_consequence_reported() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'reported' then
    update commitments set consequences = 'reported'
     where id = new.commitment_id and consequences <> 'reported';
  end if;
  return null;
end $$;
create trigger commitment_consequences_reported after insert on commitment_consequences
  for each row execute function uc_consequence_reported();

-- Who confirmed a Plan is set by the database. The writer cannot choose it.
create or replace function uc_plan_confirm() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if old.confirmed_at is not null then
      -- a confirmation on file is kept as it was made
      new.confirmed_at := old.confirmed_at;
      new.confirmed_source := old.confirmed_source;
      new.confirmed_statement_id := old.confirmed_statement_id;
      return new;
    end if;
  end if;
  if new.confirmed_at is not null then
    if auth.uid() is null then new.confirmed_source := 'ai';
    elsif uc_is_agent() then new.confirmed_source := 'agent';
    else new.confirmed_source := 'resident';
    end if;
  end if;
  return new;
end $$;
create trigger plans_confirm before insert or update on plans
  for each row execute function uc_plan_confirm();

-- A client cannot close a follow up the agent owns, and cannot change who owns one.
create or replace function uc_follow_up_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not uc_is_agent() then
    if new.owner is distinct from old.owner then
      raise exception 'A client cannot change who owns a follow up';
    end if;
    if old.owner = 'agent' and new.status is distinct from old.status then
      raise exception 'This follow up belongs to the agent';
    end if;
  end if;
  return new;
end $$;
create trigger follow_ups_guard before update on follow_ups
  for each row execute function uc_follow_up_guard();

-- ================================================================
-- 10. Provenance, history, and access for every Time table
-- ================================================================
do $$
declare t text;
begin
  foreach t in array array['ongoing_work', 'schedule_items', 'commitments', 'commitment_steps',
                           'commitment_consequences', 'commitment_standards', 'commitment_alternatives',
                           'follow_ups', 'commitment_follow_through', 'plans', 'plan_items',
                           'standing_permissions', 'time_settings']
  loop
    execute format('alter table public.%1$s enable row level security', t);
    execute format($f$
      create policy %1$s_read on public.%1$s for select
        using (user_id = auth.uid() or uc_is_agent());
      create policy %1$s_resident_insert on public.%1$s for insert
        with check (user_id = auth.uid());
      create policy %1$s_resident_update on public.%1$s for update
        using (user_id = auth.uid()) with check (user_id = auth.uid());
      create policy %1$s_agent_insert on public.%1$s for insert
        with check (uc_is_agent());
      create policy %1$s_agent_update on public.%1$s for update
        using (uc_is_agent()) with check (uc_is_agent());
    $f$, t);
    -- no delete policy on any Time table
    execute format('create trigger %1$s_source before insert or update on public.%1$s
                      for each row execute function uc_set_source()', t);
    execute format('create trigger %1$s_revision before update on public.%1$s
                      for each row execute function uc_file_revision()', t);
  end loop;
end $$;

-- A row that holds what the client stated names the statement when an agent or software files it.
-- A commitment, a step report, an outcome, a block marked observed, and a permission have their own rule above.
create or replace function uc_statement_required() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.statement_id is null and (auth.uid() is null or uc_is_agent()) then
    raise exception 'An agent and software file what the client stated only with the statement it rests on';
  end if;
  return new;
end $$;
do $$
declare t text;
begin
  foreach t in array array['schedule_items', 'ongoing_work', 'commitment_consequences', 'commitment_alternatives',
                           'commitment_standards', 'commitment_follow_through']
  loop
    execute format('create trigger %1$s_statement before insert on public.%1$s
                      for each row execute function uc_statement_required()', t);
  end loop;
end $$;

-- Only the agent files that the first seven day schedule is assembled. Operations 17.1.2
create or replace function uc_time_settings_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not uc_is_agent() then
    if tg_op = 'INSERT' then
      if new.schedule_on_file_at is not null then
        raise exception 'The agent files that the first schedule is assembled';
      end if;
    elsif new.schedule_on_file_at is distinct from old.schedule_on_file_at then
      raise exception 'The agent files that the first schedule is assembled';
    end if;
  end if;
  return new;
end $$;
create trigger time_settings_guard before insert or update on time_settings
  for each row execute function uc_time_settings_guard();

-- Recommendations and lesson deliveries are written by the agent and by software.
-- The client reads them. The client answers a recommendation through the two answer columns.
alter table recommendations   enable row level security;
alter table lesson_deliveries enable row level security;
create policy recommendations_read on recommendations
  for select using (user_id = auth.uid() or uc_is_agent());
create policy recommendations_agent_insert on recommendations
  for insert with check (uc_is_agent());
create policy recommendations_agent_update on recommendations
  for update using (uc_is_agent()) with check (uc_is_agent());
create policy recommendations_resident_answer on recommendations
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy lesson_deliveries_read on lesson_deliveries
  for select using (user_id = auth.uid() or uc_is_agent());
-- A delivery is written once, by software, and is never changed. It has no update policy and needs no history.

-- Who made a recommendation is set from the actor. A declined recommendation is not made
-- again in the same conversation. TIME.md 5.10.8
create or replace function uc_recommendation_made() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then new.made_by := 'ai'; else new.made_by := 'agent'; end if;
  if exists (select 1 from recommendations r
              where r.user_id = new.user_id and r.conversation_key = new.conversation_key
                and r.action = new.action and r.response = 'declined'
                and coalesce(r.commitment_id, r.step_id) = coalesce(new.commitment_id, new.step_id)) then
    raise exception 'The client declined this recommendation in this conversation';
  end if;
  return new;
end $$;
create trigger recommendations_made before insert on recommendations
  for each row execute function uc_recommendation_made();
create trigger recommendations_revision before update on recommendations
  for each row execute function uc_file_revision();

create or replace function uc_recommendation_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not uc_is_agent() then
    if (to_jsonb(new) - 'response' - 'responded_at' - 'response_statement_id' - 'updated_at')
       is distinct from
       (to_jsonb(old) - 'response' - 'responded_at' - 'response_statement_id' - 'updated_at') then
      raise exception 'A client answers a recommendation. A client does not rewrite it';
    end if;
  end if;
  return new;
end $$;
create trigger recommendations_guard before update on recommendations
  for each row execute function uc_recommendation_guard();

-- What Integrity reads. One view. No second copy. TIME.md 4.4.7
create view time_commitments_read with (security_invoker = true) as
  select c.id, c.user_id, c.label, c.origin_folder, c.basis,
         p.date as plan_date, i.planned_start, i.planned_end, i.state as plan_state,
         c.execution, c.timing_outcome, c.consequences, c.alternative_id is not null as alternative_used,
         c.actual_date, c.actual_start, c.withdrawn_at, c.continues_id, c.outcome_at, c.occurs_on
    from commitments c
    left join plan_items i on i.commitment_id = c.id
    left join plans p on p.id = i.plan_id;

commit;
