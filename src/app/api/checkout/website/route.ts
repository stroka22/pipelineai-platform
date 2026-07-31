import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, getInstallmentPriceId, PRICING, type WebsitePlan } from '@/lib/stripe-billing';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();

    const {
      businessName,
      contactName,
      email,
      phone,
      previewId,
      previewUrl,
      plan: rawPlan,
    } = await request.json();

    if (!businessName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const plan: WebsitePlan = rawPlan === 'installments' ? 'installments' : 'full';

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.getpipelineai.com';
    const successUrl = `${appUrl}/claim/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = previewUrl || `${appUrl}/websites`;

    const metadata: Record<string, string> = {
      type: 'website_claim',
      plan,
      business_name: businessName,
      contact_name: contactName || '',
      phone: phone || '',
      preview_id: previewId || '',
      preview_url: previewUrl || '',
    };

    let params: Stripe.Checkout.SessionCreateParams;

    if (plan === 'installments') {
      const installmentPriceId = await getInstallmentPriceId(stripe);
      params = {
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: installmentPriceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: email,
        metadata,
        subscription_data: {
          metadata: { type: 'installment', plan: 'installments' },
        },
      };
    } else {
      params = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Professional Website Package',
                description: `Custom website for ${businessName} - Includes custom design, mobile responsive, contact forms, SEO optimization, and 30-day delivery`,
              },
              unit_amount: PRICING.websiteSetup,
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: email,
        metadata,
        customer_creation: 'always',
        // Save the card so we can start the $47/mo hosting plan after 30 days.
        payment_intent_data: { setup_future_usage: 'off_session' },
      };
    }

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Website checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
