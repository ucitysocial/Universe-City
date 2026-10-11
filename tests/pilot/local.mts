// A database in memory for tests and for local work. It runs the same SQL file the hosted test database runs.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Driver, Q } from '../../lib/pilot/db';

export async function localDriver(): Promise<{ driver: Driver; db: PGlite }> {
  const db = new PGlite();
  const sql = readFileSync(fileURLToPath(new URL('../../supabase/pilot/0001_founder_test.sql', import.meta.url)), 'utf8');
  await db.exec(sql);
  // The hosted server logs in as uc_pilot_server. This session does the same.
  await db.exec(`set role uc_pilot_server`);
  const driver: Driver = {
    describe: () => 'a database in memory',
    tx: fn => db.transaction(async tx => {
      const q: Q = async (text, params) => (await tx.query(text, params as any[])).rows as any[];
      return fn(q);
    }) as any
  };
  return { driver, db };
}

/** Adds a resident to the test, the way an operator would, outside the server's own login. */
export async function addResident(db: PGlite, id: string, label: string, opts: { synthetic?: boolean; decides?: boolean; name?: string } = {}) {
  await db.exec(`reset role`);
  await db.query(
    `insert into uc_pilot.access (user_id, label, synthetic, decides_proposals, display_name) values ($1, $2, $3, $4, $5) on conflict (user_id) do nothing`,
    [id, label, opts.synthetic ?? true, opts.decides ?? false, opts.name ?? null]);
  await db.exec(`set role uc_pilot_server`);
}
