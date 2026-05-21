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

    // images = array of base64 data URLs
    // prompt = what to generate

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one image required' }, { status: 400 });
    }

    console.log(`Testing multi-reference with ${images.length} images`);

    // Build the message content with all images
    const content: any[] = [
      {
        type: 'text',
        text: `I'm providing ${images.length} reference image(s). Please generate a new image that incorporates elements from ALL of them.

REFERENCE IMAGES PROVIDED:
${images.map((_: string, i: number) => `- Image ${i + 1}`).join('\n')}

GENERATION REQUEST:
${prompt || 'Create a professional image combining these references'}

IMPORTANT: Preserve the exact likeness of any people shown. Preserve the exact appearance of any locations/buildings shown. Combine them naturally into one cohesive image.`
      },
      ...images.map((img: string) => ({
        type: 'image_url',
        image_url: { url: img, detail: 'high' }
      }))
    ];

    // Try using GPT-4o to generate with all images in context
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content
        }
      ],
      max_tokens: 4096,
    });

    const textResponse = response.choices[0].message.content;

    // Check if GPT-4o generated an image or just responded with text
    // If it can generate, there would be an image in the response
    
    // As of my knowledge, GPT-4o in the API doesn't directly output images
    // in the same way ChatGPT does - it would need to use a tool or 
    // the response would need to include image generation
    
    // Let's check what we get back
    console.log('Response:', textResponse?.substring(0, 500));

    return NextResponse.json({
      success: true,
      message: 'Test complete - check response',
      textResponse,
      note: 'If GPT-4o can generate images in chat completions, there would be image data. Otherwise, we need a different approach.',
    });

  } catch (error: any) {
    console.error('Multi-reference test error:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
