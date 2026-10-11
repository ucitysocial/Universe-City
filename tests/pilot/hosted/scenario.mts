// Runs a made up conversation with the real language model.
//
// It runs in GitHub Actions. The server logic and a database in memory run on the runner, from this repository's
// own code. Only the model call leaves the runner: it goes to the preview, which passes it to the model.
// The results are posted on the pull request. Every resident here is made up.

import { randomUUID } from 'node:crypto';
import { useDriver, withResident } from '../../../lib/pilot/db';
import { loadFile } from '../../../lib/pilot/file';
import { useModel, type Model } from '../../../lib/pilot/model';
import { sayDays, saySpan } from '../../../lib/pilot/time';
import { sayCommitment } from '../../../lib/pilot/tools';
import { receive } from '../../../lib/pilot/turn';
import { addResident, localDriver } from '../local.mts';

const base = process.env.PREVIEW!;
const pr = process.env.PULL_REQUEST!;
const repo = process.env.GITHUB_REPOSITORY!;
const label = process.env.LABEL || 'scenario';

let held: { value: string; at: number } | null = null;
async function token(): Promise<string> {
  if (held && Date.now() - held.at < 120_000) return held.value;
  const res = await fetch(`${process.env.ACTIONS_ID_TOKEN_REQUEST_URL}&audience=uc-founder-test`, {
    headers: { authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` }
  });
  if (!res.ok) throw new Error(`GitHub issued no token: ${res.status}`);
  held = { value: (await res.json()).value, at: Date.now() };
  return held.value;
}

let served = 'unknown';
const proxy: Model = {
  name: () => served === 'unknown' ? (process.env.PILOT_MODEL || 'claude-sonnet-5-5') : served,
  async create(req) {
    const res = await fetch(`${base}/api/pilot/model${process.env.PILOT_MODEL ? `?model=${process.env.PILOT_MODEL}` : ''}`, {
      method: 'POST', headers: { authorization: `Bearer ${await token()}`, 'content-type': 'application/json' }, body: JSON.stringify(req)
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`the model did not answer: ${res.status} ${body?.error || ''}`);
    served = body.model || served;
    return body;
  }
};

const { driver, db } = await localDriver();
useDriver(driver);
useModel(proxy);
const who: Record<string, string> = { a: randomUUID(), b: randomUUID() };
await addResident(db, who.a, 'made up resident A', { name: 'Ada', decides: true });
await addResident(db, who.b, 'made up resident B', { name: 'Ben' });

let steps: any[] = [];
try { const j = JSON.parse(process.env.STEPS || '[]'); steps = Array.isArray(j) ? j : j.steps || []; } catch { steps = []; }

const out: any[] = [];
let cost = 0;
for (const step of steps) {
  const id = who[step.who === 'b' ? 'b' : 'a'];
  const row: any = { say: step.say };
  try {
    if (step.fresh) await withResident({ userId: id, actor: 'resident' }, q => q(`select uc_pilot.clear_my_test_data()`));
    if (step.say) {
      const t0 = Date.now();
      const r = await receive(id, step.say, randomUUID());
      row.state = r.state; row.ms = Date.now() - t0;
      row.guide = r.reply?.body ?? null;
      if (r.note) row.note = r.note;
      row.did = r.effects.map(e => `${e.outcome.toUpperCase()} [${e.tool}] ${e.detail}`);
      const use = (await withResident({ userId: id, actor: 'resident' }, q => q<any>(
        `select t.steps, t.model, t.input_tokens as i, t.output_tokens as o, t.cache_read_tokens as cr, t.cache_write_tokens as cw, t.cost_micro::float8 as cost, t.error,
                (select array_agg(a.tool || ':' || a.outcome order by a.seq) from uc_pilot.actions a where a.turn_id = t.id) as actions
           from uc_pilot.turns t where t.message_id = $1`, [r.message!.id])))[0];
      row.turn = use;
      cost += use?.cost || 0;
    }
    if (step.file) {
      const v = await withResident({ userId: id, actor: 'resident' }, q => loadFile(q, 'America/Denver', { daysBack: 3, daysAhead: 10, statements: 60 }));
      row.file = {
        statements: v.statements.map(s => `${s.folder} / ${s.topic}: "${s.said}" [${s.basis}]`),
        weekly_schedule: v.schedule.map(s => `${s.label}, ${sayDays(s.days)}, ${saySpan(s.start_min, s.end_min)}`),
        days: v.days.filter(d => d.plan || d.commitments.length).map(d => ({ date: d.date, plan: d.plan ? d.plan.state : null, commitments: d.commitments.map(c => sayCommitment(c as any)) })),
        waiting_for_resident: v.waitingResident.map(p => p.summary),
        proposals_for_agent: v.waitingAgent.map(p => p.summary),
        follow_ups: v.followUps.map(f => `${f.owner}/${f.kind}: ${f.what}`),
        not_established: v.notEstablished
      };
    }
  } catch (e: any) {
    row.error = String(e?.message || e).slice(0, 300);
  }
  out.push(row);
  console.log(JSON.stringify({ say: step.say, state: row.state, ms: row.ms, error: row.error }));
}

const body = [
  `<!-- founder-test-run -->`,
  `**Founder test checks: ${label}**. Made up resident only. Database in memory on the runner. Model: \`${served}\`. Model cost of this run: $${(cost / 1e6).toFixed(4)}.`,
  '',
  '```json',
  JSON.stringify(out, null, 1).slice(0, 62000),
  '```'
].join('\n');
const post = await fetch(`https://api.github.com/repos/${repo}/issues/${pr}/comments`, {
  method: 'POST',
  headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'content-type': 'application/json' },
  body: JSON.stringify({ body })
});
console.log('comment posted:', post.status);
if (out.some(o => o.error)) process.exitCode = 1;
