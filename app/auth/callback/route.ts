import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // The page to open after the link is a path on this site. A full address is replaced with the Resident Portal.
  const asked = searchParams.get('next') ?? '';
  const next = /^\/(?![\/\\])[^\s]*$/.test(asked) ? asked : '/portal';
  // A preview keeps the visitor on the preview. The login cookie belongs to the address that received the link.
  const publicAppUrl = process.env.PILOT_CONTEXT === 'deploy-preview' ? origin : (process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? origin);
  if (code) {
    const { error } = await supabaseServer().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${publicAppUrl}${next}`);
  }
  return NextResponse.redirect(`${publicAppUrl}/login?error=link`);
}
