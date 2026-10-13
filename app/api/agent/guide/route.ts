import { askGuide, type GuideLine } from '@/lib/agent/guide';
import { who } from '@/lib/pilot/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * The Agency Guide answers a person on the team about the client open in the Agent Portal. Only an agent who opened a
 * client reaches it, and only from this site's own pages. The answer is returned to the page and stored nowhere.
 */
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  let from = '';
  try { from = origin ? new URL(origin).host : ''; } catch { /* no usable origin */ }
  if (!origin || !host || from !== host) return Response.json({ error: 'The request did not come from this site.' }, { status: 403 });

  const w = await who();
  if (!w.ok) return Response.json({ error: 'Log in as an agent first.' }, { status: w.why === 'logged_out' ? 401 : 403 });
  if (!w.agent) return Response.json({ error: 'Open a client from the Agent Portal first.' }, { status: 403 });

  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  const thread: GuideLine[] = Array.isArray(body?.thread)
    ? body.thread.slice(-12).map((t: any) => ({ who: t?.who === 'guide' ? 'guide' : 'agent', text: String(t?.text || '').slice(0, 2000) })).filter((t: GuideLine) => t.text)
    : [];
  if (!thread.length || thread[thread.length - 1].who !== 'agent') return Response.json({ error: 'Write to the Agency Guide first.' }, { status: 400 });

  try {
    const answer = await askGuide(w.userId, thread);
    return Response.json(answer, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return Response.json({ error: `The Agency Guide did not answer. ${String(e?.message || '').slice(0, 160)}` }, { status: 502 });
  }
}
