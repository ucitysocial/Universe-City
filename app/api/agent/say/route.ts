import { who } from '@/lib/pilot/auth';
import { isUuid } from '@/lib/pilot/db';
import { sayThroughAgent } from '@/lib/pilot/turn';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * An agent who opened a client writes to that client. The agent software writes the message from the agent's words,
 * and the client sees it as the agent. Only from this site's own pages, and only in the agent view.
 */
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  let from = '';
  try { from = origin ? new URL(origin).host : ''; } catch { /* no usable origin */ }
  if (!origin || !host || from !== host) return Response.json({ error: 'The request did not come from this site.' }, { status: 403 });
  const w = await who();
  if (!w.ok || !w.agent) return Response.json({ error: 'Open a client from the Agent Portal first.' }, { status: 403 });
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  const text = typeof body?.text === 'string' ? body.text : '';
  const key = typeof body?.key === 'string' && isUuid(body.key) ? body.key : crypto.randomUUID();
  try {
    const r = await sayThroughAgent(w.userId, text, key);
    if (r.state === 'skipped') return Response.json({ error: r.why || 'No message was written.' }, { status: 400 });
    return Response.json({ ok: true, reply: r.reply }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'No message was written, because the database did not answer.' }, { status: 503 });
  }
}
