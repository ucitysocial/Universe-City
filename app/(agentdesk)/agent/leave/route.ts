import { NextResponse } from 'next/server';
import { VIEW_COOKIE } from '@/lib/agent/clients';

export const dynamic = 'force-dynamic';

/** Closes the client the agent opened. The Resident Portal shows the agent's own File again. */
export async function GET(req: Request) {
  const to = new URL(req.url).searchParams.get('to') === 'portal' ? '/portal/home' : '/agent';
  const res = NextResponse.redirect(new URL(to, req.url));
  res.cookies.set(VIEW_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return res;
}
