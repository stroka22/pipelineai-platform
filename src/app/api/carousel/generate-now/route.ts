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
    const { images, prompt, slide_number, total_slides, company_name, industry, topic } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one image required' }, { status: 400 });
    }

    console.log(`Generate Now: slide ${slide_number}/${total_slides} with ${images.length} images`);

    // Build message content - images + text
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
      text: prompt || 'Generate a professional image incorporating all the provided reference images.',
    });

    console.log(`Sending to Responses API: ${content.length} content items, prompt length: ${(prompt || '').length}`);

    // Use gpt-4o with image_generation tool - same approach as test page
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
    console.log('Response output:', JSON.stringify(response.output?.map((o: any) => ({ type: o.type, hasResult: !!(o as any).result }))));
    
    if (response.output) {
      for (const item of response.output) {
        if (item.type === 'image_generation_call') {
          const imgItem = item as any;
          if (imgItem.result) {
            generatedImageBase64 = imgItem.result;
            break;
          }
        }
        // Also check for message content that might contain refusal
        if (item.type === 'message') {
          const msgItem = item as any;
          const textContent = msgItem.content?.find((c: any) => c.type === 'output_text');
          if (textContent) {
            console.log('API returned text instead of image:', textContent.text?.substring(0, 300));
          }
        }
      }
    }

    if (!generatedImageBase64) {
      // Return full output for debugging
      const outputDebug = response.output?.map((o: any) => {
        const debug: any = { type: o.type };
        if (o.type === 'message') {
          debug.text = o.content?.map((c: any) => c.text?.substring(0, 300)).join(' | ');
        }
        if (o.type === 'image_generation_call') {
          debug.hasResult = !!o.result;
        }
        return debug;
      });
      return NextResponse.json({ 
        error: 'No image was generated - API returned text instead', 
        debug: outputDebug,
      }, { status: 500 });
    }

    // Upload to Supabase Storage
    const imageBuffer = Buffer.from(generatedImageBase64, 'base64');
    const timestamp = Date.now();
    const safeName = (company_name || 'photoshoot').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${safeName}-${timestamp}-slide-${slide_number}.png`;
    const storageUrl = await uploadToStorage(imageBuffer, filename);

    // Return base64 for immediate display + storage URL for downloads
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
