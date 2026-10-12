// Unfinished work that carries to the next day, and entries the resident pushed later.
//
// The founder set both on October 12, 2026.
//
// Carry forward. A task the resident does on their own and did not mark done stays open. After its day ends it shows
// as To schedule, and the agent asks first what time it gets done or where it moves. Nothing is copied and no outcome
// is filed: the entry keeps its day until the resident gives it a new one, and no report means not done yet, never
// did not happen. Three kinds of entry never carry. A routine repeats on its own days. An appointment, a shift, a class,
// or a meeting is tied to its time by another person or place, so a missed one is a question of what happened and of
// reaching out to reschedule, and the entry keeps its real day.
//
// Pushes. Each time the resident moves an entry to a later time or a later day, it counts as one push. After the second
// push the agent engages with the entry, in the way it judges best from what it knows of the resident. Carrying is no
// push, because nothing moves.

import type { Q } from './db';
import { belongsTo } from './dept';
import { isWork } from './owed';
import { addDays } from './time';

/** Entries tied to their time by another person or place. They keep their day and never carry. */
const BOUND = /\b(appointment|appt|doctor|dentist|clinic|therapy|therapist|meeting|interview|class|lecture|lesson|shift|flight|train|court|hearing|call with|dinner with|lunch with|breakfast with|coffee with|party|wedding|funeral|concert|show|game|visit|pick ?up \w+ from|drop ?off \w+ at)\b/i;

export function carries(c: { label: string; folder?: string | null; schedule_item_id: string | null }): boolean {
  if (c.schedule_item_id) return false;
  if (isWork(belongsTo(c.folder ?? null, c.label))) return false;
  return !BOUND.test(c.label);
}

export type Carried = { id: string; label: string; on_date: string; start_min: number | null; end_min: number | null; folder: string | null; days: number };

/** Open tasks from the thirty days before today, oldest first. */
export async function loadCarried(q: Q, today: string): Promise<Carried[]> {
  const rows = await q<Omit<Carried, 'days'> & { schedule_item_id: string | null }>(
    `select id, label, on_date::text as on_date, start_min, end_min, folder, schedule_item_id from uc_pilot.commitments
      where withdrawn_at is null and execution = 'planned' and on_date < $1::date and on_date >= $2::date
      order by on_date, start_min nulls last limit 200`, [today, addDays(today, -30)]);
  const day = (d: string) => Date.parse(`${d}T12:00:00Z`) / 86400000;
  return rows.filter(carries).map(({ schedule_item_id: _, ...c }) => ({ ...c, days: Math.round(day(today) - day(c.on_date)) }));
}

export type Pushes = { count: number; moves: { from: string; to: string }[] };

const clock = (m: number | null) => {
  if (m === null) return 'no time';
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return `${h % 12 === 0 ? 12 : h % 12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

/** How often each entry was moved later, from the history the database keeps for every change. */
export async function loadPushes(q: Q, ids: string[]): Promise<Map<string, Pushes>> {
  const out = new Map<string, Pushes>();
  if (!ids.length) return out;
  const rows = await q<{ id: string; bd: string | null; ad: string | null; bs: number | null; as_: number | null }>(
    `select row_id::text as id, before ->> 'on_date' as bd, after ->> 'on_date' as ad,
            (before ->> 'start_min')::int as bs, (after ->> 'start_min')::int as as_
       from uc_pilot.revisions
      where table_name = 'commitments' and row_id = any ($1::uuid[]) and actor in ('resident', 'agent')
        and ('on_date' = any (changed) or 'start_min' = any (changed))
      order by seq`, [ids]);
  for (const r of rows) {
    const later = (r.ad && r.bd && r.ad > r.bd) || (r.ad === r.bd && r.bs !== null && r.as_ !== null && r.as_ > r.bs);
    if (!later) continue;
    const p = out.get(r.id) ?? { count: 0, moves: [] };
    p.count += 1;
    p.moves.push({ from: `${r.bd} ${clock(r.bs)}`, to: `${r.ad} ${clock(r.as_)}` });
    out.set(r.id, p);
  }
  return out;
}
