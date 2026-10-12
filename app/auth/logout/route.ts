import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** The addresses this site is served from. The public site proxies to the app, so there is more than one. */
const SITE_URLS = [
  process.env.NEXT_PUBLIC_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_MARKETING_SITE_URL,
  process.env.NEXT_PUBLIC_SITE_URL
];

/** The cookies @supabase/ssr writes for a login: the token, its numbered parts, and the code verifier. */
const LOGIN_COOKIE = /^sb-.+-auth-token(?:-code-verifier)?(?:\.\d+)?$/;

function hostOf(value: string | null | undefined) {
  if (!value) return null;
  try { return new URL(value).host.toLowerCase(); } catch { return null; }
}

/** A log out request is accepted only when the browser sent it from a page of this site. */
function cameFromThisSite(request: NextRequest) {
  const origin = hostOf(request.headers.get('origin'));
  if (!origin) return false;

  const allowed = new Set<string>();
  for (const name of ['host', 'x-forwarded-host']) {
    for (const part of (request.headers.get(name) ?? '').split(',')) {
      const host = part.trim().toLowerCase();
      if (host) allowed.add(host);
    }
  }
  for (const url of SITE_URLS) {
    const host = hostOf(url);
    if (host) allowed.add(host);
  }
  return allowed.has(origin);
}

export async function POST(request: NextRequest) {
  if (!cameFromThisSite(request)) {
    return NextResponse.json(
      { error: 'The request did not come from this site.' },
      { status: 403, headers: { 'cache-control': 'no-store' } }
    );
  }

  // Supabase ends this browser's session on its server. The same call clears the login cookies.
  // The resident's other devices stay logged in.
  let cleared = false;
  try {
    const { error } = await supabaseServer().auth.signOut({ scope: 'local' });
    cleared = !error;
  } catch {
    cleared = false;
  }

  // When that call returns an error, it clears no cookie.
  // The login cookies are removed here, so this browser is logged out in that case too.
  if (!cleared) {
    const store = cookies();
    for (const { name } of store.getAll()) {
      if (LOGIN_COOKIE.test(name)) store.set(name, '', { path: '/', maxAge: 0 });
    }
  }

  const { origin } = new URL(request.url);
  const home = (process.env.NEXT_PUBLIC_PUBLIC_APP_URL || origin).replace(/\/+$/, '');
  const response = NextResponse.redirect(`${home}/`, 303);
  response.headers.set('cache-control', 'no-store');
  return response;
}

/** Log out changes the session, so it is a POST. A link or a prefetch cannot log a resident out. */
export function GET() {
  return NextResponse.json(
    { error: 'This address did not log you out. Use the Log out button.' },
    { status: 405, headers: { allow: 'POST', 'cache-control': 'no-store' } }
  );
}
