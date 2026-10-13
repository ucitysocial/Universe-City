// Puts the public website into the app before each build, so one Netlify project serves the site and the
// Resident Portal from one deploy. The site's pages stay in ucitysocial/, where they are edited. This copies them
// into public/, which Next.js serves as they are. The routes in ucitysocial/_redirects live in next.config.mjs.
//   node scripts/site-into-public.mjs
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';

const from = new URL('../ucitysocial/', import.meta.url);
const to = new URL('../public/', import.meta.url);
if (existsSync(to)) rmSync(to, { recursive: true, force: true });
mkdirSync(to, { recursive: true });
let n = 0;
for (const name of readdirSync(from)) {
  if (name === '_redirects' || name === 'netlify.toml' || name.startsWith('.')) continue;
  cpSync(new URL(name, from), new URL(name, to), { recursive: true });
  n++;
}
console.log(`public/ holds the website: ${n} files from ucitysocial/`);
