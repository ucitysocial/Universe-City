import { admit } from '@/lib/pilot/auth';
import { isUuid } from '@/lib/pilot/db';
import { continueAfterPress, NoAccess } from '@/lib/pilot/turn';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * After the resident answers a waiting item with the button, the agent writes one short reply and goes on with
 * the open work. The reply is written once for each press and takes no action.
 */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  const after = String(body?.after ?? '');
  if (!isUuid(after)) return Response.json({ error: 'The request named no item.' }, { status: 400 });
  try {
    const out = await continueAfterPress(a.userId, after);
    return Response.json({ ok: true, state: out.state }, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    if (e instanceof NoAccess) return Response.json({ error: 'This account is not part of the founder test.' }, { status: 403 });
    // The decision is on file either way. The agent's next reply is written when the resident writes again.
    return Response.json({ ok: true, state: 'skipped' }, { headers: { 'cache-control': 'no-store' } });
  }
}
