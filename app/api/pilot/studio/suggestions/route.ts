import { randomUUID } from 'node:crypto';
import { admit } from '@/lib/pilot/auth';
import { canUseAgentStudio } from '@/lib/pilot/agent-studio';
import { withResident } from '@/lib/pilot/db';
import { isDefaultGhost, isMissingKey } from '@/lib/pilot/ghost-catalogue';

export const dynamic = 'force-dynamic';

/** Only a specifically enabled founder reviewer can write suggestion templates. */
export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  if (!canUseAgentStudio({ ok: true, userId: a.userId, access: a.access, email: null })) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }
  let body: any;
  try { body = await req.json(); } catch { return Response.json({ error: 'No valid suggestion was sent.' }, { status: 400 }); }
  if (!body || body.action !== 'save') return Response.json({ error: 'Unknown action.' }, { status: 400 });
  const key = body.key === 'new' ? 'custom-' + randomUUID() : String(body.key ?? '');
  if (!isDefaultGhost(key) && !/^custom-[0-9a-f-]{36}$/i.test(key)) {
    return Response.json({ error: 'The suggestion reference is invalid.' }, { status: 400 });
  }
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  const ask = typeof body.ask === 'string' ? body.ask.trim() : '';
  const at = body.at;
  const whenMissing = body.whenMissing ?? null;
  if (!label || label.length > 100 || !ask || ask.length > 300 ||
      !Number.isInteger(at) || at < -10 || at > 2880 || !isMissingKey(whenMissing) ||
      typeof body.enabled !== 'boolean') {
    return Response.json({ error: 'Check the title, prompt, placement and visibility before saving.' }, { status: 400 });
  }
  try {
    await withResident({ userId: a.userId, actor: 'agent', reason: 'Agent Studio updated a faded calendar suggestion.' }, async q => {
      await q(
        `insert into uc_pilot.ghost_suggestions (key, label, ask, at, when_missing, enabled, changed_by)
         values ($1, $2, $3, $4, $5, $6, 'agent')
         on conflict (user_id, key) do update set
            label = excluded.label, ask = excluded.ask, at = excluded.at,
            when_missing = excluded.when_missing, enabled = excluded.enabled,
            changed_at = now(), changed_by = 'agent'`,
        [key, label, ask, at, whenMissing, body.enabled]
      );
    });
    return Response.json({ ok: true, key }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'The suggestion was not saved. Check that the Agent Studio migration is installed and try again.' }, { status: 503 });
  }
}
