// Where each entry sits in the File, as an address on this site.
//
// The File has one fixed shape: My File, four departments, twelve folders in each. An entry sits in one folder.
// The conversation, the File, and the activity list all point at the same address for the same entry.

import { DEPARTMENTS, FOLDERS, type DeptKey, type Folder } from '../domain/folders';
import type { Q } from './db';

export const FILE_ROOT = '/portal/file';

export const slugOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const DEPT_SLUG: Record<DeptKey, string> = Object.fromEntries(DEPARTMENTS.map(d => [d.key, slugOf(d.name)])) as Record<DeptKey, string>;

export const deptBySlug = (s: string) => DEPARTMENTS.find(d => slugOf(d.name) === s) || null;
export const folderBySlug = (dept: DeptKey, s: string): Folder | null => FOLDERS.find(f => f.dept === dept && slugOf(f.name) === s) || null;
export const folderByName = (name: string): Folder | null => FOLDERS.find(f => f.name.toLowerCase() === name.toLowerCase()) || null;

export const deptPath = (dept: DeptKey) => `${FILE_ROOT}/${DEPT_SLUG[dept]}`;

/** /portal/file/agency-assessment/time. A statement that fits no folder sits in General, beside the departments. */
export function folderPath(folderName: string): string {
  const f = folderByName(folderName);
  return f ? `${deptPath(f.dept)}/${slugOf(f.name)}` : `${FILE_ROOT}/general`;
}

export const TIME_PATH = folderPath('Time');

type Target = { target: string | null; target_id: string | null };

/** The address of each entry an action touched. One lookup for each kind of entry. */
export async function hrefsFor(q: Q, list: Target[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const ids = (table: string) => [...new Set(list.filter(t => t.target === table && t.target_id).map(t => t.target_id as string))];
  const arr = (xs: string[]) => `{${xs.join(',')}}`;

  const commitments = ids('commitments');
  if (commitments.length) {
    for (const r of await q<{ id: string; on_date: string }>(`select id, on_date::text as on_date from uc_pilot.commitments where id = any ($1::uuid[])`, [arr(commitments)])) {
      out.set(r.id, `${TIME_PATH}/${r.on_date}/${r.id}`);
    }
  }
  const statements = ids('statements');
  if (statements.length) {
    for (const r of await q<{ id: string; folder: string }>(`select id, folder from uc_pilot.statements where id = any ($1::uuid[])`, [arr(statements)])) {
      out.set(r.id, `${folderPath(r.folder)}/said/${r.id}`);
    }
  }
  for (const id of ids('schedule_items')) out.set(id, `${TIME_PATH}/weekly/${id}`);
  const plans = ids('plans');
  if (plans.length) {
    for (const r of await q<{ id: string; plan_date: string }>(`select id, plan_date::text as plan_date from uc_pilot.plans where id = any ($1::uuid[])`, [arr(plans)])) {
      out.set(r.id, `${TIME_PATH}/${r.plan_date}`);
    }
  }
  const pending = ids('pending');
  if (pending.length) {
    for (const r of await q<{ id: string; folder: string | null }>(
      `select id, coalesce(payload -> 'args' ->> 'folder', payload ->> 'folder') as folder from uc_pilot.pending where id = any ($1::uuid[])`, [arr(pending)])) {
      out.set(r.id, `${r.folder ? folderPath(r.folder) : TIME_PATH}/waiting`);
    }
  }
  for (const id of ids('follow_ups')) out.set(id, `${TIME_PATH}/follow-ups`);
  const work = ids('work');
  if (work.length) {
    for (const r of await q<{ id: string; folder: string }>(`select id, folder from uc_pilot.work where id = any ($1::uuid[])`, [arr(work)])) {
      out.set(r.id, `${folderPath(r.folder)}/work/${r.id}`);
    }
  }
  return out;
}
