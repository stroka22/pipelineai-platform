import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: List queue items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('carousel_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, items: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add to queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      brand_profile_id,
      company_name,
      person_name,
      title,
      phone,
      email,
      website,
      industry,
      headshot_url,
      logo_url,
      primary_color,
      secondary_color,
      accent_color,
      topic,
      slide_count,
      style,
      priority,
    } = body;

    // Headshot is required for images.edit
    if (!headshot_url) {
      return NextResponse.json({ error: 'Headshot URL is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('carousel_queue')
      .insert({
        brand_profile_id,
        company_name,
        person_name,
        title,
        phone,
        email,
        website,
        industry,
        headshot_url,
        logo_url,
        primary_color: primary_color || '#1e3a5f',
        secondary_color: secondary_color || '#4a7c4e',
        accent_color: accent_color || '#c9a227',
        topic,
        slide_count: slide_count || 5,
        style: style || 'professional',
        priority: priority || 10,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      item: data,
      message: 'Added to queue. Processing will begin shortly.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove from queue
export async function DELETE(request: NextRequest) {
  try {
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
