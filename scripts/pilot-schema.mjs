// Copies the founder test schema into the app bundle as text, so a database in memory can be built with no file read.
//   node scripts/pilot-schema.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const sql = readFileSync(new URL('../supabase/pilot/0001_founder_test.sql', import.meta.url), 'utf8');
writeFileSync(new URL('../lib/pilot/schema-sql.ts', import.meta.url),
  `// Made from supabase/pilot/0001_founder_test.sql by scripts/pilot-schema.mjs. Do not edit by hand.\n// A test fails when this text and that file differ.\nexport const SCHEMA_SQL = ${JSON.stringify(sql)};\n`);
console.log('lib/pilot/schema-sql.ts written');
