import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Local work on the founder test runs with no hosted login service. A production build never takes this branch.
  if (process.env.NODE_ENV === 'development' && process.env.PILOT_LOCAL === '1') return NextResponse.next();

  if (request.nextUrl.pathname === '/join') {
    const url = request.nextUrl.clone();
    url.pathname = '/apply';
    return NextResponse.redirect(url, 301);
  }

  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
