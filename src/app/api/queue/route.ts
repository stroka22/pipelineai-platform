import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Add item to queue
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('carousel_queue')
      .insert({
        title: body.title,
        niche: body.niche,
        category: body.category,
        style: body.style || 'modern',
        slide_count: body.slideCount || 8,
        topic: body.topic,
        business_name: body.businessName,
        primary_color: body.primaryColor || '#C96A2B',
        secondary_color: body.secondaryColor || '#081F33',
        reference_image_url: body.referenceImageUrl,
        reference_analysis: body.referenceAnalysis,
        open_prompt: body.openPrompt,
        priority: body.priority || 10,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, queueItem: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get queue status
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('carousel_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Get counts by status
    const pending = data?.filter(i => i.status === 'pending').length || 0;
    const processing = data?.filter(i => i.status === 'processing').length || 0;
    const complete = data?.filter(i => i.status === 'complete').length || 0;
    const failed = data?.filter(i => i.status === 'failed').length || 0;

    return NextResponse.json({ 
      items: data,
      stats: { pending, processing, complete, failed }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete queue item
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('carousel_queue')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Cancel queue item
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    if (action === 'cancel') {
      const { error } = await supabase
        .from('carousel_queue')
        .update({ 
          status: 'cancelled',
          error_message: 'Cancelled by user'
        })
        .eq('id', id);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
