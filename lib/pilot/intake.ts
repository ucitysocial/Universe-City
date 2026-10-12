// What the agent still needs for Time.
//
// The founder set on October 12, 2026 that progress shows what the agent tracks: the pieces of a resident's days that
// Time needs before it can plan them, and which of them are on file. Issue 35 names them: sleep and wake times, the work
// schedule, meals, the morning routine, and the night routine. A missing piece shows as one short prompt the resident can
// press. The prompt sends one message to the agent, and the agent asks for that piece one question at a time.
//
// A piece counts as on file when a weekly item or a current statement names it. The work schedule also counts from a
// work shift in the next fourteen days.
// Sleep and wake count only with a clock time, so a goal such as eight hours of sleep leaves them open. The words are read
// as written. Nothing here is filed, and the resident's words are never changed.

import type { Q } from './db';
import { belongsTo } from './dept';
import { isWork } from './owed';
import { addDays } from './time';

export type IntakeItem = { key: string; label: string; done: boolean; ask: string };
export type Intake = { items: IntakeItem[]; done: number; of: number };

type Source = {
  weekly: { label: string; folder: string | null; start_min: number | null }[];
  ahead: { label: string; folder: string | null }[];
  said: { topic: string; entry: string | null; said: string; folder: string }[];
};

const CLOCK = /\b(\d{1,2}(:\d{2})?\s?(am|pm|a\.m\.|p\.m\.)|\d{1,2}:\d{2}|noon|midnight)\b/i;
const SLEEP = /\b(sleep|asleep|bed ?time|go(ing)? to bed|wake|waking|get(ting)? up|alarm)\b/i;
const MEALS = /\b(breakfast|lunch|dinner|supper|meals?|eat|eating)\b/i;
const MORNING = /\bmorning (routine|prep|preparation)|\bmorning\b.*\broutine\b/i;
const NIGHT = /\b(night|evening|bedtime) (routine|prep|preparation)|\b(night|evening)\b.*\broutine\b|\bwind(ing)? down\b/i;

export function intakeOf(src: Source): Intake {
  const weekly = src.weekly.map(w => ({ text: w.label, timed: w.start_min !== null, folder: w.folder }));
  const said = src.said.map(s => `${s.topic}. ${s.entry ?? ''} ${s.said}`);
  // A routine or a meal repeats, so a weekly item or a statement names it. One entry on one day does not.
  const any = (re: RegExp) => weekly.some(w => re.test(w.text)) || said.some(t => re.test(t));
  const sleep = weekly.some(w => SLEEP.test(w.text) && w.timed) || said.some(t => SLEEP.test(t) && CLOCK.test(t));
  const work = weekly.some(w => isWork(belongsTo(w.folder, w.text))) || src.ahead.some(c => isWork(belongsTo(c.folder, c.label))) ||
    src.said.some(s => s.folder === 'Employment' || s.folder === 'Schedule');
  const items: IntakeItem[] = [
    { key: 'sleep', label: 'Sleep and wake times', done: sleep, ask: 'Help me put my sleep and wake times on file.' },
    { key: 'work', label: 'Work schedule', done: work, ask: 'Help me put my work schedule on file.' },
    { key: 'meals', label: 'Meals', done: any(MEALS), ask: 'Help me put my meal times on file.' },
    { key: 'morning', label: 'Morning routine', done: any(MORNING), ask: 'Help me put my morning routine on file.' },
    { key: 'night', label: 'Night routine', done: any(NIGHT), ask: 'Help me put my night routine on file.' }
  ];
  return { items, done: items.filter(i => i.done).length, of: items.length };
}

export async function loadIntake(q: Q, today: string): Promise<Intake> {
  const weekly = await q<Source['weekly'][number]>(
    `select label, folder, start_min from uc_pilot.schedule_items where state = 'current' limit 200`);
  const ahead = await q<Source['ahead'][number]>(
    `select label, folder from uc_pilot.commitments where withdrawn_at is null and on_date between $1::date and $2::date limit 400`, [today, addDays(today, 14)]);
  const said = await q<Source['said'][number]>(
    `select topic, entry, said, folder from uc_pilot.statements where state = 'current' order by created_at desc limit 400`);
  return intakeOf({ weekly, ahead, said });
}

/** The lines the agent reads. */
export function sayIntake(x: Intake): string {
  const open = x.items.filter(i => !i.done).map(i => i.label.toLowerCase());
  return open.length ? `Time still needs: ${open.join(', ')}. ${x.done} of ${x.of} on file.` : `Time holds all ${x.of} pieces: sleep and wake times, work schedule, meals, morning routine, night routine.`;
}
