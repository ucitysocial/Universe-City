import { randomUUID } from 'node:crypto';
import { isUuid, withDriver, withResident } from '@/lib/pilot/db';
import { loadAccess, loadFile } from '@/lib/pilot/file';
import { MEM_RESIDENTS, memDb } from '@/lib/pilot/memdb';
import { operatorOk } from '@/lib/pilot/operator';
import { saySpan, sayDays } from '@/lib/pilot/time';
import { sayCommitment } from '@/lib/pilot/tools';
import { receive } from '@/lib/pilot/turn';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Sends one message as a made up resident and returns what the server did with it.
 * It is how the test is run against the hosted model before the founder uses it.
 *
 * It speaks only for a resident whose row in the test list is marked made up.
 * It cannot speak for the founder, whatever key or id it is given.
 *
 * With mem=1 the conversation runs against a database in memory that holds two made up residents and
 * no other row. That database belongs to this request alone. No other request is pointed at it.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!(await operatorOk(req))) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }
  const mem = url.searchParams.get('mem') === '1';
  const which = url.searchParams.get('who') === 'b' ? 1 : 0;

  const work = async (userId: string, extra: Record<string, unknown>) => {
    const access = await withResident({ userId, actor: 'resident' }, q => loadAccess(q));
    if (!access) return Response.json({ error: 'That resident is not in the test list.' }, { status: 400 });
    if (!access.synthetic) return Response.json({ error: 'This route speaks only for a made up resident.' }, { status: 403 });

    if (url.searchParams.get('fresh') === '1') {
      await withResident({ userId, actor: 'resident' }, q => q(`select uc_pilot.clear_my_test_data()`));
    }
    const say = (url.searchParams.get('say') || '').trim();
    const out: Record<string, unknown> = { ...extra };
    if (say) {
      const key = url.searchParams.get('rk');
      const t0 = Date.now();
      const r = await receive(userId, say, key && isUuid(key) ? key : randomUUID());
      out.state = r.state;
      out.ms = Date.now() - t0;
      out.resident_said = r.message?.body ?? null;
      out.guide_replied = r.reply?.body ?? null;
      if (r.note) out.note = r.note;
      out.what_the_server_did = r.effects.map(e => `${e.outcome.toUpperCase()} [${e.tool}] ${e.detail}`);
      if (r.message) {
        const use = await withResident({ userId, actor: 'resident' }, q => q<any>(
          `select t.steps, t.model, t.input_tokens, t.output_tokens, t.cache_read_tokens, t.cache_write_tokens, t.cost_micro::float8 as cost_micro, t.error,
                  (select array_agg(a.tool || ':' || a.outcome order by a.seq) from uc_pilot.actions a where a.turn_id = t.id) as actions
             from uc_pilot.turns t where t.message_id = $1`, [r.message!.id]));
        out.turn = use[0] ?? null;
      }
    } else {
      out.ok = true;
    }
    if (url.searchParams.get('file') === '1') {
      const v = await withResident({ userId, actor: 'resident' }, q => loadFile(q, access.timezone, { daysBack: 3, daysAhead: 10, statements: 60 }));
      out.file = {
        statements: v.statements.map(s => `${s.folder} / ${s.topic}: "${s.said}" [${s.basis}]`),
        weekly_schedule: v.schedule.map(s => `${s.label}, ${sayDays(s.days)}, ${saySpan(s.start_min, s.end_min)}`),
        days: v.days.filter(d => d.plan || d.commitments.length).map(d => ({
          date: d.date, plan: d.plan ? d.plan.state : null, commitments: d.commitments.map(c => sayCommitment(c as any))
        })),
        waiting_for_resident: v.waitingResident.map(p => p.summary),
        proposals_for_agent: v.waitingAgent.map(p => p.summary),
        follow_ups: v.followUps.map(f => `${f.owner}/${f.kind}: ${f.what}`),
        not_established: v.notEstablished
      };
    }
    return Response.json(out, { headers: { 'cache-control': 'no-store' } });
  };

  try {
    if (mem) {
      const m = await memDb();
      return await withDriver(m.driver, () => work(MEM_RESIDENTS[which], { mem_instance: m.instance }));
    }
    const ids = (process.env.PILOT_SELFTEST_USERS || '').split(/[\s,]+/).filter(isUuid);
    const userId = ids[which];
    if (!userId) return Response.json({ error: 'No made up resident is configured.' }, { status: 400 });
    return await work(userId, {});
  } catch (e: any) {
    return Response.json({ error: String(e?.message || e).slice(0, 400) }, { status: 500 });
  }
}
