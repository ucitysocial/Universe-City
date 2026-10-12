import type { CSSProperties } from 'react';
import Link from 'next/link';
import PilotBoardDay from '@/components/PilotBoardDay';
import PilotBoardTabs from '@/components/PilotBoardTabs';
import { Countdown } from '@/components/PilotPanelBits';
import PilotPending from '@/components/PilotPending';
import { popData } from '@/app/(pilot)/portal/file/[[...path]]/calendar';
import { spanWords } from '@/lib/pilot/browse';
import type { Board } from '@/lib/pilot/board';
import { ghostsOf } from '@/lib/pilot/ghosts';
import { belongsTo } from '@/lib/pilot/dept';
import { DEPARTMENTS, FOLDERS } from '@/lib/domain/folders';
import { folderPath, SCHEDULE_PATH, slugOf, TIME_PATH } from '@/lib/pilot/paths';
import { sayDate, weekdayName, weekdayOf } from '@/lib/pilot/time';

const short = (date: string) => sayDate(date).replace(/, \d{4}$/, '');

/**
 * The dashboard: now or coming up, one view the resident picks, and Pending. The views are the calendar and the four
 * departments. It sits at the right of every page.
 */
export default function PilotBoard({ board, wide = false, hidePending = false }: { board: Board; wide?: boolean; hidePending?: boolean }) {
  const { panel, today, days, folders } = board;
  const { now: cur, then } = panel;
  const waiting = panel.pending.length;

  const calendar = (
    <div className="dash-sec">
      <div className="dash-h">
        <h2>Today and the next six days</h2>
        <Link href={SCHEDULE_PATH} className="dash-more">Open the schedule</Link>
      </div>
      <div className="dash-days">
        {days.map(d => (
          <div key={d.date} className={`dash-row${d.date === today ? ' today' : ''}`}>
            <Link href={`${TIME_PATH}/${d.date}`} className="dash-dname">
              <span>{d.date === today ? 'Today' : weekdayName(weekdayOf(d.date)).slice(0, 3)}</span>
              <b>{Number(d.date.slice(8, 10))}</b>
            </Link>
            <div className="dash-items">
              {d.items.length === 0 && <p className="dash-empty">Nothing on file</p>}
              {d.items.map(i => (
                <a key={i.key} href={i.href} className={`dash-item d-${i.dept} ${i.kind}`} {...popData(i)}>
                  <span className="dash-it">{i.start === null ? 'No time' : i.timeShort.replace(/, end unknown$/, '')}</span>
                  <span className="dash-il">{i.label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const depts = DEPARTMENTS.map(d => ({
    key: d.key, name: d.name, slug: slugOf(d.name), color: d.color,
    folders: FOLDERS.filter(f => f.dept === d.key && f.name !== 'Time').map(f => ({ name: f.name, href: folderPath(f.name) }))
  }));

  // The overview at the right holds the day and nothing more: the entry happening now glows in the list. What waits
  // for the resident shows under it only when an item waits. The departments are in My File at the left.
  if (!wide) {
    return (
      <div className="board side-clean">
        {!hidePending && waiting > 0 && (
          <div className="dash-sec side-wait">
            <div className="dash-h"><h2>Waiting for you</h2><span className="dash-count">{waiting}</span></div>
            <div className="dash-pending"><PilotPending panel={panel} /></div>
          </div>
        )}
        <PilotBoardDay days={days} today={today} nowId={cur?.id ?? null} live={!!cur?.live} ghosts={ghostsOf(board.intake)} />
      </div>
    );
  }

  return (
    <div className={wide ? 'board wide' : 'board'}>
      {cur ? (
        <Link href={`${TIME_PATH}/${cur.on_date}/${cur.id}`} className="dash-now" style={{ '--fc': belongsTo(cur.folder, cur.label).color } as CSSProperties}>
          <span className="dash-k">{cur.live ? 'Now' : 'Coming up'}</span>
          <b>{cur.label}</b>
          <Countdown until={cur.minutesUntil} left={cur.minutesLeft} live={cur.live} />
          <span className="dash-t">{cur.on_date === today ? 'Today' : short(cur.on_date)}, {spanWords(cur.start_min, cur.end_min)}</span>
          {then && <span className="dash-then">Then {then.label}, {spanWords(then.start_min, then.end_min)}</span>}
        </Link>
      ) : (
        <p className="dash-now none">Nothing is on file for the rest of today or tomorrow.</p>
      )}
      <PilotBoardTabs calendar={
        <>
          {wide ? calendar : <PilotBoardDay days={days} today={today} />}
          {waiting > 0 && (
            <section className="dash-sec dash-schedule-pending" aria-label="Pending for you">
              <div className="dash-h"><h2>Pending</h2><span className="dash-count">{waiting}</span></div>
              <div className="dash-pending"><PilotPending panel={panel} /></div>
            </section>
          )}
        </>
      } depts={depts} filled={folders} />
    </div>
  );
}
