import { redirect } from 'next/navigation';
import PilotClear from '@/components/PilotClear';
import { who } from '@/lib/pilot/auth';
import { dailyCapMicro, modelName } from '@/lib/pilot/config';
import { withResident } from '@/lib/pilot/db';
import { loadActivity } from '@/lib/pilot/file';
import { ACTION_NAME, OUTCOME_WORD } from '@/lib/pilot/names';
import { PROMPT_VERSION } from '@/lib/pilot/prompt';
import { localNow } from '@/lib/pilot/time';

export const dynamic = 'force-dynamic';

const money = (micro: number) => `$${(micro / 1_000_000).toFixed(2)}`;

export default async function ActivityPage() {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/activity');
  const zone = w.access.timezone;
  const { actions, today } = await withResident({ userId: w.userId, actor: 'resident' }, q => loadActivity(q, zone));
  const when = (iso: string) => localNow(zone, new Date(iso)).label;

  return (
    <div className="pt-page">
      <span id="uc-path" data-path="Activity" hidden />
      <p className="pt-kick">Founder test</p>
      <h1>Activity</h1>
      <p className="pt-lede">
        This page lists each action software took for you, newest first. The server writes each line when the action runs.
        The language model cannot write a line here.
      </p>

      <h2>Language model use today</h2>
      <div className="pt-card">
        <p className="pt-said">{today.replies} {today.replies === 1 ? 'reply' : 'replies'} today. About {money(today.cost_micro)} of a daily limit of {money(dailyCapMicro())}.</p>
        <p className="pt-meta">
          {today.input.toLocaleString('en-US')} tokens read and {today.output.toLocaleString('en-US')} tokens written. Model: {modelName()}. Instructions version: {PROMPT_VERSION}.
        </p>
        <p className="pt-meta">When the daily limit is reached, your messages are still kept and the guide stops replying until the next day.</p>
      </div>

      <h2>Actions</h2>
      {actions.length === 0 && <p className="pt-empty">No action is listed yet. The server adds a line each time the guide reads your File or asks to change it.</p>}
      {actions.map(a => {
        const o = OUTCOME_WORD[a.outcome] || { word: a.outcome, tone: 'unknown' };
        return (
          <div className="pt-row" key={a.id}>
            <div>
              <p className="pt-said">{ACTION_NAME[a.tool] || a.tool}</p>
              {a.detail && <p className="pt-meta">{a.detail}</p>}
              <p className="pt-meta">{when(a.at)}. Carried out by {a.actor === 'software' ? 'software' : a.actor === 'agent' ? 'a person' : 'you'}.</p>
            </div>
            <span className={`pt-chip ${o.tone}`}>{o.word}</span>
          </div>
        );
      })}

      <h2>Take the test out to study it</h2>
      <div className="pt-card">
        <p className="pt-said">
          Each file holds the whole conversation in order, what each reply filed or left off, and each entry with its earlier versions.
          The data file also holds what the language model asked for at each step of each reply.
        </p>
        <div className="pt-btns">
          <a className="pt-btn" href="/api/pilot/export?format=text">Download the conversation as a text file</a>
          <a className="pt-btn ghost" href="/api/pilot/export">Download every entry as a data file</a>
        </div>
        <p className="pt-meta">A file you download leaves the database. Keep it where you keep private papers.</p>
      </div>

      <h2>Clear the test</h2>
      <PilotClear />
    </div>
  );
}
