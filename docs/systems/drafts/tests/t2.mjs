import { fresh, as, svc, people, attempt } from './base.mjs';
import fs from 'fs';
const db = await fresh(); const { r, a } = await people(db);
try { await db.exec(fs.readFileSync(new URL('./time_core.proposed.sql', import.meta.url),'utf8')); console.log('PROPOSAL APPLIED on top of 0001 to 0004'); }
catch (e) { console.log('PROPOSAL FAILED:', e.message, e.position||''); process.exit(1); }
await svc(db);
await db.exec(`grant all on all tables in schema public to authenticated, service_role;`);
const n = async (sql) => (await db.query(sql)).rows;
console.log('tables:', (await n(`select count(*)::int c from pg_class where relnamespace='public'::regnamespace and relkind='r'`))[0].c,
  'policies:', (await n(`select count(*)::int c from pg_policies where schemaname='public'`))[0].c,
  'triggers:', (await n(`select count(*)::int c from pg_trigger where not tgisinternal`))[0].c);
const tx = async (sql) => { try { await db.exec(sql); return { ok: true }; } catch (e) { try { await db.exec('rollback'); } catch (_) {} return { ok: false, err: e.message }; } };
const R = []; const rec = (id, pass, note='') => { R.push({ id, pass, note }); console.log(pass ? 'PASS' : 'FAIL', id, note); };
const one = async (sql) => (await db.query(sql)).rows[0];
const tomorrow = (await one(`select (uc_today('${r}') + 1)::text d`)).d, today = (await one(`select uc_today('${r}')::text d`)).d, yest = (await one(`select (uc_today('${r}') - 1)::text d`)).d;

// T-BLK-03 future observed refused
await as(db, r);
let x = await attempt(db, `insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}','${tomorrow}','09:00','17:00','Shift','paid_work','observed')`);
rec('T-BLK-03', !x.ok && /not started/.test(x.err), x.err||'');
// T-BLK-04 invalid clock and kind refused
x = await attempt(db, `insert into blocks(user_id,date,starts_at,label,kind) values ('${r}','${today}','9am','x','rest')`);
let y = await attempt(db, `insert into blocks(user_id,date,starts_at,label,kind) values ('${r}','${today}','09:00','x','not_a_kind')`);
rec('T-BLK-04', !x.ok && !y.ok);
// T-BLK-05 past midnight end accepted on the starting day
x = await attempt(db, `insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}','${yest}','22:00','30:00','Sleep','sleep','observed') returning id`);
rec('T-BLK-05', x.ok);
// T-BLK-06 resident delete refused, removal kept with history
const blk = (await one(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}','${tomorrow}','18:00','19:00','Groceries','household','planned') returning id`)).id;
x = await attempt(db, `delete from blocks where id='${blk}'`);
await db.query(`update blocks set removed_at=now(), removed_reason='The client took it off the schedule' where id='${blk}'`);
await svc(db);
const left = (await one(`select count(*)::int c from blocks where id='${blk}'`)).c, revs = (await one(`select count(*)::int c from block_revisions where block_id='${blk}'`)).c;
rec('T-BLK-06', left === 1 && revs === 1 && (x.n === 0 || !x.ok), `row kept ${left}, revisions ${revs}`);

// T-BLK-07 the agent and software mark a block observed only with the client statement
await as(db, a);
x = await attempt(db, `update blocks set status='observed' where id='${(await one(`select id from blocks where date='${yest}' limit 1`)).id}'`);
const yb = (await one(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status,source) values ('${r}','${yest}','12:00','12:30','Lunch','rest','estimated','agent') returning id`)).id;
x = await attempt(db, `update blocks set status='observed' where id='${yb}'`);
const stA = (await one(`insert into statements(user_id,said) values ('${r}','Lunch was 12 to 12:30 yesterday') returning id`)).id;
const stB = (await one(`insert into statements(user_id,said) values ('${r}','I usually take lunch at noon') returning id`)).id;
const yc = (await one(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status,statement_id) values ('${r}','${yest}','13:00','13:30','Walk','rest','estimated','${stB}') returning id`)).id;
const x2 = await attempt(db, `update blocks set status='observed' where id='${yc}'`);
y = await attempt(db, `update blocks set status='observed', statement_id='${stA}' where id='${yb}'`);
rec('T-BLK-07', !x.ok && !x2.ok && y.ok, 'no statement: refused. The statement the block was first filed with: refused. The statement of what happened: accepted');
// T-SCH-02 making a day from the schedule twice writes one block
await as(db, r);
const si = (await one(`insert into schedule_items(user_id,label,kind,starts_at,ends_at,recurrence) values ('${r}','Shift','paid_work','09:00','17:00','FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR') returning id`)).id;
await svc(db);
const wsi = await attempt(db, `insert into schedule_items(user_id,label,kind,recurrence) values ('${r}','Software item','rest','FREQ=DAILY')`);
rec('T-STM-01', !wsi.ok && /statement/.test(wsi.err), 'software files what the client stated only with the statement');
x = await attempt(db, `insert into blocks(user_id,date,occurs_on,starts_at,ends_at,label,kind,status,source,schedule_item_id) values ('${r}','${tomorrow}','${tomorrow}','09:00','17:00','Shift','paid_work','planned','ai','${si}') returning source`);
y = await attempt(db, `insert into blocks(user_id,date,occurs_on,starts_at,ends_at,label,kind,status,source,schedule_item_id) values ('${r}','${tomorrow}','${tomorrow}','09:00','17:00','Shift','paid_work','planned','ai','${si}')`);
const gen = (await one(`select id from blocks where schedule_item_id='${si}'`)).id;
await db.query(`update blocks set removed_at=now(), removed_reason='Taken off by the client' where id='${gen}'`);
let y2 = await attempt(db, `insert into blocks(user_id,date,occurs_on,starts_at,ends_at,label,kind,status,schedule_item_id) values ('${r}','${tomorrow}','${tomorrow}','09:00','17:00','Shift','paid_work','planned','${si}')`);
rec('T-SCH-02', x.ok && x.rows[0].source === 'ai' && !y.ok && !y2.ok, 'written once; a block that was taken off is not written again');
// T-SCH-04 a block moved to the next day keeps the place of its own occurrence and leaves the next day free
const after = (await one(`select ('${tomorrow}'::date + 1)::text d`)).d, after2 = (await one(`select ('${tomorrow}'::date + 2)::text d`)).d;
const mv = (await one(`insert into blocks(user_id,date,occurs_on,starts_at,ends_at,label,kind,status,schedule_item_id) values ('${r}','${after}','${after}','09:00','17:00','Shift','paid_work','planned','${si}') returning id`)).id;
await db.query(`update blocks set date='${after2}' where id='${mv}'`);
const m1 = await attempt(db, `insert into blocks(user_id,date,occurs_on,starts_at,ends_at,label,kind,status,schedule_item_id) values ('${r}','${after2}','${after2}','09:00','17:00','Shift','paid_work','planned','${si}')`);
const m2 = await attempt(db, `insert into blocks(user_id,date,occurs_on,starts_at,ends_at,label,kind,status,schedule_item_id) values ('${r}','${after}','${after}','09:00','17:00','Shift','paid_work','planned','${si}')`);
rec('T-SCH-04', m1.ok && !m2.ok, 'the next day receives its own occurrence; the moved occurrence is not written again');
x = await attempt(db, `insert into commitments(user_id,label,basis,basis_ref,schedule_item_id,occurs_on) values ('${r}','Shift','recurrence','${si}','${si}','${tomorrow}')`);
y = await attempt(db, `insert into commitments(user_id,label,basis,basis_ref,schedule_item_id,occurs_on) values ('${r}','Shift','recurrence','${si}','${si}','${tomorrow}')`);
rec('T-SCH-03', x.ok && !y.ok, 'one commitment for one recurring item on one day');
await as(db, r);
// commitment with steps
await as(db, r);
const b2 = (await one(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}','${today}','07:00','08:00','Getting ready','getting_ready','planned') returning id`)).id;
const c1 = (await one(`insert into commitments(user_id,label,block_id) values ('${r}','Getting ready','${b2}') returning id, execution, consequences, source, basis`));
rec('T-COM-01', c1.execution === 'planned' && c1.consequences === 'not_established' && c1.source === 'resident', JSON.stringify(c1));
for (const [i,l] of ['Shower','Get dressed','Eat breakfast','Pack bag'].entries())
  await db.query(`insert into commitment_steps(commitment_id,user_id,label,position) values ('${c1.id}','${r}','${l}',${i+1})`);
// T-STP-01 steps not stated as whole: all reported, execution stays planned
await db.query(`update commitment_steps set state='reported_done', state_at=now() where commitment_id='${c1.id}'`);
rec('T-STP-01', (await one(`select execution from commitments where id='${c1.id}'`)).execution === 'planned');
// T-STP-02 stated as whole, one not needed, rest done => executed with no second confirmation
const c2 = (await one(`insert into commitments(user_id,label,block_id,steps_are_whole) values ('${r}','Getting ready 2','${b2}',true) returning id`)).id;
for (const [i,l] of ['Shower','Get dressed','Eat breakfast','Pack bag'].entries())
  await db.query(`insert into commitment_steps(commitment_id,user_id,label,position) values ('${c2}','${r}','${l}',${i+1})`);
await db.query(`update commitment_steps set state='reported_done', state_at=now() where commitment_id='${c2}' and position in (1,2)`);
const mid = (await one(`select execution from commitments where id='${c2}'`)).execution;
await db.query(`update commitment_steps set state='not_needed', state_at=now() where commitment_id='${c2}' and position=3`);
await db.query(`update commitment_steps set state='reported_done', state_at=now() where commitment_id='${c2}' and position=4`);
const done = await one(`select execution, timing_outcome, consequences, outcome_basis from commitments where id='${c2}'`);
rec('T-STP-02', mid === 'planned' && done.execution === 'executed' && done.timing_outcome === 'not_established' && done.consequences === 'not_established', JSON.stringify(done));
// T-STP-03 a suggested step that was not accepted counts for nothing
const c3 = (await one(`insert into commitments(user_id,label,block_id,steps_are_whole) values ('${r}','Laundry wash','${b2}',true) returning id`)).id;
await db.query(`insert into commitment_steps(commitment_id,user_id,label,position) values ('${c3}','${r}','Load the machine',1)`);
await db.query(`insert into commitment_steps(commitment_id,user_id,label,position,suggested,suggested_by) values ('${c3}','${r}','Clean the filter',2,true,'Sanitation')`);
await db.query(`update commitment_steps set state='reported_done', state_at=now() where commitment_id='${c3}' and position=1`);
rec('T-STP-03', (await one(`select execution from commitments where id='${c3}'`)).execution === 'executed');
x = await attempt(db, `update commitment_steps set state='reported_done', state_at=now() where commitment_id='${c3}' and position=2`);
rec('T-STP-04', !x.ok, 'an unaccepted suggested step cannot be reported');

// outcomes
const c4 = (await one(`insert into commitments(user_id,label,block_id) values ('${r}','Groceries','${blk}') returning id`)).id;
x = await attempt(db, `update commitments set execution='executed' where id='${c4}'`);
rec('T-OUT-01', !x.ok, 'an outcome needs its basis, its time on file, and a Timing value');
x = await attempt(db, `update commitments set execution='executed', timing_outcome='changed', actual_date='${tomorrow}', actual_start='19:00', outcome_basis='resident_report', outcome_at=now() where id='${c4}'`);
rec('T-OUT-02', !x.ok && /future/.test(x.err), x.err||'');
await db.query(`update commitments set execution='partly_executed', timing_outcome='not_established', outcome_basis='resident_report', outcome_at=now() where id='${c4}'`);
x = await attempt(db, `update commitments set execution='executed' where id='${c4}'`);
rec('T-OUT-03', !x.ok && /correction/.test(x.err), x.err||'');
// a correction with a reason is allowed and the earlier value is kept
await db.exec(`begin; select set_config('uc.reason','The client said the earlier report was wrong',true); update commitments set execution='executed' where id='${c4}'; commit;`);
await svc(db);
const hist = await n(`select before->>'execution' b, after->>'execution' a, reason, origin from file_revisions where table_name='commitments' and row_id='${c4}' order by at`);
rec('T-OUT-04', hist.length === 2 && hist[1].b === 'partly_executed' && hist[1].a === 'executed' && hist[1].reason && hist[1].origin === 'resident', JSON.stringify(hist));
x = await attempt(db, `update file_revisions set reason='x'`);
rec('T-HIS-01', !x.ok, 'history cannot be edited');
// T-OUT-05 did not happen carries no Timing value
await as(db, r);
const c5 = (await one(`insert into commitments(user_id,label) values ('${r}','Call the clinic') returning id`)).id;
x = await attempt(db, `update commitments set execution='did_not_happen', timing_outcome='changed', outcome_basis='resident_report', outcome_at=now() where id='${c5}'`);
y = await attempt(db, `update commitments set execution='did_not_happen', outcome_basis='resident_report', outcome_at=now() where id='${c5}'`);
rec('T-OUT-05', !x.ok && y.ok);
// T-OUT-06 as planned needs a planned block
const c6 = (await one(`insert into commitments(user_id,label) values ('${r}','Pay the phone bill') returning id`)).id;
x = await attempt(db, `update commitments set execution='executed', timing_outcome='as_planned', outcome_basis='resident_report', outcome_at=now() where id='${c6}'`);
rec('T-OUT-06', !x.ok);
// T-CON-01 expected consequence leaves the outcome field alone; reported sets it
await db.query(`insert into commitment_consequences(commitment_id,user_id,kind,said) values ('${c6}','${r}','expected','The phone is cut off')`);
const e1 = (await one(`select consequences from commitments where id='${c6}'`)).consequences;
await db.query(`insert into commitment_consequences(commitment_id,user_id,kind,said) values ('${c6}','${r}','reported','A late fee was charged')`);
const e2 = (await one(`select consequences from commitments where id='${c6}'`)).consequences;
rec('T-CON-01', e1 === 'not_established' && e2 === 'reported', `${e1} then ${e2}`);
// T-CON-02 a consequence the client reports after the outcome is filed with no correction
const c9 = (await one(`insert into commitments(user_id,label,block_id,execution,timing_outcome,outcome_basis,outcome_at) values ('${r}','Shift','${b2}','executed','not_established','resident_report',now()) returning id`)).id;
x = await attempt(db, `update commitments set consequences='none_confirmed' where id='${c9}'`);
y = await attempt(db, `insert into commitment_consequences(commitment_id,user_id,kind,said) values ('${c9}','${r}','reported','The pickup was late')`);
let w = await attempt(db, `update commitments set consequences='none_confirmed' where id='${c9}'`);
rec('T-CON-02', x.ok && y.ok && !w.ok && (await one(`select consequences from commitments where id='${c9}'`)).consequences === 'reported', 'later report accepted; taking a reported consequence back needs a correction');
// T-OUT-08 a time the client states after the outcome
x = await attempt(db, `update commitments set timing_outcome='changed', actual_date='${today}', actual_start='07:10' where id='${c9}'`);
y = await attempt(db, `update commitments set timing_outcome='as_planned' where id='${c9}'`);
rec('T-OUT-08', x.ok && !y.ok, 'not established to changed: accepted. Changed to as planned: a correction');
// T-STP-05 the client states that the steps are the whole after reporting them
const c10 = (await one(`insert into commitments(user_id,label,block_id) values ('${r}','Getting ready 3','${b2}') returning id`)).id;
await db.query(`insert into commitment_steps(commitment_id,user_id,label,position,state,state_at) values ('${c10}','${r}','Shower',1,'reported_done',now()), ('${c10}','${r}','Get dressed',2,'reported_done',now())`);
const before5 = (await one(`select execution from commitments where id='${c10}'`)).execution;
await db.query(`update commitments set steps_are_whole=true where id='${c10}'`);
rec('T-STP-05', before5 === 'planned' && (await one(`select execution from commitments where id='${c10}'`)).execution === 'executed');
// T-BLK-08 a block later the same day is not observed
x = await attempt(db, `insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}','${today}','23:58','23:59','Late','rest','observed')`);
rec('T-BLK-08', !x.ok && /not started/.test(x.err), x.err||'');
// T-BLK-09 a correction to a block files its reason
await db.exec(`begin; select set_config('uc.reason','The client said the shift ended later',true); update blocks set ends_at='08:10' where id='${b2}'; commit;`);
// T-SET settings
x = await attempt(db, `insert into time_settings(user_id, schedule_on_file_at) values ('${r}', now())`);
await db.query(`insert into time_settings(user_id, daily_close_at) values ('${r}', '21:00')`);
y = await attempt(db, `update time_settings set schedule_on_file_at=now() where user_id='${r}'`);
await db.query(`update time_settings set reminders=true, reminder_minutes=30 where user_id='${r}'`);
await svc(db);
rec('T-BLK-09', (await one(`select reason from block_revisions where block_id='${b2}' order by at desc limit 1`)).reason === 'The client said the shift ended later');
rec('T-SET-01', !x.ok && !y.ok, 'only the agent files that the first schedule is assembled');
rec('T-SET-02', (await one(`select count(*)::int c from file_revisions where table_name='time_settings'`)).c === 1, 'a change to a setting writes history');
await as(db, a);
const s6 = (await one(`select id from commitment_steps where commitment_id='${c1.id}' and position=1`)).id;
await svc(db); await db.query(`update commitment_steps set state='open', state_at=null where id='${s6}'`); await as(db, a);
await svc(db); await db.query(`update commitment_steps set statement_id='${stB}' where id='${s6}'`); await as(db, a);
x = await attempt(db, `update commitment_steps set state='reported_done', state_at=now() where id='${s6}'`);
y = await attempt(db, `update commitment_steps set state='reported_done', state_at=now(), state_statement_id='${stA}' where id='${s6}'`);
rec('T-STP-06', !x.ok && y.ok, 'the statement the step was named in does not serve as the statement of the report');
// T-STP-07 an agent states that the steps are the whole only with the statement
const c11 = (await one(`insert into commitments(user_id,label,statement_id) values ('${r}','Pack for the trip','${stB}') returning id`)).id;
x = await attempt(db, `update commitments set steps_are_whole=true where id='${c11}'`);
y = await tx(`begin; select set_config('uc.statement_id','${stA}',true); update commitments set steps_are_whole=true where id='${c11}'; commit;`);
rec('T-STP-07', !x.ok && y.ok, 'that the steps are the whole is filed by an agent only with the statement ');
// T-CON-03 the agent files what the client said after the client filed the outcome on a screen
const w1 = await attempt(db, `update commitments set important=true where id='${c9}'`);
const c12 = (await one(`insert into commitments(user_id,label,statement_id) values ('${r}','Laundry','${stB}') returning id`)).id;
await as(db, r);
await db.query(`update commitments set execution='executed', timing_outcome='not_established', outcome_basis='resident_report', outcome_at=now() where id='${c12}'`);
await as(db, a);
const w2 = await attempt(db, `update commitments set important=true, origin_folder='Sanitation' where id='${c12}'`);
const w3 = await attempt(db, `update commitments set consequences='none_confirmed' where id='${c12}'`);
const w4 = await attempt(db, `insert into commitment_consequences(commitment_id,user_id,kind,said) values ('${c12}','${r}','reported','The machine room closed')`);
const w5 = await attempt(db, `insert into commitment_consequences(commitment_id,user_id,kind,said,statement_id) values ('${c12}','${r}','reported','The machine room closed','${stA}')`);
const w6 = await tx(`begin; select set_config('uc.statement_id','${stA}',true); update commitments set timing_outcome='changed', actual_date='${today}', actual_start='06:00' where id='${c12}'; commit;`);
rec('T-CON-03', w1.ok && w2.ok && !w3.ok && !w4.ok && w5.ok && w6.ok && (await one(`select consequences, timing_outcome from commitments where id='${c12}'`)).consequences === 'reported',
    'a field that is no outcome: accepted. A later answer with no statement: refused. With its statement: accepted ');
x = await attempt(db, `update time_settings set schedule_on_file_at=now() where user_id='${r}' returning schedule_on_file_at`);
rec('T-SET-03', x.ok, 'the agent files that the first schedule is assembled');
await as(db, r);
// T-WDR-01 a withdrawn commitment takes no outcome
const c7 = (await one(`insert into commitments(user_id,label,withdrawn_at,withdrawn_basis) values ('${r}','Gym',now(),'resident_decision') returning id`)).id;
x = await attempt(db, `update commitments set execution='did_not_happen', outcome_basis='resident_report', outcome_at=now() where id='${c7}'`);
rec('T-WDR-01', !x.ok);

// software
await svc(db);
x = await attempt(db, `insert into commitments(user_id,label) values ('${r}','Dishes')`);
rec('T-COM-02', !x.ok && /statement/.test(x.err), 'software files a commitment the client decided only with the statement');
const c8 = (await one(`insert into commitments(user_id,label,basis,source) values ('${r}','Dishes','standing_permission','resident') returning id, source`));
rec('T-SRC-01', c8.source === 'ai', 'the service role named resident and the row reads ' + c8.source);
x = await attempt(db, `update commitments set execution='executed', timing_outcome='not_established', outcome_basis='resident_report', outcome_at=now() where id='${c8.id}'`);
rec('T-SW-01', !x.ok && /statement/.test(x.err), x.err||'');
x = await attempt(db, `update commitments set execution='executed', timing_outcome='not_established', outcome_basis='evidence', outcome_at=now() where id='${c8.id}'`);
rec('T-OUT-07', !x.ok, 'evidence names the entry that proves it');
const st = (await one(`insert into statements(user_id,said,channel) values ('${r}','The dishes are done','guided') returning id`)).id;
x = await attempt(db, `update commitments set execution='executed', timing_outcome='not_established', outcome_basis='resident_report', outcome_at=now(), outcome_statement_id='${st}' where id='${c8.id}'`);
rec('T-SW-02', x.ok && c8.source === 'ai');
x = await attempt(db, `insert into standing_permissions(user_id,kind,wording_version,source) values ('${r}','place_work','v1','ai')`);
y = await attempt(db, `insert into standing_permissions(user_id,kind,wording_version,granted_statement_id) values ('${r}','place_work','v1','${st}')`);
rec('T-PRM-01', !x.ok && !y.ok, 'software never grants a permission, with or without naming itself');
await as(db, a);
x = await attempt(db, `insert into standing_permissions(user_id,kind,wording_version) values ('${r}','place_work','v1')`);
y = await attempt(db, `insert into standing_permissions(user_id,kind,wording_version,source,granted_statement_id) values ('${r}','place_work','v1','resident','${st}') returning source`);
rec('T-PRM-02', !x.ok && y.ok && y.rows[0].source === 'agent', 'the agent files a permission only with the client statement, and the row reads agent');
x = await attempt(db, `insert into commitments(user_id,label) values ('${r}','Agent wrote this')`);
y = await attempt(db, `insert into commitments(user_id,label,statement_id,source) values ('${r}','Agent wrote this','${st}','resident') returning source`);
rec('T-SRC-02', !x.ok && y.ok && y.rows[0].source === 'agent', 'an agent write reads agent whatever it names');
x = await attempt(db, `delete from commitments where user_id='${r}'`);
rec('T-DEL-01', x.ok && x.n === 0, 'no delete on a Time table');

// Plan
await as(db, r);
const p1 = (await one(`insert into plans(user_id,date) values ('${r}','${tomorrow}') returning id, confirmed_at`));
await db.query(`insert into plan_items(plan_id,commitment_id,user_id,planned_start,planned_end) values ('${p1.id}','${c4}','${r}','18:00','19:00')`);
await db.query(`update plans set confirmed_at=now(), realism='mostly', daily_close_at='21:00' where id='${p1.id}'`);
const p1b = await one(`select confirmed_source, confirmed_at is not null c from plans where id='${p1.id}'`);
rec('T-PLN-01', p1.confirmed_at === null && p1b.c && p1b.confirmed_source === 'resident', JSON.stringify(p1b));
await svc(db);
const p2 = (await one(`insert into plans(user_id,date,source) values ('${r}','${today}','ai') returning id`)).id;
x = await attempt(db, `update plans set confirmed_at=now() where id='${p2}'`);
y = await attempt(db, `update plans set confirmed_at=now(), confirmed_statement_id='${st}' where id='${p2}'`);
rec('T-PLN-02', !x.ok && y.ok, 'software confirms a Plan only with the client statement');
x = await attempt(db, `insert into plans(user_id,date) values ('${r}','${today}')`);
rec('T-PLN-03', !x.ok, 'one Plan for one day');
await as(db, r);
x = await attempt(db, `update plan_items set state='moved' where plan_id='${p1.id}'`);
rec('T-PLN-04', !x.ok, 'a moved item states its basis');

// follow up
await as(db, a);
const f1 = (await one(`insert into follow_ups(user_id,owner,need,next_action,from_commitment_id,source) values ('${r}','agent','agent_action','Enter the amount in Finance','${c4}','agent') returning id`)).id;
x = await attempt(db, `insert into follow_ups(user_id,owner,need,next_action,source) values ('${r}','agent','agent_action','No origin','agent')`);
await as(db, r);
y = await attempt(db, `update follow_ups set status='closed', closed_at=now() where id='${f1}'`);
rec('T-FUP-01', !x.ok && !y.ok, 'origin required; the client cannot close a follow up the agent owns');
x = await attempt(db, `update follow_ups set owner='resident' where id='${f1}'`);
rec('T-FUP-02', !x.ok, 'the client cannot change who owns a follow up');
await as(db, a);
x = await attempt(db, `update follow_ups set status='closed', closed_at=now() where id='${f1}'`);
y = await attempt(db, `update follow_ups set status='closed', closed_at=now(), closed_basis='The amount was entered' where id='${f1}'`);
rec('T-FUP-03', !x.ok && y.ok, 'a closing states what met the requirement');

// recommendation
await svc(db);
const snap = async () => JSON.stringify(await n(`select (select count(*) from file_revisions where table_name <> 'recommendations')::int f, (select count(*) from block_revisions)::int b, (select jsonb_agg(to_jsonb(c) order by c.id) from commitments c) c, (select jsonb_agg(to_jsonb(i) order by i.id) from plan_items i) i`));
const before = await snap();
const rc = (await one(`insert into recommendations(user_id,made_by,conversation_key,action,commitment_id,rests_on) values ('${r}','ai','day-1','move','${c5}','The appointment is at 5:00 PM') returning id`)).id;
await as(db, r);
x = await attempt(db, `update recommendations set rests_on='changed' where id='${rc}'`);
y = await attempt(db, `update recommendations set response='declined', responded_at=now() where id='${rc}'`);
await svc(db);
const z = await attempt(db, `insert into recommendations(user_id,made_by,conversation_key,action,commitment_id,rests_on) values ('${r}','ai','day-1','move','${c5}','Again')`);
const z2 = await attempt(db, `insert into recommendations(user_id,made_by,conversation_key,action,commitment_id,rests_on) values ('${r}','agent','day-2','move','${c5}','A new conversation') returning made_by`);
rec('T-REC-01', !x.ok && y.ok, 'the client answers and cannot rewrite');
rec('T-REC-03', before === await snap(), 'making and declining a recommendation changed no commitment, no Plan item, and wrote no revision');
rec('T-REC-02', !z.ok && z2.ok, 'made again in the same conversation: refused. In a later conversation: accepted');
rec('T-REC-04', z2.rows[0].made_by === 'ai', 'who made it is set from the actor: the service role named agent and the row reads ' + z2.rows[0].made_by);


// another client cannot read
const o = (await one(`insert into auth.users(email) values ('o@x.test') returning id`)).id;
await as(db, o);
const seen = (await one(`select (select count(*) from commitments)::int c, (select count(*) from plans)::int p, (select count(*) from file_revisions)::int f`));
rec('T-ACC-01', seen.c === 0 && seen.p === 0 && seen.f === 0, JSON.stringify(seen));
await as(db, r);
const view = await n(`select label, plan_date, execution from time_commitments_read where plan_date is not null`);
rec('T-INT-01', view.length === 1 && view[0].label === 'Groceries', JSON.stringify(view));
console.log('\n', R.filter(t=>t.pass).length, 'of', R.length, 'passed');
fs.writeFileSync(new URL('./t2.result.json', import.meta.url), JSON.stringify(R, null, 1));
