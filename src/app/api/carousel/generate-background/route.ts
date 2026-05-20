import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { uploadImageFromUrl } from '@/lib/storage';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { prompt, style, niche, saveToLibrary } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    // Enhance prompt with strict rules
    const enhancedPrompt = `${prompt}

ABSOLUTE REQUIREMENTS:
- Square format 1080x1080
- NO human faces, portraits, or people
- NO text, logos, or words of any kind
- NO generic stock photo aesthetic
- Premium, high-end, sophisticated
- Rich colors and professional lighting
- This is a BACKGROUND for text overlay

STYLE: ${style || 'corporate professional'}`;

    // Generate with gpt-image-2
    const response = await openai.images.generate({
      model: 'gpt-image-2',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
    });

    if (!response.data || response.data.length === 0) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }
    
    const imageData = response.data[0];

    let imageUrl: string;
    
    // Handle base64 or URL response
    if (imageData.b64_json) {
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
    } else if (imageData.url) {
      imageUrl = imageData.url;
    } else {
      return NextResponse.json({ error: 'No image data returned' }, { status: 500 });
    }

    // Optionally save to library
    let savedUrl = imageUrl;
    if (saveToLibrary) {
      try {
        const { url } = await uploadImageFromUrl(
          imageUrl,
          'carousel-backgrounds',
          `bg-${Date.now()}.png`
        );
        savedUrl = url;

        await supabase.from('generated_backgrounds').insert({
          prompt: prompt.substring(0, 1000),
          image_url: savedUrl,
          style: style || 'corporate',
          niche: niche || null,
          colors: [],
          tags: [],
        });
      } catch (e) {
        console.error('Failed to save to library:', e);
        // Continue with original URL
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: savedUrl,
      originalUrl: imageUrl,
    });

  } catch (error: any) {
    console.error('Background generation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate background'
    }, { status: 500 });
  }
}
