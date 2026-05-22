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

    // gpt-4o supports image_generation tool in the Responses API
    // It can accept multiple input images and generate/edit based on them
    const response = await openai.responses.create({
      model: 'gpt-image-1',
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
          outputItem.result = imgItem.result ? '(base64 image data)' : null;
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
      model: 'gpt-image-1',
    });

  } catch (error: any) {
    console.error('Responses test error:', error);
    return NextResponse.json({
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
