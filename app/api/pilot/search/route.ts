import { admit } from '@/lib/pilot/auth';
import { searchAll } from '@/lib/pilot/browse';
import { withResident } from '@/lib/pilot/db';

export const dynamic = 'force-dynamic';

/**
 * Looks for words in the resident's File and conversation. The words arrive in the body of the request,
 * so they are in no address and in no address log. The search reads and changes no entry.
 */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  const text = typeof body?.text === 'string' ? body.text.slice(0, 120) : '';
  try {
    const found = await withResident({ userId: a.userId, actor: 'resident' }, q => searchAll(q, text));
    return Response.json({ found }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'The search did not run, because the database did not answer.' }, { status: 503 });
  }
}
