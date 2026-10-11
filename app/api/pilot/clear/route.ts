import { admit } from '@/lib/pilot/auth';
import { withResident } from '@/lib/pilot/db';

export const dynamic = 'force-dynamic';

const PHRASE = 'clear my test data';

/** Removes every row the test holds for the resident who asks. The login stays. */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  if (String(body?.phrase ?? '').trim().toLowerCase() !== PHRASE) {
    return Response.json({ error: 'Nothing was cleared. Type the words clear my test data to clear it.' }, { status: 400 });
  }
  try {
    const rows = await withResident({ userId: a.userId, actor: 'resident' }, q => q<any>(`select uc_pilot.clear_my_test_data() as removed`));
    return Response.json({ ok: true, removed: rows[0]?.removed ?? {} });
  } catch {
    return Response.json({ error: 'Nothing was cleared, because the database did not answer.' }, { status: 503 });
  }
}
