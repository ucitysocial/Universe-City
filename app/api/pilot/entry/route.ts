import { admit } from '@/lib/pilot/auth';
import { loadCommitment, loadWeeklyItem, owedOnCommitment, owedOnWeekly, spanWords } from '@/lib/pilot/browse';
import { isUuid, withResident } from '@/lib/pilot/db';
import { belongsTo } from '@/lib/pilot/dept';
import { editCommitment, noteOnCommitment } from '@/lib/pilot/edit';
import { removeNumbers } from '@/lib/pilot/guard';
import { folderOf, statusOf } from '@/lib/pilot/owed';
import { sayDate, sayDays } from '@/lib/pilot/time';
import { Refusal } from '@/lib/pilot/tools';
import { demoPlan } from '@/lib/pilot/guided-demo';

export const dynamic = 'force-dynamic';

/**
 * One entry, for the small window that opens over the calendar: a commitment, or with weekly=1 an item that repeats
 * each week. Each one carries the same fields: Day, Time, Department, Folder, Status, and Pending. It changes nothing.
 */
export async function GET(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  const u = new URL(req.url);
  const id = u.searchParams.get('id') || '';
  const weekly = u.searchParams.get('weekly') === '1';
  if (!isUuid(id)) return Response.json({ error: 'The request named no entry.' }, { status: 400 });
  const zone = a.access.timezone;
  try {
    const body = await withResident({ userId: a.userId, actor: 'resident' }, async q => {
      if (weekly) {
        const x = await loadWeeklyItem(q, id);
        if (!x) return null;
        const { s } = x;
        const b = belongsTo(s.folder, s.label);
        return {
          id: s.id, label: s.label, date: '', start: s.start_min, end: s.end_min, day: sayDays(s.days), time: spanWords(s.start_min, s.end_min),
          dept: b.deptName, folder: folderOf(b), color: b.color, status: s.state === 'current' ? 'Repeats each week' : 'Ended',
          pending: (await owedOnWeekly(q, zone, s, b)).map(o => o.folder), editable: false, notes: [], changes: x.history.length
        };
      }
      const x = await loadCommitment(q, id);
      if (!x) return null;
      const { c } = x;
      const b = belongsTo(c.folder, c.label);
      return {
        id: c.id, label: c.label, date: c.on_date, start: c.start_min, end: c.end_min, day: sayDate(c.on_date), time: spanWords(c.start_min, c.end_min),
        dept: b.deptName, folder: folderOf(b), color: b.color, status: statusOf(c),
        pending: (await owedOnCommitment(q, zone, c, b)).map(o => o.folder),
        editable: !c.withdrawn_at && c.execution === 'planned',
        notes: x.notes.map(n => ({ id: n.id, said: n.said })), changes: x.history.length
      };
    });
    if (!body) return Response.json({ error: 'That entry is not on file.' }, { status: 404 });
    // The Guided Life demo shows only in the File of a made up resident. The founder set this on October 13, 2026.
    const plan = a.access.synthetic ? demoPlan(body.label) : null;
    return Response.json({ ...body, plan }, { headers: { 'cache-control': 'no-store' } });
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
      : await editCommitment(a.userId, a.access, id, { label: field('label'), date: field('date'), start: field('start'), end: field('end'), keepBoth: body?.keepBoth === true });
    return Response.json({ ok: true, detail: r.brief || r.detail, changed: r.outcome !== 'unchanged', href: null }, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    const hits = (e as { hits?: unknown })?.hits;
    if (e instanceof Refusal && Array.isArray(hits)) return Response.json({ error: `That time overlaps ${hits.join(', and ')}. Choose a different time, or keep both.`, overlap: true }, { status: 409 });
    if (e instanceof Refusal) return Response.json({ error: e.message }, { status: 400 });
    const rule = typeof e?.message === 'string' && e?.code === 'P0001' ? e.message : null;
    return Response.json({ error: rule || 'Not changed, because the database did not answer. The entry is as it was.' }, { status: rule ? 400 : 503 });
  }
}
