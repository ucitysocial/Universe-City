import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in first' }, { status: 401 });

  const { data } = await sb.from('subscriptions')
    .select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
  if (!data?.stripe_customer_id) return NextResponse.json({ error: 'No customer' }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const site = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL!;
  const portal = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${site}/member/file`
  });
  return NextResponse.json({ url: portal.url });
}
