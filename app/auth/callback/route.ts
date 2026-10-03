import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/member';
  const publicAppUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? origin;
  if (code) {
    const { error } = await supabaseServer().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${publicAppUrl}${next}`);
  }
  return NextResponse.redirect(`${publicAppUrl}/login?error=link`);
}
