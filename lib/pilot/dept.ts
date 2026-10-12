// The department of an entry in Time. The calendar colors an entry by it.
//
// A commitment and a weekly schedule item sit in Time, and each one also belongs to one folder of the forty
// eight: the folder its activity is about. A work shift belongs to Schedule in Career Development. The guide
// sets that folder when it files the entry, and the resident can tell the guide to move it.
//
// The founder set the colors on October 11, 2026: a work shift is purple, and housing work such as grocery
// shopping, cleaning, and organizing is yellow. Those are the colors of Career Development and Housing Stability.

import { DEPARTMENTS, FOLDERS, type DeptKey } from '../domain/folders';

export type Belongs = {
  folder: string | null;
  dept: DeptKey;
  deptName: string;
  color: string;
  /** file: the folder on the entry. name: read from the name of the entry. time: no folder, so the entry shows as Time. */
  by: 'file' | 'name' | 'time';
};

const TIME_DEPT: DeptKey = 'I';

// An entry filed before entries carried a folder has none. Until the guide sets one, the name of the entry is read
// for the four cases the founder named. Each other entry without a folder shows in the color of Time.
const BY_NAME: [RegExp, string][] = [
  [/\b(shift|work)\b/i, 'Schedule'],
  [/\bgrocer(y|ies)\b/i, 'Inventory'],
  [/\bclean(ing)?\b/i, 'Sanitation'],
  [/\borganiz(e|ing)\b/i, 'Organization']
];

const made = (folder: string | null, dept: DeptKey, by: Belongs['by']): Belongs => {
  const d = DEPARTMENTS.find(x => x.key === dept)!;
  return { folder, dept, deptName: d.name, color: d.color, by };
};

export function belongsTo(folder: string | null | undefined, label: string): Belongs {
  const onFile = folder ? FOLDERS.find(f => f.name === folder) : null;
  if (onFile) return made(onFile.name, onFile.dept, 'file');
  for (const [words, name] of BY_NAME) {
    if (words.test(label)) return made(name, FOLDERS.find(f => f.name === name)!.dept, 'name');
  }
  return made(null, TIME_DEPT, 'time');
}

/** Schedule, in Career Development */
export const sayBelongs = (b: Belongs) => (b.folder ? `${b.folder}, in ${b.deptName}` : b.deptName);
