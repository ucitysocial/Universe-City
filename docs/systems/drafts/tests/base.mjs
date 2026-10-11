import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'fs';
// The four migration files of the repository. This folder is docs/systems/drafts/tests.
const ROOT = new URL('../../../../', import.meta.url);
const R = new URL('supabase/migrations/', ROOT).pathname;
export const SECURITY_TEST = new URL('supabase/tests/0002_security.sql', ROOT);
export async function fresh() {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(`
    create role anon; create role authenticated; create role service_role; create role postgres_shim;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, encrypted_password text, email_confirmed_at timestamptz, raw_app_meta_data jsonb, raw_user_meta_data jsonb default '{}'::jsonb, aud text, role text);
    create or replace function auth.uid() returns uuid language sql stable as $$
      select nullif(nullif(current_setting('request.jwt.claims', true), '')::json->>'sub','')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
  `);
  for (const f of ['0001_init.sql','0002_rls_corrections.sql','0003_profile_identity.sql','0004_resident_rename.sql']) {
    try { await db.exec(fs.readFileSync(R+f,'utf8')); }
    catch (e) { console.log('FAILED', f, e.message); throw e; }
  }
  await db.exec(`grant all on all tables in schema public to authenticated, service_role; grant all on all sequences in schema public to authenticated, service_role;`);
  return db;
}
export const as = (db, uid) => db.exec(`set role authenticated; select set_config('request.jwt.claims', '${JSON.stringify({sub:uid,role:'authenticated'})}', false);`);
export const svc = (db) => db.exec(`reset role; select set_config('request.jwt.claims', '', false);`);
export async function people(db) {
  await svc(db);
  const r = (await db.query(`insert into auth.users(email) values ('r@x.test') returning id`)).rows[0].id;
  const a = (await db.query(`insert into auth.users(email) values ('a@x.test') returning id`)).rows[0].id;
  await db.exec(`update profiles set role='agent' where id='${a}'`);
  return { r, a };
}
export async function attempt(db, sql) { try { const x = await db.query(sql); return { ok: true, rows: x.rows, n: x.affectedRows }; } catch (e) { return { ok: false, err: e.message }; } }
