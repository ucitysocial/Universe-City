// Runs steps against the founder test preview from a GitHub Actions run, and posts the results on the pull request.
// Each step is one request. A step that is an object sends one message as a made up resident.
//
// STEPS is a JSON list of steps, or an object { mem: true, steps: [...] }.
// With mem, the conversation runs against a database in memory on the preview. That database lives as long as the
// server process. When a step lands on a different process, the whole list is run again from its first step.

const base = process.env.PREVIEW;
const pr = process.env.PULL_REQUEST;
const repo = process.env.GITHUB_REPOSITORY;
const label = process.env.LABEL || 'push';

async function token() {
  const res = await fetch(`${process.env.ACTIONS_ID_TOKEN_REQUEST_URL}&audience=uc-founder-test`, {
    headers: { authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` }
  });
  if (!res.ok) throw new Error(`GitHub issued no token: ${res.status}`);
  return (await res.json()).value;
}

async function get(path) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${base}/api/pilot/${path}`, { headers: { authorization: `Bearer ${await token()}` } });
    const text = await res.text();
    let body; try { body = JSON.parse(text); } catch { body = text.slice(0, 600); }
    return { status: res.status, ms: Date.now() - t0, body };
  } catch (e) {
    return { status: 0, ms: Date.now() - t0, body: String(e?.message || e) };
  }
}

let input;
try { input = JSON.parse(process.env.STEPS || 'null'); } catch { input = null; }
const mem = !!(input && !Array.isArray(input) && input.mem);
const steps = (Array.isArray(input) ? input : input?.steps) || ['health?db=0'];

// After a push, wait until the preview serves this commit.
const sha = process.env.GITHUB_SHA;
let live = null;
for (let i = 0; i < 48; i++) {
  const h = await get('health?db=0');
  live = h.body?.commit ?? null;
  if (h.status === 200 && (live === sha || process.env.GITHUB_EVENT_NAME === 'workflow_dispatch')) break;
  await new Promise(r => setTimeout(r, 10_000));
}

function pathOf(step) {
  if (typeof step === 'string') return step;
  const q = new URLSearchParams();
  q.set('who', step.who === 'b' ? 'b' : 'a');
  if (mem) q.set('mem', '1');
  if (step.fresh) q.set('fresh', '1');
  if (step.say) q.set('say', step.say);
  if (step.rk) q.set('rk', step.rk);
  if (step.file) q.set('file', '1');
  return `selftest?${q.toString()}`;
}

let out = [];
let restarts = 0;
for (let attempt = 0; attempt < 4; attempt++) {
  out = [];
  let instance = null;
  let moved = false;
  for (const step of steps) {
    const r = await get(pathOf(step));
    const here = r.body?.mem_instance ?? null;
    if (mem && here) {
      if (instance && here !== instance) { moved = true; break; }
      instance = here;
    }
    out.push({ step, status: r.status, ms: r.ms, body: r.body });
    console.log(JSON.stringify({ step: typeof step === 'string' ? step : step.say || step, status: r.status, ms: r.ms }));
  }
  if (!moved) break;
  restarts += 1;
  console.log('the server process changed. Running the list again from its first step.');
}

const body = [
  `<!-- founder-test-run -->`,
  `**Founder test checks: ${label}**. Commit on the preview: \`${live}\`. Made up resident only.${mem ? ` Database in memory. Restarts: ${restarts}.` : ''}`,
  '',
  '```json',
  JSON.stringify(out, null, 1).slice(0, 62000),
  '```'
].join('\n');

const post = await fetch(`https://api.github.com/repos/${repo}/issues/${pr}/comments`, {
  method: 'POST',
  headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'content-type': 'application/json' },
  body: JSON.stringify({ body })
});
console.log('comment posted:', post.status);
if (out.some(o => o.status === 0 || o.status >= 500)) process.exitCode = 1;
