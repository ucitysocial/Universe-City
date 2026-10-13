import { askCopilot, type ThreadLine } from '@/lib/agent/copilot';
import { demoClients } from '@/lib/agent/demo';
import { whoAgent } from '@/lib/agent/gate';
import { loadLiveClient } from '@/lib/agent/live';
import { localNow } from '@/lib/pilot/time';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * The agent thinks out loud about one client and the copilot answers. Only an agent reaches it, and only from this
 * site's own pages. The live client is the agent's own File. The answer is returned to the page and stored nowhere.
 */
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  let from = '';
  try { from = origin ? new URL(origin).host : ''; } catch { /* no usable origin */ }
  if (!origin || !host || from !== host) return Response.json({ error: 'The request did not come from this site.' }, { status: 403 });

  const w = await whoAgent();
  if (!w.ok) return Response.json({ error: 'This login is not an agent login.' }, { status: w.why === 'logged_out' ? 401 : 403 });

  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  const id = typeof body?.client === 'string' ? body.client : '';
  const thread: ThreadLine[] = Array.isArray(body?.thread)
    ? body.thread.slice(-12).map((t: any) => ({ who: t?.who === 'copilot' ? 'copilot' : 'agent', text: String(t?.text || '').slice(0, 2000) })).filter((t: ThreadLine) => t.text)
    : [];
  if (!thread.length || thread[thread.length - 1].who !== 'agent') return Response.json({ error: 'Write a note first.' }, { status: 400 });

  const client = id === 'live'
    ? await loadLiveClient(w.userId, w.access)
    : demoClients(localNow(w.access.timezone).date).find(c => c.id === id) || null;
  if (!client) return Response.json({ error: 'No client with that name is in your list.' }, { status: 404 });

  try {
    const answer = await askCopilot(client, thread);
    return Response.json(answer, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return Response.json({ error: `The copilot did not answer. ${String(e?.message || '').slice(0, 160)}` }, { status: 502 });
  }
}
