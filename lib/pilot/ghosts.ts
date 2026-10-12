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

/** Entries and faded rows in one order: by time, with an entry that has no time near the top. */
export function withGhosts<T extends { start: number | null }>(items: T[], ghosts: Ghost[]): ({ item: T } | { ghost: Ghost })[] {
  const rows = [
    ...items.map(item => ({ item, at: item.start ?? -1 })),
    ...ghosts.map(ghost => ({ ghost, at: ghost.at }))
  ];
  return rows.sort((a, b) => a.at - b.at).map(r => ('item' in r ? { item: r.item } : { ghost: r.ghost }));
}
