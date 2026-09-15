/** Every day and week boundary is computed in the member's own zone.
 *  toISOString is UTC and will give a Denver member the wrong week after 5pm. */

export function localParts(at: Date, timeZone: string) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false
  });
  const p = Object.fromEntries(f.formatToParts(at).map(x => [x.type, x.value]));
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
    weekday: weekdays.indexOf(p.weekday as string)
  };
}

export const today = (timeZone: string, at = new Date()) => localParts(at, timeZone).date;

const shift = (isoDate: string, days: number) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const x = new Date(Date.UTC(y, m - 1, d));
  x.setUTCDate(x.getUTCDate() + days);
  return x.toISOString().slice(0, 10);
};

/** Sunday to Saturday, in their zone. */
export function weekBounds(timeZone: string, at = new Date()) {
  const { date, weekday } = localParts(at, timeZone);
  const start = shift(date, -weekday);
  return { start, end: shift(start, 6), days: Array.from({ length: 7 }, (_, i) => shift(start, i)) };
}

export const nowMinutes = (timeZone: string, at = new Date()) => localParts(at, timeZone).minutes;
