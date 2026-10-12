// Copies the text of each folder from the four department pages of the public site into the app, so the Resident
// Portal shows each folder the way the site defines it.
//   node scripts/folder-text.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const pages = ['agency-assessment', 'housing-stability', 'career-development', 'life-management'];
const out = {};
for (const p of pages) {
  const html = readFileSync(new URL(`../ucitysocial/${p}.html`, import.meta.url), 'utf8');
  const m = /var systems=(\[.*?\]);/s.exec(html);
  if (!m) throw new Error(`No folder text in ${p}.html`);
  for (const f of JSON.parse(m[1])) out[f.name] = { definition: f.definition, application: f.application, example: f.example };
}
writeFileSync(new URL('../lib/domain/folder-text.ts', import.meta.url),
  `// Made from the four department pages in ucitysocial by scripts/folder-text.mjs. Do not edit by hand.\n` +
  `// The public site holds the governing text of each folder: its definition, how it applies in Universe City, and an example.\n` +
  `export type FolderText = { definition: string; application: string; example: string };\n` +
  `export const FOLDER_TEXT: Record<string, FolderText> = ${JSON.stringify(out, null, 1)};\n`);
console.log(`lib/domain/folder-text.ts written, ${Object.keys(out).length} folders`);
