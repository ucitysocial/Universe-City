// What an entry is called on screen.
//
// The founder set two rules on October 13, 2026. She shows her portal to other people.
//   1. A medication is named as medication. The name of the medication and its amount show only when the entry is
//      opened. Pick up Wellbutrin at the pharmacy shows as Pick up a prescription.
//   2. What is done inside a routine is a step of the routine. An entry named for a part of the morning routine shows
//      as Morning routine, with the part as one step.
// The entry in the File keeps its own name. Only the name on the calendar and in the day changes.

import { belongsTo } from './dept';

const MED = /\b(take|took|pick ?up|refill|prescriptions?|pharmacy|doses?|pills?|meds?|medications?|medicine)\b/i;
const PICKUP = /\b(pick ?up|refill|prescriptions?|pharmacy)\b/i;

const isMed = (label: string, folder: string | null) => belongsTo(folder, label).folder === 'Health' && MED.test(label);

/** The routine an entry belongs to, when it names a part of one: Morning routine or Night routine. */
export function routineOf(label: string): 'Morning routine' | 'Night routine' | null {
  if (/\bmorning routine\b/i.test(label) && !/^\s*morning routine\s*$/i.test(label)) return 'Morning routine';
  if (/\b(night|evening|bedtime) routine\b/i.test(label) && !/^\s*(night|evening|bedtime) routine\s*$/i.test(label)) return 'Night routine';
  return null;
}

/** The name of a step inside a routine. A medication step is called Medication. */
export function stepName(label: string, folder: string | null): string {
  if (isMed(label, folder)) return 'Medication';
  return label.replace(/\s*\((morning|night|evening|bedtime) routine\)\s*/i, '').replace(/\b(as part of|in) (my |the )?(morning|night|evening|bedtime) routine\b/i, '').trim() || label;
}

/** The name an entry shows on the calendar and in the day. */
export function shownLabel(label: string, folder: string | null): string {
  const r = routineOf(label);
  if (r) return r;
  if (isMed(label, folder)) return PICKUP.test(label) ? 'Pick up a prescription' : 'Take medication';
  return label;
}
