import { fresh, as, svc, people, attempt } from './base.mjs';
import fs from 'fs';
const db = await fresh(); const { r, a } = await people(db);
for (const f of ['time_core.proposed.sql','time_queries.proposed.sql']) {
  try { await db.exec(fs.readFileSync(new URL('./'+f, import.meta.url),'utf8')); } catch (e) { console.log('FAILED', f, e.message); process.exit(1); }
}
await svc(db); await db.exec(`grant all on all tables in schema public to authenticated, service_role;`);
const q = async (sql) => (await db.query(sql)).rows;
const one = async (sql) => (await q(sql))[0];
const R = []; const rec = (id, pass, got) => { R.push({ id, pass, got }); console.log(pass ? 'PASS' : 'FAIL', id, typeof got === 'string' ? got : JSON.stringify(got)); };
const eq = (x, y) => JSON.stringify(x) === JSON.stringify(y);
await as(db, r);
const blk = async (date, s, e, label, kind, status, extra = {}) => (await one(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status,paid,cost_of,schedule_item_id,occurs_on) values ('${r}','${date}','${s}',${e ? `'${e}'` : 'null'},'${label}','${kind}','${status}','${extra.paid||'none'}',${extra.cost_of ? `'${extra.cost_of}'` : 'null'},${extra.item ? `'${extra.item}'` : 'null'},${extra.item ? `'${date}'` : 'null'}) returning id`)).id;
const ins = async (table, o) => { const k = Object.keys(o).filter(x => o[x] !== undefined && o[x] !== null); return (await one(`insert into ${table}(${k.join(',')}) values (${k.map(x => typeof o[x] === 'string' ? `'${o[x].replace(/'/g, "''")}'` : o[x]).join(',')}) returning *`)); };
// the schedule
const siShift = (await ins('schedule_items', { user_id: r, label: 'Shift', kind: 'paid_work', paid: 'paid', starts_at: '09:00', ends_at: '17:00', recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', recurrence_said: 'Monday to Friday, nine to five', movable: false, effective_from: '2026-09-01' })).id;
const siReady = (await ins('schedule_items', { user_id: r, label: 'Getting ready', kind: 'getting_ready', starts_at: '07:30', ends_at: '08:30', recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', effective_from: '2026-09-01' })).id;
const siGym = (await ins('schedule_items', { user_id: r, label: 'Gym', kind: 'rest', starts_at: '21:15', ends_at: '22:15', recurrence: 'FREQ=WEEKLY;BYDAY=TU,TH', effective_from: '2026-09-01' })).id;
await ins('schedule_items', { user_id: r, label: 'Travel to the shift', kind: 'travel', paid: 'unpaid', starts_at: '08:30', ends_at: '09:00', recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', is_commitment: false, cost_of: siShift, effective_from: '2026-09-01' });
const bad = await attempt(db, `insert into schedule_items(user_id,label,kind,recurrence) values ('${r}','x','rest','every other full moon')`);
rec('T-SCH-01 a recurrence outside the permitted subset is refused', !bad.ok, bad.err || '');
const laundry = (await ins('ongoing_work', { user_id: r, label: 'Laundry', recurrence_said: 'Every Saturday', folder: 'Sanitation' })).id;

// LAST WEEK, October 4 to October 10, 2026
await blk('2026-10-04', '12:00', '13:00', 'Rest', 'rest', 'estimated');
await blk('2026-10-04', '23:00', '31:00', 'Sleep', 'sleep', 'estimated');
// Monday
await blk('2026-10-05', '07:30', '08:15', 'Getting ready', 'getting_ready', 'observed', { item: siReady });
const shMon = await blk('2026-10-05', '09:00', '17:00', 'Shift', 'paid_work', 'observed', { paid: 'paid', item: siShift });
await blk('2026-10-05', '08:30', '09:00', 'Travel to the shift', 'travel', 'observed', { paid: 'unpaid', cost_of: shMon });
await blk('2026-10-05', '17:00', '17:40', 'Travel home', 'travel', 'observed', { paid: 'unpaid', cost_of: shMon });
const grMon = await blk('2026-10-05', '18:00', '19:00', 'Groceries', 'household', 'planned');
await blk('2026-10-05', '20:00', '22:00', 'Rest', 'rest', 'observed');
await blk('2026-10-05', '23:00', '31:00', 'Sleep', 'sleep', 'observed');
// Tuesday
await blk('2026-10-06', '07:30', '08:25', 'Getting ready', 'getting_ready', 'observed', { item: siReady });
const shTue = await blk('2026-10-06', '09:00', '17:00', 'Shift', 'paid_work', 'observed', { paid: 'paid', item: siShift });
await blk('2026-10-06', '08:30', '09:00', 'Travel to the shift', 'travel', 'observed', { paid: 'unpaid', cost_of: shTue });
await blk('2026-10-06', '17:00', '17:30', 'Travel home', 'travel', 'observed', { paid: 'unpaid', cost_of: shTue });
await blk('2026-10-06', '18:00', '21:00', 'My project', 'building', 'observed');
const gymTue = await blk('2026-10-06', '21:15', '22:15', 'Gym', 'rest', 'planned', { item: siGym });
await blk('2026-10-06', '23:00', '31:00', 'Sleep', 'sleep', 'observed');
// Wednesday: two observed blocks overlap by thirty minutes
await blk('2026-10-07', '07:30', '08:20', 'Getting ready', 'getting_ready', 'observed', { item: siReady });
await blk('2026-10-07', '09:00', '17:00', 'Shift', 'paid_work', 'estimated', { paid: 'paid', item: siShift });
await blk('2026-10-07', '18:30', '20:00', 'Dinner with a friend', 'people', 'observed');
await blk('2026-10-07', '19:30', '21:00', 'Rest', 'rest', 'observed');
// Thursday
const shThu = await blk('2026-10-08', '09:00', '17:00', 'Shift', 'paid_work', 'planned', { paid: 'paid', item: siShift });
const apThu = await blk('2026-10-08', '17:45', '18:30', 'Clinic appointment', 'appointment', 'planned');
const gymThu = await blk('2026-10-08', '21:15', '22:15', 'Gym', 'rest', 'planned', { item: siGym });
// Saturday
await blk('2026-10-10', '10:00', '14:00', 'My project', 'building', 'observed');
await blk('2026-10-10', '14:00', '16:00', 'Rest', 'rest', 'observed');
const washB = await blk('2026-10-10', '16:00', '16:30', 'Wash the clothes', 'household', 'observed');
await blk('2026-10-10', '09:00', null, 'Errand', 'household', 'estimated');

const com = (o) => ins('commitments', { user_id: r, ...o });
const out = { outcome_basis: 'resident_report', outcome_at: 'now()' };
const plan = async (date, confirmed = true) => (await ins('plans', { user_id: r, date, ...(confirmed ? { confirmed_at: '2026-10-04 20:00:00-06', daily_close_at: '21:00' } : {}) })).id;
const item = (plan_id, commitment_id, s, e, o = {}) => ins('plan_items', { plan_id, commitment_id, user_id: r, planned_start: s, planned_end: e, created_at: '2026-10-04 19:00:00-06', ...o });
const pMon = await plan('2026-10-05'), pTue = await plan('2026-10-06'), pThu = await plan('2026-10-08'), pSat = await plan('2026-10-10');
const cShMon = await com({ label: 'Shift', block_id: shMon, schedule_item_id: siShift, occurs_on: '2026-10-05', movable: false, basis: 'recurrence', execution: 'executed', timing_outcome: 'as_planned', ...out });
const cGr = await com({ label: 'Groceries', block_id: grMon, movable: true });
await item(pMon, cShMon.id, '09:00', '17:00'); await item(pMon, cGr.id, '18:00', '19:00');
// the client reports the groceries at Daily Close: 7:00 PM, no other commitment affected
await db.exec(`begin; select set_config('uc.reason','The client reported the time the groceries happened',true);
  update blocks set starts_at='19:00', ends_at='19:50', status='observed' where id='${grMon}';
  update commitments set execution='executed', timing_outcome='changed', actual_date='2026-10-05', actual_start='19:00', actual_end='19:50', consequences='none_confirmed', outcome_basis='resident_report', outcome_at=now() where id='${cGr.id}'; commit;`);
const cShTue = await com({ label: 'Shift', block_id: shTue, schedule_item_id: siShift, occurs_on: '2026-10-06', movable: false, basis: 'recurrence', execution: 'executed', timing_outcome: 'as_planned', ...out });
const cGymTue = await com({ label: 'Gym', block_id: gymTue, schedule_item_id: siGym, occurs_on: '2026-10-06', basis: 'recurrence' });
await item(pTue, cShTue.id, '09:00', '17:00'); const iGymTue = await item(pTue, cGymTue.id, '21:15', '22:15');
// Tuesday: the client takes the gym off the Plan before it is due
await db.exec(`begin; select set_config('uc.reason','The client decided to take the gym off the Plan',true); select set_config('uc.basis','resident_decision',true);
  update plan_items set state='taken_off', state_at=now(), basis='resident_decision' where id='${iGymTue.id}';
  update commitments set withdrawn_at=now(), withdrawn_basis='resident_decision' where id='${cGymTue.id}';
  update blocks set removed_at=now(), removed_reason='Taken off the Plan by the client' where id='${gymTue}'; commit;`);
const cShThu = await com({ label: 'Shift', block_id: shThu, schedule_item_id: siShift, occurs_on: '2026-10-08', movable: false, basis: 'recurrence' });
const cAp = await com({ label: 'Clinic appointment', block_id: apThu, origin_folder: 'Health', movable: false });
const cGymThu = await com({ label: 'Gym', block_id: gymThu, schedule_item_id: siGym, occurs_on: '2026-10-08', basis: 'recurrence' });
await item(pThu, cShThu.id, '09:00', '17:00'); await item(pThu, cAp.id, '17:45', '18:30'); await item(pThu, cGymThu.id, '21:15', '22:15');
for (const [c, b] of [[cAp.id, apThu], [cGymThu.id, gymThu]])
  await db.exec(`update commitments set execution='did_not_happen', outcome_basis='resident_report', outcome_at=now() where id='${c}';
                 update blocks set removed_at=now(), removed_reason='The client reported that it did not happen' where id='${b}';`);
const cWash = await com({ label: 'Wash the clothes', block_id: washB, ongoing_work_id: laundry, execution: 'executed', timing_outcome: 'as_planned', ...out });
const cDry = await com({ label: 'Dry the clothes', ongoing_work_id: laundry });
await item(pSat, cWash.id, '16:00', '16:30'); await item(pSat, cDry.id, null, null);
await ins('commitment_follow_through', { commitment_id: cWash.id, user_id: r, action: 'Dry the clothes', owner: 'resident', ongoing_work_id: laundry, result_commitment_id: cDry.id });
await ins('follow_ups', { user_id: r, owner: 'resident', need: 'resident_action', next_action: 'Set a new time for the clinic appointment', from_commitment_id: cAp.id, folder: 'Health' });
await as(db, a);
await ins('follow_ups', { user_id: r, owner: 'agent', need: 'agent_action', next_action: 'Enter the grocery amount in Finance', from_commitment_id: cGr.id, folder: 'Finance' });
await as(db, r);

// TODAY SCENARIO: Monday October 12, 2026, 7:50 AM
await blk('2026-10-11', '23:00', '31:00', 'Sleep', 'sleep', 'estimated');
const rdy = await blk('2026-10-12', '07:30', '08:30', 'Getting ready', 'getting_ready', 'planned', { item: siReady });
const sh12 = await blk('2026-10-12', '09:00', '17:00', 'Shift', 'paid_work', 'planned', { paid: 'paid', item: siShift });
await blk('2026-10-12', '08:30', '09:00', 'Travel to the shift', 'travel', 'planned', { paid: 'unpaid', cost_of: sh12 });
const gr12 = await blk('2026-10-12', '18:00', '19:00', 'Groceries', 'household', 'planned');
const dn12 = await blk('2026-10-12', '19:30', '20:15', 'Cook dinner', 'household', 'planned');
await blk('2026-10-12', '23:00', '31:00', 'Sleep', 'sleep', 'estimated');
const p12 = await plan('2026-10-12');
const cRdy = await com({ label: 'Getting ready', block_id: rdy, schedule_item_id: siReady, occurs_on: '2026-10-12', basis: 'recurrence', steps_are_whole: true, travel_needed: false });
for (const [i, l] of ['Shower', 'Get dressed', 'Eat breakfast', 'Pack bag'].entries()) await ins('commitment_steps', { commitment_id: cRdy.id, user_id: r, label: l, position: i + 1 });
await db.exec(`update commitment_steps set state='reported_done', state_at=now() where commitment_id='${cRdy.id}' and position in (1,2)`);
const cSh12 = await com({ label: 'Shift', block_id: sh12, schedule_item_id: siShift, occurs_on: '2026-10-12', movable: false, basis: 'recurrence' });
const cBill = await com({ label: 'Pay the phone bill', duration_minutes: 15, deadline_date: '2026-10-13', travel_needed: false });
const cCall = await com({ label: 'Call the clinic' });
const cGr12 = await com({ label: 'Groceries', block_id: gr12, movable: true, latest_date: '2026-10-13', latest_time: '10:00', travel_needed: false });
const cDn12 = await com({ label: 'Cook dinner', block_id: dn12, travel_needed: false });
await item(p12, cRdy.id, '07:30', '08:30'); await item(p12, cSh12.id, '09:00', '17:00'); await item(p12, cBill.id, null, null);
await item(p12, cCall.id, null, null, { created_at: '2026-10-11 09:00:00-06' }); await item(p12, cGr12.id, '18:00', '19:00'); await item(p12, cDn12.id, '19:30', '20:15');
await ins('commitment_consequences', { commitment_id: cGr12.id, user_id: r, kind: 'expected', said: 'Dinner is late', affects_commitment_id: cDn12.id });
await ins('commitment_consequences', { commitment_id: cBill.id, user_id: r, kind: 'expected', said: 'The phone is cut off on October 14, 2026' });
// Tuesday October 13
await blk('2026-10-13', '09:00', '17:00', 'Shift', 'paid_work', 'planned', { paid: 'paid', item: siShift });
const cls = await blk('2026-10-13', '18:00', '20:00', 'Class', 'appointment', 'planned');
await com({ label: 'Class', block_id: cls, movable: false, origin_folder: 'Education' });
await blk('2026-10-13', '23:00', '31:00', 'Sleep', 'sleep', 'estimated');

// ---------------- the twenty questions ----------------
const W = '2026-10-04';
const fig = await one(`select * from tq_week_figures('${r}','${W}')`);
rec('Q-12.16 unaccounted minutes last week', eq(fig, { week_minutes: 10080, observed: 3090, estimated: 1020, planned: 480, accounted: 4590, unaccounted: 5490, controlled: 810, blocks_with_no_end: 1 }), fig);
const byDay = (await q(`select to_char(day,'Dy') d, minutes from tq_controlled_by_day('${r}','${W}') where minutes > 0`)).map(x => x.d + ' ' + x.minutes);
rec('Q-12.10 controlled minutes and where they sit', eq(byDay, ['Mon 120', 'Tue 180', 'Wed 150', 'Sat 360']), byDay);
const lu = await one(`select day::text, starts_at, minutes from tq_longest_unbroken('${r}','${W}')`);
rec('Q-12.11 longest unbroken block', eq(lu, { day: '2026-10-10', starts_at: '10:00', minutes: 360 }), lu);
const mon = await q(`select label, planned_start, execution, timing, consequences, added_after_confirmation a from tq_plan_outcomes('${r}','2026-10-05','2026-10-05')`);
rec('Q-12.2 did the day go as planned', eq(mon, [{ label: 'Shift', planned_start: '09:00', execution: 'executed', timing: 'as_planned', consequences: 'not_established', a: false }, { label: 'Groceries', planned_start: '18:00', execution: 'executed', timing: 'changed', consequences: 'none_confirmed', a: false }]), mon);
const wk = await q(`select execution, plan_state, count(*)::int n from tq_plan_outcomes('${r}','${W}','2026-10-10') group by 1,2 order by 1,2`);
rec('Q-12.3 the week by outcome', eq(wk, [{ execution: 'did_not_happen', plan_state: 'on', n: 2 }, { execution: 'executed', plan_state: 'on', n: 4 }, { execution: 'planned', plan_state: 'on', n: 2 }, { execution: 'planned', plan_state: 'taken_off', n: 1 }]), wk);
const op = await q(`select * from tq_open_after_executed('${r}')`);
rec('Q-12.4 open after executed', eq(op.map(x => x.commitment + ' / ' + x.open_kind + ' / ' + x.what + ' / ' + x.owner), ['Groceries / follow up / Enter the grocery amount in Finance / agent', 'Wash the clothes / commitment in the same ongoing work / Dry the clothes / resident']), op);
const added = (await q(`select label from tq_plan_outcomes('${r}','2026-10-12','2026-10-12') where added_after_confirmation`)).map(x => x.label);
rec('Q-12.2 a commitment added after the Plan was confirmed is marked', eq(added, ['Call the clinic']), added);
const cu = (await q(`select day::text d, label, planned_start s, origin, needs from tq_coming_up('${r}','2026-10-12', 1)`)).map(x => x.d.slice(5) + ' ' + x.label + (x.s ? ' ' + x.s : '') + ' [' + x.origin + ']: ' + (x.needs.join('; ') || 'nothing'));
rec('Q-12.5 coming up, two days', eq(cu, ['10-12 Getting ready 07:30 [the Plan]: nothing', '10-12 Shift 09:00 [the Plan]: nothing', '10-12 Groceries 18:00 [the Plan]: nothing', '10-12 Cook dinner 19:30 [the Plan]: nothing', '10-12 Call the clinic [the Plan]: a time; how the client is getting there', '10-12 Pay the phone bill [the Plan]: a time',
  '10-13 Getting ready 07:30 [the schedule, estimated]: no Plan is on file for that day', '10-13 Shift 09:00 [the schedule, estimated]: no Plan is on file for that day', '10-13 Class 18:00 [a dated commitment, with no Plan for the day]: how the client is getting there; no Plan is on file for that day', '10-13 Gym 21:15 [the schedule, estimated]: no Plan is on file for that day']), cu);
const mv = (await q(`select kind, what from tq_move_effects('${cGr12.id}')`)).map(x => x.kind + ': ' + x.what);
rec('Q-12.6 what moving the groceries affects', eq(mv, ['timing: The client stated that the time can move, no later than 2026-10-13 10:00', 'expected consequence: Dinner is late', 'commitment it affects: Cook dinner']), mv);
const mv2 = (await q(`select kind, what from tq_move_effects('${cCall.id}')`)).map(x => x.kind + ': ' + x.what);
rec('Q-12.6 missing data: nothing on file is stated as not established', eq(mv2, ['timing: Whether the time can move is not established']), mv2);
const fu = (await q(`select owner, next_action from tq_follow_ups('${r}')`)).map(x => x.owner + ': ' + x.next_action);
rec('Q-12.7 follow ups by owner', eq(fu, ['resident: Set a new time for the clinic appointment', 'agent: Enter the grocery amount in Finance']), fu);
const of = (await q(`select folder, plan_date::text d, label, execution from tq_from_other_folders('${r}','2026-10-04','2026-10-17')`)).map(x => `${x.folder} ${x.d} ${x.label} ${x.execution}`);
rec('Q-12.8 other folders on the schedule', eq(of, ['Education 2026-10-13 Class planned', 'Health 2026-10-08 Clinic appointment did_not_happen']), of);
const ch = await q(`select * from tq_changing('${r}','2026-10-04','2026-10-10')`);
rec('Q-12.9 commitments that keep changing', eq(ch, [{ what: 'Gym', occurrences: 2, differed: 2, moved: 0, taken_off: 1, timing_changed: 0, did_not_happen: 1, partly: 0 }]), ch);
const chr = (await q(`select what, day::text d, differed, basis, reason from tq_changing_reasons('${r}','2026-10-04','2026-10-10') where what = 'Gym'`)).map(x => `${x.d.slice(5)} ${x.differed} | ${x.basis} | ${x.reason}`);
rec('Q-12.9b what changed them', eq(chr, ['10-06 taken off the Plan | resident_decision | The client decided to take the gym off the Plan', '10-08 did not happen | null | null']), chr);
const ov = (await q(`select label, starts_at, origin, movable from tq_overlaps('${r}','2026-10-13','17:00','23:30')`)).map(x => `${x.label} ${x.starts_at} ${x.origin} movable:${x.movable}`);
rec('Q-12.12 a shift from 5:00 PM to 11:00 PM on October 13, with travel home', eq(ov, ['Class 18:00 block movable:false', 'Gym 21:15 schedule movable:null', 'Sleep 23:00 block movable:null']), ov);
const opn = (await q(`select starts_at || ' to ' || ends_at || ' ' || minutes m from tq_open_periods('${r}','2026-10-13','07:00','22:00',45)`)).map(x => x.m);
rec('Q-12.13 periods with no block and no recurring item on October 13', eq(opn, ['17:00 to 18:00 60', '20:00 to 21:15 75']), opn);
const opn2 = (await q(`select starts_at || ' to ' || ends_at m from tq_open_periods('${r}','2026-10-13','06:00','09:00',30)`)).map(x => x.m);
rec('Q-12.13 sleep that started the day before is counted', eq(opn2, ['07:00 to 07:30']), opn2);
const rc = await q(`select part, kind, paid, status, minutes from tq_real_cost('${cShMon.id}') order by part desc, minutes`);
rec('Q-12.14 what the Monday shift cost', rc.reduce((n, x) => n + x.minutes, 0) === 550 && rc.filter(x => x.paid === 'unpaid').reduce((n, x) => n + x.minutes, 0) === 70, rc.map(x => `${x.part} ${x.kind} ${x.paid} ${x.minutes}`));
const dl = (await q(`select to_char(day,'Dy') d, observed o, estimated e, planned p from tq_day_load('${r}','${W}') limit 5`)).map(x => `${x.d} ${x.o}/${x.e}/${x.p}`);
rec('Q-12.15 committed time by day: observed/estimated/planned', eq(dl, ['Mon 645/0/0', 'Tue 595/0/0', 'Wed 50/480/0', 'Sat 30/0/0', 'Thu 0/0/480']), dl);
const dst = await one(`select week_minutes from tq_week_figures('${r}','2026-11-01')`);
rec('Q-12.16b a week in which the clock changes', dst.week_minutes === 10140, dst);
const ao = await one(`select assumed_minutes a, observed_count n, observed_low lo, observed_middle::int mid, observed_high hi, estimated_count est from tq_assumed_and_observed('${r}','getting_ready','2026-10-04','2026-10-10')`);
rec('Q-12.17 getting ready, assumed and observed', eq(ao, { a: 60, n: 3, lo: 45, mid: 50, hi: 55, est: 0 }), ao);
const ns = await one(`select * from tq_next_step('${r}','2026-10-12','07:50')`);
rec('Q-12.18 next step at 7:50 AM', eq(ns, { commitment: 'Getting ready', step: 'Eat breakfast', step_position: 3, basis: 'the commitment planned for this time' }), ns);
const tl = await one(`select * from tq_time_left('${r}','2026-10-12','07:50')`);
rec('Q-12.19 time left at 7:50 AM', eq(tl, { next_fixed: 'Shift', starts_at: '09:00', cost_minutes: 30, cost_status: 'planned', leave_by: '08:30', minutes_left: 40, travel_on_file: true }), tl);
const ow = await one(`select * from tq_open_work('${r}','2026-10-12','07:50')`);
rec('Q-12.19c open work before the time to leave, on plan', eq(ow, { minutes_left: 40, leave_by: '08:30', open_minutes: 40, open_with_no_length: 0, earlier_with_no_outcome: 0, behind: false }), ow);
const ow2 = await one(`select minutes_left, open_minutes, earlier_with_no_outcome e, behind from tq_open_work('${r}','2026-10-12','08:45')`);
rec('Q-12.19d the time to leave has passed', eq(ow2, { minutes_left: -15, open_minutes: 0, e: 1, behind: true }), ow2);
const wf = (await q(`select label, minutes, free_minutes f, fits from tq_what_fits('${r}','2026-10-12','07:50')`)).map(x => `${x.label} ${x.minutes} free:${x.f} ${x.fits}`);
rec('Q-12.20a nothing fits while getting ready holds the time', eq(wf, ['Pay the phone bill 15 free:0 false', 'Cook dinner 45 free:0 false', 'Groceries 60 free:0 false', 'Call the clinic null free:0 null']), wf);
const skip = (await one(`select id from commitment_steps where commitment_id='${cRdy.id}' and position=3`)).id;
const ns2 = await one(`select step from tq_next_step('${r}','2026-10-12','07:50', array['${skip}']::uuid[])`);
rec('Q-12.18b a skipped step is passed over and stays open', ns2.step === 'Pack bag' && (await one(`select state from commitment_steps where id='${skip}'`)).state === 'open', ns2);
await db.exec(`update commitment_steps set state='reported_done', state_at=now() where commitment_id='${cRdy.id}' and position in (3,4)`);
const done = await one(`select execution from commitments where id='${cRdy.id}'`);
const wf2 = (await q(`select label, minutes, free_minutes f, fits from tq_what_fits('${r}','2026-10-12','07:50')`)).map(x => `${x.label} ${x.minutes} free:${x.f} ${x.fits}`);
rec('Q-12.20b after getting ready is reported, forty minutes are free', done.execution === 'executed' && eq(wf2, ['Pay the phone bill 15 free:40 true', 'Cook dinner 45 free:40 false', 'Groceries 60 free:40 false', 'Call the clinic null free:40 null']), wf2);
const ns3 = await one(`select commitment, basis from tq_next_step('${r}','2026-10-12','07:50')`);
rec('Q-12.18c with nothing planned for this time, the next commitment by planned time', eq(ns3, { commitment: 'Shift', basis: 'the next commitment by planned time' }), ns3);
const tl2 = await q(`select * from tq_time_left('${r}','2026-10-12','17:30')`);
rec('Q-12.19 missing data: no later commitment that cannot move', tl2.length === 0, tl2);
const sc = (await q(`select entry, label, changed, was, became, who, reason from tq_schedule_changes('${r}', now() - interval '1 hour', now() + interval '1 hour') where entry <> 'block' or changed <> 'added'`)).map(x => `${x.entry} ${x.label} ${x.changed}: ${x.was} -> ${String(x.became).slice(0, 10)} by ${x.who}${x.reason ? ' because ' + x.reason : ''}`);
console.log('Q-12.21 changes on file:'); sc.forEach(x => console.log('   ', x));
rec('Q-12.21 what changed on the schedule', sc.some(x => x.startsWith('block Groceries starts_at: 18:00 -> 19:00 by resident because The client reported the time')) && sc.some(x => x.includes('plan_items') && x.includes('taken_off') && x.includes('because The client decided')), sc.length + ' changes');
// the built week figures, for comparison
const built = await one(`select round(sum(case when status in ('observed','required') then (uc_min(ends_at)-uc_min(starts_at)) else 0 end)/60.0,1)::float o,
  round(sum(case when status not in ('observed','required') then (uc_min(ends_at)-uc_min(starts_at)) else 0 end)/60.0,1)::float e,
  round(sum(case when status='observed' and kind in ('people','rest','building') then (uc_min(ends_at)-uc_min(starts_at)) else 0 end)/60.0,1)::float f
  from blocks where user_id='${r}' and date between '2026-10-04' and '2026-10-10' and ends_at is not null and removed_at is null`);
console.log('built figures() on the same blocks, hours:', built, 'unaccounted', 168 - built.o - built.e, '| proposed: observed', 3090/60, 'estimated+planned', 1500/60, 'controlled', 810/60, 'unaccounted', 5490/60);
// an earlier commitment with no report is not counted as open work
const early = await blk('2026-10-12', '06:45', '07:15', 'Take out the trash', 'household', 'planned');
const cEarly = await com({ label: 'Take out the trash', block_id: early, travel_needed: false });
await item(p12, cEarly.id, '06:45', '07:15');
const ow3 = await one(`select minutes_left, open_minutes, earlier_with_no_outcome e, behind from tq_open_work('${r}','2026-10-12','07:50')`);
rec('Q-12.19e an earlier commitment with no report is not read as open work', eq(ow3, { minutes_left: 40, open_minutes: 0, e: 1, behind: false }), ow3);
// a recurring item on every second Saturday
await ins('schedule_items', { user_id: r, label: 'Market', kind: 'household', starts_at: '10:00', ends_at: '14:00', recurrence: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=SA', effective_from: '2026-10-03' });
const sat1 = (await q(`select label from tq_overlaps('${r}','2026-10-17','09:00','15:00')`)).map(x => x.label);
const sat2 = (await q(`select label from tq_overlaps('${r}','2026-10-24','09:00','15:00')`)).map(x => x.label);
rec('Q-12.13c an item on every second week is read on the weeks it falls', eq(sat1, ['Market']) && eq(sat2, []), { oct17: sat1, oct24: sat2 });
// ---- sizes, for Operations section 16 ----
await svc(db);
const sz = await q(`select 'blocks' t, count(*)::int n, round(avg(pg_column_size(b.*)))::int avg_bytes from blocks b
  union all select 'commitments', count(*)::int, round(avg(pg_column_size(c.*)))::int from commitments c
  union all select 'plan_items', count(*)::int, round(avg(pg_column_size(c.*)))::int from plan_items c
  union all select 'commitment_steps', count(*)::int, round(avg(pg_column_size(c.*)))::int from commitment_steps c
  union all select 'block_revisions', count(*)::int, round(avg(pg_column_size(c.*)))::int from block_revisions c
  union all select 'file_revisions', count(*)::int, round(avg(pg_column_size(c.*)))::int from file_revisions c`);
console.log('row sizes in the seeded data:', JSON.stringify(sz));
const ctx = await one(`select jsonb_build_object(
  'date', '2026-10-12',
  'plan', (select jsonb_build_object('confirmed', confirmed_at is not null, 'daily_close_at', daily_close_at) from plans where user_id='${r}' and date='2026-10-12'),
  'items', (select jsonb_agg(jsonb_build_object('label', c.label, 'start', i.planned_start, 'end', i.planned_end, 'execution', c.execution, 'movable', c.movable, 'minutes', c.duration_minutes, 'deadline', c.deadline_date,
              'steps', (select jsonb_agg(jsonb_build_object('label', s.label, 'state', s.state) order by s.position) from commitment_steps s where s.commitment_id = c.id and s.removed_at is null),
              'expected', (select jsonb_agg(x.said) from commitment_consequences x where x.commitment_id = c.id and x.kind = 'expected')) order by i.planned_start nulls last)
            from plans p join plan_items i on i.plan_id = p.id join commitments c on c.id = i.commitment_id where p.user_id='${r}' and p.date='2026-10-12'),
  'blocks', (select jsonb_agg(jsonb_build_object('label', label, 'start', starts_at, 'end', ends_at, 'status', status, 'kind', kind) order by starts_at) from blocks where user_id='${r}' and date='2026-10-12' and removed_at is null),
  'follow_ups', (select jsonb_agg(jsonb_build_object('owner', owner, 'next_action', next_action)) from follow_ups where user_id='${r}' and status='open'),
  'permissions', (select coalesce(jsonb_agg(kind), '[]'::jsonb) from standing_permissions where user_id='${r}' and withdrawn_at is null)
) j`);
const txt = JSON.stringify(ctx.j);
console.log('day context for October 12:', txt.length, 'characters,', JSON.parse(txt).items.length, 'commitments,', JSON.parse(txt).blocks.length, 'blocks');
// ---- the built figures(), run as written, on the same week of blocks ----
const wkBlocks = await q(`select id, user_id, date::text date, starts_at, ends_at, label, kind, status, paid, cost_of, note from blocks where user_id='${r}' and date between '2026-10-04' and '2026-10-10' and removed_at is null`);
fs.writeFileSync(new URL('./week_blocks.json', import.meta.url), JSON.stringify(wkBlocks));

console.log('\n', R.filter(t => t.pass).length, 'of', R.length, 'passed');
fs.writeFileSync(new URL('./t3.result.json', import.meta.url), JSON.stringify(R, null, 1));
