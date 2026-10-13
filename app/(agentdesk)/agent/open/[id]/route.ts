import { NextResponse } from 'next/server';
import { demoClientIds, VIEW_COOKIE } from '@/lib/agent/clients';
import { whoAgent } from '@/lib/agent/gate';
import { withResident } from '@/lib/pilot/db';
import { loadAccess } from '@/lib/pilot/file';

export const dynamic = 'force-dynamic';

/**
 * Opens one client: the Resident Portal then shows that client's File, with the agent's tools. "me" is the agent's own
 * File. A made up resident opens only when its own access row says it is made up.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const w = await whoAgent();
  const home = new URL('/agent', req.url);
  if (!w.ok) return NextResponse.redirect(new URL(w.why === 'logged_out' ? '/login?next=/agent' : '/agent', req.url));
  const id = params.id === 'me' ? w.userId : params.id.toLowerCase();
  if (id !== w.userId) {
    if (!demoClientIds().includes(id)) return NextResponse.redirect(home);
    const a = await withResident({ userId: id, actor: 'resident' }, q => loadAccess(q));
    if (!a || !a.synthetic) return NextResponse.redirect(home);
  }
  const res = NextResponse.redirect(new URL('/portal/home', req.url));
  res.cookies.set(VIEW_COOKIE, id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 });
  return res;
}
