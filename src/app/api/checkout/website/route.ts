import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    
    const { 
      businessName, 
      contactName, 
      email, 
      phone, 
      previewId,
      previewUrl 
    } = await request.json();

    if (!businessName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create Stripe Checkout Session with website package
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Professional Website Package',
              description: `Custom website for ${businessName} - Includes custom design, mobile responsive, contact forms, SEO optimization, and 30-day delivery`,
            },
            unit_amount: 49700, // $497 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.getpipelineai.com'}/claim/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: previewUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.getpipelineai.com'}/websites`,
      customer_email: email,
      metadata: {
        type: 'website_claim',
        business_name: businessName,
        contact_name: contactName || '',
        phone: phone || '',
        preview_id: previewId || '',
        preview_url: previewUrl || '',
      },
      customer_creation: 'always',
      // Add subscription for hosting after initial payment
      subscription_data: undefined, // We'll handle hosting subscription separately
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Website checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
