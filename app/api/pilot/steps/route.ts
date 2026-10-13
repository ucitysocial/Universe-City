import { admit } from '@/lib/pilot/auth';
import { loadCommitment, loadWeeklyItem } from '@/lib/pilot/browse';
import { isUuid, withResident } from '@/lib/pilot/db';
import type { DemoPlan } from '@/lib/pilot/guided-demo';
import { ownerFor, planFor } from '@/lib/pilot/plan-for';
import { markStep, saveSteps } from '@/lib/pilot/steps';

export const dynamic = 'force-dynamic';

const isDate = (d: unknown): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);

/**
 * The steps of one entry. op save keeps the steps as the resident left them and answers with them as the File holds
 * them now. op mark checks one step, or a smaller step, on one day. The resident does both from the screen.
 */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  const id = String(body?.entry?.id ?? '');
  const weekly = body?.entry?.weekly === true;
  const date = isDate(body?.date) ? body.date : null;
  if (!isUuid(id) || !date) return Response.json({ error: 'The request named no entry or no day.' }, { status: 400 });
  try {
    const out = await withResident({ userId: a.userId, actor: 'resident' }, async q => {
      const e = weekly ? (await loadWeeklyItem(q, id))?.s : (await loadCommitment(q, id))?.c;
      if (!e) return { status: 404, body: { error: 'That entry is not on file.' } };
      const base = planFor(e.label, e.folder ?? null, a.access.synthetic);
      if (!base) return { status: 404, body: { error: 'This entry holds no steps.' } };
      const owner = ownerFor(e.label, id, weekly);
      if (body?.op === 'mark') {
        const step = String(body?.step ?? '');
        if (!isUuid(step)) return { status: 400, body: { error: 'The request named no step.' } };
        const at = typeof body?.at === 'string' && !Number.isNaN(Date.parse(body.at)) ? new Date(body.at).toISOString() : null;
        await markStep(q, step, date, body?.done !== false, at);
        return { status: 200, body: { ok: true } };
      }
      const plan = body?.plan as DemoPlan;
      if (!plan || !Array.isArray(plan.groups)) return { status: 400, body: { error: 'The request held no steps.' } };
      return { status: 200, body: { plan: await saveSteps(q, owner, plan, base, date) } };
    });
    return Response.json(out.body, { status: out.status, headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    const rule = typeof e?.message === 'string' && e?.code === 'P0001' ? e.message : null;
    return Response.json({ error: rule || 'The steps were not saved, because the database did not answer. Your change is kept on this screen.' }, { status: rule ? 400 : 503 });
  }
}
