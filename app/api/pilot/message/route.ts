import { admit } from '@/lib/pilot/auth';
import { Refusal } from '@/lib/pilot/tools';
import { NoAccess, receive } from '@/lib/pilot/turn';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** One message from the resident. The same key sent again returns the same reply. */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  try {
    const viewing = typeof body?.viewing === 'string' ? body.viewing.slice(0, 200) : null;
    const out = await receive(a.userId, String(body?.text ?? ''), String(body?.key ?? ''), { viewing });
    return Response.json(out, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    if (e instanceof Refusal) return Response.json({ error: e.message }, { status: 400 });
    if (e instanceof NoAccess) return Response.json({ error: 'This account is not part of the founder test.' }, { status: 403 });
    return Response.json({ error: 'The message was not kept, because the database did not answer. Send it again.' }, { status: 503 });
  }
}
