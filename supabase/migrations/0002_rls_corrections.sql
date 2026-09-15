-- Universe City. 0002. Security corrections.
--
-- 0001 gave every member-owned table the same policy. That was wrong in five
-- ways: a member could make themselves an agent, mark themselves paid, write
-- their own subscription, rewrite their own audit trail, and approve their own
-- proposals. This replaces that with three classes of table.
--
--   MEMBER OWNED   they write it. blocks, standards, inventory_items,
--                  entries, statements, salary
--   SYSTEM OWNED   nobody writes from a client. subscriptions,
--                  block_revisions, stripe_events
--   AGENT OWNED    the member reads only. proposals, reviews
--
-- profiles is a fourth case: the row is theirs, four columns are not.

begin;

-- ================================================================
-- 1. Tear down the generic policies from 0001
-- ================================================================
do $$
declare t text; p text;
begin
  foreach t in array array['subscriptions','blocks','block_revisions','standards',
                           'inventory_items','salary','entries','statements',
                           'proposals','reviews']
  loop
    for p in select policyname from pg_policies where schemaname='public' and tablename=t
    loop execute format('drop policy if exists %I on public.%I', p, t); end loop;
  end loop;
  for p in select policyname from pg_policies where schemaname='public' and tablename='profiles'
  loop execute format('drop policy if exists %I on public.profiles', p); end loop;
end $$;

-- ================================================================
-- 2. Case numbers from a sequence. Random four digits collide.
-- ================================================================
create sequence if not exists uc_case_seq start 401;

create or replace function uc_next_case() returns text
language sql volatile as $$
  select 'UC-' || lpad(nextval('uc_case_seq')::text, 4, '0');
$$;

alter table profiles alter column case_no set default uc_next_case();

-- existing rows keep whatever they have, and the sequence starts above them
select setval('uc_case_seq',
  greatest(401, coalesce((select max(nullif(regexp_replace(case_no,'\D','','g'),''))::bigint
                          from profiles), 400) + 1), false);

-- ================================================================
-- 3. New columns. Timezone, test separation, audit.
-- ================================================================
alter table profiles
  add column if not exists timezone text not null default 'America/Denver',
  add column if not exists is_test  boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

comment on column profiles.timezone is
  'IANA zone. Every week and day boundary is computed in this zone, never from UTC.';
comment on column profiles.is_test is
  'Seeded or rehearsal record. Convenience only. Real separation is a separate Supabase project and Stripe test mode.';

-- Salary. The nullable columns already carry the distinction. This is the
-- contract, not a constraint. Zero is a legitimate confirmed value.
comment on table salary is
  'NULL means not established. 0 means confirmed zero. Never coerce a missing value to 0. A calculation whose operands are NULL returns not established rather than a number.';
comment on column salary.established is
  'True once enough Time is observed for the figures to mean anything. Never set by a page needing content.';

-- ================================================================
-- 4. profiles. The row is theirs. Four columns are not.
-- ================================================================
create policy profiles_read on profiles
  for select using (id = auth.uid() or uc_is_agent());

create policy profiles_insert_self on profiles
  for insert with check (id = auth.uid());

create policy profiles_update_self on profiles
  for update using (id = auth.uid() or uc_is_agent())
  with check (id = auth.uid() or uc_is_agent());

-- Postgres cannot scope a policy to columns, so the guard is a trigger.
-- role, membership, case_no, represented_since change only through the service
-- role or an agent. email changes only through Supabase Auth, synchronised after.
create or replace function uc_guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
declare acting_agent boolean;
begin
  -- service role has no auth.uid(), so it passes untouched
  if auth.uid() is null then
    new.updated_at := now();
    return new;
  end if;

  acting_agent := uc_is_agent();

  if not acting_agent then
    if new.role is distinct from old.role
       or new.membership is distinct from old.membership
       or new.case_no is distinct from old.case_no
       or new.represented_since is distinct from old.represented_since then
      raise exception 'Not yours to change: role, membership, case_no, represented_since';
    end if;
  end if;

  -- email belongs to Auth. It is synchronised in, never edited here.
  if new.email is distinct from old.email then
    raise exception 'Change your email through account settings, not the profile record';
  end if;

  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profiles_guard on profiles;
create trigger profiles_guard before update on profiles
  for each row execute function uc_guard_profile();

-- keep the profile in step when Auth changes the email
create or replace function uc_sync_auth_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_email on auth.users;
create trigger on_auth_user_email after update of email on auth.users
  for each row execute function uc_sync_auth_email();

-- ================================================================
-- 5. MEMBER OWNED. They write. An agent may read and add, never delete.
-- ================================================================
do $$
declare t text;
begin
  foreach t in array array['blocks','standards','inventory_items','entries','statements','salary']
  loop
    execute format($f$
      create policy %1$s_read on public.%1$s for select
        using (user_id = auth.uid() or uc_is_agent());

      create policy %1$s_member_insert on public.%1$s for insert
        with check (user_id = auth.uid());

      create policy %1$s_member_update on public.%1$s for update
        using (user_id = auth.uid()) with check (user_id = auth.uid());

      create policy %1$s_member_delete on public.%1$s for delete
        using (user_id = auth.uid());

      create policy %1$s_agent_insert on public.%1$s for insert
        with check (uc_is_agent());

      create policy %1$s_agent_update on public.%1$s for update
        using (uc_is_agent()) with check (uc_is_agent());
    $f$, t);
  end loop;
end $$;

-- ================================================================
-- 6. Provenance is not user-selectable metadata.
--    A member's write is always source = member, whatever they sent.
-- ================================================================
create or replace function uc_force_source() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;   -- service role
  if uc_is_agent() then
    if new.source = 'ai' then
      raise exception 'Only a server side process may record source = ai';
    end if;
    return new;
  end if;
  new.source := 'member';
  return new;
end $$;

drop trigger if exists blocks_source on blocks;
create trigger blocks_source before insert or update on blocks
  for each row execute function uc_force_source();

drop trigger if exists entries_source on entries;
create trigger entries_source before insert or update on entries
  for each row execute function uc_force_source();

-- proposals carry origin rather than source, and the same rule applies
create or replace function uc_force_origin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if uc_is_agent() then return new; end if;
  new.origin := 'member';
  return new;
end $$;

drop trigger if exists proposals_origin on proposals;
create trigger proposals_origin before insert or update on proposals
  for each row execute function uc_force_origin();

-- ================================================================
-- 7. SYSTEM OWNED. Read only from any client. The trigger and the
--    service role are the only writers.
-- ================================================================
create policy subscriptions_read on subscriptions
  for select using (user_id = auth.uid() or uc_is_agent());

create policy block_revisions_read on block_revisions
  for select using (user_id = auth.uid() or uc_is_agent());
-- no insert, update or delete policy exists for either table, by design

-- The revision trigger now writes past RLS on the member's behalf. It records
-- the real authenticated actor, and the member never gains write access.
create or replace function uc_block_revision() returns trigger
language plpgsql security definer set search_path = public as $$
declare actor uuid := auth.uid();
declare who uc_source;
begin
  if to_jsonb(old) is distinct from to_jsonb(new) then
    if actor is null then who := 'ai';
    elsif uc_is_agent() then who := 'agent';
    else who := 'member';
    end if;

    insert into public.block_revisions (block_id, user_id, before, after, changed_by, origin)
    values (old.id, old.user_id, to_jsonb(old), to_jsonb(new), actor, who);
  end if;
  new.updated_at := now();
  return new;
end $$;

-- a revision is immutable once written, even for an agent
create or replace function uc_revisions_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'A revision is a historical record and cannot be changed or removed';
end $$;

drop trigger if exists block_revisions_immutable on block_revisions;
create trigger block_revisions_immutable before update or delete on block_revisions
  for each row execute function uc_revisions_immutable();

-- ================================================================
-- 8. AGENT OWNED. The member reads. Only an agent decides.
-- ================================================================
create policy proposals_read on proposals
  for select using (user_id = auth.uid() or uc_is_agent());
create policy proposals_agent_insert on proposals
  for insert with check (uc_is_agent());
create policy proposals_agent_update on proposals
  for update using (uc_is_agent()) with check (uc_is_agent());

create policy reviews_read on reviews
  for select using (user_id = auth.uid() or uc_is_agent());
create policy reviews_agent_insert on reviews
  for insert with check (uc_is_agent());
create policy reviews_agent_update on reviews
  for update using (uc_is_agent()) with check (uc_is_agent());

-- a decided proposal records who decided it, and cannot be re-decided quietly
create or replace function uc_proposal_decision() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.state is distinct from old.state and new.state <> 'proposed' then
    new.decided_by := coalesce(new.decided_by, auth.uid());
    new.decided_at := coalesce(new.decided_at, now());
  end if;
  return new;
end $$;

drop trigger if exists proposals_decision on proposals;
create trigger proposals_decision before update on proposals
  for each row execute function uc_proposal_decision();

-- approved and then edited is a distinct outcome from approved as proposed
alter type uc_proposal add value if not exists 'edited';

-- ================================================================
-- 9. Stripe idempotency. Received, processing, processed, so a failed
--    handler retries instead of being silently marked done.
-- ================================================================
create table if not exists stripe_events (
  id            text primary key,          -- the Stripe event id
  type          text not null,
  status        text not null default 'received',  -- received | processing | processed | failed
  attempts      int  not null default 0,
  last_error    text,
  payload       jsonb,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz
);
create index if not exists stripe_events_status on stripe_events (status, received_at);

alter table stripe_events enable row level security;
-- no policy at all. Only the service role touches this table.

commit;
