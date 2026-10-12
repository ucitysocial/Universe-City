import { admit } from '@/lib/pilot/auth';
import { withResident } from '@/lib/pilot/db';
import { loadFile } from '@/lib/pilot/file';
import { modelRoute } from '@/lib/pilot/model';
import { thread } from '@/lib/pilot/turn';

export const dynamic = 'force-dynamic';

/** The conversation, oldest first, with what each reply did, and each item that waits for the resident. */
export async function GET(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  const before = new URL(req.url).searchParams.get('before');
  try {
    const t = await thread(a.userId, { before });
    const view = await withResident({ userId: a.userId, actor: 'resident' }, q => loadFile(q, a.access.timezone, { statements: 1 }));
    return Response.json({
      messages: t.messages, more: t.more, presses: t.presses,
      waiting: view.waitingResident.map(p => ({ id: p.id, kind: p.kind, summary: p.summary })),
      noticeSeen: !!a.access.notice_seen_at,
      ownAccount: modelRoute() === 'own account'
    }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'The conversation was not loaded, because the database did not answer.' }, { status: 503 });
  }
}
