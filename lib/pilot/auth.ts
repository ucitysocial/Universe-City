// Who is asking. Every screen and every route of the founder test goes through this file.

import { supabaseServer } from '@/lib/supabase/server';
import { pilotEnabled } from './config';
import { withResident } from './db';
import { loadAccess, type Access } from './file';
import { cookies } from 'next/headers';
import { demoClientIds, VIEW_COOKIE } from '../agent/clients';
import { ensureLocal, LOCAL_USER, localMode } from './local';

function agentView(): string | null {
  try {
    const v = cookies().get(VIEW_COOKIE)?.value || '';
    return /^[0-9a-f-]{36}$/i.test(v) ? v.toLowerCase() : null;
  } catch { return null; }
}

/** Set when an agent has opened a client: the person logged in, who sees the client's File. */
export type AgentSeat = { userId: string; name: string | null; email: string | null };

export type Who =
  | { ok: true; userId: string; access: Access; email: string | null; agent?: AgentSeat }
  | { ok: false; why: 'off' | 'logged_out' | 'not_in_test' | 'database'; detail?: string; email?: string | null };

export async function who(opts: { own?: boolean } = {}): Promise<Who> {
  if (!pilotEnabled()) return { ok: false, why: 'off' };
  let userId: string | null = null;
  let email: string | null = null;
  if (localMode()) {
    await ensureLocal();
    userId = LOCAL_USER;
  } else {
    const { data: { user } } = await supabaseServer().auth.getUser();
    userId = user?.id ?? null;
    email = user?.email ?? null;
  }
  if (!userId) return { ok: false, why: 'logged_out' };
  try {
    const access = await withResident({ userId, actor: 'resident' }, q => loadAccess(q));
    if (!access) return { ok: false, why: 'not_in_test', email };
    // An agent who opened a client from the Agent Portal sees that client's File. The founder set this on October 13,
    // 2026. The client is the agent's own File or a made up resident of the test, and nothing else.
    const view = opts.own ? null : agentView();
    if (view && access.decides_proposals && (!access.synthetic || localMode())) {
      const allowed = view === userId || demoClientIds().includes(view);
      const target = allowed ? await withResident({ userId: view, actor: 'resident' }, q => loadAccess(q)) : null;
      if (target && (view === userId || target.synthetic)) {
        return { ok: true, userId: view, access: target, email, agent: { userId, name: access.display_name, email } };
      }
    }
    return { ok: true, userId, access, email };
  } catch (e: any) {
    return { ok: false, why: 'database', detail: typeof e?.message === 'string' ? e.message : undefined };
  }
}

const SAY: Record<string, { status: number; error: string }> = {
  off: { status: 404, error: 'The founder test is not running on this site.' },
  logged_out: { status: 401, error: 'Log in to use the founder test.' },
  not_in_test: { status: 403, error: 'This account is not part of the founder test.' },
  database: { status: 503, error: 'The founder test database did not answer. Nothing was filed.' }
};

/** For a route. Returns the resident, or the response that turns the request away. */
export async function admit(req: Request): Promise<{ userId: string; access: Access } | Response> {
  if (req.method !== 'GET') {
    // A write is accepted only from this site's own pages.
    const origin = req.headers.get('origin');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    let from = '';
    try { from = origin ? new URL(origin).host : ''; } catch { /* no usable origin */ }
    if (!origin || !host || from !== host) {
      return Response.json({ error: 'The request did not come from this site.' }, { status: 403 });
    }
  }
  const w = await who();
  // In the agent view the client's File changes only through the automated agent, and the client confirms each change.
  // The founder set this on October 13, 2026. A person on the team writes in the conversation, and the automated agent
  // sends it in its own words. Every other write stays with the client.
  if (w.ok && w.agent && req.method !== 'GET') {
    return Response.json({ error: 'The client makes this choice. Write to the client in the conversation, and the agent sends it.' }, { status: 403 });
  }
  if (w.ok) return { userId: w.userId, access: w.access };
  const s = SAY[w.why];
  return Response.json({ error: s.error }, { status: s.status, headers: { 'cache-control': 'no-store' } });
}
