import { randomUUID } from 'node:crypto';
import { isUuid, withResident } from '@/lib/pilot/db';
import { loadAccess } from '@/lib/pilot/file';
import { receive } from '@/lib/pilot/turn';
import { operatorOk } from '@/lib/pilot/operator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Sends one message as a made up resident and returns what the server did with it.
 * It is how the test is run against the hosted model and database before the founder uses it.
 *
 * It speaks only for a resident whose row in the test list is marked made up.
 * It cannot speak for the founder, whatever key or id it is given.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!(await operatorOk(req))) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }
  const ids = (process.env.PILOT_SELFTEST_USERS || '').split(/[\s,]+/).filter(isUuid);
  const which = url.searchParams.get('who') === 'b' ? 1 : 0;
  const userId = ids[which];
  if (!userId) return Response.json({ error: 'No made up resident is configured.' }, { status: 400 });

  try {
    const access = await withResident({ userId, actor: 'resident' }, q => loadAccess(q));
    if (!access) return Response.json({ error: 'That resident is not in the test list.' }, { status: 400 });
    if (!access.synthetic) return Response.json({ error: 'This route speaks only for a made up resident.' }, { status: 403 });

    if (url.searchParams.get('fresh') === '1') {
      await withResident({ userId, actor: 'resident' }, q => q(`select uc_pilot.clear_my_test_data()`));
    }
    const say = (url.searchParams.get('say') || '').trim();
    if (!say) return Response.json({ ok: true, cleared: url.searchParams.get('fresh') === '1' });

    const key = url.searchParams.get('rk');
    const t0 = Date.now();
    const out = await receive(userId, say, key && isUuid(key) ? key : randomUUID());
    return Response.json({
      state: out.state,
      ms: Date.now() - t0,
      resident_said: out.message?.body ?? null,
      guide_replied: out.reply?.body ?? null,
      note: out.note ?? null,
      what_the_server_did: out.effects.map(e => `${e.outcome.toUpperCase()} [${e.tool}] ${e.detail}`)
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return Response.json({ error: String(e?.message || e).slice(0, 400) }, { status: 500 });
  }
}
