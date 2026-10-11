// Local work only. With PILOT_LOCAL=1 on a development server, the founder test runs against a database
// in memory and a stand in for the language model, so the screens can be opened with no hosted service.
// A production build never reaches this file's code path: NODE_ENV is production there.

import { useDriver, type Driver, type Q } from './db';
import { useModel, type Model } from './model';

export const LOCAL_USER = '00000000-0000-4000-8000-000000000001';

const G = globalThis as unknown as { __ucPilotLocal?: Promise<void> };

export function localMode(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.PILOT_LOCAL === '1';
}

export function ensureLocal(): Promise<void> {
  if (!localMode()) return Promise.resolve();
  return (G.__ucPilotLocal ||= (async () => {
    const pg = '@electric-sql/pglite';
    const { PGlite } = await import(/* webpackIgnore: true */ pg);
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const db = new PGlite();
    await db.exec(readFileSync(join(process.cwd(), 'supabase/pilot/0001_founder_test.sql'), 'utf8'));
    await db.query(
      `insert into uc_pilot.access (user_id, label, synthetic, decides_proposals, display_name) values ($1, 'local', true, true, 'Local resident')`, [LOCAL_USER]);
    await db.exec('set role uc_pilot_server');
    const driver: Driver = {
      describe: () => 'a database in memory',
      tx: (fn: (q: Q) => Promise<any>) => db.transaction(async (tx: any) => fn(async (text, params) => (await tx.query(text, params as any[])).rows))
    };
    useDriver(driver);
    if (!process.env.ANTHROPIC_API_KEY) useModel(standIn);
  })());
}

/** Answers with fixed text and files one commitment when the message names a time for tomorrow. Enough to open every screen. */
const standIn: Model = {
  name: () => 'stand in for local work',
  async create(req) {
    const last = req.messages[req.messages.length - 1];
    const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    if (Array.isArray(last.content)) {
      const first = last.content.find(b => b.type === 'tool_result') as any;
      const ok = first && !first.is_error;
      return { content: [{ type: 'text', text: ok ? 'That is on file now. The list under this reply shows the entry.' : 'That was not filed. The list under this reply shows the reason.' }], stop: 'end_turn', usage, model: 'stand in' };
    }
    const said = String(last.content).split('\n').slice(-1)[0];
    const m = /tomorrow i (work|have) (.+)/i.exec(said);
    if (m && req.allowActions) {
      const system = req.system[1]?.text || '';
      const tomorrow = /(\d{4}-\d{2}-\d{2}) \(tomorrow\)/.exec(system)?.[1] || '2026-01-01';
      return {
        content: [{ type: 'tool_use', id: 'local1', name: 'add_commitment', input: { date: tomorrow, label: m[1] === 'work' ? 'Work' : m[2].slice(0, 40), quote: said.replace(/[.!]$/, '') } }],
        stop: 'tool_use', usage, model: 'stand in'
      };
    }
    return { content: [{ type: 'text', text: 'This is the stand in for the language model. It answers every message with this sentence.' }], stop: 'end_turn', usage, model: 'stand in' };
  }
};
