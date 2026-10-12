import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * The static public pages ask this route whether the visitor is logged in.
 * The answer is one true or false value. It carries no name, no email, and no id.
 * The answer is never stored by a cache, so one visitor never receives another visitor's answer.
 */
function answer(signedIn: boolean) {
  return NextResponse.json(
    { signedIn },
    { headers: { 'cache-control': 'private, no-store', vary: 'cookie' } }
  );
}

export async function GET() {
  try {
    const { data: { user } } = await supabaseServer().auth.getUser();
    return answer(!!user);
  } catch {
    return answer(false);
  }
}
