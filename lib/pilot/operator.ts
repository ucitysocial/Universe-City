// Who may call the two check routes of the founder test, /api/pilot/health and /api/pilot/selftest.
//
// Two callers are accepted. Neither is a resident, and neither reaches the founder's File.
//   1. A request that carries the test key held in the server's environment, in a header.
//   2. A GitHub Actions run of this repository on the founder test branch. The run proves what it is with a
//      signed token from GitHub. The server checks the signature against GitHub's published keys.
//      No secret is stored in the repository for this.
//
// Both routes answer only on a preview. On a production deploy, and on any deploy that does not name itself
// a preview, both answer Not Found.

import { createPublicKey, timingSafeEqual, verify } from 'node:crypto';
import { deployContext } from './config';

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
  // GitHub's keys are read at most once a minute, however many unknown key ids arrive.
  const known = G.__ucPilotJwks?.keys.some(k => k.kid === header.kid);
  const age = G.__ucPilotJwks ? now - G.__ucPilotJwks.at : Infinity;
  if (age > 10 * 60_000 || (!known && age > 60_000)) {
    const res = await fetch(`${ISSUER}/.well-known/jwks`, { cache: 'no-store' });
    if (!res.ok) return false;
    const body = await res.json();
    G.__ucPilotJwks = { keys: Array.isArray(body?.keys) ? body.keys : [], at: now };
  }
  const jwk = G.__ucPilotJwks?.keys.find(k => k.kid === header.kid);
  if (!jwk) return false;
  const signed = verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
  if (!signed) return false;

  const repo = (process.env.PILOT_OIDC_REPO || 'ucitysocial/universe-city').toLowerCase();
  const ref = process.env.PILOT_OIDC_REF || 'refs/heads/pilot/founder-test';
  const workflow = `${repo}/.github/workflows/pilot-selftest.yml@${ref}`;
  const seconds = Math.floor(now / 1000);
  return claims?.iss === ISSUER
    && claims?.aud === AUDIENCE
    && String(claims?.repository || '').toLowerCase() === repo
    && String(claims?.repository_owner || '').toLowerCase() === repo.split('/')[0]
    && claims?.ref === ref
    && String(claims?.workflow_ref || '').toLowerCase() === workflow.toLowerCase()
    && (claims?.event_name === 'workflow_dispatch' || claims?.event_name === 'push')
    && claims?.runner_environment === 'github-hosted'
    && typeof claims?.exp === 'number' && claims.exp > seconds
    && (typeof claims?.nbf !== 'number' || claims.nbf <= seconds + 60);
}

export async function operatorOk(req: Request): Promise<boolean> {
  // The check routes answer only on a preview or a branch deploy, and on a development server. Every other place is treated as production.
  const where = deployContext();
  const preview = where === 'deploy-preview' || where === 'branch-deploy' || process.env.NODE_ENV === 'development';
  if (!preview || process.env.PILOT_SELFTEST === 'off') return false;
  if (keyOk(req.headers.get('x-pilot-key'))) return true;
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    try { return await githubRun(auth.slice(7).trim()); } catch { return false; }
  }
  return false;
}
