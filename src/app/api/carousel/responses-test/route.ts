import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 300;

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { images, prompt } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one image required' }, { status: 400 });
    }

    console.log(`Testing Responses API with ${images.length} images`);

    // Build message content - images + text inside a user message
    const content: any[] = [];

    // Add each image as input_image inside the message content
    images.forEach((img: { url: string; label: string }) => {
      content.push({
        type: 'input_image',
        image_url: img.url,
        detail: 'high',
      });
    });

    // Add the text prompt
    content.push({
      type: 'input_text',
      text: `I'm providing ${images.length} reference image(s):
${images.map((img: { label: string }, i: number) => `- Image ${i + 1}: ${img.label}`).join('\n')}

TASK: Generate a NEW image that combines these references:
${prompt || 'Create a professional image that incorporates all the reference images exactly as they appear.'}

CRITICAL REQUIREMENTS:
- If there's a person/headshot, their EXACT face and features must appear in the generated image
- If there's a logo, that EXACT logo must appear in the generated image
- If there's a location/building, that EXACT location must appear in the generated image
- Combine them naturally into one cohesive, professional image
- The output should look like a real photograph, not a collage`,
    });

    // Use Responses API with image_generation tool
    // Input must be a message array with proper role structure
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: content,
        },
      ],
      tools: [
        {
          type: 'image_generation',
        },
      ],
    });

    console.log('Responses API response:', JSON.stringify(response, null, 2).substring(0, 2000));

    // Extract generated image from output
    let generatedImage = null;
    if (response.output) {
      for (const item of response.output) {
        if (item.type === 'image_generation_call') {
          const imgItem = item as any;
          if (imgItem.result) {
            generatedImage = imgItem.result;
            break;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      generatedImage,
      outputTypes: response.output?.map((o: any) => o.type),
    });

  } catch (error: any) {
    console.error('Responses test error:', error);
    return NextResponse.json({
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
