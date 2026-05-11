import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = getSupabase();
    
    const { vault_item_id } = await request.json();

    if (!vault_item_id) {
      return NextResponse.json({ error: 'Missing vault_item_id' }, { status: 400 });
    }

    // Fetch vault item
    const { data: item, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('id', vault_item_id)
      .single();

    if (error || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (!item.price) {
      return NextResponse.json({ error: 'Item has no price set' }, { status: 400 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title,
              description: `${item.content_type === 'carousel' ? `${item.slide_count}-slide carousel` : item.content_type} - ${item.category}`,
              images: item.images?.slice(0, 1) || [],
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/vault/${item.niche}`,
      metadata: {
        vault_item_id: item.id,
        item_title: item.title,
      },
      customer_creation: 'always',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
