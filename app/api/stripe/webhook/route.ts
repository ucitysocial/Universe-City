import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

/** A browser redirect is not proof of payment. This is. */
export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return NextResponse.json({ error: `Signature: ${e.message}` }, { status: 400 });
  }

  // service role, because a webhook has no session to act through
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const setMembership = async (userId: string, status: string, sub?: Stripe.Subscription) => {
    const membership =
      status === 'active' || status === 'trialing' ? 'active' :
      status === 'past_due' || status === 'unpaid' ? 'past_due' : 'canceled';

    await admin.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: typeof sub?.customer === 'string' ? sub.customer : undefined,
      stripe_subscription_id: sub?.id,
      status,
      current_period_end: sub?.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    });

    const patch: Record<string, unknown> = { membership };
    if (membership === 'active') patch.represented_since = new Date().toISOString().slice(0, 10);
    await admin.from('profiles').update(patch).eq('id', userId);
  };

  /* Idempotency. Claim the event, do the work, then mark it done. A handler
     that fails leaves the row as failed so the retry picks it up, rather than
     being marked handled before the business operation succeeded. */
  const { data: seen } = await admin.from('stripe_events')
    .select('status').eq('id', event.id).maybeSingle();

  if (seen?.status === 'processed') return NextResponse.json({ received: true, duplicate: true });

  await admin.from('stripe_events').upsert({
    id: event.id, type: event.type, status: 'processing',
    payload: event.data.object as any, received_at: new Date().toISOString()
  });

  try {
  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.client_reference_id;
      if (userId && s.subscription) {
        const sub = await stripe.subscriptions.retrieve(s.subscription as string);
        await setMembership(userId, sub.status, sub);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user;
      if (userId) await setMembership(userId, sub.status, sub);
      break;
    }
  }
  } catch (e: any) {
    await admin.from('stripe_events')
      .update({ status: 'failed', last_error: String(e?.message ?? e) })
      .eq('id', event.id);
    // a non 2xx tells Stripe to retry
    return NextResponse.json({ error: 'handler failed' }, { status: 500 });
  }

  await admin.from('stripe_events')
    .update({ status: 'processed', processed_at: new Date().toISOString() })
    .eq('id', event.id);

  return NextResponse.json({ received: true });
}
