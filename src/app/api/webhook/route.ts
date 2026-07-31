import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { ensureHostingSubscription, attachInstallmentSchedule } from '@/lib/stripe-billing';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// After the initial checkout is paid, finish the recurring billing setup:
// - installments: convert the $179/mo sub into 3 charges that roll into $47/mo
// - full: start the $47/mo hosting subscription with a 30-day trial
// Errors here must not fail the webhook (payment already succeeded).
async function setupPostPaymentBilling(stripe: Stripe, session: Stripe.Checkout.Session) {
  const plan = session.metadata?.plan === 'installments' ? 'installments' : 'full';
  try {
    if (plan === 'installments') {
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
      if (subscriptionId) {
        await attachInstallmentSchedule(stripe, subscriptionId);
      }
    } else {
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id;
      if (customerId) {
        let paymentMethodId: string | null = null;
        const piId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;
        if (piId) {
          const pi = await stripe.paymentIntents.retrieve(piId);
          paymentMethodId =
            typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id ?? null;
        }
        await ensureHostingSubscription(stripe, {
          customerId,
          paymentMethodId,
          metadata: { source_session: session.id },
        });
      }
    }
  } catch (err) {
    console.error('Post-payment billing setup failed:', err);
  }
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

async function handleWebsiteClaim(session: Stripe.Checkout.Session, resend: Resend) {
  const customerEmail = session.customer_details?.email || '';
  const businessName = session.metadata?.business_name || 'Your Business';
  const contactName = session.metadata?.contact_name || '';
  const phone = session.metadata?.phone || '';
  const previewUrl = session.metadata?.preview_url || '';
  const planLabel =
    session.metadata?.plan === 'installments'
      ? '3-payment plan ($179 x3, then $47/mo)'
      : 'Paid in full ($497, then $47/mo)';
  
  // Notify VPS backend about the claim
  try {
    await fetch('https://sites.getpipelineai.com/api/claim/paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stripeSessionId: session.id,
        stripePaymentIntent: session.payment_intent,
        businessName,
        contactName,
        email: customerEmail,
        phone,
        previewUrl,
        amountPaid: (session.amount_total || 0) / 100,
      }),
    });
  } catch (err) {
    console.error('Error notifying VPS about claim:', err);
  }
  
  // Send confirmation email to customer
  if (customerEmail) {
    try {
      await resend.emails.send({
        from: 'Pipeline AI <noreply@getpipelineai.com>',
        to: customerEmail,
        subject: `Welcome to Pipeline AI! Your Website is Being Built`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <div style="background-color: #059669; padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Pipeline <span style="color: #d1fae5;">AI</span></h1>
                <p style="color: #d1fae5; margin: 8px 0 0; font-size: 14px;">Professional Websites for Local Businesses</p>
              </div>
              
              <div style="padding: 40px;">
                <div style="background-color: #ecfdf5; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                  <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0;">Payment Successful!</p>
                </div>
                
                <h2 style="color: #111827; font-size: 24px; margin: 0 0 16px; text-align: center;">
                  Welcome, ${contactName || 'valued customer'}!
                </h2>
                
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                  Thank you for choosing Pipeline AI! We're excited to build a professional website for <strong>${businessName}</strong>.
                </p>
                
                <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <h3 style="color: #111827; font-size: 16px; margin: 0 0 16px;">What Happens Next:</h3>
                  <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li>Our team will review your preview and begin customization</li>
                    <li>We'll reach out within 24 hours to gather any additional info</li>
                    <li>Your website will be ready within <strong>3 business days</strong></li>
                    <li>We'll send you the live link and login credentials</li>
                  </ol>
                </div>
                
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <p style="color: #92400e; font-size: 14px; margin: 0;">
                    <strong>Launch Bonus:</strong> Your package includes a custom logo and social media profile/cover images, delivered within your first 30 days!
                  </p>
                </div>
                
                ${previewUrl ? `
                <a href="${previewUrl}" style="display: block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 18px 24px; border-radius: 12px; font-weight: bold; font-size: 16px; text-align: center; margin-bottom: 16px;">
                  View Your Preview
                </a>
                ` : ''}
                
                <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
                  Questions? Email <a href="mailto:Support@GetPipelineAI.com" style="color: #059669; font-weight: bold;">Support@GetPipelineAI.com</a> or call/text <a href="tel:1-888-247-7818" style="color: #059669; font-weight: bold;">1-888-247-7818</a>
                </p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  &copy; ${new Date().getFullYear()} Pipeline AI. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Error sending website claim email:', emailError);
    }
  }
  
  // Send notification to Pipeline AI team
  try {
    await resend.emails.send({
      from: 'Pipeline AI <noreply@getpipelineai.com>',
      to: 'brian@getpipelineai.com',
      subject: `New Website Sale! ${businessName}`,
      html: `
        <h2>New Website Claim</h2>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Contact:</strong> ${contactName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Plan:</strong> ${planLabel}</p>
        <p><strong>First payment:</strong> $${(session.amount_total || 0) / 100}</p>
        <p><strong>Preview:</strong> <a href="${previewUrl}">${previewUrl}</a></p>
        <p><strong>Stripe Session:</strong> ${session.id}</p>
      `,
    });
  } catch (err) {
    console.error('Error sending team notification:', err);
  }
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
    
    // Handle website claim purchases
    if (session.metadata?.type === 'website_claim') {
      await handleWebsiteClaim(session, resend);
      await setupPostPaymentBilling(stripe, session);
      return NextResponse.json({ received: true });
    }
    
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
