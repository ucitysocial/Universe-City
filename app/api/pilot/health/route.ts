import { randomUUID } from 'node:crypto';
import { deployContext, modelName, pilotEnabled } from '@/lib/pilot/config';
import { getDriver, withResident } from '@/lib/pilot/db';
import { getModel } from '@/lib/pilot/model';
import { PROMPT_VERSION } from '@/lib/pilot/prompt';
import { operatorOk } from '@/lib/pilot/operator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * States whether the parts of the founder test are connected. It returns no secret and no resident data.
 * It answers only a request that carries the test key.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!(await operatorOk(req))) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }
  const out: Record<string, unknown> = {
    enabled: pilotEnabled(),
    prompt_version: PROMPT_VERSION,
    model: modelName(),
    commit: process.env.PILOT_COMMIT || null,
    context: deployContext() || null,
    model_key_present: !!process.env.ANTHROPIC_API_KEY,
    model_address_present: !!process.env.ANTHROPIC_BASE_URL,
    database_address_present: !!process.env.PILOT_DATABASE_URL
  };

  if (url.searchParams.get('db') !== '0') {
    try {
      const d = await getDriver();
      out.database = 'connected';
      const tls = d.tls?.();
      if (tls) {
        out.database_tls_verified = tls.verified;
        // A certificate is public. The authority's certificate is listed so it can be set as the one to trust.
        out.database_certificates = tls.chain.map(c => ({ subject: c.subject, issuer: c.issuer, fingerprint256: c.fingerprint256, ...(url.searchParams.get('pem') === '1' ? { pem_base64: Buffer.from(c.pem).toString('base64') } : {}) }));
      }
      const facts = await d.tx(async q => (await q<any>(
        `select session_user::text as login, current_user::text as acting_as,
                has_schema_privilege(session_user, 'uc_pilot', 'usage') as login_can_use_schema,
                has_table_privilege(session_user, 'uc_pilot.messages', 'select') as login_can_read_messages,
                (select rolbypassrls or rolsuper from pg_roles where rolname = session_user) as login_bypasses_rules`))[0]);
      out.database_login = facts;
      // A resident who is not in the test reads nothing and writes nothing.
      const stranger = randomUUID();
      const seen = await withResident({ userId: stranger, actor: 'resident' }, async q => {
        const rows = await q<any>(
          `select (select count(*)::int from uc_pilot.access) as access_rows,
                  (select count(*)::int from uc_pilot.messages) as message_rows,
                  (select count(*)::int from uc_pilot.statements) as statement_rows`);
        return rows[0];
      });
      let strangerWrite = 'accepted';
      try {
        await withResident({ userId: stranger, actor: 'resident' }, async q => {
          const s = await q<any>(`insert into uc_pilot.sessions default values returning id`);
          return s;
        });
      } catch (e: any) { strangerWrite = `refused: ${String(e?.message || e).slice(0, 120)}`; }
      out.stranger_reads = seen;
      out.stranger_write = strangerWrite;
    } catch (e: any) {
      out.database_error = String(e?.message || e).slice(0, 400);
    }
  }

  const models = (url.searchParams.get('models') || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 4);
  if (models.length) {
    const tried: Record<string, unknown> = {};
    for (const m of models) {
      const before = process.env.PILOT_MODEL;
      process.env.PILOT_MODEL = m;
      const t0 = Date.now();
      try {
        const r = await getModel().create({
          system: [{ type: 'text', text: 'Reply with the single word ready.' }],
          tools: [{ name: 'noop', description: 'Does nothing.', input_schema: { type: 'object', properties: {}, additionalProperties: false } }],
          messages: [{ role: 'user', content: 'Say ready.' }], maxTokens: 16, allowActions: false
        });
        tried[m] = { ok: true, ms: Date.now() - t0, said: r.content.map((b: any) => b.text || '').join('').slice(0, 40), served_by: r.model, usage: r.usage };
      } catch (e: any) {
        tried[m] = { ok: false, ms: Date.now() - t0, error: String(e?.message || e).slice(0, 300), status: e?.status ?? null };
      }
      if (before === undefined) delete process.env.PILOT_MODEL; else process.env.PILOT_MODEL = before;
    }
    out.models = tried;
  }
  return Response.json(out, { headers: { 'cache-control': 'no-store' } });
}
