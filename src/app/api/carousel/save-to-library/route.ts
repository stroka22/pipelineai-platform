import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { slides } = await request.json();

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 });
    }

    const inserts = slides.map((slide: any) => ({
      image_url: slide.imageUrl,
      prompt: slide.prompt || '',
      niche: slide.niche || 'General',
      category: slide.category || 'tips',
      source: slide.source || 'brand_photoshoot',
      metadata: {
        slide_number: slide.slide_number,
      },
    }));

    const { error } = await supabase.from('generated_images').insert(inserts);

    if (error) throw error;

    return NextResponse.json({ success: true, saved: inserts.length });
  } catch (error: any) {
    console.error('Save to library error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
