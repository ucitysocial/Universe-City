// Unfinished tasks from earlier days, shown again today.
//
// The founder set on October 13, 2026 that a task not finished on its day, or only partly done, shows on today
// automatically. Nothing in the
// database moves: the entry keeps its own day and its history, and it is shown again on today, marked with the day it
// came from, until the resident marks it done, gives it a new day, or takes it off. No report means not done yet.
// Three kinds of entry never carry. A routine repeats on its own days. A work shift belongs to its day. An
// appointment, a class, or a meeting is tied to its time by another person or place, so a missed one is a question of
// what happened, never a task for today.

import type { Q } from './db';
import { belongsTo } from './dept';
import { isWork } from './owed';
import { addDays } from './time';

/** Entries tied to their time by another person or place. They keep their day and never carry. */
const BOUND = /\b(appointment|appt|doctor|dentist|clinic|therapy|therapist|meeting|interview|class|lecture|lesson|shift|flight|train|court|hearing|call with|dinner with|lunch with|breakfast with|coffee with|party|wedding|funeral|concert|show|game|visit|sleep|nap)\b/i;

export function carries(c: { label: string; folder?: string | null; schedule_item_id: string | null }): boolean {
  if (c.schedule_item_id) return false;
  if (isWork(belongsTo(c.folder ?? null, c.label))) return false;
  return !BOUND.test(c.label);
}

export type Carried = { id: string; label: string; on_date: string; start_min: number | null; end_min: number | null; folder: string | null };

/** Open tasks from the fourteen days before today, oldest first. */
export async function loadCarried(q: Q, today: string): Promise<Carried[]> {
  const rows = await q<Carried & { schedule_item_id: string | null }>(
    `select id, label, on_date::text as on_date, start_min, end_min, folder, schedule_item_id from uc_pilot.commitments
      where withdrawn_at is null and execution in ('planned', 'partly_executed') and on_date < $1::date and on_date >= $2::date
      order by on_date, start_min nulls last limit 100`, [today, addDays(today, -14)]);
  return rows.filter(carries).map(({ schedule_item_id: _, ...c }) => c);
}
