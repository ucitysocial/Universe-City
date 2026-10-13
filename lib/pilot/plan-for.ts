// Which steps an entry opens with in Guided Life.
//
// A routine opens in every File: the steps the resident filed for it, then the agent's suggestions, faded. The
// founder set this on October 13, 2026. Other entries open with example steps only in the File of a made up resident.
// Steps for a work shift, a class, or an errand are never invented for a real resident.

import { demoPlan, routinePlan, type DemoPlan } from './guided-demo';
import { routineOf, stepName } from './private';

export function routineName(label: string): 'Morning routine' | 'Night routine' | null {
  if (/^\s*morning routine\s*$/i.test(label)) return 'Morning routine';
  if (/^\s*(night|evening|bedtime) routine\s*$/i.test(label)) return 'Night routine';
  return routineOf(label);
}

/** steps: the parts of the routine filed as entries of their own, when the caller already knows them. */
export function planFor(label: string, folder: string | null, synthetic: boolean, steps?: string[]): DemoPlan | null {
  const routine = routineName(label);
  if (routine) {
    const filed = steps ?? (routineOf(label) ? [stepName(label, folder)] : []);
    return routinePlan(routine, filed);
  }
  return synthetic ? demoPlan(label) : null;
}

/** Where the steps of an entry are kept. A routine keeps one set of steps for every day it repeats. */
export function planKeyFor(userId: string, label: string, id: string): string {
  const r = routineName(label);
  return r ? `uc:gl:plan:${userId}:${r.toLowerCase().replace(/ /g, '-')}` : `uc:gl:plan:${userId}:${id}`;
}
