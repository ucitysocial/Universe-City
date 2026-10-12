import { admit } from '@/lib/pilot/auth';
import { editCommitment, noteOnCommitment } from '@/lib/pilot/edit';
import { removeNumbers } from '@/lib/pilot/guard';
import { Refusal } from '@/lib/pilot/tools';

export const dynamic = 'force-dynamic';

/**
 * The form on one commitment. The resident changes its name, day, or time, or writes a note on it.
 * The server applies the same rules as in the conversation and answers with what is on file afterward.
 */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  const id = String(body?.id ?? '');
  const field = (k: string) => (typeof body?.[k] === 'string' ? (body[k] as string).slice(0, 200) : undefined);
  try {
    const r = typeof body?.note === 'string'
      ? await noteOnCommitment(a.userId, a.access, id, removeNumbers(body.note.slice(0, 1200)).text)
      : await editCommitment(a.userId, a.access, id, { label: field('label'), date: field('date'), start: field('start'), end: field('end') });
    return Response.json({ ok: true, detail: r.brief || r.detail, changed: r.outcome !== 'unchanged', href: null }, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    if (e instanceof Refusal) return Response.json({ error: e.message }, { status: 400 });
    const rule = typeof e?.message === 'string' && e?.code === 'P0001' ? e.message : null;
    return Response.json({ error: rule || 'Not changed, because the database did not answer. The entry is as it was.' }, { status: rule ? 400 : 503 });
  }
}
