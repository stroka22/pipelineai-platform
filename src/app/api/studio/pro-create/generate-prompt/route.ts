import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { logoImage, headshotImage, slideCount } = await request.json();

    // Analyze logo and generate a detailed prompt
    const imageContent: any[] = [
      {
        type: 'image_url',
        image_url: { url: logoImage, detail: 'high' }
      }
    ];

    if (headshotImage) {
      imageContent.push({
        type: 'image_url',
        image_url: { url: headshotImage, detail: 'low' }
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at creating detailed prompts for AI image generation. Analyze the uploaded logo to extract brand information, then generate a comprehensive prompt for creating a premium ${slideCount}-slide carousel.

Your prompt should be structured like a creative brief that tells the AI exactly what to generate.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this logo and create a DETAILED prompt for generating a ${slideCount}-slide premium carousel.

The prompt should include:

1. BRAND ANALYSIS (from the logo):
   - Company name
   - Brand colors (specific hex codes)
   - Industry/business type
   - Style/aesthetic notes

2. DESIGN DIRECTION:
   - Premium, high-end corporate feel
   - NOT generic AI or Canva-looking
   - Specific visual elements to include
   - Typography direction
   - Background style for each slide

3. SLIDE-BY-SLIDE BREAKDOWN:
   For each of the ${slideCount} slides, specify:
   - Headline text
   - Supporting copy
   - Visual direction for background
   - What elements to include

4. TECHNICAL REQUIREMENTS:
   - 1080x1080 square format
   - Space for headshot overlay
   - Space for logo overlay
   - High contrast for text readability

Make the prompt detailed enough that it could be copy-pasted into ChatGPT or another AI to generate each slide.

Include placeholder text like [PERSON NAME], [PHONE], [EMAIL], [WEBSITE] that the user can fill in with their actual info.`
            },
            ...imageContent
          ]
        }
      ],
      max_tokens: 4000,
    });

    const generatedPrompt = response.choices[0].message.content || '';

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt
    });

  } catch (error: any) {
    console.error('Generate prompt error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
