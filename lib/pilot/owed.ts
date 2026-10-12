// The fixed fields of one entry in Time: Department, Folder, Status, and Pending.
//
// The founder set these fields on October 11, 2026. Each entry on the calendar shows the same four fields, in the
// small window over the calendar and on the page of the entry.
//
// Pending names each folder that still waits for an entry because of this one:
//   Time     the end time, or what happened, once the entry has passed
//   Finance  for a work shift: the pay from the shift. It is checked against the hours once the end time is on file
//   Salary   for a work shift: the hourly pay, and the tips when the job pays tips. It is asked once for each
//            resident, so it stays off the list once a statement is in Salary
// Software reads Pending from the File each time the entry shows. It is never stored.

import type { Belongs } from './dept';

export type Owed = { folder: 'Time' | 'Finance' | 'Salary'; why: string };

export type OwedEntry = {
  on_date: string | null;            // null for an item that repeats each week
  start_min: number | null;
  end_min: number | null;
  execution: string;                 // planned for an entry without an outcome
  actual_end_min: number | null;
  withdrawn: boolean;
};

export type OwedFile = {
  today: string;
  nowMin: number;
  salaryOnFile: boolean;             // a current statement is in Salary
  payOnFile: boolean;                // a current statement in Finance is about this entry
};

export const isWork = (b: Belongs) => b.folder === 'Schedule';

export function owedOn(e: OwedEntry, b: Belongs, f: OwedFile): Owed[] {
  if (e.withdrawn) return [];
  const work = isWork(b);
  const out: Owed[] = [];
  const passed = e.on_date !== null && (e.on_date < f.today || (e.on_date === f.today && e.end_min !== null && e.end_min <= f.nowMin));
  const happened = e.execution === 'executed' || e.execution === 'partly_executed';

  if (e.execution === 'planned') {
    if (passed) out.push({ folder: 'Time', why: work ? 'What time the shift started and ended, for the hours worked.' : 'What happened, and what time it ended.' });
    else if (e.end_min === null) out.push({ folder: 'Time', why: work ? 'The end time of the shift, for the hours worked.' : 'The end time.' });
  } else if (work && happened && e.actual_end_min === null) {
    out.push({ folder: 'Time', why: 'What time the shift ended, for the hours worked.' });
  }

  if (work && e.on_date !== null && e.execution !== 'did_not_happen' && !f.payOnFile) {
    out.push({ folder: 'Finance', why: 'The pay from this shift. It is checked against the hours once the end time is on file.' });
  }
  if (work && !f.salaryOnFile) {
    out.push({ folder: 'Salary', why: 'Your hourly pay, and your tips when the job pays tips.' });
  }
  return out;
}

/** Time, Finance, Salary. None when no folder waits. */
export const sayOwed = (list: Owed[]) => (list.length ? list.map(o => o.folder).join(', ') : 'None');

/** The status of a commitment, in the words the calendar uses. */
export function statusOf(c: { execution: string; withdrawn_at: string | null }): string {
  if (c.withdrawn_at) return 'Taken off';
  if (c.execution === 'executed') return 'Executed';
  if (c.execution === 'partly_executed') return 'Partly executed';
  if (c.execution === 'did_not_happen') return 'Did not happen';
  return 'Planned';
}

/** The folder an entry sits in. An entry without a folder sits in Time. */
export const folderOf = (b: Belongs) => b.folder ?? 'Time';
