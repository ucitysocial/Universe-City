import Link from 'next/link';
import { redirect } from 'next/navigation';
import PilotGuided from '@/components/PilotGuided';
import { who } from '@/lib/pilot/auth';
import { loadCommitment, loadWeeklyItem, spanWords } from '@/lib/pilot/browse';
import { isUuid, withResident } from '@/lib/pilot/db';
import { demoPlan } from '@/lib/pilot/guided-demo';
import { sayDate, localNow } from '@/lib/pilot/time';

export const dynamic = 'force-dynamic';

/**
 * Guided Life for one entry: the center of the frame shows one step at a time. The founder set on October 13, 2026
 * that it is shown first as a demo, in the File of a made up resident. Nothing pressed here is filed.
 */
export default async function GuidedPage({ params, searchParams }: { params: { id: string }; searchParams: { weekly?: string; date?: string } }) {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/home');
  const id = params.id;
  const weekly = searchParams.weekly === '1';
  const zone = w.access.timezone;
  const today = localNow(zone).date;
  const entry = !isUuid(id) ? null : await withResident({ userId: w.userId, actor: 'resident' }, async q => {
    if (weekly) {
      const x = await loadWeeklyItem(q, id);
      return x ? { label: x.s.label, date: today, start: x.s.start_min, end: x.s.end_min } : null;
    }
    const x = await loadCommitment(q, id);
    return x ? { label: x.c.label, date: x.c.on_date, start: x.c.start_min, end: x.c.end_min } : null;
  });
  const plan = entry && w.access.synthetic ? demoPlan(entry.label) : null;
  if (!entry || !plan) {
    return (
      <div className="gl-none">
        <h1>Guided Life is not open for this entry</h1>
        <p>{!entry
          ? 'This entry is not on file.'
          : 'Guided Life is a demo for now. It opens on the made up residents of the test, for entries that have example steps.'}</p>
        <Link href="/portal/home" className="pt-btn">Go to the conversation</Link>
      </div>
    );
  }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date || '') ? searchParams.date! : entry.date;
  return (
    <PilotGuided
      sessionKey={`uc:gl:${w.userId}:${id}:${date}`}
      href={`/portal/guided/${id}${weekly ? '?weekly=1' : `?date=${date}`}`}
      label={entry.label}
      when={`${date === today ? 'Today' : sayDate(date)}, ${spanWords(entry.start, entry.end)}`}
      date={date} end={entry.end} zone={zone} plan={plan}
    />
  );
}
