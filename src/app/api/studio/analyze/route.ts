import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing images for the purpose of recreating their style.
Analyze the image and describe in detail:
- Visual style (cinematic, minimal, corporate, luxury, etc.)
- Color palette (specific colors and how they're used)
- Composition and layout
- Typography style if any text is present
- Lighting and mood
- Any distinctive design elements
- Overall aesthetic and feel

Be specific and detailed so this description can be used to generate a similar image.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image in detail so I can create similar images matching its style.'
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    const analysis = response.choices[0].message.content;

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to analyze image',
    }, { status: 500 });
  }
}
