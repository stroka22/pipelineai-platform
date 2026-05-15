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

    // Handle cart purchases (multiple items)
    const vaultItemIds = session.metadata?.vault_item_ids?.split(',') || [];
    const itemQuantities = session.metadata?.item_quantities?.split(',').map(Number) || [];
    
    if (vaultItemIds.length > 1) {
      // Cart purchase - create a purchase record for each item
      for (let i = 0; i < vaultItemIds.length; i++) {
        const quantity = itemQuantities[i] || 1;
        for (let q = 0; q < quantity; q++) {
          await supabase.from('purchases').insert({
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            customer_email: customerEmail,
            vault_item_id: vaultItemIds[i],
            amount_paid: (session.amount_total || 0) / 100 / vaultItemIds.length,
            currency: session.currency || 'usd',
            status: 'completed',
          });
        }
      }
    } else {
      // Single item purchase
      const { error } = await supabase.from('purchases').insert({
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
        customer_email: customerEmail,
        vault_item_id: session.metadata?.vault_item_id || vaultItemIds[0],
        amount_paid: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        status: 'completed',
      });

      if (error) {
        console.error('Error recording purchase:', error);
      }
    }

    // Fetch caption for single item purchase
    let caption = '';
    const singleItemId = session.metadata?.vault_item_id;
    if (singleItemId) {
      const { data: vaultItem } = await supabase
        .from('vault_items')
        .select('caption')
        .eq('id', singleItemId)
        .single();
      caption = vaultItem?.caption || '';
    }

    // Send download email to customer
    if (customerEmail) {
      try {
        const captionHtml = caption ? `
                  <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <p style="color: #0369a1; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; font-weight: bold;">Caption for Your Post:</p>
                    <p style="color: #1e3a5f; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${caption}</p>
                  </div>
        ` : '';

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
            <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
              <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <div style="background-color: #081F33; padding: 32px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Pipeline <span style="color: #C96A2B;">AI</span></h1>
                  <p style="color: #9ca3af; margin: 8px 0 0; font-size: 14px;">Premium Social Media Content</p>
                </div>
                
                <div style="padding: 40px;">
                  <div style="background-color: #ecfdf5; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0;">✓ Payment Successful</p>
                  </div>
                  
                  <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Your Purchase</p>
                    <h2 style="color: #081F33; font-size: 22px; font-weight: bold; margin: 0;">${itemTitle}</h2>
                  </div>
                  
                  <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
                    Thank you for your purchase! Your content is ready to download. Click the button below to access your files.
                  </p>
                  
                  ${captionHtml}
                  
                  <a href="${downloadUrl}" style="display: block; background-color: #C96A2B; color: #ffffff; text-decoration: none; padding: 18px 24px; border-radius: 12px; font-weight: bold; font-size: 16px; text-align: center;">
                    Download Your Files
                  </a>
                  
                  <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0; text-align: center;">
                    Save this email to access your download anytime.
                  </p>
                </div>
                
                <!-- Branding Tool Spotlight -->
                <div style="background-color: #7c3aed; padding: 32px; text-align: center;">
                  <p style="color: #e9d5ff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">✨ AI-Powered</p>
                  <h3 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 12px;">Want Your Brand on This Content?</h3>
                  <p style="color: #e9d5ff; font-size: 14px; margin: 0 0 20px; line-height: 1.5;">
                    Use our Branding Tool to add your business name, phone number, and website to any carousel image.
                  </p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.getpipelineai.com'}/brand" style="display: inline-block; background-color: #ffffff; color: #7c3aed; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 14px;">
                    Try Branding Tool - FREE
                  </a>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
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
