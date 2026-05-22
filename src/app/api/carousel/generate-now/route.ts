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
    .from('vault')
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

// Convert marketing brief into visual scene description for the image API
async function buildScenePrompt(openai: OpenAI, userPrompt: string, industry?: string, topic?: string): Promise<string> {
  // If already a visual description, use as-is
  if (userPrompt.length < 150 && !userPrompt.match(/\d{3}[-.)]\d{3,4}[-.)]\d{4}/)) {
    return userPrompt;
  }

  // Convert marketing brief to visual scene description
  const conversionPrompt = `Convert this request into a brief VISUAL SCENE description for an AI image generator.
RULES:
- Describe ONLY what the image should look like visually (setting, pose, lighting, mood)
- Do NOT mention any person by name - say "a professional" or "the professional"
- Do NOT include phone numbers, emails, or contact info
- Do NOT ask for text overlays or words in the image
- Keep it under 80 words
- End with: "Professional corporate photography style, photorealistic, natural lighting"

REQUEST: ${userPrompt}
${industry ? `INDUSTRY: ${industry}` : ''}
${topic ? `TOPIC: ${topic}` : ''}

VISUAL SCENE:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: conversionPrompt }],
      max_tokens: 120,
      temperature: 0.7,
    });
    const desc = response.choices[0]?.message?.content?.trim();
    if (desc) return desc;
  } catch (err) {
    console.error('Prompt conversion failed:', err);
  }

  return `A professional in a modern business setting. Professional corporate photography style, photorealistic, natural lighting.`;
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { images, prompt, slide_number, total_slides, company_name, industry, topic } = await request.json();

    if (images.length === 0 && !prompt) {
      return NextResponse.json({ error: 'At least one image or prompt required' }, { status: 400 });
    }

    console.log(`Generate Now: slide ${slide_number}/${total_slides}, ${images.length} images`);

    // Convert the user prompt to a visual scene description
    const scenePrompt = await buildScenePrompt(openai, prompt || '', industry, topic);
    console.log(`Scene prompt: "${scenePrompt.substring(0, 100)}"`);

    let imageBuffer: Buffer;

    if (images.length > 0) {
      // MODE 1: images.edit - ALWAYS returns an image, preserves likeness perfectly
      const headshotBuffer = await urlToBuffer(images[0]);
      const headshotFile = await toFile(headshotBuffer, 'headshot.png', { type: 'image/png' });

      // Add variation for multi-slide sets
      const variations = [
        'looking directly at camera with confidence',
        'slightly turned, engaged expression',
        'gesturing while explaining something',
        'reviewing documents or materials',
        'warm, approachable smile',
        'thoughtful expression, hand on chin',
        'pointing at something off-camera',
        'leaning forward, engaged in conversation',
        'standing with arms crossed confidently',
        'casual but professional stance',
      ];
      const variation = total_slides > 1 ? `\n\nPose variation: ${variations[(slide_number - 1) % variations.length]}` : '';

      const editPrompt = `Transform this photo into a professional business scene.

SCENE: ${scenePrompt}${variation}

CRITICAL: Keep the EXACT same person - same face, features, hair, appearance. Only change the setting/scene/background around them. Professional corporate photography, premium quality, excellent lighting, photorealistic.`;

      console.log(`Using images.edit with prompt length: ${editPrompt.length}`);

      const imageResponse = await openai.images.edit({
        model: 'gpt-image-2',
        image: headshotFile,
        prompt: editPrompt,
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
    } else {
      // MODE 2: images.generate - for prompts without reference images
      const generatePrompt = `Professional social media image. ${scenePrompt}. Clean, premium aesthetic, bold and eye-catching. Square format. No text or words in the image - just visuals. Photorealistic or high-quality graphic design style.`;

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

    // Return base64 for immediate display + storage URL for downloads
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
