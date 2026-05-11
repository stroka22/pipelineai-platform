import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const supabase = getSupabase();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Record the purchase
    const { error } = await supabase.from('purchases').insert({
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
      customer_email: session.customer_details?.email || '',
      vault_item_id: session.metadata?.vault_item_id,
      amount_paid: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      status: 'completed',
    });

    if (error) {
      console.error('Error recording purchase:', error);
    }

    // Optional: Send email notification here
    // You could integrate with Resend, SendGrid, etc.
  }

  return NextResponse.json({ received: true });
}
