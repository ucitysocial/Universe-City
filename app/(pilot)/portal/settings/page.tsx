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
const CHANGE = /^(change_|correct_|withdraw_|end_|set_folder|tidy_|screen_edit|close_)/;

/**
 * Settings: the account, what changed in the File, taking the File out, and clearing the test. The founder set on
 * October 12, 2026 that Activity sits here, with the account and the downloads, and not in the main menu.
 * More settings are added here as they are built.
 */
export default async function SettingsPage() {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/settings');
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
    <div className="pt-page set">
      <span id="uc-path" data-path="Settings" hidden />
      <h1>Settings</h1>

      <h2>Your account</h2>
      <dl className="fields set-fields">
        <dt>Name</dt><dd>{w.access.display_name || 'Not on file'}</dd>
        <dt>Email</dt><dd>{w.email || 'Not on file'}</dd>
        <dt>Time zone</dt><dd>{w.access.timezone.replace(/_/g, ' ')}</dd>
        <dt>Agent use today</dt><dd>{today.replies} {today.replies === 1 ? 'reply' : 'replies'}, about {money(today.cost_micro)} of the {money(dailyCapMicro())} daily limit</dd>
      </dl>

      <h2 id="activity">Activity</h2>
      <PilotActivity lines={lines} />

      <h2>Export</h2>
      <div className="pt-btns">
        <a className="pt-btn" href="/api/pilot/export?format=text">Download the conversation as a text file</a>
        <a className="pt-btn ghost" href="/api/pilot/export">Download every entry as a data file</a>
      </div>
      <p className="pt-meta">A file you download leaves the database. Keep it where you keep private papers.</p>

      <h2>Import</h2>
      <p className="pt-meta">Bringing a file into your File is not built yet.</p>

      <h2>Clear the test</h2>
      <PilotClear />
    </div>
  );
}
