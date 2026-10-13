import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** A path on this site. It starts with one slash and holds no space. An address on another site does not match. */
const SAFE_NEXT = /^\/(?![\/\\])[^\s]*$/;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: { name: string; value: string; options?: CookieOptions }[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user && (path.startsWith('/portal') || path.startsWith('/agent'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // A logged in visitor has no use for the login form. Send them where they were going.
  if (user && path === '/login') {
    const next = request.nextUrl.searchParams.get('next');
    const target = new URL(next && SAFE_NEXT.test(next) ? next : '/portal', request.nextUrl.origin);
    const toLogin = target.pathname === '/login';
    const url = request.nextUrl.clone();
    url.pathname = toLogin ? '/portal' : target.pathname;
    url.search = toLogin ? '' : target.search;
    url.hash = toLogin ? '' : target.hash;
    const redirect = NextResponse.redirect(url);
    // Keep a login cookie that was refreshed during this request.
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    redirect.headers.set('cache-control', 'private, no-store');
    return redirect;
  }

  // The Agent Portal checks who may open it in its own layout, against the founder test list. The founder set on
  // October 13, 2026 that it opens for her login. The old check against public.profiles sent every login to /portal.

  return response;
}
