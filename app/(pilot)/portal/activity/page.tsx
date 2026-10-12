import { redirect } from 'next/navigation';
import PilotActivity, { type ActivityLine } from '@/components/PilotActivity';
import PilotClear from '@/components/PilotClear';
import { who } from '@/lib/pilot/auth';
import { dailyCapMicro } from '@/lib/pilot/config';
import { withResident } from '@/lib/pilot/db';
import { loadActivity } from '@/lib/pilot/file';
import { localNow, sayClock, sayDate } from '@/lib/pilot/time';

export const dynamic = 'force-dynamic';

const money = (micro: number) => `$${(micro / 1_000_000).toFixed(2)}`;
const CHANGE = /^(change_|correct_|withdraw_|end_|set_folder|screen_edit|close_)/;

/**
 * Activity: what changed in the File, one line each, newest first, grouped by day. The server writes each line when
 * the action runs. The language model cannot write a line here. A line that changed nothing is left out.
 */
export default async function ActivityPage() {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/activity');
  const zone = w.access.timezone;
  const { actions, today } = await withResident({ userId: w.userId, actor: 'resident' }, q => loadActivity(q, zone));

  const lines: ActivityLine[] = actions.filter(a => a.outcome !== 'unchanged').map(a => {
    const at = localNow(zone, new Date(a.at));
    const group: ActivityLine['group'] =
      a.outcome === 'read' ? 'read'
        : a.outcome === 'decided' ? 'decided'
          : a.outcome === 'prepared' || a.outcome === 'proposed' ? 'pending'
            : a.outcome === 'refused' || a.outcome === 'failed' ? 'left'
              : CHANGE.test(a.tool) ? 'changed' : 'filed';
    const word = { filed: 'Filed', changed: 'Changed', decided: 'Decided', pending: 'Pending', left: 'Left off', read: 'Looked up' }[group];
    const tone = { filed: 'filed', changed: 'filed', decided: 'filed', pending: 'wait', left: 'no', read: 'unknown' }[group];
    const raw = (a.brief || a.detail || '').replace(/^(Filed|Updated|Confirmed|Declined|Changed|Prepared|Not done|Nothing changed)[.:]\s*/i, '');
    return {
      id: a.id, day: sayDate(at.date), time: sayClock(at.minutes), group, word, tone,
      line: raw.length > 220 ? `${raw.slice(0, 220)} (more text follows)` : raw,
      by: a.actor === 'resident' ? 'You' : a.actor === 'agent' ? 'A person' : 'Agent'
    };
  });

  return (
    <div className="pt-page">
      <span id="uc-path" data-path="Activity" hidden />
      <h1>Activity</h1>
      <PilotActivity lines={lines} />
      <p className="act-use">
        Today: {today.replies} {today.replies === 1 ? 'reply' : 'replies'}, about {money(today.cost_micro)} of the {money(dailyCapMicro())} daily limit.
      </p>
      <h2>Clear the test</h2>
      <PilotClear />
    </div>
  );
}
