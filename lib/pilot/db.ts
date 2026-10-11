// The one way the founder test reaches its database.
//
// The server logs in as a role that holds no privilege of its own. Each unit of work is one
// transaction. Inside it the server becomes uc_pilot_resident and states which resident it is
// working for. Row level security then limits every statement to that resident's rows, so a
// mistake in this code cannot read or write another resident's File.

export type Actor = 'resident' | 'software' | 'agent';

export type Ctx = {
  userId: string;
  actor: Actor;
  messageId?: string | null;
  turnId?: string | null;
  reason?: string | null;
};

export type Q = <T = Record<string, any>>(text: string, params?: unknown[]) => Promise<T[]>;

/** A driver runs a function inside one transaction and hands it a query function. */
export interface Driver {
  tx<T>(fn: (q: Q) => Promise<T>): Promise<T>;
  describe(): string;
  /** How the connection to the database is protected, and the certificates the database presented. */
  tls?(): { verified: boolean; chain: { subject: string; issuer: string; fingerprint256: string; pem: string }[] };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: unknown): s is string => typeof s === 'string' && UUID.test(s);

// Kept on the global object so one process holds one connection pool, however the module is loaded.
const G = globalThis as unknown as { __ucPilotDb?: { driver: Driver | null; promise: Promise<Driver> | null } };
const state = (G.__ucPilotDb ||= { driver: null, promise: null });

/** Tests and local work supply their own database. */
export function useDriver(d: Driver | null) {
  state.driver = d;
  state.promise = null;
}

/** The certificate of the authority that signs the database's certificate. A PEM text, or the same text in base64. */
function readCa(): string | null {
  const raw = (process.env.PILOT_DATABASE_CA || '').trim();
  if (!raw) return null;
  if (raw.includes('BEGIN CERTIFICATE')) return raw.replace(/\\n/g, '\n');
  try {
    const text = Buffer.from(raw, 'base64').toString('utf8');
    return text.includes('BEGIN CERTIFICATE') ? text : null;
  } catch { return null; }
}

async function pgDriver(): Promise<Driver> {
  const urls = (process.env.PILOT_DATABASE_URL || '').split(/[\s,]+/).filter(Boolean);
  if (urls.length === 0) throw new Error('The founder test database is not configured.');
  const { Pool } = await import('pg');
  const errors: string[] = [];
  for (const url of urls) {
    // The pooler presents a certificate from the database host's own authority. When that authority's
    // certificate is set in PILOT_DATABASE_CA, the connection is refused unless the database proves it holds one
    // that the authority signed. Until it is set, the connection is encrypted and the database is not verified.
    const ca = readCa();
    const pool = new Pool({
      connectionString: url,
      ssl: ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 6_000,
      allowExitOnIdle: true
    });
    pool.on('error', () => { /* an idle connection closed. The next request opens a new one. */ });
    try {
      const c = await pool.connect();
      let chain: { subject: string; issuer: string; fingerprint256: string; pem: string }[] = [];
      try {
        await c.query('select 1');
        try {
          let cert = (c as any).connection?.stream?.getPeerCertificate?.(true);
          const seen = new Set<string>();
          while (cert && cert.raw && !seen.has(cert.fingerprint256)) {
            seen.add(cert.fingerprint256);
            const b64 = Buffer.from(cert.raw).toString('base64').replace(/(.{64})/g, '$1\n').trim();
            chain.push({
              subject: String(cert.subject?.CN || ''), issuer: String(cert.issuer?.CN || ''), fingerprint256: cert.fingerprint256,
              pem: `-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----`
            });
            cert = cert.issuerCertificate;
          }
        } catch { chain = []; }
      } finally { c.release(); }
      const host = (() => { try { return new URL(url).host; } catch { return 'database'; } })();
      return {
        describe: () => `postgres at ${host}`,
        tls: () => ({ verified: !!ca, chain }),
        async tx<T>(fn: (q: Q) => Promise<T>): Promise<T> {
          const client = await pool.connect();
          try {
            await client.query('begin');
            const q: Q = async (text, params) => (await client.query(text, params as any[])).rows as any[];
            const out = await fn(q);
            await client.query('commit');
            return out;
          } catch (e) {
            try { await client.query('rollback'); } catch { /* the connection is already gone */ }
            throw e;
          } finally {
            client.release();
          }
        }
      };
    } catch (e: any) {
      errors.push(`${(() => { try { return new URL(url).host; } catch { return 'database'; } })()}: ${e?.message || e}`);
      try { await pool.end(); } catch { /* nothing to close */ }
    }
  }
  throw new Error(`The founder test database did not accept a connection. ${errors.join(' | ')}`);
}

export async function getDriver(): Promise<Driver> {
  if (state.driver) return state.driver;
  if (!state.promise) {
    state.promise = pgDriver().then(d => { state.driver = d; return d; }).catch(e => { state.promise = null; throw e; });
  }
  return state.promise;
}

/** One transaction, limited to one resident. */
export async function withResident<T>(ctx: Ctx, fn: (q: Q) => Promise<T>): Promise<T> {
  if (!isUuid(ctx.userId)) throw new Error('No resident is set.');
  if (ctx.messageId && !isUuid(ctx.messageId)) throw new Error('The message reference is not valid.');
  if (ctx.turnId && !isUuid(ctx.turnId)) throw new Error('The reply reference is not valid.');
  const d = await getDriver();
  return d.tx(async q => {
    await q('set local role uc_pilot_resident');
    await q(
      `select set_config('uc.user_id', $1, true), set_config('uc.actor', $2, true),
              set_config('uc.message_id', $3, true), set_config('uc.turn_id', $4, true),
              set_config('uc.reason', $5, true)`,
      [ctx.userId, ctx.actor, ctx.messageId || '', ctx.turnId || '', ctx.reason || '']
    );
    return fn(q);
  });
}

/** Timestamps and dates leave the database as text, so both drivers return the same thing. */
export const TS = (col: string) => `to_char(${col} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;
