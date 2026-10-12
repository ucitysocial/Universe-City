import { admit } from '@/lib/pilot/auth';
import { isUuid, withResident } from '@/lib/pilot/db';
import { clip } from '@/lib/pilot/guard';
import { localNow } from '@/lib/pilot/time';
import { decide, decideProposal, Refusal, type Env } from '@/lib/pilot/tools';

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
    const result = await withResident({ userId: a.userId, actor: desk ? 'agent' : 'resident' }, async q => {
      const env: Env = {
        q, userId: a.userId, messageId: null, messageText: '', now: localNow(a.access.timezone),
        basis: 'resident_confirmation', via: 'screen'
      };
      const r = desk ? await decideProposal(env, id, decision) : await decide(env, id, decision);
      // A second press on an item that is already decided changes nothing, and the list keeps the first press alone.
      await q(
        `insert into uc_pilot.actions (tool, args, outcome, detail, brief, target, target_id, idem_key)
         values ($1, $2::jsonb, $3, $4, $5, $6, $7, $8) on conflict (user_id, idem_key) do nothing`,
        [desk ? 'desk_decision' : 'screen_decision', JSON.stringify({ id, decision }), r.outcome === 'unchanged' ? 'unchanged' : 'decided',
          clip(r.detail, 900), r.brief ? clip(r.brief, 300) : null, r.target || null, r.targetId || null, `screen:${id}`]);
      return r;
    });
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
