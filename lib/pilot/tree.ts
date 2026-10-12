// The rows of the File tree, from the address on screen and the counts the server read.
//
// The tree has one fixed shape: My File, four departments, twelve folders in each. A row is open when the address
// on screen is inside it, so the tree always shows where the resident is and never needs a second map.

import { DEPARTMENTS, FOLDERS } from '../domain/folders';
import type { FileIndex } from './browse';
import { DEPT_SLUG, FILE_ROOT, slugOf } from './paths';

export type TreeRow = {
  href: string; label: string; depth: number; icon: 'folder' | 'folder empty' | 'page' | 'day' | 'wait' | 'said' | 'work' | 'clock';
  color?: string; num?: string; count?: number; on: boolean; open: boolean;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** October 16 */
export const dayLabel = (date: string) => `${MONTHS[Number(date.slice(5, 7)) - 1]} ${Number(date.slice(8, 10))}`;

const count = (ix: FileIndex, folder: string) => {
  const f = ix.folders[folder] || { said: 0, waiting: 0, work: 0 };
  return f.said + f.work + (folder === 'Time' ? ix.time.weekly + ix.time.days.reduce((n, d) => n + d.count, 0) : 0);
};

export function totalEntries(ix: FileIndex): number {
  return [...FOLDERS.map(f => f.name), 'General'].reduce((n, name) => n + count(ix, name), 0);
}

export function treeRows(ix: FileIndex, path: string): TreeRow[] {
  const rows: TreeRow[] = [];
  const inside = (href: string) => path === href || path.startsWith(`${href}/`);
  const add = (r: Omit<TreeRow, 'on' | 'open'>) => rows.push({ ...r, on: path === r.href, open: inside(r.href) });

  add({ href: FILE_ROOT, label: 'My File', depth: 0, icon: 'folder', count: totalEntries(ix) });
  for (const dept of DEPARTMENTS) {
    const dp = `${FILE_ROOT}/${DEPT_SLUG[dept.key]}`;
    const folders = FOLDERS.filter(f => f.dept === dept.key);
    add({ href: dp, label: dept.name, num: dept.key, depth: 1, icon: 'folder', color: dept.color, count: folders.reduce((n, f) => n + count(ix, f.name), 0) });
    if (!inside(dp)) continue;
    for (const f of folders) {
      const fp = `${dp}/${slugOf(f.name)}`;
      const n = count(ix, f.name);
      const here = ix.folders[f.name] || { said: 0, waiting: 0, work: 0 };
      add({ href: fp, label: f.name, num: String(f.num).padStart(2, '0'), depth: 2, icon: n ? 'folder' : 'folder empty', color: dept.color, count: n });
      if (!inside(fp)) continue;
      if (f.name === 'Time') {
        // The days near today, and the day on screen. The folder itself lists every day.
        const near = ix.time.days.filter(d => (d.count > 0 || d.plan) && (d.date >= ix.today || inside(`${fp}/${d.date}`))).slice(0, 14);
        for (const d of near) add({ href: `${fp}/${d.date}`, label: dayLabel(d.date), depth: 3, icon: 'day', color: dept.color, count: d.count });
        add({ href: `${fp}/weekly`, label: 'Weekly schedule', depth: 3, icon: 'clock', color: dept.color, count: ix.time.weekly });
      }
      if (here.said || f.name === 'Time') add({ href: `${fp}/said`, label: 'What you said', depth: 3, icon: 'said', color: dept.color, count: here.said });
      if (here.waiting) add({ href: `${fp}/waiting`, label: 'Waiting', depth: 3, icon: 'wait', color: dept.color, count: here.waiting });
      if (here.work) add({ href: `${fp}/work`, label: 'Ongoing work', depth: 3, icon: 'work', color: dept.color, count: here.work });
      if (f.name === 'Time') {
        if (ix.time.followUps) add({ href: `${fp}/follow-ups`, label: 'Follow ups', depth: 3, icon: 'wait', color: dept.color, count: ix.time.followUps });
        add({ href: `${fp}/unknown`, label: 'Still unknown', depth: 3, icon: 'page', color: dept.color });
        if (ix.time.history) add({ href: `${fp}/history`, label: 'History', depth: 3, icon: 'page', color: dept.color, count: ix.time.history });
      }
    }
  }
  const general = ix.folders.General;
  if (general && (general.said || general.work || general.waiting)) {
    add({ href: `${FILE_ROOT}/general`, label: 'General', depth: 1, icon: 'folder', count: general.said + general.work });
  }
  return rows;
}
