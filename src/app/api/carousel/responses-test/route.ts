import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 300;

// Increase body size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { images, prompt } = await request.json();

    // images = array of { url: base64DataUrl, label: string }
    // e.g., [{ url: "data:image/...", label: "headshot" }, { url: "...", label: "house" }]

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one image required' }, { status: 400 });
    }

    console.log(`Testing Responses API with ${images.length} images`);

    // Build input content with all images
    const inputContent: any[] = [];
    
    // Add each image
    images.forEach((img: { url: string; label: string }, i: number) => {
      inputContent.push({
        type: 'input_image',
        image_url: img.url,
        detail: 'high',
      });
    });

    // Add the text prompt
    inputContent.push({
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
- The output should look like a real photograph, not a collage`
    });

    // Try using the Responses API with image generation
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: inputContent,
      tools: [{
        type: 'image_generation',
        // Let the model decide how to generate
      }],
    });

    console.log('Responses API response:', JSON.stringify(response, null, 2).substring(0, 1000));

    // Extract generated image if present
    let generatedImage = null;
    if (response.output) {
      for (const item of response.output) {
        if (item.type === 'image_generation_call' && item.result) {
          generatedImage = item.result;
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      response: response,
      generatedImage,
      note: 'Testing Responses API with multiple image inputs for likeness preservation',
    });

  } catch (error: any) {
    console.error('Responses test error:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.toString(),
      code: error.code,
    }, { status: 500 });
  }
}
