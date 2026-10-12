import type { CSSProperties } from 'react';
import Link from 'next/link';
import PilotBoardTabs from '@/components/PilotBoardTabs';
import { Countdown } from '@/components/PilotPanelBits';
import PilotPending from '@/components/PilotPending';
import { popData } from '@/app/(pilot)/portal/file/[[...path]]/calendar';
import { spanWords } from '@/lib/pilot/browse';
import type { Board } from '@/lib/pilot/board';
import { belongsTo } from '@/lib/pilot/dept';
import { slugOf, SCHEDULE_PATH, TIME_PATH } from '@/lib/pilot/paths';
import { sayDate, weekdayName, weekdayOf } from '@/lib/pilot/time';

const short = (date: string) => sayDate(date).replace(/, \d{4}$/, '');

/** The dashboard: now or coming up, one view the resident picks, and Pending. It sits at the right of every page. */
export default function PilotBoard({ board }: { board: Board }) {
  const { panel, today, days, folders } = board;
  const { now: cur, then } = panel;
  const waiting = panel.pending.length;

  const calendar = (
    <div className="dash-sec">
      <div className="dash-h">
        <h2>Today and the next six days</h2>
        <Link href={SCHEDULE_PATH} className="dash-more">Open the calendar</Link>
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
                  <span className="dash-it">{i.start === null ? 'No time' : i.timeShort}</span>
                  <span className="dash-il">{i.label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const views = [
    { key: 'calendar', label: 'Calendar', color: 'var(--I)', node: calendar },
    ...folders.map(f => ({
      key: slugOf(f.name), label: f.name, color: f.color,
      node: (
        <div className="dash-sec">
          <div className="dash-h">
            <h2>{f.name}</h2>
            <Link href={f.href} className="dash-more">Open the folder</Link>
          </div>
          <div className="dash-said">
            {f.lines.map(l => (
              <Link key={l.key} href={l.href} className="dash-st" style={{ '--fc': f.color } as CSSProperties}>
                <b>{l.title}</b>
                <span>{l.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      )
    }))
  ];

  return (
    <div className="board">
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
      <PilotBoardTabs views={views} />
      <div className="dash-sec">
        <div className="dash-h"><h2>Pending</h2>{waiting > 0 && <span className="dash-count">{waiting}</span>}</div>
        <div className="dash-pending"><PilotPending panel={panel} /></div>
      </div>
    </div>
  );
}
