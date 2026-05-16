import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const { prompt, size = '1024x1024' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');
    console.log('Size:', size);

    const imageApiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size,
      }),
    });

    const imageResponse = await imageApiResponse.json();

    if (!imageApiResponse.ok) {
      console.error('OpenAI error:', imageResponse.error);
      return NextResponse.json({ 
        error: imageResponse.error?.message || 'Image generation failed',
      }, { status: 400 });
    }

    // Handle both URL and base64 responses
    let imageUrl = imageResponse.data?.[0]?.url;
    
    if (!imageUrl && imageResponse.data?.[0]?.b64_json) {
      imageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate image',
    }, { status: 500 });
  }
}
