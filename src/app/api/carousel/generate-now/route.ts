import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { supabase } from '@/lib/supabase';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function urlToBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    const base64 = url.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64, 'base64');
  }
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToStorage(buffer: Buffer, filename: string): Promise<string | null> {
  const { error } = await supabase.storage
    .from('Vault')
    .upload(`generated/${filename}`, buffer, {
      contentType: 'image/png',
      upsert: true,
    });
  if (error) {
    console.error('Storage upload error:', error);
    return null;
  }
  const { data: urlData } = supabase.storage.from('vault').getPublicUrl(`generated/${filename}`);
  return urlData.publicUrl;
}

// Convert marketing brief into a visual scene description
// Preserves gender but strips names/numbers that trigger safety refusals
async function buildScenePrompt(openai: OpenAI, userPrompt: string, industry?: string, topic?: string): Promise<string> {
  // If already a short visual description, use as-is
  if (userPrompt.length < 100 && !userPrompt.match(/\d{3}[-.)]\d{3,4}[-.)]\d{4}/)) {
    return userPrompt;
  }

  const conversionPrompt = `Convert this marketing request into a specific, detailed VISUAL SCENE description for an AI IMAGE generator. The AI will generate a PHOTOGRAPH based on your description.

RULES:
- Describe the EXACT visual scene to create: specific setting, background, props, colors, atmosphere
- Preserve gender from context clues (she/her -> woman, he/his -> man) but remove names
- Remove phone numbers, emails, contact info
- Remove any request for text overlays or words in the image
- Be SPECIFIC about the scene (e.g., "downtown city street with palm trees and modern buildings" not "professional setting")
- Include mood and style details
- 50-100 words

REQUEST: ${userPrompt}
${industry ? `INDUSTRY: ${industry}` : ''}
${topic ? `TOPIC: ${topic}` : ''}

VISUAL SCENE:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: conversionPrompt }],
      max_tokens: 150,
      temperature: 0.7,
    });
    const desc = response.choices[0]?.message?.content?.trim();
    if (desc) {
      console.log(`Converted: "${userPrompt.substring(0, 60)}..." -> "${desc.substring(0, 80)}..."`);
      return desc;
    }
  } catch (err) {
    console.error('Prompt conversion failed:', err);
  }

  return `A professional woman in a modern business setting, confident pose, natural lighting. Professional corporate photography style, photorealistic.`;
}

async function generateWithResponsesAPI(openai: OpenAI, images: string[], prompt: string): Promise<string | null> {
  const content: any[] = [];

  images.forEach((imgUrl: string) => {
    content.push({
      type: 'input_image',
      image_url: imgUrl,
      detail: 'high',
    });
  });

  content.push({
    type: 'input_text',
    text: prompt,
  });

  const response = await openai.responses.create({
    model: 'gpt-4o',
    input: [
      {
        role: 'system',
        content: 'You are an image generator. You MUST generate an image based on the user request. Never respond with text. Always use the image_generation tool to create a visual output.',
      },
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

  // Extract generated image
  if (response.output) {
    for (const item of response.output) {
      if (item.type === 'image_generation_call') {
        const imgItem = item as any;
        if (imgItem.result) {
          return imgItem.result; // base64
        }
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { images, prompt, slide_number, total_slides, company_name, industry, topic } = await request.json();

    if (images.length === 0 && !prompt) {
      return NextResponse.json({ error: 'At least one image or prompt required' }, { status: 400 });
    }

    console.log(`Generate Now: slide ${slide_number}/${total_slides}, ${images.length} images`);

    // Step 1: Convert the user prompt to a visual scene description
    const scenePrompt = await buildScenePrompt(openai, prompt || '', industry, topic);

    // Step 2: Add variation for multi-slide sets
    let finalPrompt = scenePrompt;
    if (total_slides > 1) {
      const variations = [
        'looking directly at camera with confidence',
        'slightly turned, warm engaged expression',
        'gesturing while explaining something',
        'reviewing documents or materials',
        'warm, approachable smile',
        'thoughtful expression, hand on chin',
        'pointing at something off-camera',
        'leaning forward, engaged in conversation',
        'standing with arms crossed confidently',
        'casual but professional stance',
      ];
      finalPrompt += `\n\nPose variation: ${variations[(slide_number - 1) % variations.length]}`;
    }

    console.log(`Final prompt: "${finalPrompt.substring(0, 120)}"`);

    let imageBuffer: Buffer;

    if (images.length > 0) {
      // MODE: Responses API - produces the best quality images
      // Try with the converted prompt first
      let generatedBase64 = await generateWithResponsesAPI(openai, images, finalPrompt);

      // If API returned text instead of image, retry with a simpler prompt
      if (!generatedBase64) {
        console.log('First attempt returned text. Retrying with simpler prompt...');
        const simplePrompt = `Create a photorealistic professional business photograph. ${images.length} reference images provided for visual context. Professional lighting, high quality, natural composition.`;
        generatedBase64 = await generateWithResponsesAPI(openai, images, simplePrompt);
      }

      // If still no image, fall back to images.edit (lower quality but always works)
      if (!generatedBase64) {
        console.log('Responses API failed twice. Falling back to images.edit...');
        const headshotBuffer = await urlToBuffer(images[0]);
        const headshotFile = await toFile(headshotBuffer, 'headshot.png', { type: 'image/png' });

        const editPrompt = `Transform this photo into a professional business scene. Keep the EXACT same person - same face, features, hair, appearance. Only change the background/setting. Professional corporate photography, premium quality, excellent lighting, photorealistic.`;

        const imageResponse = await openai.images.edit({
          model: 'gpt-image-2',
          image: headshotFile,
          prompt: editPrompt,
          n: 1,
          size: '1024x1024',
        });

        if (imageResponse.data?.[0]?.b64_json) {
          generatedBase64 = imageResponse.data[0].b64_json;
        } else if (imageResponse.data?.[0]?.url) {
          const buf = await urlToBuffer(imageResponse.data[0].url);
          generatedBase64 = buf.toString('base64');
        }
      }

      if (!generatedBase64) {
        return NextResponse.json({ error: 'All generation methods failed. Try a simpler prompt.' }, { status: 500 });
      }

      imageBuffer = Buffer.from(generatedBase64, 'base64');
    } else {
      // MODE: images.generate - no reference images, prompt only
      const generatePrompt = `Professional social media image. ${finalPrompt}. Clean, premium aesthetic, bold and eye-catching. Square format. No text or words - just visuals. Photorealistic or high-quality graphic design style.`;

      const imageResponse = await openai.images.generate({
        model: 'gpt-image-2',
        prompt: generatePrompt,
        n: 1,
        size: '1024x1024',
      });

      if (imageResponse.data?.[0]?.b64_json) {
        imageBuffer = Buffer.from(imageResponse.data[0].b64_json, 'base64');
      } else if (imageResponse.data?.[0]?.url) {
        imageBuffer = await urlToBuffer(imageResponse.data[0].url);
      } else {
        return NextResponse.json({ error: 'Image generation returned no data' }, { status: 500 });
      }
    }

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const safeName = (company_name || 'photoshoot').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${safeName}-${timestamp}-slide-${slide_number}.png`;
    const storageUrl = await uploadToStorage(imageBuffer, filename);

    const imageUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      storageUrl,
    });

  } catch (error: any) {
    console.error('Generate Now error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
