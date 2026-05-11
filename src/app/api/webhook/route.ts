import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const supabase = getSupabase();
  const resend = getResend();
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
    const customerEmail = session.customer_details?.email || '';
    const itemTitle = session.metadata?.item_title || 'Your Purchase';
    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/download?session_id=${session.id}`;

    // Record the purchase
    const { error } = await supabase.from('purchases').insert({
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
      customer_email: customerEmail,
      vault_item_id: session.metadata?.vault_item_id,
      amount_paid: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      status: 'completed',
    });

    if (error) {
      console.error('Error recording purchase:', error);
    }

    // Send download email to customer
    if (customerEmail) {
      try {
        await resend.emails.send({
          from: 'Pipeline AI <noreply@getpipelineai.com>',
          to: customerEmail,
          subject: `Your Download is Ready: ${itemTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #081F33; margin: 0; padding: 40px 20px;">
              <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(180deg, #0a2540 0%, #081F33 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <div style="padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px;">Pipeline <span style="color: #C96A2B;">AI</span></h1>
                  <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 14px;">Premium Social Media Content</p>
                </div>
                
                <div style="padding: 0 40px 40px;">
                  <div style="background: rgba(201,106,43,0.1); border: 1px solid rgba(201,106,43,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <p style="color: #22c55e; font-size: 14px; font-weight: 600; margin: 0 0 8px;">✓ Payment Successful</p>
                    <h2 style="color: #ffffff; font-size: 20px; margin: 0;">${itemTitle}</h2>
                  </div>
                  
                  <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                    Thank you for your purchase! Your content is ready to download. Click the button below to access your files.
                  </p>
                  
                  <a href="${downloadUrl}" style="display: block; background: #C96A2B; color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center;">
                    Download Your Files
                  </a>
                  
                  <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 24px 0 0; text-align: center;">
                    Bookmark this email to access your download anytime.
                  </p>
                </div>
                
                <div style="background: rgba(0,0,0,0.2); padding: 20px 40px; text-align: center;">
                  <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Pipeline AI. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
