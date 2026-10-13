// Which entry is happening now, for the glow in the day.
//
// The founder set on October 13, 2026 that the glow is exact at every minute. An entry is live from its start to its
// end. With no end, it is live for one hour. When entries overlap, the one that started last glows, because it is the
// one the resident is in: a doctor appointment during a work shift glows, and when the appointment ends the shift
// glows again. With no entry live, the next entry today is marked Next. An entry with an outcome on file does not glow.

export type NowItem = { key: string; start: number | null; end: number | null; kind: string };
export type NowPick = { key: string; live: boolean } | null;

const OVER = new Set(['executed', 'partly', 'missed']);

export function pickNow(items: NowItem[], minutes: number): NowPick {
  const timed = items.filter(i => i.start !== null && !OVER.has(i.kind));
  const live = timed
    .filter(i => (i.start as number) <= minutes && minutes < (i.end ?? (i.start as number) + 60))
    .sort((a, b) => (b.start as number) - (a.start as number) || ((a.end ?? 1e9) - (b.end ?? 1e9)));
  if (live.length) return { key: live[0].key, live: true };
  const next = timed.filter(i => (i.start as number) > minutes).sort((a, b) => (a.start as number) - (b.start as number))[0];
  return next ? { key: next.key, live: false } : null;
}
