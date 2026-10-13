import Link from 'next/link';
import { redirect } from 'next/navigation';
import PilotGuided from '@/components/PilotGuided';
import { who } from '@/lib/pilot/auth';
import { loadCommitment, loadWeeklyItem, spanWords } from '@/lib/pilot/browse';
import { isUuid, withResident } from '@/lib/pilot/db';
import { planFor } from '@/lib/pilot/plan-for';
import { shownLabel } from '@/lib/pilot/private';
import { DAY_FIT, loadCalendar } from '@/lib/pilot/calendar';
import type { TodayItem } from '@/components/PilotGuided';
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
      return x ? { label: x.s.label, folder: x.s.folder as string | null, date: today, start: x.s.start_min, end: x.s.end_min } : null;
    }
    const x = await loadCommitment(q, id);
    return x ? { label: x.c.label, folder: x.c.folder as string | null, date: x.c.on_date, start: x.c.start_min, end: x.c.end_min } : null;
  });
  const plan = entry ? planFor(entry.label, entry.folder, w.access.synthetic) : null;
  if (!entry || !plan) {
    return (
      <div className="gl-none">
        <h1>Guided Life is not open for this entry</h1>
        <p>{!entry
          ? 'This entry is not on file.'
          : 'Guided Life opens for a routine. Steps for this entry are not on file yet. Tell your agent the steps, and they show here.'}</p>
        <Link href="/portal/home" className="pt-btn">Go to the conversation</Link>
      </div>
    );
  }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date || '') ? searchParams.date! : entry.date;
  // The other entries of that day, so the session can say when a different entry is the one happening now.
  const cal = await withResident({ userId: w.userId, actor: 'resident' }, q => loadCalendar(q, date, date, today, DAY_FIT));
  const items: TodayItem[] = (cal.days[0] ? [...cal.days[0].untimed, ...cal.days[0].timed] : []).map(i => ({
    key: i.key, start: i.start, end: i.end, kind: i.kind, label: i.label, time: i.timeText.replace(/, end unknown$/, ''),
    go: planFor(i.label, null, w.access.synthetic, i.steps) ? `/portal/guided/${i.key.split(':')[0]}?${i.kind === 'weekly' ? 'weekly=1&' : ''}date=${date}` : i.href
  }));
  // A routine whose parts were filed as entries of their own opens with every part as a step.
  const here = cal.days[0] ? [...cal.days[0].untimed, ...cal.days[0].timed].find(i => i.key.split(':')[0] === id) : undefined;
  const steps = here?.steps ? planFor(entry.label, entry.folder, w.access.synthetic, here.steps) ?? plan : plan;
  return (
    <PilotGuided
      sessionKey={`uc:gl:${w.userId}:${id}:${date}`}
      planKey={`uc:gl:plan:${w.userId}:${id}`}
      href={`/portal/guided/${id}?${weekly ? 'weekly=1&' : ''}date=${date}`}
      label={shownLabel(entry.label, entry.folder)}
      when={`${date === today ? 'Today' : sayDate(date)}, ${spanWords(entry.start, entry.end)}`}
      date={date} end={entry.end} zone={zone} plan={steps} entryId={id} today={items}
    />
  );
}
