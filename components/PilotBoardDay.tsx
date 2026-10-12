'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BoardDay } from '@/lib/pilot/board';
import PilotGhost from '@/components/PilotGhost';
import { withGhosts, type Ghost } from '@/lib/pilot/ghosts';
import { dayHref, monthHref, popData, weekHref } from '@/app/(pilot)/portal/file/[[...path]]/calendar';

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const say = (date: string) => {
  const d = new Date(`${date}T12:00:00Z`);
  return `${WEEKDAY[d.getUTCDay()]}, ${MONTH[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

const WORD: Record<string, string> = { planned: 'Planned', executed: 'Executed', partly: 'Partly executed', missed: 'Did not happen', weekly: 'Routine' };

/**
 * The schedule in the overview at the right, in the same form as the day in the schedule: one day at a time, in order
 * of time. The arrows step through today and the six days after it, and Week and Month open the schedule. Each entry
 * shows its name, its time, its status, and a line in the color of its department. The entry happening now glows in its department color, and the next
 * one is marked Next. Pressing an entry opens the calendar window. Blocks are kept for the week and the month.
 * The founder set on October 12, 2026 that the overview holds the day and nothing more.
 */
export default function PilotBoardDay({ days, today, nowId = null, live = false, ghosts = [] }: { days: BoardDay[]; today: string; nowId?: string | null; live?: boolean; ghosts?: Ghost[] }) {
  const router = useRouter();
  const [n, setN] = useState(0);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [showDone, setShowDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const d = days[n];
  if (!d) return null;

  // Checking an entry marks it done. It leaves the list at once, so the day gets shorter. The founder set this on
  // October 12, 2026. Only an entry on today or a day before can be checked.
  async function check(key: string, weekly: boolean, date: string) {
    const id = key.split(':')[0];
    setErr(null);
    setGone(g => new Set(g).add(key));
    try {
      const res = await fetch('/api/pilot/entry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(weekly ? { id, weekly: true, date, done: true } : { id, done: true }) });
      if (!res.ok) {
        const x = await res.json().catch(() => ({}));
        setErr(x.error || 'Not marked. The entry is as it was.');
        setGone(g => { const c = new Set(g); c.delete(key); return c; });
      } else router.refresh();
    } catch {
      setErr('Not marked, because the server did not answer.');
      setGone(g => { const c = new Set(g); c.delete(key); return c; });
    }
  }
  const open = d.items.filter(i => i.kind !== 'executed' && !gone.has(i.key));
  const done = d.items.filter(i => i.kind === 'executed' || gone.has(i.key));
  const canCheck = d.date <= today;
  const full = `${say(d.date)}, ${d.date.slice(0, 4)}`;
  return (
    <div className="sday">
      <div className="sday-top">
        <h2><Link href={dayHref(d.date)}>{full}</Link></h2>
        <span className="cal-seg sday-move">
          <button type="button" onClick={() => setN(n - 1)} disabled={n === 0} aria-label="The day before">‹</button>
          <button type="button" onClick={() => setN(0)} disabled={n === 0}>Today</button>
          <button type="button" onClick={() => setN(n + 1)} disabled={n === days.length - 1} aria-label="The day after">›</button>
        </span>
      </div>
      <span className="cal-seg cal-views sday-views" aria-label="Calendar view">
        <span className="on" aria-current="page">Day</span>
        <Link href={weekHref(d.date)}>Week</Link>
        <Link href={monthHref(d.date)}>Month</Link>
      </span>
      {d.items.length === 0 && !ghosts.length && <p className="dash-empty">Nothing is on file for this day.</p>}
      {d.items.length > 0 && open.length === 0 && <p className="dash-empty">Each entry on this day is done.</p>}
      {err && <p className="pt-err" role="status">{err}</p>}
      {(open.length > 0 || (ghosts.length > 0 && d.date >= today)) && (
        <div className="ents sday-list">
          {withGhosts(open, d.date >= today ? ghosts : []).map(r => {
            if ('ghost' in r) return <PilotGhost key={`g:${r.ghost.key}`} label={r.ghost.label} ask={r.ghost.ask} />;
            const i = r.item;
            const here = nowId !== null && i.key.split(':')[0] === nowId;
            return (
              <div key={i.key} className={`ent sday-row d-${i.dept}${here ? (live ? ' is-now' : ' is-next') : ''}`}>
                {canCheck && i.kind !== 'missed'
                  ? <input type="checkbox" className="sday-check" aria-label={`Mark ${i.label} done`} onChange={() => void check(i.key, i.kind === 'weekly', d.date)} />
                  : <span className="fi i-page" />}
                <a href={i.href} className="sday-open" {...popData(i)}>
                <b>{here && <span className="day-flag">{live ? 'Now' : 'Next'}</span>}{i.label}</b>
                <span className="sub sday-time">{i.start === null ? 'No time' : i.timeText.replace(/, end unknown$/, '')}</span>
                <span className="sub"><span className={`pt-chip ${i.kind === 'executed' ? 'filed' : 'unknown'}`}>{WORD[i.kind] || 'Planned'}</span></span>
                </a>
              </div>
            );
          })}
        </div>
      )}
      {done.length > 0 && (
        <div className="sday-done">
          <button type="button" className="dash-more" onClick={() => setShowDone(x => !x)} aria-expanded={showDone}>
            {showDone ? 'Hide' : 'Show'} {done.length} done
          </button>
          {showDone && (
            <ul>
              {done.map(i => <li key={i.key}><a href={i.href} {...popData(i)}>{i.label}</a></li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
