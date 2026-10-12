import { admit } from '@/lib/pilot/auth';
import { loadCommitment, spanWords } from '@/lib/pilot/browse';
import { isUuid, withResident } from '@/lib/pilot/db';
import { belongsTo, sayBelongs } from '@/lib/pilot/dept';
import { editCommitment, noteOnCommitment } from '@/lib/pilot/edit';
import { removeNumbers } from '@/lib/pilot/guard';
import { Refusal } from '@/lib/pilot/tools';

export const dynamic = 'force-dynamic';

const OUTCOME: Record<string, string> = { executed: 'Executed', partly_executed: 'Partly executed', did_not_happen: 'Did not happen' };

/** One commitment, for the small window that opens over the calendar. It reads and changes nothing. */
export async function GET(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  const id = new URL(req.url).searchParams.get('id') || '';
  if (!isUuid(id)) return Response.json({ error: 'The request named no entry.' }, { status: 400 });
  try {
    const x = await withResident({ userId: a.userId, actor: 'resident' }, q => loadCommitment(q, id));
    if (!x) return Response.json({ error: 'That entry is not on file.' }, { status: 404 });
    const { c } = x;
    const b = belongsTo(c.folder, c.label);
    return Response.json({
      id: c.id, label: c.label, date: c.on_date, start: c.start_min, end: c.end_min, time: spanWords(c.start_min, c.end_min),
      belongs: sayBelongs(b), color: b.color,
      state: c.withdrawn_at ? 'Taken off' : OUTCOME[c.execution] || 'Planned',
      editable: !c.withdrawn_at && c.execution === 'planned',
      said: c.said, notes: x.notes.map(n => ({ id: n.id, said: n.said })), changes: x.history.length
    }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'The entry was not loaded, because the database did not answer.' }, { status: 503 });
  }
}

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
