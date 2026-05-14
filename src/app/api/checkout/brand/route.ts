import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();

  try {
    const body = await request.json();
    const { businessName, websiteUrl, phoneNumber, brandColors, carouselImage, logoImage } = body;

    if (!carouselImage || !businessName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a unique ID for this branding request
    const brandingId = `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store the branding data temporarily (we'll retrieve it after payment)
    // In production, you might want to use Redis or a database
    // For now, we'll pass it through Stripe metadata (limited to 500 chars per key)
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Image Branding',
              description: `Brand carousel image for ${businessName}`,
            },
            unit_amount: 50, // $0.50 for testing (change back to 1000 for $10)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.getpipelineai.com'}/brand/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.getpipelineai.com'}/brand`,
      metadata: {
        type: 'branding',
        branding_id: brandingId,
        business_name: businessName,
        website_url: websiteUrl || '',
        phone_number: phoneNumber || '',
        brand_colors: brandColors || '',
      },
    });

    return NextResponse.json({ url: session.url, brandingId });
  } catch (error) {
    console.error('Branding checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
