import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import PilotAsk from '@/components/PilotAsk';
import PilotBoard from '@/components/PilotBoard';
import { loadBoard } from '@/lib/pilot/board';
import PilotCalFocus from '@/components/PilotCalFocus';
import PilotDecide from '@/components/PilotDecide';
import PilotEntry from '@/components/PilotEntry';
import { DEPARTMENTS, FOLDERS, type Folder } from '@/lib/domain/folders';
import { who } from '@/lib/pilot/auth';
import {
  entriesIn, loadBelonging, loadCommitment, loadDay, loadFollowUps, loadIndex, loadSaid, loadStatement, loadTimeHistory, loadWaiting,
  loadWeekly, loadWeeklyItem, loadWork, loadWorkItem, owedOnCommitment, owedOnWeekly, spanWords, waitingIn,
  type CommitmentFull, type FileIndex, type Revision, type Source, type WaitingRow
} from '@/lib/pilot/browse';
import { isUuid, withResident, type Q } from '@/lib/pilot/db';
import { loadFile } from '@/lib/pilot/file';
import { deptBySlug, deptPath, FILE_ROOT, folderBySlug, folderPath, slugOf, TIME_PATH } from '@/lib/pilot/paths';
import { isDate, localNow, sayClock, sayDate, sayDays } from '@/lib/pilot/time';
import { dayLabel, totalEntries } from '@/lib/pilot/tree';
import { DAY_FIT, loadCalendar, MONTH_FIT, WEEK_FIT, weekStart } from '@/lib/pilot/calendar';
import { belongsTo } from '@/lib/pilot/dept';
import { folderOf, statusOf, type Owed } from '@/lib/pilot/owed';
import { addDays } from '@/lib/pilot/time';
import { CalendarBar, HourGrid, Legend, MonthGrid, monthRange, type CalView } from './calendar';

export const dynamic = 'force-dynamic';

// The File browser. One address names one place in the File:
//   /portal/file                                         My File, the four departments
//   /portal/file/agency-assessment                       one department, its twelve folders
//   /portal/file/agency-assessment/time                  one folder
//   /portal/file/agency-assessment/time/2026-10-16       one day in Time
//   /portal/file/agency-assessment/time/2026-10-16/<id>  one commitment, with its history
// The tree at the left shows the same place. This page shows what that place holds, and builds no entry.

type Crumb = { label: string; href: string };
type Ctx = { q: Q; zone: string; ix: FileIndex; decides: boolean; view: CalView; on: string | null };

const BASIS: Record<string, string> = {
  resident_statement: 'You said it', resident_confirmation: 'You confirmed it',
  agent_decision: 'A person decided it', schedule: 'From the weekly schedule'
};
const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const Unknown = () => <span className="none">unknown</span>;
/** 15:30, for a time box. An unknown time is an empty box. */
const clock24 = (min: number | null) => (min === null ? '' : `${String(Math.floor((min % 1440) / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`);
const fc = (color?: string) => ({ '--fc': color || 'var(--ink)' } as CSSProperties);

function outcomeOf(c: CommitmentFull): { word: string; tone: string } {
  if (c.withdrawn_at) return { word: 'Taken off', tone: 'unknown' };
  if (c.execution === 'executed') return { word: 'Executed', tone: 'filed' };
  if (c.execution === 'partly_executed') return { word: 'Partly executed', tone: 'wait' };
  if (c.execution === 'did_not_happen') return { word: 'Did not happen', tone: 'no' };
  return { word: 'Planned', tone: 'unknown' };
}

// ------------------------------------------------------------------ the frame of the browser

function Browser({ crumbs, color, ix, zone, children }: { crumbs: Crumb[]; color?: string; ix: FileIndex; zone: string; children: ReactNode }) {
  const last = crumbs[crumbs.length - 1];
  const up = crumbs.length > 1 ? crumbs[crumbs.length - 2] : null;
  const address = last.href.replace('/portal/file', 'my-file').replace(/\/([0-9a-f]{8})-[0-9a-f-]{27}$/, '/$1');
  const waiting = Object.values(ix.folders).reduce((n, f) => n + f.waiting, 0);
  return (
    <div className="fb">
      <div className="fb-bar"><span>My File</span><em>{address}</em></div>
      <nav className="fb-crumbs" aria-label="Path" id="uc-path" data-path={crumbs.map(c => c.label).join(' › ')} style={fc(color)}>
        {crumbs.map((c, i) => (
          <span key={c.href} style={{ display: 'contents' }}>
            {i > 0 && <span className="sep" aria-hidden="true">›</span>}
            {i === crumbs.length - 1
              ? <strong aria-current="page">{color && i > 0 && <span className="dot" />}{c.label}</strong>
              : <Link href={c.href}>{c.label}</Link>}
          </span>
        ))}
      </nav>
      <div className="fb-pane">
        {up && <Link className="fb-back" href={up.href}><span aria-hidden="true">‹</span> {up.label}</Link>}
        {children}
      </div>
      <div className="fb-status">
        <span>{count(totalEntries(ix), 'entry', 'entries')} on file</span>
        <span>{waiting === 0 ? 'No entry waits' : `${count(waiting, 'entry waits', 'entries wait')}`}</span>
        {ix.lastFiledAt && <span>Last filed {localNow(zone, new Date(ix.lastFiledAt)).label}</span>}
      </div>
      {/* The agent is reached from each place in the File. The message is sent in the conversation. */}
      <PilotAsk place={last.label} path={crumbs.map(c => c.label).join(' › ')} />
    </div>
  );
}

type TileItem = { href: string; icon: string; name: string; num?: string; meta: string; color?: string; quiet?: boolean; needs?: boolean };
function Tiles({ items }: { items: TileItem[] }) {
  return (
    <div className="tiles">
      {items.map(t => (
        <Link key={t.href} href={t.href} className={['tile', t.quiet ? 'quiet' : '', t.needs ? 'needs' : ''].join(' ').trim()} style={fc(t.color)}>
          <span className={`fi i-mid ${t.icon.split(' ').map(x => `i-${x}`).join(' ')}`} style={fc(t.color)} />
          <b>{t.num && <i>{t.num}</i>}{t.name}</b>
          <span className="meta">{t.meta}</span>
        </Link>
      ))}
    </div>
  );
}

function Words({ label, quote, source, zone }: { label: string; quote?: string | null; source: Source; zone: string }) {
  if (!quote && !source) return null;
  const whole = source && source.speaker === 'resident' && (!quote || source.body.trim() !== quote.trim()) ? source.body : null;
  return (
    <div className="words">
      <p className="flab">{label}</p>
      {quote && <p className="fq">{quote}</p>}
      {whole && <><p className="flab" style={{ marginTop: 8 }}>The whole message</p><p className="fq" style={{ borderLeftColor: 'var(--rule)' }}>{whole}</p></>}
      {source && (
        <p className="src">
          Sent {localNow(zone, new Date(source.at)).label}. <Link href={`/portal/home#m-${source.id}`}>Open the conversation at this message</Link>
        </p>
      )}
    </div>
  );
}

function History({ list, zone }: { list: Revision[]; zone: string }) {
  return (
    <div className="hist">
      <p className="flab">History</p>
      {list.length === 0 && <p className="meta" style={{ padding: '6px 0 8px' }}>No change since it was filed.</p>}
      {list.length > 0 && (
        <ol>
          {list.map(r => (
            <li key={r.id}>
              <p className="meta">{localNow(zone, new Date(r.at)).label}</p>
              {r.notes.map((n, i) => <p key={`n${i}`}><strong>{n}</strong></p>)}
              {r.lines.map((l, i) => <p key={i}><strong>{l.field}:</strong> {l.now}. <del>Before: {l.before}.</del></p>)}
              {r.via === 'screen' && <p className="src">You confirmed it with the button on the screen.</p>}
              {r.via === 'conversation' && <p className="src">You confirmed it in the conversation.</p>}
              {r.via === 'edit' && <p className="src">You changed it in the form on this entry.</p>}
              {r.message && r.message.speaker === 'resident' && (
                <p className="src">Your message: {r.message.body} <Link href={`/portal/home#m-${r.message.id}`}>Open it</Link></p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function WaitingList({ list, zone, decides }: { list: WaitingRow[]; zone: string; decides: boolean }) {
  if (!list.length) return null;
  return (
    <div className="ents" style={{ marginBottom: 16, maxWidth: 820 }}>
      {list.map(p => (
        <div className="ent" key={p.id}>
          <span className="fi i-wait" />
          <b>{p.summary}</b>
          <span className={`pt-chip ${p.decider === 'agent' ? 'agent' : 'wait'}`}>{p.decider === 'agent' ? 'Proposal' : 'Waiting for you'}</span>
          <div className="sub">
            {p.rests_on && <p>Why it waits: {p.rests_on}</p>}
            {p.source && p.source.speaker === 'resident' && (
              <p>Your message, {localNow(zone, new Date(p.source.at)).label}: {p.source.body} <Link href={`/portal/home#m-${p.source.id}`}>Open it</Link></p>
            )}
            {p.decider === 'agent'
              ? (decides
                ? <><p>A proposal is a reading that goes past what you said. A person decides it. In this test you hold the part of the agent.</p><PilotDecide id={p.id} kind={p.kind} desk /></>
                : <p>A proposal is a reading that goes past what you said. No person has decided it yet.</p>)
              : <PilotDecide id={p.id} kind={p.kind} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The fixed fields of each entry in Time: Department, Folder, Status, and Pending. The small window over the calendar
 * shows the same four. The calendar colors the entry by its department.
 */
function Fixed({ b, status, owed }: { b: ReturnType<typeof belongsTo>; status: string; owed: Owed[] }) {
  return (
    <>
      <dt>Department</dt><dd><span className="dot" style={{ background: b.color }} /> {b.deptName}</dd>
      <dt>Folder</dt>
      <dd>
        {folderOf(b)}
        {b.by !== 'file' && (
          <span className="src">
            {' '}{b.by === 'name' ? 'Read from the name of the entry. Tell the agent to move it to a different folder.' : 'Tell the agent which folder it belongs to.'}
          </span>
        )}
      </dd>
      <dt>Status</dt><dd>{status}</dd>
      <dt>Pending</dt>
      <dd>
        {owed.length === 0 ? 'None' : (
          <ul className="owed">
            {owed.map(o => {
              const f = FOLDERS.find(x => x.name === o.folder);
              return <li key={o.folder}>{f ? <Link href={folderPath(f.name)}>{o.folder}</Link> : o.folder}. <span className="src">{o.why}</span></li>;
            })}
          </ul>
        )}
      </dd>
    </>
  );
}

// ------------------------------------------------------------------ panes

/**
 * My File opens on the overview: now or coming up, the calendar and the four departments, and Pending. The founder set
 * it on October 12, 2026. Inside My File the overview is here, so the right part of the frame is closed.
 */
async function rootPane({ q, zone, ix }: Ctx) {
  const general = ix.folders.General;
  const board = await loadBoard(q, zone, ix);
  return (
    <>
      <PilotBoard board={board} wide />
      {general && (general.said > 0 || general.work > 0 || general.waiting > 0) && (
        <>
          <h2 className="fb-h">Outside the forty eight folders</h2>
          <Tiles items={[{ href: `${FILE_ROOT}/general`, icon: 'folder', name: 'General', meta: count(general.said + general.work, 'entry', 'entries') }]} />
        </>
      )}
    </>
  );
}

function deptPane({ ix }: Ctx, dept: (typeof DEPARTMENTS)[number]) {
  return (
    <Tiles items={FOLDERS.filter(f => f.dept === dept.key).map(f => {
      const n = entriesIn(ix, f.name);
      const w = waitingIn(ix, f.name);
      return {
        href: `${deptPath(dept.key)}/${slugOf(f.name)}`, icon: n ? 'folder' : 'folder empty', color: dept.color,
        num: String(f.num).padStart(2, '0'), name: f.name,
        meta: n || w ? `${count(n, 'entry', 'entries')}${w ? ` / ${w} waiting` : ''}` : 'empty', quiet: !n && !w, needs: w > 0
      };
    })} />
  );
}

async function folderPane(ctx: Ctx, folder: Folder | null, base: string, color?: string) {
  const { ix, q, zone } = ctx;
  const name = folder?.name ?? 'General';
  const here = ix.folders[name] || { said: 0, waiting: 0, work: 0, cal: 0 };
  const node = (slug: string, label: string, icon: string, n: number, word: string, many?: string, needs = false): TileItem =>
    ({ href: `${base}/${slug}`, icon, color, name: label, meta: n ? count(n, word, many) : 'none', quiet: !n, needs: needs && n > 0 });

  if (name !== 'Time') {
    const items = [
      here.said ? node('said', 'Statements', 'said', here.said, 'statement') : null,
      here.waiting ? node('waiting', 'Pending', 'wait', here.waiting, 'entry', 'entries', true) : null
    ].filter((x): x is TileItem => !!x);
    // Calendar entries sit in Time and belong to this folder too. They are listed here, and each opens in Time.
    const cal = here.cal ? await loadBelonging(q, name, ix.today) : null;
    const line = (c: { id: string; label: string; on_date: string; start_min: number | null; end_min: number | null }) => (
      <Link key={c.id} href={`${TIME_PATH}/${c.on_date}/${c.id}`} className="sum-line">
        <span className="sw" style={{ background: color }} />
        <b>{c.label}</b>
        <span>{dayLabel(c.on_date)}{c.on_date === ix.today ? ', today' : ''}. {spanWords(c.start_min, c.end_min)}</span>
      </Link>
    );
    return (
      <>
        {folder && <p className="fb-note">{folder.system}. {folder.question}?</p>}
        {cal && (
          <div className="sum">
            <section className="sum-box">
              <h2>On the calendar</h2>
              {cal.ahead.length === 0 && <p className="sum-none">Nothing ahead is on the calendar.</p>}
              {cal.ahead.map(line)}
              {cal.weekly.map(s => (
                <Link key={s.id} href={`${TIME_PATH}/weekly/${s.id}`} className="sum-line">
                  <span className="sw" style={{ background: color }} />
                  <b>{s.label}</b>
                  <span>{sayDays(s.days)}. {spanWords(s.start_min, s.end_min)}</span>
                </Link>
              ))}
            </section>
            {cal.before.length > 0 && (
              <section className="sum-box">
                <h2>Before today</h2>
                {cal.before.map(line)}
              </section>
            )}
          </div>
        )}
        {items.length ? <Tiles items={items} /> : !cal && <p className="fb-empty">No entry is on file in {name} yet.</p>}
      </>
    );
  }

  // Time opens on a summary: what comes next, what is pending, and what is missing. Its four files sit below.
  const view = await loadFile(q, zone, { daysBack: 3, daysAhead: 10, statements: 1 });
  const pending = (await loadWaiting(q)).filter(w => w.folder === 'Time');
  const next = await q<{ id: string; label: string; on_date: string; start_min: number | null; end_min: number | null; folder: string | null }>(
    `select id, label, on_date::text as on_date, start_min, end_min, folder from uc_pilot.commitments
      where withdrawn_at is null and execution = 'planned' and on_date >= $1::date order by on_date, start_min nulls last limit 5`, [ix.today]);
  const days = ix.time.days.reduce((n, d) => n + d.count, 0);
  return (
    <>
      <div className="sum">
        <section className="sum-box">
          <h2>Coming up</h2>
          {next.length === 0 && <p className="sum-none">Nothing is on the schedule for today or a day ahead.</p>}
          {next.map(c => (
            <Link key={c.id} href={`${base}/${c.on_date}/${c.id}`} className="sum-line">
              <span className="sw" style={{ background: belongsTo(c.folder, c.label).color }} />
              <b>{c.label}</b>
              <span>{dayLabel(c.on_date)}{c.on_date === ix.today ? ', today' : ''}. {spanWords(c.start_min, c.end_min)}</span>
            </Link>
          ))}
        </section>
        <section className="sum-box">
          <h2>Pending</h2>
          {pending.length === 0 && <p className="sum-none">Nothing is pending.</p>}
          {pending.slice(0, 3).map(p => (
            <div key={p.id} className="sum-wait">
              <p>{p.summary}</p>
              {p.decider === 'resident' && <PilotDecide id={p.id} kind={p.kind} />}
            </div>
          ))}
          {pending.length > 3 && <Link href={`${base}/waiting`} className="sum-more">{pending.length - 3} more pending</Link>}
        </section>
        <section className="sum-box">
          <h2>Missing details</h2>
          {view.notEstablished.length === 0 && <p className="sum-none">No detail is missing.</p>}
          {view.notEstablished.slice(0, 4).map((u, i) => <p key={i} className="sum-gap">{u}</p>)}
          {view.notEstablished.length > 4 && <p className="sum-none">{view.notEstablished.length - 4} more. The agent asks about them in the conversation.</p>}
        </section>
      </div>
      <h2 className="fb-h">Files</h2>
      <Tiles items={[
        node('schedule', 'Schedule', 'day', days, 'entry', 'entries'),
        node('weekly', 'Weekly routine', 'clock', ix.time.weekly, 'item that repeats', 'items that repeat'),
        node('said', 'Statements', 'said', here.said, 'statement'),
        node('waiting', 'Pending', 'wait', here.waiting, 'entry', 'entries', true)
      ]} />
    </>
  );
}

/** The calendar of Time: one week by default, one month when asked. One day has its own address. */
async function schedulePane(ctx: Ctx) {
  const { ix, q, zone } = ctx;
  const now = localNow(zone);
  const on = ctx.on ?? now.date;
  const month = ctx.view === 'month';
  const range = month ? monthRange(on) : { from: weekStart(on), to: addDays(weekStart(on), 6) };
  const cal = await loadCalendar(q, range.from, range.to, now.date, month ? MONTH_FIT : WEEK_FIT);
  return (
    <>
      <CalendarBar view={month ? 'month' : 'week'} on={on} today={now.date} />
      {month ? <MonthGrid cal={cal} on={on} today={now.date} /> : <HourGrid cal={cal} today={now.date} nowMin={now.minutes} />}
      <Legend month={month} />
      <PilotCalFocus on={`${month ? 'month' : 'week'} ${on} ${ix.lastFiledAt ?? ''}`} />
    </>
  );
}

async function dayPane({ q, zone, decides, ix }: Ctx, base: string, date: string, color?: string) {
  void ix;
  const { commitments, waiting } = await loadDay(q, date);
  const now = localNow(zone);
  return (
    <>
      <CalendarBar view="day" on={date} today={now.date} />
      <WaitingList list={waiting} zone={zone} decides={decides} />
      <div className="day-extra">
      {commitments.length === 0 && <p className="fb-empty">No commitment is on this day.</p>}
      {commitments.length > 0 && (
        <div className="ents" style={{ maxWidth: 820 }}>
          {commitments.map(c => {
            const o = outcomeOf(c);
            return (
              <Link key={c.id} href={`${base}/${date}/${c.id}`} className={c.withdrawn_at ? 'ent off' : 'ent'} style={fc(belongsTo(c.folder, c.label).color)}>
                <span className="fi i-page" />
                <b>{c.label}</b>
                <span className="right">{spanWords(c.start_min, c.end_min)}</span>
                <span className="sub">
                  <span className={`pt-chip ${o.tone}`}>{o.word}</span>
                  {c.changes ? ` ${count(c.changes, 'change')} in its history` : ''}
                </span>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}

async function commitmentPane({ q, zone, decides }: Ctx, base: string, id: string, color?: string) {
  const x = await loadCommitment(q, id);
  if (!x) return null;
  const { c } = x;
  const o = outcomeOf(c);
  const rough = c.time_is_estimate ? ', a rough time as you gave it' : '';
  const b = belongsTo(c.folder, c.label);
  const owed = await owedOnCommitment(q, zone, c, b);
  // The form changes an entry that is still planned. An entry with an outcome is changed by a correction.
  const open = !c.withdrawn_at && c.execution === 'planned';
  return {
    label: c.label,
    date: c.on_date,
    node: (
      <>
        <div className="doc">
          <div className="doc-bar" style={fc(b.color)}>
            <b>{c.label}</b>
            <span className={`pt-chip ${o.tone}`}>{o.word}</span>
          </div>
          <dl className="fields">
            <dt>Day</dt><dd><Link href={`${base}/${c.on_date}`}>{sayDate(c.on_date)}</Link></dd>
            <dt>Start</dt><dd>{c.start_min === null ? <Unknown /> : `${sayClock(c.start_min)}${rough}`}</dd>
            <dt>End</dt><dd>{c.end_min === null ? <Unknown /> : `${sayClock(c.end_min)}${rough}`}</dd>
            <Fixed b={b} status={`${statusOf(c)}${c.timing ? `, time ${c.timing.replace(/_/g, ' ')}` : ''}`} owed={owed} />
            <dt>What counts as done</dt><dd>{c.completion || <Unknown />}</dd>
            {(c.actual_start_min !== null || c.actual_end_min !== null) && <><dt>Actual time</dt><dd>{spanWords(c.actual_start_min, c.actual_end_min)}</dd></>}
            {x.weekly && <><dt>Comes from</dt><dd><Link href={`${base}/weekly/${x.weekly.id}`}>{x.weekly.label}, {sayDays(x.weekly.days)}, in the weekly schedule</Link></dd></>}
            <dt>On file since</dt><dd>{localNow(zone, new Date(c.created_at)).label}</dd>
          </dl>
          <Words label={c.basis === 'schedule' ? 'Your words for the weekly item' : 'Your words when it was filed'} quote={c.said} source={x.source} zone={zone} />
          {c.outcome_said && <Words label="Your words on the outcome" quote={c.outcome_said} source={x.outcomeSource} zone={zone} />}
          {c.withdrawn_said && <div className="words"><p className="flab">When it was taken off</p><p className="fq">{c.withdrawn_said}</p></div>}
          {x.notes.length > 0 && (
            <div className="words">
              <p className="flab">Notes</p>
              {x.notes.map(n => (
                <div key={n.id}>
                  <p className="fq">{n.said}</p>
                  <p className="src">Added {localNow(zone, new Date(n.created_at)).label}. <Link href={`${base}/said/${n.id}`}>Open the note</Link></p>
                </div>
              ))}
            </div>
          )}
          {open && <PilotEntry key={`${c.label} ${c.on_date} ${c.start_min} ${c.end_min}`} id={c.id} label={c.label} date={c.on_date} start={clock24(c.start_min)} end={clock24(c.end_min)} />}
          {!open && <p className="fb-note" style={{ padding: '10px 12px 0', margin: 0 }}>{c.withdrawn_at ? 'This entry was taken off its day, so its day and time stay as they are.' : 'This entry has an outcome on file, so its day and time stay as they are. Tell the agent to correct the outcome.'}</p>}
          <History list={x.history} zone={zone} />
        </div>
        <WaitingList list={x.waiting} zone={zone} decides={decides} />
      </>
    )
  };
}

async function weeklyPane({ q }: Ctx, base: string, color?: string) {
  const list = await loadWeekly(q);
  if (!list.length) return <p className="fb-empty">No item that repeats each week is on file.</p>;
  return (
    <div className="ents" style={{ maxWidth: 820 }}>
      {list.map(s => (
        <Link key={s.id} href={`${base}/weekly/${s.id}`} className={s.state === 'current' ? 'ent' : 'ent off'} style={fc(color)}>
          <span className="fi i-clock" />
          <b>{s.label}</b>
          <span className="right">{spanWords(s.start_min, s.end_min)}</span>
          <span className="sub">{sayDays(s.days)}{s.state !== 'current' ? '. Ended' : ''}{s.changes ? `. ${count(s.changes, 'change')} in its history` : ''}</span>
        </Link>
      ))}
    </div>
  );
}

async function weeklyItemPane({ q, zone }: Ctx, id: string, color?: string) {
  const x = await loadWeeklyItem(q, id);
  if (!x) return null;
  const { s } = x;
  const b = belongsTo(s.folder, s.label);
  const owed = await owedOnWeekly(q, zone, s, b);
  return {
    label: s.label,
    node: (
      <div className="doc">
        <div className="doc-bar" style={fc(b.color)}>
          <b>{s.label}</b>
          <span className={`pt-chip ${s.state === 'current' ? 'filed' : 'unknown'}`}>{s.state === 'current' ? 'Repeats each week' : 'Ended'}</span>
        </div>
        <dl className="fields">
          <dt>Days</dt><dd>{sayDays(s.days)}</dd>
          <dt>Start</dt><dd>{s.start_min === null ? <Unknown /> : sayClock(s.start_min)}</dd>
          <dt>End</dt><dd>{s.end_min === null ? <Unknown /> : sayClock(s.end_min)}</dd>
          <Fixed b={b} status={s.state === 'current' ? 'Repeats each week' : 'Ended'} owed={owed} />
          <dt>On file since</dt><dd>{localNow(zone, new Date(s.created_at)).label}</dd>
          {s.ended_at && <><dt>Ended</dt><dd>{localNow(zone, new Date(s.ended_at)).label}</dd></>}
        </dl>
        <Words label="Your words when it was filed" quote={s.said} source={x.source} zone={zone} />
        <History list={x.history} zone={zone} />
      </div>
    )
  };
}

async function saidPane({ q, zone }: Ctx, base: string, folder: string, color?: string) {
  const list = await loadSaid(q, folder);
  if (!list.length) return <p className="fb-empty">No statement is on file in {folder} yet.</p>;
  return (
    <div className="ents" style={{ maxWidth: 820 }}>
      {list.map(s => (
        <Link key={s.id} href={`${base}/said/${s.id}`} className={s.state === 'current' ? 'ent' : 'ent off'} style={fc(color)}>
          <span className="fi i-said" style={fc(color)} />
          <b>{s.topic}</b>
          <span className="right">{localNow(zone, new Date(s.created_at)).label.replace(/, \d{4},/, ',')}</span>
          <span className="sub">{s.entry ?? s.said}{s.state === 'superseded' ? ' (replaced)' : s.state === 'withdrawn' ? ' (withdrawn)' : ''}</span>
        </Link>
      ))}
    </div>
  );
}

async function statementPane({ q, zone }: Ctx, id: string, color?: string) {
  const x = await loadStatement(q, id);
  if (!x) return null;
  const { s } = x;
  const state = s.state === 'current' ? { word: 'On file', tone: 'filed' } : s.state === 'superseded' ? { word: 'Replaced', tone: 'unknown' } : { word: 'Withdrawn', tone: 'unknown' };
  return {
    label: s.topic,
    folder: s.folder,
    node: (
      <div className="doc">
        <div className="doc-bar" style={fc(color)}>
          <b>{s.topic}</b>
          <span className={`pt-chip ${state.tone}`}>{state.word}</span>
        </div>
        {s.entry && <p className="doc-lead">{s.entry}</p>}
        <Words label={s.basis === 'agent_decision' ? 'What is on file' : 'Your words'} quote={s.said} source={x.source} zone={zone} />
        <dl className="fields" style={{ borderTop: '2px solid var(--ink)' }}>
          <dt>Folder</dt><dd><Link href={folderPath(s.folder)}>{s.folder}</Link></dd>
          {s.about_date && <><dt>About</dt><dd>{sayDate(s.about_date)}</dd></>}
          <dt>Filed</dt><dd>{localNow(zone, new Date(s.created_at)).label}</dd>
          {s.ended_at && <><dt>{s.state === 'withdrawn' ? 'Withdrawn' : 'Replaced'}</dt><dd>{localNow(zone, new Date(s.ended_at)).label}</dd></>}
        </dl>
        <div className="hist">
          <p className="flab">History</p>
          {!x.later && x.earlier.length === 0 && <p className="meta" style={{ padding: '6px 0 8px' }}>No change since it was filed.</p>}
          <ol>
            {x.later && <li><p className="meta">Replaced by</p><p><Link href={`${folderPath(x.later.folder)}/said/${x.later.id}`}>{x.later.entry ?? x.later.said}</Link></p></li>}
            {x.endedBy && x.endedBy.speaker === 'resident' && (
              <li><p className="meta">It ended with your message, {localNow(zone, new Date(x.endedBy.at)).label}</p><p>{x.endedBy.body} <Link href={`/portal/home#m-${x.endedBy.id}`}>Open it</Link></p></li>
            )}
            {x.earlier.map(e => (
              <li key={e.id}>
                <p className="meta">Earlier version, filed {localNow(zone, new Date(e.created_at)).label}</p>
                <p><del>{e.entry ?? e.said}</del> <Link href={`${folderPath(e.folder)}/said/${e.id}`}>Open it</Link></p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    )
  };
}

async function waitingPane({ q, zone, decides }: Ctx, folder: string) {
  const list = (await loadWaiting(q)).filter(w => w.folder === folder);
  if (!list.length) return <p className="fb-empty">No entry waits in {folder}.</p>;
  return <WaitingList list={list} zone={zone} decides={decides} />;
}

async function followUpsPane({ q, zone }: Ctx) {
  const list = await loadFollowUps(q);
  if (!list.length) return <p className="fb-empty">No follow up is on file.</p>;
  return (
    <>
      <div className="ents" style={{ maxWidth: 820 }}>
        {list.map(f => (
          <div key={f.id} className={f.state === 'open' ? 'ent' : 'ent off'}>
            <span className="fi i-wait" />
            <b>{f.what}</b>
            <span className={`pt-chip ${f.state !== 'open' ? 'unknown' : f.owner === 'agent' ? 'agent' : 'wait'}`}>
              {f.state !== 'open' ? (f.state === 'done' ? 'Done' : 'Dropped') : f.owner === 'agent' ? 'For a person on the team' : f.owner === 'resident' ? 'For you' : 'For software'}
            </span>
            <span className="sub">
              Opened {localNow(zone, new Date(f.created_at)).label}.{f.due_on ? ` Needed by ${sayDate(f.due_on)}.` : ''}
              {f.closed_said ? ` Your words when it closed: ${f.closed_said}` : ''}
            </span>
          </div>
        ))}
      </div>
      {list.some(f => f.owner === 'agent' && f.state === 'open') && (
        <p className="fb-note" style={{ marginTop: 12 }}>A follow up for a person on the team is on file. No person has been told yet. The step that tells a person is still to be built.</p>
      )}
    </>
  );
}

async function workPane({ q, zone }: Ctx, base: string, folder: string, color?: string) {
  const list = await loadWork(q, folder);
  if (!list.length) return <p className="fb-empty">No ongoing work is on file in {folder}.</p>;
  return (
    <div className="ents" style={{ maxWidth: 820 }}>
      {list.map(w => (
        <Link key={w.id} href={`${base}/work/${w.id}`} className={w.state === 'open' ? 'ent' : 'ent off'} style={fc(color)}>
          <span className="fi i-work" />
          <b>{w.label}</b>
          <span className={`pt-chip ${w.state === 'open' ? 'wait' : 'unknown'}`}>{w.state === 'open' ? 'Open' : w.state === 'done' ? 'Settled' : 'Dropped'}</span>
          <span className="sub">{w.said}. Opened {localNow(zone, new Date(w.created_at)).label}.</span>
        </Link>
      ))}
    </div>
  );
}

async function workItemPane({ q, zone }: Ctx, id: string, color?: string) {
  const x = await loadWorkItem(q, id);
  if (!x) return null;
  const { w } = x;
  return {
    label: w.label,
    node: (
      <div className="doc">
        <div className="doc-bar" style={fc(color)}>
          <b>{w.label}</b>
          <span className={`pt-chip ${w.state === 'open' ? 'wait' : 'unknown'}`}>{w.state === 'open' ? 'Open' : w.state === 'done' ? 'Settled' : 'Dropped'}</span>
        </div>
        <p className="fb-note" style={{ padding: '10px 12px 0', margin: 0 }}>You asked the agent for help with this. The agent keeps it open and asks the next question until you say it is settled.</p>
        <Words label="Your words when you asked" quote={w.said} source={x.source} zone={zone} />
        <dl className="fields" style={{ borderTop: '2px solid var(--ink)' }}>
          <dt>Opened</dt><dd>{localNow(zone, new Date(w.created_at)).label}</dd>
          {w.closed_at && <><dt>Closed</dt><dd>{localNow(zone, new Date(w.closed_at)).label}</dd></>}
          {w.closed_said && <><dt>Your words then</dt><dd>{w.closed_said}</dd></>}
        </dl>
        <History list={x.history} zone={zone} />
      </div>
    )
  };
}

async function unknownPane({ q, zone }: Ctx) {
  const view = await loadFile(q, zone, { daysBack: 3, daysAhead: 10, statements: 1 });
  if (!view.notEstablished.length) return <p className="fb-empty">No gap is listed for the entries on file.</p>;
  return (
    <div className="ents" style={{ maxWidth: 820 }}>
      {view.notEstablished.map((u, i) => (
        <div className="ent" key={i}><span className="fi i-page" /><b style={{ fontWeight: 500 }}>{u}</b><span className="none">unknown</span></div>
      ))}
    </div>
  );
}

async function historyPane({ q, zone }: Ctx, base: string) {
  const changes = await loadTimeHistory(q);
  const past = (await loadSaid(q, 'Time')).filter(s => s.state !== 'current');
  if (!changes.length && !past.length) return <p className="fb-empty">No entry in Time has changed yet.</p>;
  return (
    <>
      {changes.length > 0 && (
        <div className="ents" style={{ maxWidth: 820 }}>
          {changes.map(c => (
            <Link key={c.id} href={c.href || base} className="ent">
              <span className="fi i-page" />
              <b>{c.title}</b>
              <span className="right">{localNow(zone, new Date(c.at)).label.replace(/, \d{4},/, ',')}</span>
              <span className="sub">{c.lines.join(' ')}{c.message ? ` Your message: ${c.message}` : ''}</span>
            </Link>
          ))}
        </div>
      )}
      {past.length > 0 && (
        <>
          <h2 className="fb-h">Statements that were replaced or withdrawn</h2>
          <div className="ents" style={{ maxWidth: 820 }}>
            {past.map(s => (
              <Link key={s.id} href={`${base}/said/${s.id}`} className="ent off">
                <span className="fi i-said" /><b>{s.topic}</b>
                <span className="right">{s.state === 'withdrawn' ? 'Withdrawn' : 'Replaced'}</span>
                <span className="sub">{s.said}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ------------------------------------------------------------------ the page

const NODES: Record<string, string> = {
  weekly: 'Weekly routine', said: 'Statements', waiting: 'Pending', work: 'Ongoing work', schedule: 'Schedule',
  'follow-ups': 'Follow ups', unknown: 'Still unknown', history: 'History'
};

export default async function FilePage({ params, searchParams }: { params: { path?: string[] }; searchParams?: { view?: string; on?: string } }) {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/file');
  const zone = w.access.timezone;
  const seg = (params.path || []).map(s => decodeURIComponent(s));
  if (seg.length > 4) notFound();

  const out = await withResident({ userId: w.userId, actor: 'resident' }, async q => {
    const ix = await loadIndex(q, zone);
    const ctx: Ctx = {
      q, zone, ix, decides: w.access.decides_proposals,
      view: searchParams?.view === 'month' ? 'month' : 'week',
      on: typeof searchParams?.on === 'string' && isDate(searchParams.on) ? searchParams.on : null
    };
    const crumbs: Crumb[] = [{ label: 'My File', href: FILE_ROOT }];
    if (seg.length === 0) return { ix, crumbs, color: undefined, body: await rootPane(ctx) };

    // General sits beside the departments. It has no department, so its folder is the first part of the address.
    const general = seg[0] === 'general';
    const dept = general ? null : deptBySlug(seg[0]);
    if (!general && !dept) return null;
    const color = dept?.color;
    if (dept) crumbs.push({ label: dept.name, href: deptPath(dept.key) });
    if (dept && seg.length === 1) return { ix, crumbs, color, body: deptPane(ctx, dept) };

    const folder = dept ? folderBySlug(dept.key, seg[1]) : null;
    if (dept && !folder) return null;
    const name = folder?.name ?? 'General';
    const base = folder ? folderPath(folder.name) : `${FILE_ROOT}/general`;
    const rest = general ? seg.slice(1) : seg.slice(2);
    crumbs.push({ label: name, href: base });
    if (rest.length === 0) return { ix, crumbs, color, body: await folderPane(ctx, folder, base, color) };
    if (rest.length > 2) return null;

    const [node, id] = rest;
    // The calendar, and one day in it.
    if (name === 'Time' && node === 'schedule' && !id) {
      crumbs.push({ label: 'Schedule', href: `${base}/schedule` });
      return { ix, crumbs, color, body: await schedulePane(ctx) };
    }
    if (name === 'Time' && isDate(node)) {
      crumbs.push({ label: 'Schedule', href: `${base}/schedule` });
      crumbs.push({ label: dayLabel(node), href: `${base}/${node}` });
      if (!id) return { ix, crumbs, color, body: await dayPane(ctx, base, node, color) };
      const c = isUuid(id) ? await commitmentPane(ctx, base, id, color) : null;
      if (!c || c.date !== node) return null;
      crumbs.push({ label: c.label, href: `${base}/${node}/${id}` });
      return { ix, crumbs, color, body: c.node };
    }
    if (!NODES[node]) return null;
    if (name !== 'Time' && !['said', 'waiting', 'work'].includes(node)) return null;
    crumbs.push({ label: NODES[node], href: `${base}/${node}` });
    if (!id) {
      const body = node === 'weekly' ? await weeklyPane(ctx, base, color)
        : node === 'said' ? await saidPane(ctx, base, name, color)
          : node === 'waiting' ? await waitingPane(ctx, name)
            : node === 'work' ? await workPane(ctx, base, name, color)
              : node === 'follow-ups' ? await followUpsPane(ctx)
                : node === 'unknown' ? await unknownPane(ctx)
                  : await historyPane(ctx, base);
      return { ix, crumbs, color, body };
    }
    if (!isUuid(id)) return null;
    const item = node === 'weekly' ? await weeklyItemPane(ctx, id, color)
      : node === 'said' ? await statementPane(ctx, id, color)
        : node === 'work' ? await workItemPane(ctx, id, color) : null;
    if (!item) return null;
    crumbs.push({ label: item.label, href: `${base}/${node}/${id}` });
    return { ix, crumbs, color, body: item.node };
  });

  if (!out) notFound();
  return <Browser crumbs={out.crumbs} color={out.color} ix={out.ix} zone={zone}>{out.body}</Browser>;
}
