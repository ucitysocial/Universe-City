-- Resident-scoped editable faded scheduling suggestions, not commitments.
-- Apply after 0001_founder_test.sql. No existing File records are modified.
create table if not exists uc_pilot.ghost_suggestions (
  user_id uuid not null default uc_pilot.uid(),
  key text not null check (char_length(key) between 1 and 70),
  label text not null check (char_length(label) between 1 and 100),
  ask text not null check (char_length(ask) between 1 and 300),
  at integer not null check (at between -10 and 2880),
  when_missing text check (when_missing in ('sleep','morning','work','meals','night')),
  enabled boolean not null default true,
  changed_at timestamptz not null default now(),
  changed_by text not null default 'agent',
  primary key (user_id, key)
);
alter table uc_pilot.ghost_suggestions enable row level security;
alter table uc_pilot.ghost_suggestions force row level security;
revoke all on uc_pilot.ghost_suggestions from public;
drop policy if exists ghost_read on uc_pilot.ghost_suggestions;
drop policy if exists ghost_insert on uc_pilot.ghost_suggestions;
drop policy if exists ghost_update on uc_pilot.ghost_suggestions;
create policy ghost_read on uc_pilot.ghost_suggestions for select to uc_pilot_resident
  using (user_id = uc_pilot.uid() and uc_pilot.allowed());
create policy ghost_insert on uc_pilot.ghost_suggestions for insert to uc_pilot_resident
  with check (user_id = uc_pilot.uid() and uc_pilot.allowed() and uc_pilot.actor() = 'agent');
create policy ghost_update on uc_pilot.ghost_suggestions for update to uc_pilot_resident
  using (user_id = uc_pilot.uid() and uc_pilot.allowed() and uc_pilot.actor() = 'agent')
  with check (user_id = uc_pilot.uid() and uc_pilot.allowed() and uc_pilot.actor() = 'agent');
grant select, insert on uc_pilot.ghost_suggestions to uc_pilot_resident;
grant update (label, ask, at, when_missing, enabled, changed_at, changed_by)
  on uc_pilot.ghost_suggestions to uc_pilot_resident;
-- Immutable change history. No direct INSERT/UPDATE grants.
create table if not exists uc_pilot.ghost_suggestion_history (
  id bigint generated always as identity primary key,
  user_id uuid not null, key text not null,
  before jsonb, after jsonb not null,
  changed_at timestamptz not null default now(),
  actor text not null
);
alter table uc_pilot.ghost_suggestion_history enable row level security;
alter table uc_pilot.ghost_suggestion_history force row level security;
revoke all on uc_pilot.ghost_suggestion_history from public;
drop policy if exists ghost_history_read on uc_pilot.ghost_suggestion_history;
create policy ghost_history_read on uc_pilot.ghost_suggestion_history for select to uc_pilot_resident
  using (user_id = uc_pilot.uid() and uc_pilot.allowed());
grant select on uc_pilot.ghost_suggestion_history to uc_pilot_resident;
create or replace function uc_pilot.capture_ghost_suggestion_change() returns trigger
language plpgsql security definer set search_path = uc_pilot, pg_temp as $$
begin
  insert into uc_pilot.ghost_suggestion_history(user_id, key, before, after, actor)
  values (new.user_id, new.key, case when tg_op = 'INSERT' then null else to_jsonb(old) end, to_jsonb(new), uc_pilot.actor());
  return new;
end $$;
revoke all on function uc_pilot.capture_ghost_suggestion_change() from public;
drop trigger if exists ghost_history on uc_pilot.ghost_suggestions;
create trigger ghost_history after insert or update on uc_pilot.ghost_suggestions
  for each row execute function uc_pilot.capture_ghost_suggestion_change();
