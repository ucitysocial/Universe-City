-- TECHNICAL PROPOSAL. Folder 01 Time Operations, Appendix B.
-- Reference queries for the twenty questions in TIME.md section 12.
-- Not approved. Written to prove that each question is answered from the
-- structured File alone. The repository calculates its week figures in
-- TypeScript, in lib/domain/time.ts. The language of the final code is open.

create or replace function uc_min(t text) returns int
language sql immutable as $$ select split_part(t, ':', 1)::int * 60 + split_part(t, ':', 2)::int $$;

-- Whether a recurring item falls on one date, for the subset of rules the proposal permits.
-- An interval is counted from the day the item took effect: in days, in weeks that start on Sunday, or in months.
create or replace function uc_item_on(p_rule text, p_from date, p_to date, p_date date) returns boolean
language sql immutable as $$
  with r as (
    select coalesce(substring(p_rule from 'INTERVAL=([0-9]+)')::int, 1) as n,
           substring(p_rule from 'BYDAY=([A-Z,]+)') as byday,
           substring(p_rule from 'BYMONTHDAY=([0-9,]+)') as bymonthday,
           substring(p_rule from 'UNTIL=([0-9]{8})') as until
  )
  select case
    when p_date < p_from or (p_to is not null and p_date > p_to) then false
    when r.until is not null and p_date > to_date(r.until, 'YYYYMMDD') then false
    when p_rule ~ '^FREQ=DAILY' then (p_date - p_from) % r.n = 0
    when p_rule ~ '^FREQ=WEEKLY' then
      (((p_date - extract(dow from p_date)::int) - (p_from - extract(dow from p_from)::int)) / 7) % r.n = 0
      and case when r.byday is not null
               then (array['SU','MO','TU','WE','TH','FR','SA'])[extract(dow from p_date)::int + 1] = any (string_to_array(r.byday, ','))
               else extract(dow from p_date) = extract(dow from p_from) end
    when p_rule ~ '^FREQ=MONTHLY' then
      ((extract(year from p_date) * 12 + extract(month from p_date)) - (extract(year from p_from) * 12 + extract(month from p_from)))::int % r.n = 0
      and case when r.bymonthday is not null
               then extract(day from p_date)::int::text = any (string_to_array(r.bymonthday, ','))
               else extract(day from p_date) = extract(day from p_from) end
    else false end
    from r
$$;

-- Every live block of a client in a date range, with minutes from the start of its own day.
create or replace view time_block_minutes with (security_invoker = true) as
  select b.*, uc_min(b.starts_at) as s, case when b.ends_at is null then null else uc_min(b.ends_at) end as e,
         case when b.kind in ('people', 'rest', 'building') then 'free'
              when b.kind in ('sleep', 'getting_ready', 'travel') then 'necessary'
              else 'committed' end as klass
    from blocks b
   where b.removed_at is null;

-- Every period on file for one day, in minutes of that day: the blocks of the day, a block that started the day
-- before and passes midnight, and each recurring item that falls on the day and has no block written for it yet.
create or replace function tq_day_periods(p_user uuid, p_date date)
returns table (label text, s int, e int, status text, origin text, movable boolean, is_commitment boolean, kind text)
language sql stable as $$
  select b.label, b.s, b.e, b.status::text, 'block', c.movable, c.id is not null, b.kind
    from time_block_minutes b left join commitments c on c.block_id = b.id and c.withdrawn_at is null
   where b.user_id = p_user and b.date = p_date and b.e is not null
  union all
  select b.label, 0, b.e - 1440, b.status::text, 'block from the day before', null, false, b.kind
    from time_block_minutes b where b.user_id = p_user and b.date = p_date - 1 and b.e > 1440
  union all
  select i.label, uc_min(i.starts_at) - d.shift, uc_min(i.ends_at) - d.shift, 'estimated', 'schedule', i.movable, i.is_commitment, i.kind
    from schedule_items i
    cross join (values (p_date, 0), (p_date - 1, 1440)) d(day, shift)
   where i.user_id = p_user and i.starts_at is not null and i.ends_at is not null
     and uc_item_on(i.recurrence, i.effective_from, i.effective_to, d.day) is true
     and (d.shift = 0 or uc_min(i.ends_at) > 1440)
     and not exists (select 1 from blocks b where b.schedule_item_id = i.id and b.occurs_on = d.day)
$$;

-- Minutes covered by a set of blocks, with overlapping blocks counted once.
-- absolute minute = day number * 1440 + minute of the day, so a block that runs past midnight stays whole.
create or replace function tq_covered_minutes(p_user uuid, p_from date, p_to date, p_statuses text[],
                                              p_klass text default null, p_kinds text[] default null)
returns int language sql stable as $$
  with x as (
    select (date - p_from) * 1440 + s as a, (date - p_from) * 1440 + e as z
      from time_block_minutes
     where user_id = p_user and date between p_from and p_to and e is not null
       and status::text = any (p_statuses) and (p_klass is null or klass = p_klass)
       and (p_kinds is null or kind = any (p_kinds))
  ), o as (
    select a, z, max(z) over (order by a, z rows between unbounded preceding and 1 preceding) as prev_z from x
  ), g as (
    select a, z, sum(case when prev_z is null or a > prev_z then 1 else 0 end) over (order by a, z) as grp from o
  )
  select coalesce(sum(len), 0)::int from (select max(z) - min(a) as len from g group by grp) t
$$;

-- 12.10 and 12.16. The week figures, in minutes. The length of the week is read from the client's timezone,
-- so a week in which the clock changes holds 167 or 169 hours. A block is counted by its clock times.
create or replace function tq_week_figures(p_user uuid, p_week_start date)
returns table (week_minutes int, observed int, estimated int, planned int, accounted int, unaccounted int,
               controlled int, blocks_with_no_end int)
language sql stable as $$
  select (extract(epoch from ((p_week_start + 7)::timestamp at time zone z.tz) - (p_week_start::timestamp at time zone z.tz)) / 60)::int,
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['observed']),
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['estimated']),
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['planned', 'required', 'suggested']),
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['observed', 'estimated', 'planned', 'required', 'suggested']),
         (extract(epoch from ((p_week_start + 7)::timestamp at time zone z.tz) - (p_week_start::timestamp at time zone z.tz)) / 60)::int
           - tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['observed', 'estimated', 'planned', 'required', 'suggested']),
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['observed'], 'free'),
         (select count(*)::int from time_block_minutes where user_id = p_user
            and date between p_week_start and p_week_start + 6 and e is null)
    from (select coalesce((select timezone from profiles where id = p_user), 'America/Denver') as tz) z
$$;

-- 12.10. Where the controlled hours sit.
create or replace function tq_controlled_by_day(p_user uuid, p_week_start date)
returns table (day date, minutes int) language sql stable as $$
  select d::date, tq_covered_minutes(p_user, d::date, d::date, array['observed'], 'free')
    from generate_series(p_week_start, p_week_start + 6, interval '1 day') d order by 1
$$;

-- 12.11. The longest unbroken run of observed free time, and the day it starts on.
create or replace function tq_longest_unbroken(p_user uuid, p_week_start date)
returns table (day date, starts_at text, minutes int) language sql stable as $$
  with x as (
    select (date - p_week_start) * 1440 + s as a, (date - p_week_start) * 1440 + e as z
      from time_block_minutes
     where user_id = p_user and date between p_week_start and p_week_start + 6
       and e is not null and status = 'observed' and klass = 'free'
  ), o as (
    select a, z, max(z) over (order by a, z rows between unbounded preceding and 1 preceding) as prev_z from x
  ), g as (
    select a, z, sum(case when prev_z is null or a > prev_z then 1 else 0 end) over (order by a, z) as grp from o
  ), r as (select min(a) as a, max(z) as z from g group by grp)
  select p_week_start + (a / 1440), lpad((a % 1440 / 60)::text, 2, '0') || ':' || lpad((a % 60)::text, 2, '0'), z - a
    from r order by z - a desc, a limit 1
$$;

-- 12.2 and 12.3. Each commitment on the Plans of a date range, with its four outcome fields.
create or replace function tq_plan_outcomes(p_user uuid, p_from date, p_to date)
returns table (plan_date date, confirmed boolean, label text, planned_start text, plan_state text,
               execution text, timing text, consequences text, alternative_used boolean,
               added_after_confirmation boolean, steps_reported int, steps_not_needed int, steps_live int)
language sql stable as $$
  select p.date, p.confirmed_at is not null, c.label, i.planned_start, i.state,
         c.execution::text, c.timing_outcome::text, c.consequences::text, c.alternative_id is not null,
         p.confirmed_at is not null and i.created_at > p.confirmed_at,
         (select count(*)::int from commitment_steps s where s.commitment_id = c.id and s.removed_at is null and s.state = 'reported_done'),
         (select count(*)::int from commitment_steps s where s.commitment_id = c.id and s.removed_at is null and s.state = 'not_needed'),
         (select count(*)::int from commitment_steps s where s.commitment_id = c.id and s.removed_at is null
            and (not s.suggested or s.accepted_at is not null))
    from plans p
    join plan_items i on i.plan_id = p.id
    join commitments c on c.id = i.commitment_id
   where p.user_id = p_user and p.date between p_from and p_to
   order by p.date, i.planned_start nulls last, i.position nulls last, c.created_at
$$;

-- 12.4. What is still open from commitments already executed.
create or replace function tq_open_after_executed(p_user uuid)
returns table (commitment text, open_kind text, what text, owner text) language sql stable as $$
  select c.label, 'follow up', f.next_action, f.owner::text
    from commitments c join follow_ups f on f.from_commitment_id = c.id
   where c.user_id = p_user and c.execution = 'executed' and f.status = 'open'
  union all
  select c.label, 'follow through with no result', t.action, t.owner::text
    from commitments c join commitment_follow_through t on t.commitment_id = c.id
   where c.user_id = p_user and c.execution = 'executed'
     and t.result_commitment_id is null and t.result_follow_up_id is null
  union all
  select c.label, 'commitment in the same ongoing work', c2.label, 'resident'
    from commitments c join commitments c2 on c2.ongoing_work_id = c.ongoing_work_id and c2.id <> c.id
   where c.user_id = p_user and c.execution = 'executed' and c2.execution = 'planned' and c2.withdrawn_at is null
   order by 1, 2
$$;

-- 12.5. What is coming up, and what each commitment needs from the client.
-- Three sources: a commitment on a Plan, a dated commitment on a day with no Plan, and a recurring
-- commitment of the schedule on a day for which no occurrence is written yet.
create or replace function tq_coming_up(p_user uuid, p_today date, p_days int default 7)
returns table (day date, label text, planned_start text, origin text, needs text[]) language sql stable as $$
  with needs as (
    select c.id,
           case when c.travel_needed is null and not exists
                  (select 1 from blocks b where b.cost_of = c.block_id and b.kind = 'travel' and b.removed_at is null)
                then 'how the client is getting there' end as travel,
           case when exists (select 1 from follow_ups f where f.from_commitment_id = c.id and f.status = 'open' and f.owner = 'resident')
                then 'an open follow up owned by the client' end as follow_up
      from commitments c where c.user_id = p_user and c.execution = 'planned' and c.withdrawn_at is null
  )
  select p.date, c.label, i.planned_start, 'the Plan',
         array_remove(array[case when i.planned_start is null then 'a time' end, n.travel, n.follow_up,
                            case when p.confirmed_at is null then 'the Plan for that day is not confirmed' end], null)
    from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
    join commitments c on c.id = i.commitment_id join needs n on n.id = c.id
   where p.user_id = p_user and p.date between p_today and p_today + p_days
  union all
  select b.date, c.label, b.starts_at, 'a dated commitment, with no Plan for the day',
         array_remove(array[n.travel, n.follow_up, 'no Plan is on file for that day'], null)
    from commitments c join blocks b on b.id = c.block_id and b.removed_at is null join needs n on n.id = c.id
   where c.user_id = p_user and b.date between p_today and p_today + p_days
     and not exists (select 1 from plan_items i where i.commitment_id = c.id)
  union all
  select d::date, s.label, s.starts_at, 'the schedule, estimated',
         array_remove(array[case when s.starts_at is null then 'a time' end, 'no Plan is on file for that day'], null)
    from schedule_items s cross join generate_series(p_today, p_today + p_days, interval '1 day') d
   where s.user_id = p_user and s.is_commitment
     and uc_item_on(s.recurrence, s.effective_from, s.effective_to, d::date) is true
     and not exists (select 1 from plans p where p.user_id = p_user and p.date = d::date)
     and not exists (select 1 from commitments c where c.schedule_item_id = s.id and c.occurs_on = d::date)
   order by 1, 3 nulls last, 2
$$;

-- 12.6. What is on file about moving one commitment.
create or replace function tq_move_effects(p_commitment uuid)
returns table (kind text, what text) language sql stable as $$
  select 'timing', case when c.movable is false then 'The client stated that the time cannot move'
                        when c.movable is true then 'The client stated that the time can move' ||
                             coalesce(', no later than ' || c.latest_date::text || coalesce(' ' || c.latest_time, ''), '')
                        else 'Whether the time can move is not established' end
    from commitments c where c.id = p_commitment
  union all
  select 'deadline', c.deadline_date::text || coalesce(' ' || c.deadline_time, '')
    from commitments c where c.id = p_commitment and c.deadline_date is not null
  union all
  select 'expected consequence', q.said from commitment_consequences q where q.commitment_id = p_commitment and q.kind = 'expected'
  union all
  select 'commitment it affects', c2.label from commitment_consequences q join commitments c2 on c2.id = q.affects_commitment_id
   where q.commitment_id = p_commitment and q.kind = 'expected'
  union all
  select 'cost block that moves with it', b.label || ' ' || b.starts_at
    from commitments c join blocks b on b.cost_of = c.block_id where c.id = p_commitment and b.removed_at is null
  union all
  select 'minimum that applies', s.wording from commitment_standards cs join standards s on s.id = cs.standard_id
   where cs.commitment_id = p_commitment
  union all
  select 'follow through', t.action from commitment_follow_through t where t.commitment_id = p_commitment
$$;

-- 12.7. Open follow ups, by owner.
create or replace function tq_follow_ups(p_user uuid)
returns table (owner text, next_action text, need text, due_date date, from_commitment text) language sql stable as $$
  select f.owner::text, f.next_action, f.need, f.due_date, c.label
    from follow_ups f left join commitments c on c.id = f.from_commitment_id
   where f.user_id = p_user and f.status = 'open'
   order by f.owner, f.due_date nulls last, f.created_at
$$;

-- 12.8. What other folders have on the schedule in a date range.
create or replace function tq_from_other_folders(p_user uuid, p_from date, p_to date)
returns table (folder text, plan_date date, label text, planned_start text, execution text) language sql stable as $$
  select c.origin_folder, coalesce(p.date, b.date), c.label, coalesce(i.planned_start, b.starts_at), c.execution::text
    from commitments c
    left join plan_items i on i.commitment_id = c.id and i.state = 'on'
    left join plans p on p.id = i.plan_id
    left join blocks b on b.id = c.block_id
   where c.user_id = p_user and c.origin_folder is not null and c.withdrawn_at is null
     and coalesce(p.date, b.date) between p_from and p_to
   order by 1, 2, 4
$$;

-- 12.9. Which commitments keep changing. Grouped by the recurring item, then the ongoing work, then the commitment.
create or replace function tq_changing(p_user uuid, p_from date, p_to date)
returns table (what text, occurrences int, differed int, moved int, taken_off int, timing_changed int,
               did_not_happen int, partly int) language sql stable as $$
  with x as (
    select coalesce(si.label, ow.label, c.label) as what,
           coalesce(c.schedule_item_id, c.ongoing_work_id, c.id) as grp,
           c.id, c.execution, c.timing_outcome, i.state
      from commitments c
      join plan_items i on i.commitment_id = c.id
      join plans p on p.id = i.plan_id
      left join schedule_items si on si.id = c.schedule_item_id
      left join ongoing_work ow on ow.id = c.ongoing_work_id
     where c.user_id = p_user and p.date between p_from and p_to
  )
  select what, count(distinct id)::int,
         count(*) filter (where state <> 'on' or timing_outcome = 'changed' or execution in ('did_not_happen', 'partly_executed'))::int,
         count(*) filter (where state = 'moved')::int, count(*) filter (where state = 'taken_off')::int,
         count(*) filter (where timing_outcome = 'changed')::int,
         count(*) filter (where execution = 'did_not_happen')::int,
         count(*) filter (where execution = 'partly_executed')::int
    from x group by grp, what
  having count(*) filter (where state <> 'on' or timing_outcome = 'changed' or execution in ('did_not_happen', 'partly_executed')) > 1
   order by 3 desc
$$;

-- 12.9, second half. What changed each occurrence that differed: what differed, the basis, and the reason on file.
create or replace function tq_changing_reasons(p_user uuid, p_from date, p_to date)
returns table (what text, day date, differed text, basis text, reason text) language sql stable as $$
  select coalesce(si.label, ow.label, c.label), p.date,
         case when i.state = 'moved' then 'moved' when i.state = 'taken_off' then 'taken off the Plan'
              when c.execution = 'did_not_happen' then 'did not happen' when c.execution = 'partly_executed' then 'partly executed'
              else 'time changed' end,
         i.basis::text,
         (select r.reason from file_revisions r
           where r.reason is not null
             and ((r.table_name = 'plan_items' and r.row_id = i.id) or (r.table_name = 'commitments' and r.row_id = c.id))
           order by r.at desc limit 1)
    from commitments c
    join plan_items i on i.commitment_id = c.id
    join plans p on p.id = i.plan_id
    left join schedule_items si on si.id = c.schedule_item_id
    left join ongoing_work ow on ow.id = c.ongoing_work_id
   where c.user_id = p_user and p.date between p_from and p_to
     and (i.state <> 'on' or c.timing_outcome = 'changed' or c.execution in ('did_not_happen', 'partly_executed'))
   order by 1, 2
$$;

-- 12.12 and 12.13. What is on file in one period of one day, the schedule included.
create or replace function tq_overlaps(p_user uuid, p_date date, p_start text, p_end text)
returns table (label text, starts_at text, status text, origin text, movable boolean, is_commitment boolean)
language sql stable as $$
  select d.label, lpad((greatest(d.s, 0) / 60)::text, 2, '0') || ':' || lpad((greatest(d.s, 0) % 60)::text, 2, '0'),
         d.status, d.origin, d.movable, d.is_commitment
    from tq_day_periods(p_user, p_date) d
   where d.s < uc_min(p_end) and d.e > uc_min(p_start)
   order by d.s
$$;

-- 12.13. Periods of one day that no block and no recurring item covers, at least p_minutes long, between two times.
create or replace function tq_open_periods(p_user uuid, p_date date, p_from text, p_to text, p_minutes int)
returns table (starts_at text, ends_at text, minutes int) language sql stable as $$
  with x as (
    select greatest(s, uc_min(p_from)) as a, least(e, uc_min(p_to)) as z from tq_day_periods(p_user, p_date)
     where s < uc_min(p_to) and e > uc_min(p_from)
    union all select uc_min(p_from), uc_min(p_from)
    union all select uc_min(p_to), uc_min(p_to)
  ), o as (
    select a, z, max(z) over (order by a, z rows between unbounded preceding and 1 preceding) as prev_z from x
  )
  select lpad((prev_z / 60)::text, 2, '0') || ':' || lpad((prev_z % 60)::text, 2, '0'),
         lpad((a / 60)::text, 2, '0') || ':' || lpad((a % 60)::text, 2, '0'), a - prev_z
    from o where prev_z is not null and a - prev_z >= p_minutes order by prev_z
$$;

-- 12.14. What one commitment cost, with the blocks that exist because of it.
create or replace function tq_real_cost(p_commitment uuid)
returns table (part text, kind text, paid text, status text, minutes int) language sql stable as $$
  select 'the commitment', b.kind, b.paid::text, b.status::text, b.e - b.s
    from commitments c join time_block_minutes b on b.id = c.block_id where c.id = p_commitment
  union all
  select 'cost', k.kind, k.paid::text, k.status::text, k.e - k.s
    from commitments c join time_block_minutes k on k.cost_of = c.block_id where c.id = p_commitment
$$;

-- 12.15. For each day of a week: the minutes in committed blocks and in travel and getting ready, one figure
-- for each status, with a minute counted once. The three figures are never added.
create or replace function tq_day_load(p_user uuid, p_week_start date)
returns table (day date, observed int, estimated int, planned int, commitments int) language sql stable as $$
  select d::date,
         tq_covered_minutes(p_user, d::date, d::date, array['observed'], null, k.kinds),
         tq_covered_minutes(p_user, d::date, d::date, array['estimated'], null, k.kinds),
         tq_covered_minutes(p_user, d::date, d::date, array['planned', 'required', 'suggested'], null, k.kinds),
         (select count(*)::int from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
           where p.user_id = p_user and p.date = d::date)
    from generate_series(p_week_start, p_week_start + 6, interval '1 day') d
    cross join (select array['paid_work', 'unpaid_work', 'household', 'caring', 'appointment', 'travel', 'getting_ready'] as kinds) k
   order by 2 desc, 3 desc, 4 desc, 1
$$;

-- 12.17. The assumed length of one kind of block, each observed length, and each length software measured.
create or replace function tq_assumed_and_observed(p_user uuid, p_kind text, p_from date, p_to date)
returns table (assumed_minutes int, observed_count int, observed_low int, observed_middle numeric, observed_high int,
               estimated_count int, measured_count int, measured_middle numeric) language sql stable as $$
  select (select uc_min(ends_at) - uc_min(starts_at) from schedule_items
           where user_id = p_user and kind = p_kind and starts_at is not null and ends_at is not null
             and effective_to is null order by effective_from desc limit 1),
         count(*) filter (where status = 'observed')::int,
         min(e - s) filter (where status = 'observed'),
         percentile_cont(0.5) within group (order by e - s) filter (where status = 'observed'),
         max(e - s) filter (where status = 'observed'),
         count(*) filter (where status <> 'observed')::int,
         (select count(*)::int from commitments c join blocks b on b.id = c.block_id
           where c.user_id = p_user and b.kind = p_kind and b.date between p_from and p_to
             and c.measured_start is not null and c.measured_end is not null),
         (select percentile_cont(0.5) within group (order by extract(epoch from (c.measured_end - c.measured_start)) / 60)
            from commitments c join blocks b on b.id = c.block_id
           where c.user_id = p_user and b.kind = p_kind and b.date between p_from and p_to
             and c.measured_start is not null and c.measured_end is not null)
    from time_block_minutes
   where user_id = p_user and kind = p_kind and date between p_from and p_to and e is not null
$$;

-- 12.18. The next step. The commitment is selected in this order: the one planned for the current time, the next
-- one by planned time, then one with no time set, by its deadline and then by whether a consequence is on file.
-- A step the client skipped in the session is passed over. It stays open.
create or replace function tq_next_step(p_user uuid, p_today date, p_now text, p_skipped uuid[] default '{}')
returns table (commitment text, step text, step_position int, basis text) language sql stable as $$
  with cur as (
    select c.id, c.label, i.planned_start, i.planned_end, i.position, c.deadline_date,
           exists (select 1 from commitment_consequences x where x.commitment_id = c.id and x.kind = 'expected') as has_consequence,
           case when i.planned_start is not null and uc_min(i.planned_start) <= uc_min(p_now)
                 and (i.planned_end is null or uc_min(i.planned_end) > uc_min(p_now)) then 0
                when i.planned_start is not null then 1 else 2 end as rank
      from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
      join commitments c on c.id = i.commitment_id
     where p.user_id = p_user and p.date = p_today and c.execution = 'planned' and c.withdrawn_at is null
       and (i.planned_end is null or uc_min(i.planned_end) > uc_min(p_now))
  )
  select cur.label, s.label, s.position,
         case cur.rank when 0 then 'the commitment planned for this time'
              when 1 then 'the next commitment by planned time'
              else case when cur.deadline_date is not null then 'a commitment with no time set and a deadline'
                        when cur.has_consequence then 'a commitment with no time set and a consequence on file'
                        else 'a commitment with no time set' end end
    from cur
    left join lateral (
      select id, label, position from commitment_steps
       where commitment_id = cur.id and removed_at is null and state = 'open'
         and (not suggested or accepted_at is not null) and not (id = any (p_skipped))
       order by position limit 1) s on true
   order by cur.rank, cur.planned_start nulls last, cur.deadline_date nulls last, cur.has_consequence desc, cur.position nulls last
   limit 1
$$;

-- 12.19. Time left before the next commitment that cannot move, with its travel and preparation.
create or replace function tq_time_left(p_user uuid, p_today date, p_now text)
returns table (next_fixed text, starts_at text, cost_minutes int, cost_status text, leave_by text,
               minutes_left int, travel_on_file boolean) language sql stable as $$
  with f as (
    select c.id, c.label, c.block_id, c.travel_needed, i.planned_start
      from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
      join commitments c on c.id = i.commitment_id
     where p.user_id = p_user and p.date = p_today and c.movable is false and c.withdrawn_at is null
       and c.execution = 'planned' and i.planned_start is not null and uc_min(i.planned_start) > uc_min(p_now)
     order by uc_min(i.planned_start) limit 1
  ), k as (
    select coalesce(sum(b.e - b.s), 0)::int as m,
           case when count(*) = 0 then null
                when bool_and(b.status = 'observed') then 'observed'
                when bool_or(b.status = 'planned') then 'planned' else 'estimated' end as st,
           bool_or(b.kind = 'travel') as has_travel
      from f join time_block_minutes b on b.cost_of = f.block_id and b.date = p_today
     where b.e is not null and b.e <= uc_min(f.planned_start)
  )
  select f.label, f.planned_start, k.m, k.st,
         lpad(((uc_min(f.planned_start) - k.m) / 60)::text, 2, '0') || ':' || lpad(((uc_min(f.planned_start) - k.m) % 60)::text, 2, '0'),
         uc_min(f.planned_start) - k.m - uc_min(p_now),
         coalesce(k.has_travel, false) or f.travel_needed is false
    from f, k
$$;

-- The open work that the Plan places before the time to leave, with the planned minutes that remain.
--   Planned to start later than now: its whole planned length.
--   Planned for the current time: from now to its planned end.
--   Its planned end has passed and no outcome is on file: not counted. Silence proves nothing. TIME.md 8.9.
--   The count of such commitments is returned, so the answer can state it.
-- An empty length is never read as zero. The count of such commitments is returned beside the total.
create or replace function tq_open_work(p_user uuid, p_today date, p_now text)
returns table (minutes_left int, leave_by text, open_minutes int, open_with_no_length int, earlier_with_no_outcome int, behind boolean)
language sql stable as $$
  with t as (select * from tq_time_left(p_user, p_today, p_now)),
  w as (
    select c.id,
           i.planned_end is not null and uc_min(i.planned_end) <= uc_min(p_now) as earlier,
           case when i.planned_end is null and c.duration_minutes is null then null
                when uc_min(i.planned_start) <= uc_min(p_now) and i.planned_end is not null and uc_min(i.planned_end) > uc_min(p_now)
                  then uc_min(i.planned_end) - uc_min(p_now)
                else coalesce(c.duration_minutes, uc_min(i.planned_end) - uc_min(i.planned_start)) end as remaining
      from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
      join commitments c on c.id = i.commitment_id, t
     where p.user_id = p_user and p.date = p_today and c.execution = 'planned' and c.withdrawn_at is null
       and i.planned_start is not null and uc_min(i.planned_start) < uc_min(t.leave_by)
       and not exists (select 1 from blocks b where b.id = c.block_id and b.cost_of is not null)
  )
  select t.minutes_left, t.leave_by,
         coalesce(sum(w.remaining) filter (where not w.earlier), 0)::int,
         count(*) filter (where w.id is not null and not w.earlier and w.remaining is null)::int,
         count(*) filter (where w.earlier)::int,
         case when count(*) filter (where w.id is not null and not w.earlier and w.remaining is null) > 0 then null
              else coalesce(sum(w.remaining) filter (where not w.earlier), 0) > t.minutes_left end
    from t left join w on true group by t.minutes_left, t.leave_by
$$;

-- 12.20. What still fits before the next commitment that cannot move. The free minutes are the minutes left,
-- less the open work the Plan already places before the time to leave. A candidate is an open commitment
-- with no time set, or one planned for later in the day whose time is not fixed.
create or replace function tq_what_fits(p_user uuid, p_today date, p_now text)
returns table (label text, minutes int, free_minutes int, fits boolean) language sql stable as $$
  with o as (select * from tq_open_work(p_user, p_today, p_now)),
  f as (select o.leave_by, case when o.open_with_no_length > 0 then null else greatest(o.minutes_left - o.open_minutes, 0) end as free from o)
  select c.label,
         coalesce(c.duration_minutes, case when i.planned_end is not null then uc_min(i.planned_end) - uc_min(i.planned_start) end),
         f.free,
         coalesce(c.duration_minutes, case when i.planned_end is not null then uc_min(i.planned_end) - uc_min(i.planned_start) end) <= f.free
    from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
    join commitments c on c.id = i.commitment_id, f
   where p.user_id = p_user and p.date = p_today and c.execution = 'planned' and c.withdrawn_at is null
     and c.movable is distinct from false
     and (i.planned_start is null or uc_min(i.planned_start) >= uc_min(f.leave_by))
     and not exists (select 1 from blocks b where b.id = c.block_id and b.cost_of is not null)
   order by 4 desc nulls last, 2 nulls last, 1
$$;

-- 12.21. What changed on the schedule in a period. Reads the two histories.
create or replace function tq_schedule_changes(p_user uuid, p_from timestamptz, p_to timestamptz)
returns table (at timestamptz, entry text, label text, changed text, was text, became text,
               who text, basis text, reason text) language sql stable as $$
  select r.at, 'block', r.after->>'label', k.key, r.before->>k.key, r.after->>k.key, r.origin::text, r.basis, r.reason
    from block_revisions r cross join lateral jsonb_object_keys(r.after) k(key)
   where r.user_id = p_user and r.at >= p_from and r.at < p_to
     and k.key not in ('updated_at') and r.before->k.key is distinct from r.after->k.key
  union all
  select r.at, r.table_name, coalesce(r.after->>'label', r.after->>'next_action', r.table_name), k.key,
         r.before->>k.key, r.after->>k.key, r.origin::text, r.basis, r.reason
    from file_revisions r cross join lateral jsonb_object_keys(r.after) k(key)
   where r.user_id = p_user and r.at >= p_from and r.at < p_to
     and r.table_name in ('commitments', 'plan_items', 'schedule_items', 'plans')
     and k.key in ('block_id', 'state', 'planned_start', 'planned_end', 'starts_at', 'ends_at', 'recurrence',
                   'withdrawn_at', 'required_date', 'required_start', 'effective_to', 'confirmed_at')
     and r.before->k.key is distinct from r.after->k.key
  union all
  select b.created_at, 'block', b.label, 'added', null, b.starts_at || coalesce(' to ' || b.ends_at, ''), b.source::text, null, null
    from blocks b where b.user_id = p_user and b.created_at >= p_from and b.created_at < p_to
   order by 1
$$;
