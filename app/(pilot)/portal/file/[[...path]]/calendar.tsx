import type { CSSProperties } from 'react';
import Link from 'next/link';
import PilotCalZoom from '@/components/PilotCalZoom';
import PilotDayMode from '@/components/PilotDayMode';
import { DEPARTMENTS } from '@/lib/domain/folders';
import { addMonths, hourShort, KIND_WORD, monthEnd, monthStart, weekStart, type CalDay, type Calendar, type CalItem, type Placed } from '@/lib/pilot/calendar';
import { SCHEDULE_PATH, TIME_PATH } from '@/lib/pilot/paths';
import { addDays, sayDate, sayDay, weekdayName, weekdayOf } from '@/lib/pilot/time';

// The calendar in Time. Three views of the same entries: one day, one week, one month.
// Each entry fills exactly the hours it holds, in the color of the department it belongs to. A block that is too
// small for its whole name shows the first words of it. The whole entry opens when the block is pressed.
// The calendar changes no entry.

export type CalView = 'day' | 'week' | 'month';

const WORD: Record<string, string> = {
  planned: 'Planned', executed: 'Executed', partly: 'Partly executed', missed: 'Did not happen', weekly: 'From the weekly schedule'
};

export const weekHref = (on: string) => `${SCHEDULE_PATH}?view=week&on=${on}`;
export const monthHref = (on: string) => `${SCHEDULE_PATH}?view=month&on=${on}`;
export const dayHref = (on: string) => `${TIME_PATH}/${on}`;

/** October 11 to 17, 2026 */
export function weekTitle(start: string): string {
  const end = addDays(start, 6);
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  return `${sayDay(start)} to ${sameMonth ? Number(end.slice(8, 10)) : sayDay(end)}, ${end.slice(0, 4)}`;
}
export const monthTitle = (on: string) => sayDate(monthStart(on)).replace(/^\w+, (\w+) \d+, (\d+)$/, '$1 $2');

/** The row above the calendar: which view, and the way to the days before and after. */
export function CalendarBar({ view, on, today }: { view: CalView; on: string; today: string }) {
  const earlier = view === 'month' ? monthHref(addMonths(on, -1)) : view === 'week' ? weekHref(addDays(weekStart(on), -7)) : dayHref(addDays(on, -1));
  const later = view === 'month' ? monthHref(addMonths(on, 1)) : view === 'week' ? weekHref(addDays(weekStart(on), 7)) : dayHref(addDays(on, 1));
  const now = view === 'month' ? monthHref(today) : view === 'week' ? weekHref(today) : dayHref(today);
  const title = view === 'month' ? monthTitle(on) : view === 'week' ? weekTitle(weekStart(on)) : sayDate(on);
  return (
    <div className="cal-bar">
      <strong className="cal-title">{title}</strong>
      <span className="cal-seg cal-move" aria-label="Move through the calendar">
        <Link href={earlier} aria-label="Earlier"><span aria-hidden="true">‹</span><span className="cal-word"> Earlier</span></Link>
        <Link href={now}>{view === 'month' ? 'This month' : view === 'week' ? 'This week' : 'Today'}</Link>
        <Link href={later} aria-label="Later"><span className="cal-word">Later </span><span aria-hidden="true">›</span></Link>
      </span>
      <span className="cal-seg cal-views" aria-label="Calendar view">
        <Link href={dayHref(on)} className={view === 'day' ? 'on' : undefined} aria-current={view === 'day' ? 'page' : undefined}>Day</Link>
        <Link href={weekHref(on)} className={view === 'week' ? 'on' : undefined} aria-current={view === 'week' ? 'page' : undefined}>Week</Link>
        <Link href={monthHref(on)} className={view === 'month' ? 'on' : undefined} aria-current={view === 'month' ? 'page' : undefined}>Month</Link>
      </span>
      {view === 'day' && <PilotDayMode />}
      {view !== 'month' && <PilotCalZoom />}
    </div>
  );
}

/** What the colors and the kinds of block mean, in one line under the calendar. A color is the department of the folder. */
export function Legend({ month = false }: { month?: boolean }) {
  return (
    <p className="cal-legend">
      <span title={DEPARTMENTS.map(d => d.name).join(', ')}>
        {DEPARTMENTS.map(d => <i key={d.key} className={`cal-key d-${d.key}`} aria-label={d.name} />)}
        Department
      </span>
      <span><i className="cal-key d-I executed" />Executed</span>
      <span><i className="cal-key d-I weekly" />Weekly routine</span>
      {!month && <span><i className="cal-key d-I open" />End unknown</span>}
    </p>
  );
}

/**
 * The time of a block in parts that each stay on one line: 10:30 to / 11:30 AM / executed.
 * A narrow block breaks between two parts and never inside one.
 */
function timeParts(time: string, more: string[]): string[] {
  const at = time.indexOf(' to ');
  const comma = time.indexOf(', ');
  const parts = at > 0 ? [time.slice(0, at + 3), time.slice(at + 4)] : comma > 0 ? [`${time.slice(0, comma)},`, time.slice(comma + 2)] : [time];
  for (const m of more.filter(Boolean)) { parts[parts.length - 1] += ','; parts.push(m); }
  return parts;
}

/** What the small window over the calendar shows at once, before it loads the rest of the entry. */
export const popData = (i: CalItem) => ({
  'data-pop': i.key.split(':')[0], 'data-weekly': i.kind === 'weekly' ? '1' : undefined,
  'data-label': i.label, 'data-time': i.timeText, 'data-belongs': i.belongs, 'data-href': i.href, 'data-kind': WORD[i.kind]
});

function Block({ t, firstMin, single }: { t: Placed; firstMin: number; single: boolean }) {
  const word = KIND_WORD[t.kind];
  const cls = ['cal-block', `d-${t.dept}`, t.kind, t.split ? 'split' : 'step', t.rough ? 'rough' : '', t.openEnd ? 'open-end' : '', t.openStart ? 'open-start' : ''].filter(Boolean).join(' ');
  return (
    <Link href={t.href} className={cls} data-name={t.label} {...popData(t)} title={`${t.label}. ${t.timeText}. ${WORD[t.kind]}. ${t.belongs}.`}
      style={{ '--top': t.from - firstMin, '--len': t.len, '--lane': t.lane, '--lanes': t.lanes, '--clear': t.clear, '--z': t.order } as CSSProperties}>
      <span className="cal-text">
        <b key={t.label}>{t.label}</b>
        <span className="cal-time">{timeParts(single ? t.timeText : t.timeShort, [t.rough ? 'rough' : '', word]).map((part, n) => <i key={n}>{part} </i>)}</span>
      </span>
    </Link>
  );
}

function Untimed({ list }: { list: CalItem[] }) {
  return (
    <>
      {list.map(i => (
        <Link key={i.key} href={i.href} className={`cal-chip d-${i.dept} ${i.kind}`} {...popData(i)} title={`${i.label}. Time unknown. ${WORD[i.kind]}. ${i.belongs}.`}>{i.label}</Link>
      ))}
    </>
  );
}

/** One day or one week, hour by hour. Each entry sits in its hours. */
export function HourGrid({ cal, today, nowMin, single = false }: { cal: Calendar; today: string; nowMin: number; single?: boolean }) {
  const { days, firstMin, lastMin } = cal;
  const hours = (lastMin - firstMin) / 60;
  const marks = Array.from({ length: hours }, (_, i) => firstMin + i * 60);
  const anyUntimed = days.some(d => d.untimed.length > 0);
  return (
    <div className={single ? 'cal-scroll single' : 'cal-scroll'}>
      <div className={single ? 'cal single' : 'cal'} style={{ '--cols': days.length, '--hours': hours, '--h': `${cal.hour}px` } as CSSProperties}>
        {!single && <div className="cal-corner" />}
        {!single && days.map(d => (
          <Link key={d.date} href={dayHref(d.date)} className={d.date === today ? 'cal-head today' : 'cal-head'}>
            <span>{weekdayName(weekdayOf(d.date)).slice(0, 3)}</span>
            <b>{Number(d.date.slice(8, 10))}</b>
          </Link>
        ))}
        {anyUntimed && <div className="cal-side" title="Entries with no time on file">No time</div>}
        {anyUntimed && days.map(d => <div key={d.date} className="cal-untimed"><Untimed list={d.untimed} /></div>)}
        <div className="cal-gutter">
          {marks.map(m => <span key={m} style={{ '--top': m - firstMin } as CSSProperties}>{hourShort(m)}</span>)}
        </div>
        {days.map(d => (
          <div key={d.date} className={d.date === today ? 'cal-col today' : 'cal-col'}>
            {d.date === today && nowMin >= firstMin && nowMin <= lastMin && <span className="cal-now" style={{ '--top': nowMin - firstMin } as CSSProperties} aria-label="Now" />}
            {d.timed.map(t => <Block key={t.key} t={t} firstMin={firstMin} single={single} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One month. Each day shows the part of its hours that is filled, and each entry it holds. */
export function MonthGrid({ cal, on, today }: { cal: Calendar; on: string; today: string }) {
  const month = on.slice(0, 7);
  const seg = (d: CalDay) => d.timed.map(t => ({
    key: t.key, cls: `d-${t.dept} ${t.kind}${t.openEnd ? ' open' : ''}`,
    left: Math.min(100, (t.from / 1440) * 100), width: Math.max(1.5, Math.min(100 - (t.from / 1440) * 100, (t.len / 1440) * 100))
  }));
  return (
    <div className="mon">
      {[0, 1, 2, 3, 4, 5, 6].map(n => <div key={n} className="mon-dow">{weekdayName(n).slice(0, 3)}</div>)}
      {cal.days.map(d => {
        const all = [...d.timed, ...d.untimed];
        const cls = ['mon-cell', d.date.slice(0, 7) !== month ? 'out' : '', d.date === today ? 'today' : ''].filter(Boolean).join(' ');
        return (
          <Link key={d.date} href={dayHref(d.date)} className={cls} title={`${sayDate(d.date)}. ${all.length} ${all.length === 1 ? 'entry' : 'entries'}.`}>
            <span className="mon-num">
              <b>{Number(d.date.slice(8, 10))}</b>
            </span>
            {d.timed.length > 0 && (
              <span className="mon-strip" aria-hidden="true">
                {seg(d).map(s => <i key={s.key} className={s.cls} style={{ left: `${s.left}%`, width: `${s.width}%` }} />)}
              </span>
            )}
            {all.map(i => (
              <span key={i.key} className={`mon-item d-${i.dept} ${i.kind}`} role="button" tabIndex={0} {...popData(i)}>
                {i.start !== null ? <em>{hourShort(i.start)}</em> : null}{i.label}
              </span>
            ))}
            {all.length > 0 && <span className="mon-count">{all.length}</span>}
          </Link>
        );
      })}
    </div>
  );
}

/** The first and last day a month view shows: whole weeks, Sunday to Saturday. */
export function monthRange(on: string): { from: string; to: string } {
  const from = weekStart(monthStart(on));
  const last = monthEnd(on);
  return { from, to: addDays(last, 6 - weekdayOf(last)) };
}
