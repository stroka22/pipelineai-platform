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
      text: prompt || 'Generate an image that incorporates all the provided reference images exactly as they appear.',
    });

    // Try with gpt-image-1 model which is specifically for image generation
    // The image_generation tool requires the model to support it
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: content,
        },
      ],
      tools: [
        {
          type: 'image_generation',
          quality: 'high',
          size: '1024x1024',
        },
      ],
    });

    // Extract ALL output items for debugging
    const outputItems = response.output?.map((item: any) => ({
      type: item.type,
      // For messages, include the text content
      content: item.type === 'message' ? item.content?.map((c: any) => ({
        type: c.type,
        text: c.text,
      })) : undefined,
      // For image_generation_call, include the result
      result: item.type === 'image_generation_call' ? item.result : undefined,
    }));

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
      outputItems,
      model: 'gpt-4o',
    });

  } catch (error: any) {
    console.error('Responses test error:', error);
    return NextResponse.json({
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
