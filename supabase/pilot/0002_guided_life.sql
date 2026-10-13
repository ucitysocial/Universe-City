-- Guided Life v1: separate ordered steps and an execution session under an existing Time commitment.
-- Apply ONLY after the Founder Pilot migration (0001). Does not alter existing commitments or history.
-- The resident decides which proposed steps are accepted and what work they actually did.
create table if not exists uc_pilot.guided_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default uc_pilot.uid(),
  commitment_id uuid not null references uc_pilot.commitments(id),
  position integer not null check (position between 0 and 9999),
  label text not null check (char_length(label) between 1 and 220),
  instructions text check (char_length(instructions) <= 2000),
  origin text not null check (origin in ('resident', 'agent_suggestion')),
  state text not null default 'proposed' check (state in ('proposed','ready','done','skipped','rejected')),
  created_at timestamptz not null default now(),
  changed_at timestamptz not null default now()
);
create index if not exists guided_steps_parent on uc_pilot.guided_steps(user_id,commitment_id,position,id);
create table if not exists uc_pilot.guided_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default uc_pilot.uid(),
  commitment_id uuid not null references uc_pilot.commitments(id),
  state text not null default 'idle' check (state in ('idle','active','paused')),
  created_at timestamptz not null default now(),
  changed_at timestamptz not null default now(),
  unique(user_id,commitment_id)
);
create or replace function uc_pilot.guided_step_guard() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from uc_pilot.commitments c where c.id=new.commitment_id and c.user_id=uc_pilot.uid())
    then raise exception 'The commitment is not in this File.'; end if;
  if tg_op='INSERT' then
    if new.origin='agent_suggestion' then
      if uc_pilot.actor()<>'agent' or new.state<>'proposed' then raise exception 'An agent may only propose a step.'; end if;
    elsif uc_pilot.actor()<>'resident' or new.state<>'ready' then
      raise exception 'Only the resident can put a new step on their plan.';
    end if;
  else
    if new.commitment_id is distinct from old.commitment_id or new.origin is distinct from old.origin or
       new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at then
      raise exception 'A step cannot change its source or owner.'; end if;
    if old.state='proposed' and new.state<>old.state and uc_pilot.actor()<>'resident' then
      raise exception 'Only the resident can decide on a proposed step.'; end if;
    if old.state in ('done','skipped','rejected') and new.state<>old.state and uc_pilot.actor()<>'resident' then
      raise exception 'Only the resident can change a reported step.'; end if;
    if uc_pilot.actor()='agent' and (new.state<>old.state or old.state<>'proposed') then
      raise exception 'The agent cannot mark a step completed or approved.'; end if;
    new.changed_at=now();
  end if;
  return new;
end $$;
create or replace function uc_pilot.guided_session_guard() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from uc_pilot.commitments c where c.id=new.commitment_id and c.user_id=uc_pilot.uid())
    then raise exception 'The commitment is not in this File.'; end if;
  if uc_pilot.actor()<>'resident' then raise exception 'Only the resident can run Guided Life.'; end if;
  if tg_op='UPDATE' then
    if new.user_id is distinct from old.user_id or new.commitment_id is distinct from old.commitment_id or
       new.created_at is distinct from old.created_at then raise exception 'A Guided Life session cannot change its owner.'; end if;
    new.changed_at=now();
  end if;
  return new;
end $$;
drop trigger if exists guided_steps_guard on uc_pilot.guided_steps;
create trigger guided_steps_guard before insert or update on uc_pilot.guided_steps
for each row execute function uc_pilot.guided_step_guard();
drop trigger if exists guided_sessions_guard on uc_pilot.guided_sessions;
create trigger guided_sessions_guard before insert or update on uc_pilot.guided_sessions
for each row execute function uc_pilot.guided_session_guard();
drop trigger if exists guided_steps_history on uc_pilot.guided_steps;
create trigger guided_steps_history after update on uc_pilot.guided_steps
for each row execute function uc_pilot.keep_revision();
drop trigger if exists guided_sessions_history on uc_pilot.guided_sessions;
create trigger guided_sessions_history after update on uc_pilot.guided_sessions
for each row execute function uc_pilot.keep_revision();
alter table uc_pilot.guided_steps enable row level security;
alter table uc_pilot.guided_steps force row level security;
alter table uc_pilot.guided_sessions enable row level security;
alter table uc_pilot.guided_sessions force row level security;
revoke all on uc_pilot.guided_steps,uc_pilot.guided_sessions from public;
drop policy if exists guided_steps_owner on uc_pilot.guided_steps;
create policy guided_steps_owner on uc_pilot.guided_steps for all to uc_pilot_resident
using(user_id=uc_pilot.uid() and uc_pilot.allowed()) with check(user_id=uc_pilot.uid() and uc_pilot.allowed());
drop policy if exists guided_sessions_owner on uc_pilot.guided_sessions;
create policy guided_sessions_owner on uc_pilot.guided_sessions for all to uc_pilot_resident
using(user_id=uc_pilot.uid() and uc_pilot.allowed()) with check(user_id=uc_pilot.uid() and uc_pilot.allowed());
grant select,insert on uc_pilot.guided_steps,uc_pilot.guided_sessions to uc_pilot_resident;
grant update(position,label,instructions,state,changed_at) on uc_pilot.guided_steps to uc_pilot_resident;
grant update(state,changed_at) on uc_pilot.guided_sessions to uc_pilot_resident;
