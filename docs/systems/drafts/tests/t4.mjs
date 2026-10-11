import { fresh, as, svc, people, attempt, SECURITY_TEST } from './base.mjs';
import fs from 'fs';
// 1. the repository's own security tests, on the four migrations
{
  const db = await fresh();
  const sql = fs.readFileSync(SECURITY_TEST,'utf8');
  await db.exec(`grant all on all tables in schema public to authenticated; grant all on all sequences in schema public to authenticated; grant all on auth.users to authenticated;`);
  const me = (await db.query('select current_user u')).rows[0].u; console.log('superuser role in the test database:', me);
  const notices = [];
  try { await db.exec(sql, { onNotice: n => notices.push(n.message) }); console.log('repo security tests: ran clean.', notices.filter(x=>/passed/.test(x)).length, 'passed notices'); notices.filter(x=>/TEST/.test(x)).forEach(x=>console.log('  ', x)); }
  catch (e) { console.log('repo security tests FAILED:', e.message); notices.filter(x=>/TEST/.test(x)).forEach(x=>console.log('  ', x)); }
}

// 2. the same tests with the proposal applied
{
  const db = await fresh();
  await db.exec(fs.readFileSync(new URL('./time_core.proposed.sql', import.meta.url),'utf8'));
  await db.exec(`grant all on all tables in schema public to authenticated; grant all on all sequences in schema public to authenticated;`);
  const sql = fs.readFileSync(SECURITY_TEST,'utf8');
  const notices = [];
  try { await db.exec(sql, { onNotice: n => notices.push(n.message) }); console.log('with the proposal applied: ran clean.', notices.filter(x=>/passed/.test(x)).length, 'passed notices'); }
  catch (e) { console.log('with the proposal applied FAILED:', e.message); notices.filter(x=>/TEST/.test(x)).forEach(x=>console.log('  ', x)); }
}
