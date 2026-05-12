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
  
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Fetch all vault items
    const itemIds = items.map((i: any) => i.vaultItemId);
    const { data: vaultItems, error } = await supabase
      .from('vault_items')
      .select('*')
      .in('id', itemIds);

    if (error || !vaultItems) {
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }

    // Build cart with quantities
    const cartItems = items.map((cartItem: any) => {
      const vaultItem = vaultItems.find(v => v.id === cartItem.vaultItemId);
      return {
        vaultItem,
        quantity: cartItem.quantity,
      };
    }).filter((item: any) => item.vaultItem);

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.vaultItem.price || 0) * item.quantity, 0);

    // Calculate buy 2 get 1 free discount for 10-slide carousels
    const carouselItems = cartItems.filter((i: any) => i.vaultItem.slide_count === 10);
    const totalCarousels = carouselItems.reduce((sum: number, i: any) => sum + i.quantity, 0);
    
    let discountAmount = 0;
    let freeItems = 0;
    
    if (totalCarousels >= 3) {
      freeItems = Math.floor(totalCarousels / 3);
      
      // Get all carousel prices sorted ascending
      const carouselPrices: number[] = [];
      carouselItems.forEach((item: any) => {
        for (let i = 0; i < item.quantity; i++) {
          carouselPrices.push(item.vaultItem.price || 0);
        }
      });
      carouselPrices.sort((a, b) => a - b);
      
      // Free items are the cheapest ones
      discountAmount = carouselPrices.slice(0, freeItems).reduce((sum, p) => sum + p, 0);
    }

    const total = subtotal - discountAmount;

    // Build line items for Stripe
    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.vaultItem.title,
          description: `${item.vaultItem.category} - ${item.vaultItem.slide_count || 1} slides`,
        },
        unit_amount: Math.round((item.vaultItem.price || 0) * 100),
      },
      quantity: item.quantity,
    }));

    // Add discount as negative line item if applicable
    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Buy 2 Get 1 Free Discount (${freeItems} free)`,
          },
          unit_amount: -Math.round(discountAmount * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.getpipelineai.com'}/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.getpipelineai.com'}/cart`,
      metadata: {
        vault_item_ids: itemIds.join(','),
        item_quantities: items.map((i: any) => i.quantity).join(','),
        discount_amount: discountAmount.toString(),
        free_items: freeItems.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Cart checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
