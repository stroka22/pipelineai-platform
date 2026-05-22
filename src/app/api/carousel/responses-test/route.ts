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

    // Keep prompt simple and professional to avoid safety refusals
    content.push({
      type: 'input_text',
      text: prompt || 'Generate a professional image incorporating all the provided reference images.',
    });

    // Use gpt-4o with image_generation tool
    // action: "generate" forces image generation instead of text response
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
          action: 'generate',
        },
      ],
    });

    // Extract generated image from output
    let generatedImage = null;
    const outputItems: any[] = [];

    if (response.output) {
      for (const item of response.output) {
        const outputItem: any = { type: item.type };

        if (item.type === 'message') {
          const msgItem = item as any;
          outputItem.content = msgItem.content?.map((c: any) => ({
            type: c.type,
            text: c.text,
          }));
        }

        if (item.type === 'image_generation_call') {
          const imgItem = item as any;
          if (imgItem.result) {
            generatedImage = imgItem.result;
          }
        }

        outputItems.push(outputItem);
      }
    }

    return NextResponse.json({
      success: true,
      generatedImage,
      outputItems,
    });

  } catch (error: any) {
    console.error('Responses test error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
