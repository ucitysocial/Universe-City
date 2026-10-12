import { admit } from '@/lib/pilot/auth';
import { withResident } from '@/lib/pilot/db';

export const dynamic = 'force-dynamic';

/** The resident read what the test keeps. */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  try {
    await withResident({ userId: a.userId, actor: 'resident' }, q =>
      q(`update uc_pilot.access set notice_seen_at = coalesce(notice_seen_at, now()) where user_id = uc_pilot.uid()`));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'That was not saved, because the database did not answer.' }, { status: 503 });
  }
}
