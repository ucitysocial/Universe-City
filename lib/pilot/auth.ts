// Who is asking. Every screen and every route of the founder test goes through this file.

import { supabaseServer } from '@/lib/supabase/server';
import { pilotEnabled } from './config';
import { withResident } from './db';
import { loadAccess, type Access } from './file';
import { ensureLocal, LOCAL_USER, localMode } from './local';

export type Who =
  | { ok: true; userId: string; access: Access }
  | { ok: false; why: 'off' | 'logged_out' | 'not_in_test' | 'database'; detail?: string };

export async function who(): Promise<Who> {
  if (!pilotEnabled()) return { ok: false, why: 'off' };
  let userId: string | null = null;
  if (localMode()) {
    await ensureLocal();
    userId = LOCAL_USER;
  } else {
    const { data: { user } } = await supabaseServer().auth.getUser();
    userId = user?.id ?? null;
  }
  if (!userId) return { ok: false, why: 'logged_out' };
  try {
    const access = await withResident({ userId, actor: 'resident' }, q => loadAccess(q));
    if (!access) return { ok: false, why: 'not_in_test' };
    return { ok: true, userId, access };
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
    if (origin && host) {
      let from = '';
      try { from = new URL(origin).host; } catch { /* no usable origin */ }
      if (from !== host) return Response.json({ error: 'The request did not come from this site.' }, { status: 403 });
    }
  }
  const w = await who();
  if (w.ok) return { userId: w.userId, access: w.access };
  const s = SAY[w.why];
  return Response.json({ error: s.error }, { status: s.status, headers: { 'cache-control': 'no-store' } });
}
