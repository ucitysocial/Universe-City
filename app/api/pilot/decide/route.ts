import { admit } from '@/lib/pilot/auth';
import { isUuid } from '@/lib/pilot/db';
import { press } from '@/lib/pilot/press';
import { Refusal } from '@/lib/pilot/tools';

export const dynamic = 'force-dynamic';

/**
 * A press on the screen.
 * The resident confirms or declines an item that waits for the resident.
 * A person who decides proposals in this test confirms or declines a proposal, at the desk.
 */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  const id = String(body?.id ?? '');
  const decision = body?.decision === 'confirm' ? 'confirm' : body?.decision === 'decline' ? 'decline' : null;
  const desk = body?.desk === true;
  if (!isUuid(id) || !decision) return Response.json({ error: 'The request named no item or no decision.' }, { status: 400 });
  if (desk && !a.access.decides_proposals) {
    return Response.json({ error: 'A proposal is decided by a person acting as the agent. This login does not hold that part in the test.' }, { status: 403 });
  }
  try {
    const result = await press(a.userId, a.access, id, decision, desk);
    return Response.json({
      ok: true, detail: result.brief || result.detail, changed: result.outcome !== 'unchanged',
      // The guide goes on after the resident's own press. The screen asks for that reply next.
      next: !desk && result.outcome !== 'unchanged' ? id : null
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    if (e instanceof Refusal) return Response.json({ error: e.message }, { status: 400 });
    const rule = typeof e?.message === 'string' && e?.code === 'P0001' ? e.message : null;
    return Response.json({ error: rule || 'The decision was not filed, because the database did not answer. Nothing changed.' }, { status: rule ? 400 : 503 });
  }
}
