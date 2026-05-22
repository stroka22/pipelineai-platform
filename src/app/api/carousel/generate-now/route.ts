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

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { images, prompt, slide_number, total_slides, company_name, industry, topic, mode } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one image required' }, { status: 400 });
    }

    console.log(`Generate Now: slide ${slide_number}/${total_slides}, mode: ${mode}, ${images.length} images`);

    // Build message content - images + text
    const content: any[] = [];

    images.forEach((imgUrl: string) => {
      content.push({
        type: 'input_image',
        image_url: imgUrl,
        detail: 'high',
      });
    });

    // CRITICAL: Prefix prompt to force IMAGE generation, not text
    // The API defaults to text responses when the prompt sounds like a content/copy request
    const imagePrompt = `GENERATE AN IMAGE: ${prompt || 'A professional business photograph incorporating the provided reference images.'}`;

    content.push({
      type: 'input_text',
      text: imagePrompt,
    });

    // Use gpt-4o with image_generation tool
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
          ? `AI responded with text instead of an image: "${textResponse}"` 
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
