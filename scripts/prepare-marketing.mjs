// Publish the existing canonical static marketing pages alongside the Next.js
// Resident Portal. Do NOT copy ucitysocial/_redirects: its old proxy rules
// forwarded /portal to the former stage site and would split authentication.
import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const source=join(root,'ucitysocial');
const dest=join(root,'public');
if (!existsSync(join(source,'index.html'))) {
  throw new Error('Missing canonical marketing homepage: ucitysocial/index.html');
}
mkdirSync(dest,{recursive:true});
let n=0;
for(const ent of readdirSync(source,{withFileTypes:true})){
  if(!ent.isFile() || ent.name==='_redirects') continue;
  const filename=ent.name==='index.html'?'marketing-home.html':ent.name;
  copyFileSync(join(source,ent.name),join(dest,filename));
  n++;
}
console.log('Copied '+n+' canonical Universe City marketing assets into the Next.js public directory.');