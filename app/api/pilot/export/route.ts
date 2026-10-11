import { admit } from '@/lib/pilot/auth';
import { withResident } from '@/lib/pilot/db';
import { exportAll, exportText } from '@/lib/pilot/export';

export const dynamic = 'force-dynamic';

/**
 * The resident's whole test as one file: the conversation, what each reply did, every entry, and every change.
 * format=text returns it as plain text to read. The default is a data file for study.
 */
export async function GET(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  const text = new URL(req.url).searchParams.get('format') === 'text';
  try {
    const all = await withResident({ userId: a.userId, actor: 'resident' }, q => exportAll(q, a.access.timezone));
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '');
    const name = `universe-city-founder-test-${stamp}.${text ? 'txt' : 'json'}`;
    return new Response(text ? exportText(all) : JSON.stringify(all, null, 1), {
      headers: {
        'content-type': text ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="${name}"`,
        'cache-control': 'no-store'
      }
    });
  } catch {
    return Response.json({ error: 'The file was not made, because the database did not answer.' }, { status: 503 });
  }
}
