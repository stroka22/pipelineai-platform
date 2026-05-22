import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
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

// Convert any user prompt into a pure visual scene description
// This prevents safety refusals from mentioning specific people/identities
async function convertToVisualPrompt(openai: OpenAI, userPrompt: string, industry?: string, topic?: string): Promise<string> {
  // If the prompt is already a visual description, use as-is
  const visualKeywords = ['photorealistic', 'photograph', 'scene', 'pose', 'lighting', 'studio', 'portrait', 'setting', 'background', 'composition'];
  const isVisual = visualKeywords.some(k => userPrompt.toLowerCase().includes(k)) && userPrompt.length < 200;
  
  if (isVisual) {
    return userPrompt;
  }

  // Otherwise, convert marketing/content brief into a visual scene description
  const conversionPrompt = `Convert the following request into a brief visual scene description for an AI image generator. 
RULES:
- Describe ONLY what the image should look like visually
- Do NOT mention any specific person by name - use "a professional" or "the professional"
- Do NOT include phone numbers, email addresses, or contact info
- Do NOT ask for text overlays or words in the image
- Focus on: setting, pose, lighting, mood, composition, style
- Keep it under 100 words
- End with: "Photorealistic, professional quality, natural lighting"

REQUEST: ${userPrompt}
${industry ? `INDUSTRY: ${industry}` : ''}
${topic ? `TOPIC: ${topic}` : ''}

VISUAL DESCRIPTION:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: conversionPrompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    const visualDesc = response.choices[0]?.message?.content?.trim();
    if (visualDesc) {
      console.log(`Converted prompt: "${userPrompt.substring(0, 50)}..." -> "${visualDesc.substring(0, 80)}..."`);
      return visualDesc;
    }
  } catch (err) {
    console.error('Prompt conversion failed, using original:', err);
  }

  // Fallback: strip names/numbers and use a generic visual prompt
  return `A professional business photograph in a modern corporate setting. Professional corporate photography style, clean composition, confident atmosphere. Photorealistic, professional quality, natural lighting.`;
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { images, prompt, slide_number, total_slides, company_name, industry, topic, mode } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one image required' }, { status: 400 });
    }

    console.log(`Generate Now: slide ${slide_number}/${total_slides}, ${images.length} images`);

    // Step 1: Convert the user's prompt into a safe visual description
    const visualPrompt = await convertToVisualPrompt(openai, prompt || '', industry, topic);

    // Step 2: Build message content - images + visual prompt
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
      text: visualPrompt,
    });

    console.log(`Sending visual prompt: "${visualPrompt.substring(0, 100)}"`);

    // Step 3: Generate image using Responses API
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

    // Extract generated image
    let generatedImageBase64 = null;
    
    if (response.output) {
      for (const item of response.output) {
        if (item.type === 'image_generation_call') {
          const imgItem = item as any;
          if (imgItem.result) {
            generatedImageBase64 = imgItem.result;
            break;
          }
        }
      }
    }

    if (!generatedImageBase64) {
      const textResponse = response.output
        ?.filter((o: any) => o.type === 'message')
        .flatMap((o: any) => o.content?.map((c: any) => c.text) || [])
        .join(' ')
        .substring(0, 200);
      
      return NextResponse.json({ 
        error: textResponse 
          ? `AI responded with text instead of an image. Try simplifying your prompt.` 
          : 'No image was generated',
      }, { status: 500 });
    }

    // Upload to Supabase Storage
    const imageBuffer = Buffer.from(generatedImageBase64, 'base64');
    const timestamp = Date.now();
    const safeName = (company_name || 'photoshoot').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${safeName}-${timestamp}-slide-${slide_number}.png`;
    const storageUrl = await uploadToStorage(imageBuffer, filename);

    const imageUrl = `data:image/png;base64,${generatedImageBase64}`;

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
