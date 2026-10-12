// The calendar in Time: each entry on file, placed in the hours it holds.
//
// The calendar draws what is on file and builds no entry. A time that is unknown is drawn as unknown:
// an entry with a start and no end is drawn as one hour with an open lower edge, and an entry with no time sits
// above the hours. docs/systems/TIME.md 3.6.7: planned and reported entries stay distinguishable in every view.
//
// Each block matches the time on file exactly: its top is the start and its height is the length. The name inside a
// block is shortened when the block is too small for it. The whole entry opens when the block is pressed.

import type { DeptKey } from '../domain/folders';
import type { Q } from './db';
import { belongsTo } from './dept';
import { TIME_PATH } from './paths';
import { addDays, sayClock, weekdayOf } from './time';

export type CalKind = 'planned' | 'executed' | 'partly' | 'missed' | 'weekly';

export type CalItem = {
  key: string;
  href: string;
  label: string;
  kind: CalKind;            // weekly: an item of the weekly schedule that falls on a day ahead and is not placed on it yet
  dept: DeptKey;            // the department of the folder the entry belongs to. It sets the color
  belongs: string;          // Schedule, in Career Development
  start: number | null;     // minutes after midnight
  end: number | null;       // can pass 1440 when the entry runs past midnight
  rough: boolean;           // the resident gave the time as a rough one
  reported: boolean;        // drawn at the time the resident reported, which replaced the planned time
  fromWeekly: boolean;
  timeText: string;         // 6:00 PM to 8:00 PM
  timeShort: string;        // 6 to 8 PM
};

export type Placed = CalItem & {
  from: number; len: number; openStart: boolean; openEnd: boolean;
  lane: number; lanes: number;   // entries that share hours each take a lane
  clear: number;                 // the minutes from its start until a later entry is drawn over it. The name sits there
  split: boolean;                // side by side, each lane its own width. Otherwise stepped: full width, a later entry on top
  order: number;
};

export type CalDay = { date: string; plan: string | null; timed: Placed[]; untimed: CalItem[]; takenOff: number };

export type Calendar = { days: CalDay[]; firstMin: number; lastMin: number; hour: number };

/** How a view draws entries that share hours, and the height of one hour. */
export type Fit = { sideBySide: boolean; hour: number };
export const WEEK_FIT: Fit = { sideBySide: false, hour: 60 };   // a day is narrow, so entries that share hours are stepped
export const DAY_FIT: Fit = { sideBySide: true, hour: 60 };
export const MONTH_FIT: Fit = { sideBySide: true, hour: 60 };

const timeText = (start: number | null, end: number | null) =>
  start !== null && end !== null ? `${sayClock(start)} to ${sayClock(end)}`
    : start !== null ? `${sayClock(start)}, end unknown`
      : end !== null ? `ends ${sayClock(end)}, start unknown` : 'time unknown';

const clock = (min: number) => {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return { text: `${h % 12 === 0 ? 12 : h % 12}${m ? `:${String(m).padStart(2, '0')}` : ''}`, half: h < 12 ? 'AM' : 'PM' };
};
/** 6 PM */
export const hourShort = (min: number) => { const c = clock(min); return `${c.text} ${c.half}`; };
/** 6 to 8 PM. 11 AM to 1 PM. 3:30 PM, end unknown. */
const timeShort = (start: number | null, end: number | null) => {
  if (start !== null && end !== null) {
    const a = clock(start);
    const b = clock(end);
    return a.half === b.half ? `${a.text} to ${b.text} ${b.half}` : `${a.text} ${a.half} to ${b.text} ${b.half}`;
  }
  return start !== null ? `${hourShort(start)}, end unknown` : end !== null ? `ends ${hourShort(end)}, start unknown` : 'time unknown';
};

const KIND: Record<string, CalKind> = { planned: 'planned', executed: 'executed', partly_executed: 'partly', did_not_happen: 'missed' };
export const KIND_WORD: Record<CalKind, string> = { planned: '', executed: 'executed', partly: 'partly executed', missed: 'did not happen', weekly: '' };

/** Reads the days from one date to another, with each entry and where it is drawn. */
export async function loadCalendar(q: Q, from: string, to: string, today: string, fit: Fit): Promise<Calendar> {
  const rows = await q<any>(
    `select id, label, on_date::text as on_date, start_min, end_min, execution, actual_start_min, actual_end_min, time_is_estimate,
            schedule_item_id, folder, withdrawn_at is not null as off
       from uc_pilot.commitments where on_date between $1::date and $2::date
      order by on_date, start_min nulls last, created_at`, [from, to]);
  const plans = await q<{ plan_date: string; state: string }>(
    `select plan_date::text as plan_date, state from uc_pilot.plans where plan_date between $1::date and $2::date`, [from, to]);
  const weekly = await q<{ id: string; label: string; days: number[]; start_min: number | null; end_min: number | null; folder: string | null }>(
    `select id, label, days, start_min, end_min, folder from uc_pilot.schedule_items where state = 'current' order by start_min nulls last, label`);

  const days: CalDay[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const mine = rows.filter((r: any) => r.on_date === date);
    const items: CalItem[] = mine.filter((r: any) => !r.off).map((r: any) => {
      const reported = r.actual_start_min !== null || r.actual_end_min !== null;
      const start = r.actual_start_min ?? r.start_min;
      const end = r.actual_end_min ?? r.end_min;
      const b = belongsTo(r.folder, r.label);
      return {
        key: r.id, href: `${TIME_PATH}/${date}/${r.id}`, label: r.label, kind: KIND[r.execution] || 'planned',
        dept: b.dept, belongs: b.folder ? `${b.folder}, in ${b.deptName}` : b.deptName,
        start, end, rough: !!r.time_is_estimate, reported, fromWeekly: !!r.schedule_item_id,
        timeText: timeText(start, end), timeShort: timeShort(start, end)
      };
    });
    // The weekly schedule on a day ahead. A day that already holds the item, or had it taken off, is left as it is.
    if (date >= today) {
      for (const s of weekly) {
        if (!s.days.includes(weekdayOf(date))) continue;
        if (mine.some((r: any) => r.schedule_item_id === s.id)) continue;
        const b = belongsTo(s.folder, s.label);
        items.push({
          key: `${s.id}:${date}`, href: `${TIME_PATH}/weekly/${s.id}`, label: s.label, kind: 'weekly',
          dept: b.dept, belongs: b.folder ? `${b.folder}, in ${b.deptName}` : b.deptName,
          start: s.start_min, end: s.end_min, rough: false, reported: false, fromWeekly: true,
          timeText: timeText(s.start_min, s.end_min), timeShort: timeShort(s.start_min, s.end_min)
        });
      }
    }
    const timed: Placed[] = items.filter(i => i.start !== null || i.end !== null).map(i => {
      // An unknown end is drawn as one hour with an open lower edge. An unknown start, as the hour before the end.
      const s = i.start ?? Math.max(0, (i.end as number) - 60);
      const e = i.end ?? (i.start as number) + 60;
      return { ...i, from: s, len: Math.max(e - s, 20), openStart: i.start === null, openEnd: i.end === null, lane: 0, lanes: 1, clear: 0, split: fit.sideBySide, order: 0 };
    }).sort((a, b) => a.from - b.from || b.len - a.len);
    // Entries that share hours are laid out as one group. Each takes the first lane that is free at its start.
    let group: Placed[] = [];
    let ends: number[] = [];
    let groupEnd = -1;
    const close = () => {
      for (const t of group) {
        t.lanes = Math.max(1, ends.length);
        // The name of an entry sits in the part no later entry is drawn over.
        const over = group.filter(u => u.order > t.order && u.lane > t.lane && u.from < t.from + t.len);
        t.clear = over.length ? Math.min(t.len, ...over.map(u => u.from - t.from)) : t.len;
      }
      // Two entries that start within twenty minutes of each other leave no room for the first name. They sit side by side.
      if (group.some(t => t.clear < 20)) for (const t of group) { t.split = true; t.clear = t.len; }
      if (fit.sideBySide) for (const t of group) t.clear = t.len;
      group = []; ends = [];
    };
    timed.forEach((t, n) => {
      t.order = n;
      if (group.length && t.from >= groupEnd) close();
      let lane = ends.findIndex(e => e <= t.from);
      if (lane < 0) { lane = ends.length; ends.push(0); }
      ends[lane] = t.from + t.len;
      t.lane = lane;
      group.push(t);
      groupEnd = Math.max(groupEnd, t.from + t.len);
    });
    close();
    days.push({
      date, plan: plans.find(p => p.plan_date === date)?.state ?? null,
      timed, untimed: items.filter(i => i.start === null && i.end === null), takenOff: mine.filter((r: any) => r.off).length
    });
  }

  // The hours shown: 6:00 AM to 10:00 PM, and wider when an entry sits outside them. The latest row ends at 2:00 AM.
  const all = days.flatMap(d => d.timed);
  const firstMin = Math.min(6 * 60, ...all.map(t => Math.floor(t.from / 60) * 60));
  const lastMin = Math.min(26 * 60, Math.max(22 * 60, ...all.map(t => Math.ceil((t.from + t.len) / 60) * 60)));
  return { days, firstMin: Math.max(0, firstMin), lastMin, hour: fit.hour };
}

/** The Sunday that starts the week of a date. */
export const weekStart = (date: string) => addDays(date, -weekdayOf(date));
export const monthStart = (date: string) => `${date.slice(0, 7)}-01`;
export function monthEnd(date: string): string {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  return `${date.slice(0, 7)}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
}
export function addMonths(date: string, n: number): string {
  const d = new Date(`${date.slice(0, 7)}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}
