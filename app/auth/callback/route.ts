import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// Where an emailed link lands: a confirmation link, or a link for a new password.
//
// A good link opened in the browser that asked for it starts a login and opens the page named in `next`.
// Every other case opens Log in with one plain sentence that states what happened.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // The page to open after the link is a path on this site. A full address is replaced with the Resident Portal.
  const asked = searchParams.get('next') ?? '';
  const next = /^\/(?![\/\\])[^\s]*$/.test(asked) ? asked : '/portal';
  // A preview keeps the visitor on the address the visitor typed. The login cookie belongs to that address.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const here = host ? `https://${host}` : origin;
  const publicAppUrl = process.env.PILOT_CONTEXT === 'deploy-preview' ? here : (process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? origin);
  const toLogin = (link: 'expired' | 'failed' | 'opened') =>
    NextResponse.redirect(`${publicAppUrl}/login?link=${link}&next=${encodeURIComponent(next)}`);

  if (code) {
    const { error } = await supabaseServer().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${publicAppUrl}${next}`);
    // This browser holds no request that matches the code, so no login starts here. The usual cause is a link opened
    // in a different browser from the one that asked for it. When the login service accepted the link, the email is
    // confirmed already, and the visitor logs in. The page states only what this server knows.
    return toLogin('opened');
  }
  return toLogin(searchParams.get('error_code') === 'otp_expired' ? 'expired' : 'failed');
}
