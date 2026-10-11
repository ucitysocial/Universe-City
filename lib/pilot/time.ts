// Dates and clock times for the founder test.
// A day is the resident's local day. A clock time is minutes after local midnight.
// An end past 1440 crosses midnight and belongs to the day it started on.

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

export type LocalNow = { date: string; minutes: number; weekday: number; label: string; zone: string };

export function localNow(zone: string, at: Date = new Date()): LocalNow {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(at);
  } catch {
    return localNow('America/Denver', at);
  }
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const minutes = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
  return { date, minutes, weekday: weekdayOf(date), label: `${sayDate(date)}, ${sayClock(minutes)}`, zone };
}

export function isDate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function weekdayName(n: number): string {
  return WEEKDAYS[((n % 7) + 7) % 7];
}

/** Monday, October 12, 2026 */
export function sayDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** October 12 */
export function sayDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** 840 reads 2:00 PM. 1500 reads 1:00 AM the next day. */
export function sayClock(min: number | null | undefined): string {
  if (min === null || min === undefined) return 'time not established';
  const next = min >= 1440;
  const m = ((min % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${h24 < 12 ? 'AM' : 'PM'}${next ? ' the next day' : ''}`;
}

export function saySpan(start: number | null | undefined, end: number | null | undefined): string {
  if (start == null && end == null) return 'time not established';
  if (start != null && end != null) return `${sayClock(start)} to ${sayClock(end)}`;
  if (start != null) return `starts ${sayClock(start)}, end not established`;
  return `ends ${sayClock(end)}, start not established`;
}

/** Reads 14:00 or 9:30 on a 24 hour clock. Returns minutes after midnight, or null when it is no clock time. */
export function parseClock(s: unknown): number | null {
  if (typeof s !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mi = parseInt(m[2], 10);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

/** An end at or before its start is read as the next day. */
export function endAfter(start: number | null, end: number | null): number | null {
  if (end === null) return null;
  if (start !== null && end <= start) return end + 1440;
  return end === 0 ? 1440 : end;
}

/** A timestamp from the database, said in the resident's zone. */
export function sayWhen(iso: string, zone: string): string {
  const n = localNow(zone, new Date(iso));
  return n.label;
}

export function sayDays(days: number[]): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  if (sorted.length === 7) return 'every day';
  if (sorted.join(',') === '0,6') return 'Saturday and Sunday';
  // Three or more days in a row read as a range: Tuesday to Saturday.
  const inRow = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (sorted.length >= 3 && inRow) return `${weekdayName(sorted[0])} to ${weekdayName(sorted[sorted.length - 1])}`;
  const names = sorted.map(weekdayName);
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
