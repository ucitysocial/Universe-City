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
  // A preview keeps the visitor on the preview. The login cookie belongs to the address that received the link.
  const publicAppUrl = process.env.PILOT_CONTEXT === 'deploy-preview' ? origin : (process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? origin);
  const toLogin = (link: 'expired' | 'failed' | 'confirmed') =>
    NextResponse.redirect(`${publicAppUrl}/login?link=${link}&next=${encodeURIComponent(next)}`);

  if (code) {
    const { error } = await supabaseServer().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${publicAppUrl}${next}`);
    // The login service issues a code only after it has accepted the link, and accepting the link is the step that
    // confirms the email. This browser holds no matching request, so no login starts here. The visitor logs in.
    return toLogin('confirmed');
  }
  return toLogin(searchParams.get('error_code') === 'otp_expired' ? 'expired' : 'failed');
}
