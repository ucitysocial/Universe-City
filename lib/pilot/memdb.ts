// A database in memory, built from the same schema as the hosted one.
//
// Local work uses it to open the screens with no hosted database. It lives as long as the process that built it.
// It never holds a resident's File. A production server never builds one.

import { randomUUID } from 'node:crypto';
import type { Driver, Q } from './db';
import { SCHEMA_SQL } from './schema-sql';

export const MEM_RESIDENTS = ['00000000-0000-4000-8000-0000000000aa', '00000000-0000-4000-8000-0000000000bb'];

type Mem = { driver: Driver; instance: string; db: any };
const G = globalThis as unknown as { __ucPilotMem?: Promise<Mem> };

export function memDb(): Promise<Mem> {
  return (G.__ucPilotMem ||= (async () => {
    const { PGlite } = await import('@electric-sql/pglite');
    const db = new PGlite();
    await db.exec(SCHEMA_SQL);
    await db.query(
      `insert into uc_pilot.access (user_id, label, synthetic, decides_proposals, display_name) values ($1, 'made up resident A', true, true, 'Ada'), ($2, 'made up resident B', true, false, 'Ben')`,
      MEM_RESIDENTS);
    await db.exec('set role uc_pilot_server');
    const driver: Driver = {
      describe: () => 'a database in memory',
      tx: (fn: (q: Q) => Promise<any>) => db.transaction(async (tx: any) => fn(async (text, params) => (await tx.query(text, params as any[])).rows))
    };
    return { driver, instance: randomUUID().slice(0, 8), db };
  })().catch(e => { G.__ucPilotMem = undefined; throw e; }));
}
