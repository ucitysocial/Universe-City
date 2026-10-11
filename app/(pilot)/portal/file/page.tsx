import { redirect } from 'next/navigation';
import PilotDecide from '@/components/PilotDecide';
import { who } from '@/lib/pilot/auth';
import { withResident } from '@/lib/pilot/db';
import { loadFile, loadHistory, type CommitmentView } from '@/lib/pilot/file';
import { FOLDERS } from '@/lib/domain/folders';
import { localNow, sayDate, sayDays, saySpan } from '@/lib/pilot/time';

export const dynamic = 'force-dynamic';

const BASIS: Record<string, string> = {
  resident_statement: 'You said it',
  resident_confirmation: 'You confirmed it',
  agent_decision: 'A person decided it',
  schedule: 'From the weekly schedule'
};

function outcome(c: CommitmentView): { word: string; tone: string } {
  if (c.withdrawn_at) return { word: 'Taken off', tone: 'unknown' };
  if (c.execution === 'executed') return { word: 'Executed', tone: 'filed' };
  if (c.execution === 'partly_executed') return { word: 'Partly executed', tone: 'wait' };
  if (c.execution === 'did_not_happen') return { word: 'Did not happen', tone: 'no' };
  return { word: 'No outcome reported', tone: 'unknown' };
}

export default async function FilePage() {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/file');
  const zone = w.access.timezone;
  const { view, history } = await withResident({ userId: w.userId, actor: 'resident' }, async q => ({
    view: await loadFile(q, zone, { daysBack: 3, daysAhead: 10, statements: 300 }),
    history: await loadHistory(q)
  }));
  const day = (iso: string) => sayDate(localNow(zone, new Date(iso)).date);
  const order = [...FOLDERS.map(f => f.name), 'General'];
  const folders = order.filter(name => view.statements.some(s => s.folder === name));
  const daysShown = view.days.filter(d => d.plan || d.commitments.length);

  return (
    <div className="pt-page">
      <p className="pt-kick">Founder test</p>
      <h1>Your File in this test</h1>
      <p className="pt-lede">
        This page shows what is on file, what waits for an answer, and what is still unknown.
        Each entry came from the conversation or from a button you pressed.
      </p>

      <h2>Waiting for your answer</h2>
      {view.waitingResident.length === 0 && <p className="pt-empty">No entry waits for your answer. The guide adds one here when it prepares an entry or a Plan.</p>}
      {view.waitingResident.map(p => (
        <div className="pt-card" key={p.id}>
          <span className="pt-chip wait">Waiting for you</span>
          <p className="pt-said" style={{ marginTop: 6 }}>{p.summary}</p>
          {p.rests_on && <p className="pt-meta">It rests on: {p.rests_on}</p>}
          <PilotDecide id={p.id} kind={p.kind} />
        </div>
      ))}

      <h2>Proposals waiting for a person</h2>
      <p className="pt-meta">
        A proposal is a reading the guide made that goes past what you said. It is no entry on file. A person decides it. Software never does.
      </p>
      {view.waitingAgent.length === 0 && <p className="pt-empty">No proposal waits. The guide adds one here when it reads a pattern across your entries.</p>}
      {view.waitingAgent.map(p => (
        <div className="pt-card" key={p.id}>
          <span className="pt-chip agent">Proposal</span>
          <p className="pt-said" style={{ marginTop: 6 }}>{p.summary}</p>
          {p.rests_on && <p className="pt-meta">It rests on: {p.rests_on}</p>}
          {w.access.decides_proposals ? (
            <>
              <p className="pt-meta">In this test you hold the part of the agent. A press here is filed as the decision of a person.</p>
              <PilotDecide id={p.id} kind={p.kind} desk />
            </>
          ) : (
            <p className="pt-meta">No person has decided it yet.</p>
          )}
        </div>
      ))}

      <h2>Time</h2>
      <h3>Weekly schedule</h3>
      {view.schedule.length === 0 && <p className="pt-empty">The weekly schedule is still unknown. Tell the guide what repeats in your week and it is filed here.</p>}
      {view.schedule.length > 0 && (
        <ul className="pt-list">
          {view.schedule.map(s => (
            <li key={s.id}><strong>{s.label}</strong>. {sayDays(s.days)}, {saySpan(s.start_min, s.end_min)}.</li>
          ))}
        </ul>
      )}

      <h3>Days</h3>
      {daysShown.length === 0 && <p className="pt-empty">No commitment and no Plan is on file for the days in view. Tell the guide what a day holds and it is filed here.</p>}
      {daysShown.map(d => (
        <div className="pt-day" key={d.date}>
          <header>
            <strong>{sayDate(d.date)}{d.date === view.now.date ? ', today' : ''}</strong>
            {d.plan?.state === 'confirmed' && <span className="pt-chip filed">Plan confirmed by you</span>}
            {d.plan?.state === 'draft' && <span className="pt-chip wait">Plan is a draft</span>}
            {!d.plan && <span className="pt-chip unknown">No Plan yet</span>}
          </header>
          {d.plan?.realism && <p className="pt-meta">How realistic it felt, in your words: {d.plan.realism}</p>}
          <ul className="pt-list">
            {d.commitments.map(c => {
              const o = outcome(c);
              return (
                <li key={c.id}>
                  <span className={c.withdrawn_at ? 'pt-off' : undefined}><strong>{c.label}</strong>. {saySpan(c.start_min, c.end_min)}.</span>{' '}
                  <span className={`pt-chip ${o.tone}`}>{o.word}</span>
                  <div className="pt-meta">
                    {BASIS[c.basis] || 'On file'}.
                    {c.time_is_estimate ? ' The time is a rough one, as you gave it.' : ''}
                    {c.completion ? ` Done means: ${c.completion}.` : ' What counts as done is still unknown.'}
                    {(c.actual_start_min !== null || c.actual_end_min !== null) ? ` Actual time you reported: ${saySpan(c.actual_start_min, c.actual_end_min)}.` : ''}
                    {c.outcome_said ? ` Your words: ${c.outcome_said}` : ''}
                  </div>
                </li>
              );
            })}
            {d.commitments.length === 0 && <li className="pt-empty">No commitment is on this day.</li>}
          </ul>
        </div>
      ))}

      <h2>What you said, by folder</h2>
      {folders.length === 0 && <p className="pt-empty">No statement is on file yet. The guide files what you state plainly about your own life, in your own words.</p>}
      {folders.map(name => (
        <div key={name}>
          <h3>{name}</h3>
          {view.statements.filter(s => s.folder === name).map(s => {
            const before = s.supersedes ? history.past.find(p => p.id === s.supersedes) : null;
            return (
              <div className="pt-row" key={s.id}>
                <div>
                  <p className="pt-said">{s.said}</p>
                  <p className="pt-meta">{s.topic}. Filed {day(s.created_at)}.{s.about_date ? ` About ${sayDate(s.about_date)}.` : ''}</p>
                  {before && <p className="pt-past">Before your correction: {before.said}</p>}
                </div>
                <span className={`pt-chip ${s.basis === 'agent_decision' ? 'agent' : 'filed'}`}>{BASIS[s.basis] || 'On file'}</span>
              </div>
            );
          })}
        </div>
      ))}

      <h2>Follow ups</h2>
      {view.followUps.length === 0 && <p className="pt-empty">No follow up is open. The guide opens one when a detail, a decision, or an action is still needed.</p>}
      {view.followUps.map(f => (
        <div className="pt-row" key={f.id}>
          <div>
            <p className="pt-said">{f.what}</p>
            <p className="pt-meta">Opened {day(f.created_at)}.{f.due_on ? ` Needed by ${sayDate(f.due_on)}.` : ''}</p>
          </div>
          <span className={`pt-chip ${f.owner === 'agent' ? 'agent' : 'wait'}`}>
            {f.owner === 'agent' ? 'For your agent' : f.owner === 'resident' ? 'For you' : 'For software'}
          </span>
        </div>
      ))}
      {view.followUps.some(f => f.owner === 'agent') && (
        <p className="pt-meta">A follow up for your agent is on file. No person has been told yet. The step that tells a person is still to be built.</p>
      )}

      <h2>Still unknown</h2>
      {view.notEstablished.length === 0 && <p className="pt-empty">No gap is listed for the entries on file.</p>}
      {view.notEstablished.length > 0 && (
        <ul className="pt-list">{view.notEstablished.map((u, i) => <li key={i}>{u}</li>)}</ul>
      )}

      <h2>Changes and earlier versions</h2>
      {history.changes.length === 0 && history.past.length === 0 && <p className="pt-empty">No entry has changed yet. Each change is listed here with what the entry said before.</p>}
      {history.changes.map(c => (
        <div className="pt-row" key={c.id}>
          <div>
            <p className="pt-said"><strong>{c.label}</strong></p>
            {c.lines.map((l, i) => <p className="pt-meta" key={i}>{l}</p>)}
            {c.message && <p className="pt-past">The message it rests on: {c.message}</p>}
          </div>
          <span className="pt-meta">{day(c.at)}</span>
        </div>
      ))}
      {history.past.map(p => (
        <div className="pt-row" key={p.id}>
          <div>
            <p className="pt-said pt-off">{p.said}</p>
            <p className="pt-meta">
              {p.folder}. {p.state === 'withdrawn' ? 'You withdrew it' : 'You corrected it'}{p.ended_at ? ` on ${day(p.ended_at)}` : ''}.
            </p>
            {p.replaced_by && <p className="pt-past">Now on file: {p.replaced_by}</p>}
          </div>
          <span className="pt-chip unknown">{p.state === 'withdrawn' ? 'Withdrawn' : 'Replaced'}</span>
        </div>
      ))}
    </div>
  );
}
