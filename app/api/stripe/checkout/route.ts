import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Log in first' }, { status: 401 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const site = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL!;

  const { data: sub } = await sb.from('subscriptions')
    .select('stripe_customer_id').eq('user_id', user.id).maybeSingle();

  let customer = sub?.stripe_customer_id ?? undefined;
  if (!customer) {
    const made = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user: user.id }
    });
    customer = made.id;
    await sb.from('subscriptions').upsert({ user_id: user.id, stripe_customer_id: customer });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price: process.env.STRIPE_PRICE_MEMBERSHIP!, quantity: 1 }],
    success_url: `${site}/member?welcome=1`,
    cancel_url: `${site}/apply`,
    client_reference_id: user.id,
    subscription_data: { metadata: { supabase_user: user.id } }
  });

  return NextResponse.json({ url: session.url });
}
