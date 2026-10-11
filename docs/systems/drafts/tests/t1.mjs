import { fresh, as, svc, people, attempt } from './base.mjs';
const db = await fresh(); const { r, a } = await people(db);
console.log('profiles', (await db.query('select role, timezone from profiles order by role')).rows);
await as(db, r);
let b1 = (await db.query(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}','2026-10-12','09:00','17:00','Shift','paid_work','planned') returning id, source`)).rows[0];
let b2 = (await db.query(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status,cost_of) values ('${r}','2026-10-12','08:30','09:00','Travel','travel','planned','${b1.id}') returning id`)).rows[0];
let b3 = (await db.query(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}','2026-10-12','18:00','19:00','Groceries','household','planned') returning id`)).rows[0];
console.log('A. delete a block with no revision:', await attempt(db, `delete from blocks where id='${b3.id}'`));
await svc(db); console.log('   rows left for that block:', (await db.query(`select count(*)::int n from blocks where id='${b3.id}'`)).rows[0].n, 'revisions:', (await db.query(`select count(*)::int n from block_revisions where block_id='${b3.id}'`)).rows[0].n);
await as(db, r);
await db.query(`update blocks set ends_at='17:30' where id='${b1.id}'`);
console.log('B. delete a block that has a revision:', await attempt(db, `delete from blocks where id='${b1.id}'`));
await svc(db);
console.log('   revision reason stored:', (await db.query(`select reason, origin from block_revisions`)).rows);
// delete the parent of a cost block that has no revision of its own
await as(db, r);
let b4 = (await db.query(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}','2026-10-13','09:00','17:00','Shift2','paid_work','planned') returning id`)).rows[0];
let b5 = (await db.query(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status,cost_of) values ('${r}','2026-10-13','08:30','09:00','Travel2','travel','planned','${b4.id}') returning id`)).rows[0];
console.log('C. delete a shift that has a travel block:', await attempt(db, `delete from blocks where id='${b4.id}'`));
await svc(db); console.log('   travel block still on file:', (await db.query(`select count(*)::int n from blocks where id='${b5.id}'`)).rows[0].n);
// account deletion with a revision on file
console.log('D. delete the auth user while a revision exists:', await attempt(db, `delete from auth.users where id='${r}'`));
// service role proposal with origin ai
console.log('E. service role files a proposal:', await attempt(db, `insert into proposals(user_id,kind,target_table,payload,reason) values ('${r}','time.block','blocks','{}','test') returning origin, state`));
await as(db, r);
console.log('F. resident files a proposal:', await attempt(db, `insert into proposals(user_id,kind,target_table,payload,reason) values ('${r}','time.block','blocks','{}','test') returning origin`));
console.log('G. resident decides a proposal:', await attempt(db, `update proposals set state='confirmed' returning state`));
console.log('H. resident sets status observed on a future planned block:', await attempt(db, `update blocks set status='observed' where id='${b2.id}' returning status, date`));
console.log('I. block with an invalid time and unknown kind:', await attempt(db, `insert into blocks(user_id,date,starts_at,ends_at,label,kind) values ('${r}','2026-10-12','9am','25:99','x','not_a_kind') returning starts_at, ends_at, kind, status`));
await as(db, a);
console.log('J. agent writes source ai:', await attempt(db, `insert into blocks(user_id,date,starts_at,label,kind,source) values ('${r}','2026-10-12','10:00','y','rest','ai') returning source`));
console.log('K. agent deletes a block:', await attempt(db, `delete from blocks where user_id='${r}'`));
await svc(db);
console.log('L. statements columns:', (await db.query(`select column_name from information_schema.columns where table_name='statements' order by ordinal_position`)).rows.map(x=>x.column_name).join(', '));
console.log('M. proposals columns:', (await db.query(`select column_name||':'||udt_name c from information_schema.columns where table_name='proposals' order by ordinal_position`)).rows.map(x=>x.c).join(', '));
console.log('N. reviews columns:', (await db.query(`select column_name||':'||udt_name c from information_schema.columns where table_name='reviews' order by ordinal_position`)).rows.map(x=>x.c).join(', '));
