// Copies the five Time documents into the app bundle as text, so the guide can read them with no file read.
//   node scripts/pilot-docs.mjs
// The five are the governing documents of Folder 01 Time. GitHub holds the copy that governs.
import { readFileSync, writeFileSync } from 'node:fs';
export const TIME_DOCS = [
  ['time', 'Folder 01 Time', 'docs/systems/TIME.md'],
  ['operations', 'Folder 01 Time Operations', 'docs/systems/TIME_OPERATIONS.md'],
  ['developments', 'Folder 01 Time Developments', 'docs/systems/TIME_DEVELOPMENTS.md'],
  ['curriculum', 'Folder 01 Time Curriculum', 'docs/systems/TIME_CURRICULUM.md'],
  ['research', 'Folder 01 Time Research', 'docs/systems/TIME_RESEARCH.md']
];
const docs = TIME_DOCS.map(([key, title, path]) => ({ key, title, path, text: readFileSync(new URL(`../${path}`, import.meta.url), 'utf8') }));
writeFileSync(new URL('../lib/pilot/time-docs.ts', import.meta.url),
  `// Made from the five Time documents in docs/systems by scripts/pilot-docs.mjs. Do not edit by hand.\n` +
  `// A test fails when this text and those files differ. Run npm run pilot:docs after a change to one of them.\n` +
  `export type TimeDoc = { key: string; title: string; path: string; text: string };\n` +
  `export const TIME_DOCS: TimeDoc[] = ${JSON.stringify(docs)};\n`);
console.log('lib/pilot/time-docs.ts written');
