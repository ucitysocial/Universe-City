import type { CSSProperties } from 'react';
import Link from 'next/link';
import PilotBoardDay from '@/components/PilotBoardDay';
import PilotBoardTabs from '@/components/PilotBoardTabs';
import { Countdown } from '@/components/PilotPanelBits';
import PilotPending from '@/components/PilotPending';
import { popData } from '@/app/(pilot)/portal/file/[[...path]]/calendar';
import { spanWords } from '@/lib/pilot/browse';
import type { Board } from '@/lib/pilot/board';
import { belongsTo } from '@/lib/pilot/dept';
import { DEPARTMENTS, FOLDERS } from '@/lib/domain/folders';
import { folderPath, SCHEDULE_PATH, slugOf, TIME_PATH } from '@/lib/pilot/paths';
import { sayDate, weekdayName, weekdayOf } from '@/lib/pilot/time';

const short = (date: string) => sayDate(date).replace(/, \d{4}$/, '');

/**
 * The dashboard: now or coming up, one view the resident picks, and Pending. The views are the calendar and the four
 * departments. It sits at the right of every page.
 */
export default function PilotBoard({ board, wide = false }: { board: Board; wide?: boolean }) {
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
      <PilotBoardTabs calendar={wide ? calendar : <PilotBoardDay days={days} today={today} />} depts={depts} filled={folders} />
      {wide && (
        <div className="dash-sec">
          <div className="dash-h"><h2>Progress</h2></div>
          <div className="prog">
            {(() => {
              const planned = days.filter(d => d.items.length > 0).length;
              const rows = [
                { key: 'week', label: 'Days with entries, today and the next six', n: planned, of: 7, color: 'var(--ink)' },
                ...DEPARTMENTS.map(dep => {
                  const n = folders.filter(f => f.dept === dep.key).length + (dep.key === 'I' && days.some(d => d.items.length) ? 1 : 0);
                  return { key: dep.key, label: `${dep.name}, folders with entries`, n, of: 12, color: dep.color };
                })
              ];
              return rows.map(r => (
                <div key={r.key} className="prog-row">
                  <span className="prog-l">{r.label}</span>
                  <span className="prog-bar" role="img" aria-label={`${r.n} of ${r.of}`}>
                    <i style={{ width: `${Math.round((r.n / r.of) * 100)}%`, background: r.color }} />
                  </span>
                  <span className="prog-n">{r.n} of {r.of}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
      <div className="dash-sec">
        <div className="dash-h"><h2>Pending</h2>{waiting > 0 && <span className="dash-count">{waiting}</span>}</div>
        <div className="dash-pending"><PilotPending panel={panel} /></div>
      </div>
    </div>
  );
}
