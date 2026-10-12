import { getModel, type ModelRequest } from '@/lib/pilot/model';
import { operatorOk } from '@/lib/pilot/operator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Passes one request to the language model and returns its answer.
 *
 * It exists so the test run in GitHub Actions can use the same model the preview uses, with a made up resident and
 * a database in memory on the runner. It answers only that run, on a preview. It reads no database and holds no
 * resident's File.
 */
export async function POST(req: Request) {
  if (!(await operatorOk(req))) return Response.json({ error: 'Not found.' }, { status: 404 });
  let body: any = null;
  try { body = await req.json(); } catch { /* no body */ }
  if (!body || !Array.isArray(body.system) || !Array.isArray(body.tools) || !Array.isArray(body.messages)) {
    return Response.json({ error: 'The request is not a model request.' }, { status: 400 });
  }
  if (JSON.stringify(body).length > 300_000) return Response.json({ error: 'The request is too large.' }, { status: 413 });
  const request: ModelRequest = {
    system: body.system, tools: body.tools, messages: body.messages,
    maxTokens: Math.min(Math.max(parseInt(body.maxTokens, 10) || 900, 16), 1200),
    allowActions: body.allowActions !== false
  };
  // A run can name the model to ask. The name is checked for shape, and the gateway refuses a model it does not list.
  const asked = new URL(req.url).searchParams.get('model') || '';
  const before = process.env.PILOT_MODEL;
  if (/^claude-[a-z0-9-]{3,40}$/.test(asked)) process.env.PILOT_MODEL = asked;
  try {
    return Response.json(await getModel().create(request), { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return Response.json({ error: String(e?.message || e).slice(0, 400), status: e?.status ?? null }, { status: 502 });
  } finally {
    if (before === undefined) delete process.env.PILOT_MODEL; else process.env.PILOT_MODEL = before;
  }
}
