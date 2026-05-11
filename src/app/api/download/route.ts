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

export async function GET(request: NextRequest) {
  const stripe = getStripe();
  const supabase = getSupabase();
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'No session ID' }, { status: 400 });
  }

  try {
    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not completed' 
      }, { status: 400 });
    }

    const vaultItemId = session.metadata?.vault_item_id;

    if (!vaultItemId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No item associated with this purchase' 
      }, { status: 400 });
    }

    // Fetch vault item with download files
    const { data: item, error } = await supabase
      .from('vault_items')
      .select('title, category, content_type, download_files')
      .eq('id', vaultItemId)
      .single();

    if (error || !item) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item not found' 
      }, { status: 404 });
    }

    // Record/update purchase if not already recorded (backup for webhook)
    await supabase.from('purchases').upsert({
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
      customer_email: session.customer_details?.email || '',
      vault_item_id: vaultItemId,
      amount_paid: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      status: 'completed',
    }, { onConflict: 'stripe_session_id' });

    // Increment download count (optional - RPC may not exist)
    try {
      await supabase.from('purchases')
        .update({ download_count: 1 })
        .eq('stripe_session_id', sessionId);
    } catch {
      // Ignore if fails
    }

    return NextResponse.json({
      success: true,
      item: {
        title: item.title,
        category: item.category,
        content_type: item.content_type,
        download_files: item.download_files || [],
      },
      customer_email: session.customer_details?.email,
    });
  } catch (err) {
    console.error('Download verification error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify purchase' 
    }, { status: 500 });
  }
}
