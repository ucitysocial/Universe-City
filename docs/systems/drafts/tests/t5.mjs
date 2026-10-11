import { fresh, as, svc, people, attempt, SECURITY_TEST } from './base.mjs';
import fs from 'fs';
for (const withProposal of [false, true]) {
  const db = await fresh();
  if (withProposal) await db.exec(fs.readFileSync(new URL('./time_core.proposed.sql', import.meta.url),'utf8'));
  await db.exec(`grant all on all tables in schema public to authenticated; grant all on all sequences in schema public to authenticated;`);
  let sql = fs.readFileSync(SECURITY_TEST,'utf8');
  // Test 4 expects an error where row level security changes no row and raises none. Count rows instead.
  sql = sql.replace(`update block_revisions set after = '{}'::jsonb where block_id = b;\n  exception when others then failed := true; end;`,
                    `update block_revisions set after = '{}'::jsonb where block_id = b;\n    get diagnostics n = row_count; if n = 0 then failed := true; end if;\n  exception when others then failed := true; end;`)
           .replace(`delete from block_revisions where block_id = b;\n  exception when others then failed := true; end;`,
                    `delete from block_revisions where block_id = b;\n    get diagnostics n = row_count; if n = 0 then failed := true; end if;\n  exception when others then failed := true; end;`);
  const notices = [];
  try { await db.exec(sql, { onNotice: n => notices.push(n.message) }); console.log(withProposal ? 'WITH PROPOSAL:' : 'FOUR MIGRATIONS:', 'ran clean'); }
  catch (e) { console.log(withProposal ? 'WITH PROPOSAL:' : 'FOUR MIGRATIONS:', 'stopped:', e.message); }
  notices.filter(x=>/TEST/.test(x)).forEach(x=>console.log('  ', x));
}
// direct check of what the unmodified test 4 trips on
{
  const db = await fresh(); const { r } = await people(db);
  await db.exec(`grant all on all tables in schema public to authenticated;`);
  await as(db, r);
  const b = (await db.query(`insert into blocks(user_id,date,starts_at,ends_at,label,kind,status) values ('${r}',current_date,'14:00','22:00','Work','paid_work','observed') returning id`)).rows[0].id;
  await db.query(`update blocks set ends_at='22:45' where id='${b}'`);
  const u = await attempt(db, `update block_revisions set after='{}'::jsonb where block_id='${b}'`);
  const d = await attempt(db, `delete from block_revisions where block_id='${b}'`);
  await svc(db);
  const left = (await db.query(`select after->>'ends_at' e from block_revisions where block_id='${b}'`)).rows;
  console.log('client edit of a revision:', JSON.stringify(u), '| client delete:', JSON.stringify(d), '| revision still reads', JSON.stringify(left));
}
