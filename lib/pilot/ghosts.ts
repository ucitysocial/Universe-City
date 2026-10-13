// The pieces Time still needs, shown as faded rows in the day itself.
//
// The founder set on October 12, 2026 that a missing piece shows in the day where it would sit: Wake up at the top,
// then the morning routine, the work schedule, meals, the night routine, and Bedtime at the end. A faded row is no
// entry. Pressing it sends one message to the agent, and the agent asks for that piece one question at a time.

import type { Intake } from './intake';

export type Ghost = { key: string; label: string; ask: string; at: number };

export function ghostsOf(intake: Intake): Ghost[] {
  const open = new Map(intake.items.filter(i => !i.done).map(i => [i.key, i]));
  const out: Ghost[] = [];
  const sleep = open.get('sleep');
  if (sleep) out.push({ key: 'wake', label: 'Wake up', ask: sleep.ask, at: -3 });
  const morning = open.get('morning');
  if (morning) out.push({ key: 'morning', label: 'Morning routine', ask: morning.ask, at: -2 });
  const work = open.get('work');
  if (work) out.push({ key: 'work', label: 'Work schedule', ask: work.ask, at: 540 });
  const meals = open.get('meals');
  if (meals) out.push({ key: 'meals', label: 'Meals', ask: meals.ask, at: 720 });
  const night = open.get('night');
  if (night) out.push({ key: 'night', label: 'Night routine', ask: night.ask, at: 1438 });
  if (sleep) out.push({ key: 'bed', label: 'Bedtime', ask: sleep.ask, at: 1439 });
  return out;
}

/**
 * Entries and faded rows in one order: by time, with an entry that has no time near the top.
 * The founder set on October 13, 2026 that the morning comes after sleep: when the day holds sleep that ends in the
 * morning or the afternoon, Wake up and the morning routine sit right after it, and Meals after them. When the day holds sleep that starts
 * in the evening, the night routine and Bedtime sit right before it. An entry with no time sits after waking.
 */
export function withGhosts<T extends { start: number | null; end?: number | null; label?: string }>(items: T[], ghosts: Ghost[]): ({ item: T } | { ghost: Ghost })[] {
  const sleeps = items.filter(i => i.start !== null && /\bsleep\b/i.test(i.label ?? ''));
  const woke = sleeps.find(i => (i.start as number) < 720 && i.end != null && i.end <= 1080);
  const bed = sleeps.filter(i => (i.start as number) >= 1080).sort((a, b) => (a.start as number) - (b.start as number))[0];
  const placed = (g: Ghost): number => {
    if (woke && (g.key === 'wake' || g.key === 'morning')) return (woke.end as number) + (g.key === 'wake' ? 0.1 : 0.2);
    if (woke && g.key === 'meals') return Math.max(g.at, (woke.end as number) + 0.3);
    if (bed && (g.key === 'night' || g.key === 'bed')) return (bed.start as number) - (g.key === 'night' ? 0.2 : 0.1);
    return g.at;
  };
  // An entry with no time can be done only once the resident is awake. With sleep that ends late, it sits after the
  // morning routine. The morning routine itself sits right after sleep.
  const untimed = (i: T) => !woke ? -1 : (i.label === 'Morning routine' ? (woke.end as number) + 0.2 : (woke.end as number) + 0.25);
  const rows = [
    ...items.map(item => ({ item, at: item.start ?? untimed(item) })),
    ...ghosts.map(ghost => ({ ghost, at: placed(ghost) }))
  ];
  return rows.sort((a, b) => a.at - b.at).map(r => ('item' in r ? { item: r.item } : { ghost: r.ghost }));
}
