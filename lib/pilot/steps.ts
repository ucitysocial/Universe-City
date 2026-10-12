// Steps inside one entry.
//
// The founder set on October 12, 2026 that any entry in Time can hold an ordered list of smaller steps. The agent
// builds the list from what the resident says in the conversation: it asks what the work involves, in full detail,
// and puts the answer in order. A step on a weekly item, such as one in a morning routine, applies on the days it
// names, so a routine can hold a step for some days and leave it off on others. A step is marked done on one day's
// entry, so each day keeps its own progress and the list itself never changes from a mark.

import type { Q } from './db';
import { weekdayOf } from './time';

export type Step = { id: string; label: string; days: number[] | null; done: boolean; from: 'entry' | 'routine' };

type Row = { id: string; label: string; days: number[] | null; position: number; commitment_id: string | null; schedule_item_id: string | null };

/** The steps that apply to one commitment on its day, in order, with the marks made on that day. */
export async function stepsOn(q: Q, c: { id: string; on_date: string; schedule_item_id: string | null }): Promise<Step[]> {
  const rows = await q<Row>(
    `select id, label, days, position, commitment_id, schedule_item_id from uc_pilot.steps
      where state = 'current' and (commitment_id = $1 or ($2::uuid is not null and schedule_item_id = $2::uuid))
      order by schedule_item_id is null, position`, [c.id, c.schedule_item_id]);
  const wd = weekdayOf(c.on_date);
  const apply = rows.filter(r => !r.days || r.days.map(Number).includes(wd));
  if (!apply.length) return [];
  const marks = await q<{ step_id: string; done: boolean }>(
    `select step_id::text as step_id, done from uc_pilot.step_marks where commitment_id = $1`, [c.id]);
  const done = new Set(marks.filter(m => m.done).map(m => m.step_id));
  return apply.map(r => ({ id: r.id, label: r.label, days: r.days ? r.days.map(Number) : null, done: done.has(r.id), from: r.schedule_item_id ? 'routine' : 'entry' }));
}

/** The steps of one weekly item, each with the days it applies on. */
export async function stepsOfWeekly(q: Q, scheduleItemId: string): Promise<Step[]> {
  const rows = await q<Row>(
    `select id, label, days, position, commitment_id, schedule_item_id from uc_pilot.steps
      where state = 'current' and schedule_item_id = $1 order by position`, [scheduleItemId]);
  return rows.map(r => ({ id: r.id, label: r.label, days: r.days ? r.days.map(Number) : null, done: false, from: 'routine' }));
}

/** Counts of steps for many commitments at once, for the calendar and the agent's view. */
export async function stepCounts(q: Q, list: { id: string; on_date: string; schedule_item_id: string | null }[]): Promise<Map<string, { done: number; of: number }>> {
  const out = new Map<string, { done: number; of: number }>();
  if (!list.length) return out;
  const ids = list.map(c => c.id);
  const items = [...new Set(list.map(c => c.schedule_item_id).filter(Boolean))] as string[];
  const rows = await q<Row>(
    `select id, label, days, position, commitment_id::text as commitment_id, schedule_item_id::text as schedule_item_id from uc_pilot.steps
      where state = 'current' and (commitment_id = any ($1::uuid[]) or schedule_item_id = any ($2::uuid[]))`, [ids, items]);
  if (!rows.length) return out;
  const marks = await q<{ step_id: string; commitment_id: string }>(
    `select step_id::text as step_id, commitment_id::text as commitment_id from uc_pilot.step_marks where done and commitment_id = any ($1::uuid[])`, [ids]);
  for (const c of list) {
    const wd = weekdayOf(c.on_date);
    const mine = rows.filter(r => r.commitment_id === c.id || (c.schedule_item_id && r.schedule_item_id === c.schedule_item_id && (!r.days || r.days.map(Number).includes(wd))));
    if (!mine.length) continue;
    const ok = new Set(mine.map(r => r.id));
    out.set(c.id, { of: mine.length, done: marks.filter(m => m.commitment_id === c.id && ok.has(m.step_id)).length });
  }
  return out;
}

/** Marks one step done or not done on one commitment. The history keeps each change. */
export async function markStep(q: Q, commitmentId: string, stepId: string, done: boolean): Promise<{ label: string; changed: boolean }> {
  const c = (await q<{ id: string; on_date: string; schedule_item_id: string | null }>(
    `select id, on_date::text as on_date, schedule_item_id from uc_pilot.commitments where id = $1`, [commitmentId]))[0];
  if (!c) throw new Error('That entry is not on file.');
  const step = (await stepsOn(q, c)).find(s => s.id === stepId);
  if (!step) throw new Error('That step is not part of this entry on this day.');
  if (step.done === done) return { label: step.label, changed: false };
  await q(
    `insert into uc_pilot.step_marks (step_id, commitment_id, done) values ($1, $2, $3)
     on conflict (user_id, step_id, commitment_id) do update set done = excluded.done`, [stepId, commitmentId, done]);
  return { label: step.label, changed: true };
}
