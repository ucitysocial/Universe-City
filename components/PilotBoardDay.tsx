'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { BoardDay } from '@/lib/pilot/board';
import { popData } from '@/app/(pilot)/portal/file/[[...path]]/calendar';
import { SCHEDULE_PATH, TIME_PATH } from '@/lib/pilot/paths';

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const say = (date: string) => {
  const d = new Date(`${date}T12:00:00Z`);
  return `${WEEKDAY[d.getUTCDay()]}, ${MONTH[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

const WORD: Record<string, string> = { planned: 'Planned', executed: 'Executed', partly: 'Partly executed', missed: 'Did not happen', weekly: 'Routine' };

/**
 * The schedule in the overview at the right: one day at a time, in order of time. The arrows step through today and
 * the six days after it. Each entry shows plainly, with its time and its status, and a thin line in the color of its
 * department. Pressing an entry opens the calendar window. Blocks are kept for the week and the month.
 */
export default function PilotBoardDay({ days, today }: { days: BoardDay[]; today: string }) {
  const [n, setN] = useState(0);
  const d = days[n];
  if (!d) return null;
  return (
    <div className="dash-sec">
      <div className="dash-h day-h">
        <button type="button" className="day-step" onClick={() => setN(n - 1)} disabled={n === 0} aria-label="The day before">‹</button>
        <h2><Link href={`${TIME_PATH}/${d.date}`}>{d.date === today ? `Today, ${say(d.date).split(', ')[1]}` : say(d.date)}</Link></h2>
        <button type="button" className="day-step" onClick={() => setN(n + 1)} disabled={n === days.length - 1} aria-label="The day after">›</button>
        <Link href={SCHEDULE_PATH} className="dash-more">Open the schedule</Link>
      </div>
      {d.items.length === 0 && <p className="dash-empty">Nothing is on file for this day.</p>}
      {d.items.length > 0 && (
        <div className="day-plain">
          {d.items.map(i => (
            <a key={i.key} href={i.href} className={`day-item d-${i.dept}`} {...popData(i)}>
              <b>{i.label}</b>
              <span className="day-when">{i.start === null ? 'No time' : i.timeText.replace(/, end unknown$/, '')}</span>
              <span className={`pt-chip ${i.kind === 'executed' ? 'filed' : 'unknown'}`}>{WORD[i.kind] || 'Planned'}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
