// Who may call the two check routes of the founder test, /api/pilot/health and /api/pilot/selftest.
//
// Two callers are accepted. Neither is a resident, and neither reaches the founder's File.
//   1. A request that carries the test key held in the server's environment.
//   2. A GitHub Actions run of this repository on the founder test branch. The run proves what it is with a
//      signed token from GitHub. The server checks the signature against GitHub's published keys.
//      No secret is stored in the repository for this.
//
// On a production deploy both routes answer Not Found.

import { createPublicKey, timingSafeEqual, verify } from 'node:crypto';

const ISSUER = 'https://token.actions.githubusercontent.com';
const AUDIENCE = 'uc-founder-test';

const G = globalThis as unknown as { __ucPilotJwks?: { keys: any[]; at: number } };

function keyOk(given: string | null): boolean {
  const want = process.env.PILOT_SELFTEST_KEY || '';
  if (!want || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function githubRun(token: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  let header: any; let claims: any;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch { return false; }
  if (header?.alg !== 'RS256' || !header?.kid) return false;

  const now = Date.now();
  if (!G.__ucPilotJwks || now - G.__ucPilotJwks.at > 10 * 60_000 || !G.__ucPilotJwks.keys.some(k => k.kid === header.kid)) {
    const res = await fetch(`${ISSUER}/.well-known/jwks`, { cache: 'no-store' });
    if (!res.ok) return false;
    const body = await res.json();
    G.__ucPilotJwks = { keys: Array.isArray(body?.keys) ? body.keys : [], at: now };
  }
  const jwk = G.__ucPilotJwks.keys.find(k => k.kid === header.kid);
  if (!jwk) return false;
  const signed = verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
  if (!signed) return false;

  const repo = (process.env.PILOT_OIDC_REPO || 'ucitysocial/universe-city').toLowerCase();
  const ref = process.env.PILOT_OIDC_REF || 'refs/heads/pilot/founder-test';
  const seconds = Math.floor(now / 1000);
  return claims?.iss === ISSUER
    && claims?.aud === AUDIENCE
    && String(claims?.repository || '').toLowerCase() === repo
    && claims?.ref === ref
    && typeof claims?.exp === 'number' && claims.exp > seconds
    && (typeof claims?.nbf !== 'number' || claims.nbf <= seconds + 60);
}

export async function operatorOk(req: Request): Promise<boolean> {
  if (process.env.CONTEXT === 'production' || process.env.PILOT_SELFTEST === 'off') return false;
  const url = new URL(req.url);
  if (keyOk(url.searchParams.get('key') || req.headers.get('x-pilot-key'))) return true;
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    try { return await githubRun(auth.slice(7).trim()); } catch { return false; }
  }
  return false;
}
