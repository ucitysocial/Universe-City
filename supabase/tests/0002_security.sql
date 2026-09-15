-- Universe City. Security tests for 0002.
--
-- Run in the Supabase SQL editor after 0002. Each test asserts and raises on
-- failure, so a clean run means every one passed.
--
-- These impersonate a member and an agent by setting the request claims the
-- way PostgREST does. Nothing here needs the client.

begin;

-- ---------------------------------------------------------------- fixtures
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
declare a uuid := '22222222-2222-2222-2222-222222222222';
begin
  delete from profiles where id in (m, a);
  insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, aud, role)
  values (m, 'test.member@uc.test', '', now(), '{}', '{"name":"Test Member"}', 'authenticated', 'authenticated'),
         (a, 'test.agent@uc.test',  '', now(), '{}', '{"name":"Test Agent"}',  'authenticated', 'authenticated')
  on conflict (id) do nothing;
  -- the signup trigger made the profiles. Promote one and mark both as test.
  update profiles set role = 'agent', is_test = true where id = a;
  update profiles set is_test = true, membership = 'active' where id = m;
end $$;

create or replace function uc_as(uid uuid) returns void
language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true),
         set_config('role', 'authenticated', true);
$$;

create or replace function uc_as_service() returns void
language sql as $$
  select set_config('request.jwt.claims', '', true), set_config('role', 'postgres', true);
$$;

-- ================================================================
-- TEST 1. A member cannot make themselves an agent.
-- ================================================================
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
declare failed boolean := false;
begin
  perform uc_as(m);
  begin
    update profiles set role = 'agent' where id = m;
  exception when others then failed := true;
  end;
  perform uc_as_service();
  if not failed or (select role from profiles where id = m) = 'agent' then
    raise exception 'TEST 1 FAILED. A member escalated to agent.';
  end if;
  raise notice 'TEST 1 passed. Role is protected.';
end $$;

-- ================================================================
-- TEST 2. A member cannot mark themselves paid.
-- ================================================================
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
declare failed boolean := false;
begin
  perform uc_as_service();
  update profiles set membership = 'none' where id = m;
  perform uc_as(m);
  begin
    update profiles set membership = 'active' where id = m;
  exception when others then failed := true;
  end;
  perform uc_as_service();
  if not failed or (select membership from profiles where id = m) = 'active' then
    raise exception 'TEST 2 FAILED. A member granted themselves membership.';
  end if;
  update profiles set membership = 'active' where id = m;
  raise notice 'TEST 2 passed. Membership is protected.';
end $$;

-- ================================================================
-- TEST 3. Name and city are theirs. The guard is per column, not per row.
-- ================================================================
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
begin
  perform uc_as(m);
  update profiles set name = 'Renamed', city = 'Denver', timezone = 'America/Denver' where id = m;
  perform uc_as_service();
  if (select name from profiles where id = m) <> 'Renamed' then
    raise exception 'TEST 3 FAILED. A member cannot edit their own name.';
  end if;
  raise notice 'TEST 3 passed. Member editable columns still work.';
end $$;

-- ================================================================
-- TEST 4. The correction test. A member updates a block, the revision
--         appears automatically, and they cannot touch it afterwards.
-- ================================================================
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
declare b uuid;
declare n int;
declare failed boolean;
begin
  perform uc_as(m);
  insert into blocks (user_id, date, starts_at, ends_at, label, kind, status, paid)
  values (m, current_date, '14:00', '22:00', 'Work at ROK', 'paid_work', 'observed', 'paid')
  returning id into b;

  update blocks set ends_at = '22:45' where id = b;          -- "I actually left at 10:45"

  select count(*) into n from block_revisions where block_id = b;
  if n <> 1 then raise exception 'TEST 4 FAILED. Expected one revision, found %', n; end if;

  if (select (before->>'ends_at') from block_revisions where block_id = b) <> '22:00'
     or (select (after->>'ends_at') from block_revisions where block_id = b) <> '22:45' then
    raise exception 'TEST 4 FAILED. The revision did not capture before and after.';
  end if;

  if (select count(*) from blocks where id = b) <> 1 then
    raise exception 'TEST 4 FAILED. A correction created a second block.';
  end if;

  failed := false;
  begin
    update block_revisions set after = '{}'::jsonb where block_id = b;
  exception when others then failed := true; end;
  if not failed then raise exception 'TEST 4 FAILED. A member rewrote their own audit trail.'; end if;

  failed := false;
  begin
    delete from block_revisions where block_id = b;
  exception when others then failed := true; end;
  if not failed then raise exception 'TEST 4 FAILED. A member deleted a revision.'; end if;

  perform uc_as_service();
  raise notice 'TEST 4 passed. Corrections revise, history is immutable.';
end $$;

-- ================================================================
-- TEST 5. Provenance. A member cannot claim their write came from AI.
-- ================================================================
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
declare b uuid;
begin
  perform uc_as(m);
  insert into blocks (user_id, date, starts_at, ends_at, label, kind, source)
  values (m, current_date, '09:00', '10:00', 'Claimed as AI', 'rest', 'ai')
  returning id into b;

  if (select source from blocks where id = b) <> 'member' then
    raise exception 'TEST 5 FAILED. A member set their own provenance to ai.';
  end if;

  update blocks set source = 'agent' where id = b;
  if (select source from blocks where id = b) <> 'member' then
    raise exception 'TEST 5 FAILED. A member changed provenance to agent.';
  end if;

  if (select origin from block_revisions where block_id = b order by at desc limit 1) <> 'member' then
    raise exception 'TEST 5 FAILED. The revision recorded the wrong origin.';
  end if;

  perform uc_as_service();
  raise notice 'TEST 5 passed. Provenance describes who actually wrote it.';
end $$;

-- ================================================================
-- TEST 6. A member cannot approve their own proposal.
-- ================================================================
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
declare a uuid := '22222222-2222-2222-2222-222222222222';
declare p uuid;
declare failed boolean := false;
begin
  perform uc_as_service();
  insert into proposals (user_id, kind, payload, reason, origin)
  values (m, 'block.create', '{"label":"Sunday work"}', 'Sounded like they worked Sunday', 'ai')
  returning id into p;

  perform uc_as(m);
  begin
    update proposals set state = 'confirmed' where id = p;
  exception when others then failed := true; end;

  perform uc_as_service();
  if not failed and (select state from proposals where id = p) = 'confirmed' then
    raise exception 'TEST 6 FAILED. A member approved their own proposal.';
  end if;

  failed := false;
  perform uc_as(m);
  begin
    insert into proposals (user_id, kind, payload, origin)
    values (m, 'block.create', '{}', 'ai');
  exception when others then failed := true; end;
  perform uc_as_service();
  if not failed then
    raise exception 'TEST 6 FAILED. A member inserted a proposal.';
  end if;

  -- and an agent can, with the decision recorded
  perform uc_as(a);
  update proposals set state = 'confirmed' where id = p;
  perform uc_as_service();
  if (select decided_by from proposals where id = p) is distinct from a then
    raise exception 'TEST 6 FAILED. The decision did not record who made it.';
  end if;
  raise notice 'TEST 6 passed. Approval sits with the agent.';
end $$;

-- ================================================================
-- TEST 7. A member cannot write their own subscription.
-- ================================================================
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
declare failed boolean := false;
begin
  perform uc_as_service();
  insert into subscriptions (user_id, status) values (m, 'canceled')
  on conflict (user_id) do update set status = 'canceled';

  perform uc_as(m);
  begin
    update subscriptions set status = 'active' where user_id = m;
  exception when others then failed := true; end;

  perform uc_as_service();
  if not failed and (select status from subscriptions where user_id = m) = 'active' then
    raise exception 'TEST 7 FAILED. A member wrote their own subscription.';
  end if;

  failed := false;
  perform uc_as(m);
  begin
    insert into subscriptions (user_id, status) values (m, 'active')
    on conflict (user_id) do update set status = 'active';
  exception when others then failed := true; end;
  perform uc_as_service();
  if not failed then raise exception 'TEST 7 FAILED. A member inserted a subscription.'; end if;

  -- but they can read it
  perform uc_as(m);
  if (select count(*) from subscriptions where user_id = m) <> 1 then
    raise exception 'TEST 7 FAILED. A member cannot read their own subscription.';
  end if;
  perform uc_as_service();
  raise notice 'TEST 7 passed. Subscriptions come from Stripe only.';
end $$;

-- ================================================================
-- TEST 8. One member cannot see another. RLS, not the interface.
-- ================================================================
do $$
declare m uuid := '11111111-1111-1111-1111-111111111111';
declare a uuid := '22222222-2222-2222-2222-222222222222';
declare other uuid := '33333333-3333-3333-3333-333333333333';
declare n int;
begin
  perform uc_as_service();
  insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, aud, role)
  values (other, 'other@uc.test', '', now(), '{}', '{"name":"Other"}', 'authenticated', 'authenticated')
  on conflict (id) do nothing;
  update profiles set is_test = true where id = other;
  insert into blocks (user_id, date, starts_at, ends_at, label, kind)
  values (other, current_date, '08:00', '09:00', 'Not yours', 'rest');

  perform uc_as(m);
  select count(*) into n from blocks where user_id = other;
  if n <> 0 then raise exception 'TEST 8 FAILED. A member read another member''s blocks.'; end if;

  select count(*) into n from profiles where id = other;
  if n <> 0 then raise exception 'TEST 8 FAILED. A member read another member''s profile.'; end if;

  -- the agent can, because representing them is the job
  perform uc_as(a);
  select count(*) into n from blocks where user_id = other;
  if n <> 1 then raise exception 'TEST 8 FAILED. The agent cannot read a member record.'; end if;

  -- but cannot delete it
  declare failed boolean := false;
  begin
    delete from blocks where user_id = other;
  exception when others then failed := true; end;
  if not failed and (select count(*) from blocks where user_id = other) = 0 then
    raise exception 'TEST 8 FAILED. The agent deleted a member record.';
  end if;

  perform uc_as_service();
  raise notice 'TEST 8 passed. Isolation holds at the database.';
end $$;

-- ---------------------------------------------------------------- clean up
rollback;   -- nothing here is kept. Change to commit only if you want the fixtures.
