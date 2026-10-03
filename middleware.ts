import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const host = request.nextUrl.hostname;

  // The public site previously linked to this deploy-preview URL.
  // Never leave a visitor on the preview hostname for the public Apply entry.
  if (host === 'deploy-preview-2--universecitystage.netlify.app' && request.nextUrl.pathname === '/join') {
    return NextResponse.redirect('https://ucitysocial.com/join', 307);
  }

  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
