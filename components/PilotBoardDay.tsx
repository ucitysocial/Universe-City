'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  const [n, setN] = useState(0);
  const d = days[n];
  if (!d) return null;
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
      {(d.items.length > 0 || ghosts.length > 0) && (
        <div className="ents sday-list">
          {withGhosts(d.items, d.date >= today ? ghosts : []).map(r => {
            if ('ghost' in r) return <PilotGhost key={`g:${r.ghost.key}`} label={r.ghost.label} ask={r.ghost.ask} />;
            const i = r.item;
            const here = nowId !== null && i.key.split(':')[0] === nowId;
            return (
              <a key={i.key} href={i.href} className={`ent d-${i.dept}${here ? (live ? ' is-now' : ' is-next') : ''}`} {...popData(i)}>
                <span className="fi i-page" />
                <b>{here && <span className="day-flag">{live ? 'Now' : 'Next'}</span>}{i.label}</b>
                <span className="sub sday-time">{i.start === null ? 'No time' : i.timeText.replace(/, end unknown$/, '')}</span>
                <span className="sub"><span className={`pt-chip ${i.kind === 'executed' ? 'filed' : 'unknown'}`}>{WORD[i.kind] || 'Planned'}</span></span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
