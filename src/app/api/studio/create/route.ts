import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const { prompt, images, slideCount = 5 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build the messages array for GPT-4o
    const content: any[] = [
      {
        type: 'text',
        text: `You are a creative director for a marketing agency. The user wants to create a ${slideCount}-slide carousel for social media.

USER'S REQUEST:
${prompt}

${images && images.length > 0 ? `The user has attached ${images.length} reference image(s) which may include logos, professional headshots, brand colors, or style references.` : ''}

YOUR TASK:
Analyze the request and any attached images, then create ${slideCount} detailed image generation prompts for each slide of the carousel.

For each slide, create a prompt that:
1. Maintains visual consistency across all slides (same style, colors, fonts)
2. Uses the brand colors and style from any attached logos/images
3. Includes specific text that should appear on each slide (headlines, body text, contact info)
4. Specifies layout, positioning of elements
5. Is optimized for Instagram carousel format (1:1 square)

If a professional headshot is attached, describe how to incorporate a similar-looking professional in the slides (but describe them generically as "a professional business person" since AI cannot recreate exact faces).

If a logo is attached, describe its colors and style to use as brand guidelines.

Respond with a JSON object in this exact format:
{
  "analysis": "Brief analysis of what you understood from the request and images",
  "brandGuidelines": "Colors, fonts, and style notes extracted from the images",
  "slidePrompts": [
    "Detailed prompt for slide 1...",
    "Detailed prompt for slide 2...",
    ...
  ]
}

Make each slide prompt detailed enough to generate a professional, cohesive carousel. Include text content, colors (specific hex if possible), layout descriptions, and visual style.`
      }
    ];

    // Add images if provided
    if (images && images.length > 0) {
      for (const img of images) {
        content.push({
          type: 'image_url',
          image_url: {
            url: img.data,
            detail: 'high'
          }
        });
      }
    }

    // Call GPT-4o to analyze and create prompts
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content
        }
      ],
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const responseContent = response.choices[0].message.content || '{}';
    
    let result;
    try {
      result = JSON.parse(responseContent);
    } catch (e) {
      console.error('Failed to parse response:', responseContent);
      return NextResponse.json({ 
        error: 'Failed to parse AI response',
        raw: responseContent 
      }, { status: 500 });
    }

    if (!result.slidePrompts || !Array.isArray(result.slidePrompts)) {
      return NextResponse.json({ 
        error: 'Invalid response format - missing slidePrompts',
        result 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      brandGuidelines: result.brandGuidelines,
      slidePrompts: result.slidePrompts
    });

  } catch (error: any) {
    console.error('Create API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process request',
      details: error?.error || error?.code
    }, { status: 500 });
  }
}
