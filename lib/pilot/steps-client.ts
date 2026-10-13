// The screen's side of steps in the File. Every screen saves and checks steps through the same route, so the entry
// page, the calendar window, Guided Life, and the Agent Portal read the same steps.

import type { DemoPlan, PlanStep } from './guided-demo';

export type EntryRef = { id: string; weekly: boolean };

async function post(body: unknown): Promise<any> {
  const res = await fetch('/api/pilot/steps', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || 'The steps were not saved.');
  return d;
}

export async function saveRemote(entry: EntryRef, date: string, plan: DemoPlan): Promise<DemoPlan> {
  const strip = { ...plan, marks: undefined, subs: undefined };
  return (await post({ op: 'save', entry, date, plan: strip })).plan as DemoPlan;
}

export async function markRemote(entry: EntryRef, date: string, step: string, done: boolean, at?: string): Promise<void> {
  await post({ op: 'mark', entry, date, step, done, at });
}

/** The step with this name in a plan read back from the File. */
export const stepByLabel = (plan: DemoPlan, label: string): PlanStep | undefined =>
  plan.groups.flatMap(g => g.steps).find(x => !x.suggested && x.label === label);

/** Steps kept on this device before the File held steps. They are read once, saved to the File, and cleared. */
export function takeLegacy(key: string | undefined): DemoPlan | null {
  if (!key) return null;
  try {
    const p = JSON.parse(localStorage.getItem(key) || 'null');
    localStorage.removeItem(key);
    return p?.groups ? p : null;
  } catch { return null; }
}

export async function runRemote(entry: EntryRef, date: string, op: 'start' | 'end' | 'begin', extra: { step?: string; outcome?: 'done' | 'not_yet' } = {}): Promise<void> {
  await post({ op, entry, date, ...extra });
}
