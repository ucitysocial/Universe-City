'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { BoardDay } from '@/lib/pilot/board';
import { popData } from '@/app/(pilot)/portal/file/[[...path]]/calendar';
import { SCHEDULE_PATH, TIME_PATH } from '@/lib/pilot/paths';

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const say = (date: string) => {
  const d = new Date(`${date}T12:00:00Z`);
  return `${WEEKDAY[d.getUTCDay()]}, ${MONTH[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

const KEY = 'uc:boardmode';
const WORD: Record<string, string> = { planned: 'Planned', executed: 'Executed', partly: 'Partly executed', missed: 'Did not happen', weekly: 'Weekly routine' };

/**
 * The schedule in the overview at the right: one day at a time, in order of time. The arrows step through today and
 * the six days after it. List shows each entry plainly, with its time and its status. Blocks shows each entry in the
 * color of its department. List is the first view. The choice is kept in this browser. Pressing an entry opens the
 * calendar window.
 */
export default function PilotBoardDay({ days, today }: { days: BoardDay[]; today: string }) {
  const [n, setN] = useState(0);
  const [mode, setMode] = useState<'list' | 'blocks'>('list');
  useEffect(() => { try { if (localStorage.getItem(KEY) === 'blocks') setMode('blocks'); } catch { /* List */ } }, []);
  const choose = (m: 'list' | 'blocks') => { setMode(m); try { localStorage.setItem(KEY, m); } catch { /* kept for this page */ } };
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
      <span className="cal-seg day-mode" aria-label="How the day is shown">
        <button type="button" className={mode === 'list' ? 'on' : undefined} aria-pressed={mode === 'list'} onClick={() => choose('list')}>List</button>
        <button type="button" className={mode === 'blocks' ? 'on' : undefined} aria-pressed={mode === 'blocks'} onClick={() => choose('blocks')}>Blocks</button>
      </span>
      {d.items.length === 0 && <p className="dash-empty">Nothing is on file for this day.</p>}
      {d.items.length > 0 && mode === 'list' && (
        <div className="day-plain">
          {d.items.map(i => (
            <a key={i.key} href={i.href} className="day-item" {...popData(i)}>
              <b>{i.label}</b>
              <span className="day-when">{i.start === null ? 'No time' : i.timeText.replace(/, end unknown$/, '')}</span>
              <span className={`pt-chip ${i.kind === 'executed' ? 'filed' : 'unknown'}`}>{WORD[i.kind] || 'Planned'}</span>
            </a>
          ))}
        </div>
      )}
      {d.items.length > 0 && mode === 'blocks' && (
        <div className="day-blocks">
          {d.items.map(i => (
            <a key={i.key} href={i.href} className={`day-block d-${i.dept} ${i.kind}`} {...popData(i)}>
              <span className="day-t">{i.start === null ? 'No time' : i.timeShort.replace(/, end unknown$/, '')}</span>
              <span className="day-l">{i.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
