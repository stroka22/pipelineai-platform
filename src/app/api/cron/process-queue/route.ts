import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

async function generateImage(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI error:', data.error);
      return null;
    }

    let imageUrl = data.data?.[0]?.url;
    if (!imageUrl && data.data?.[0]?.b64_json) {
      imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
    }

    return imageUrl;
  } catch (error) {
    console.error('Generate image error:', error);
    return null;
  }
}

async function uploadToStorage(imageUrl: string, fileName: string, supabase: ReturnType<typeof getSupabase>): Promise<string> {
  if (imageUrl.includes('supabase.co/storage')) {
    return imageUrl;
  }

  let imageData: Blob;

  if (imageUrl.startsWith('data:')) {
    const base64Content = imageUrl.split(',')[1];
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    imageData = new Blob([byteArray], { type: 'image/png' });
  } else {
    const response = await fetch(imageUrl);
    imageData = await response.blob();
  }

  const path = `carousels/${fileName}`;
  
  const { error } = await supabase.storage
    .from('generated-images')
    .upload(path, imageData, {
      contentType: 'image/png',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('generated-images')
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

const CAROUSEL_CATEGORIES: Record<string, { name: string; description: string }> = {
  'myths': { name: 'Myth Busters', description: 'Debunk common myths in your industry' },
  'tips': { name: 'Pro Tips', description: 'Share expert tips and advice' },
  'mistakes': { name: 'Common Mistakes', description: 'Highlight mistakes to avoid' },
  'benefits': { name: 'Benefits', description: 'Showcase benefits of your service' },
  'process': { name: 'Our Process', description: 'Walk through your service process' },
  'faq': { name: 'FAQ', description: 'Answer frequently asked questions' },
  'seasonal': { name: 'Seasonal', description: 'Seasonal tips and reminders' },
  'diy-vs-pro': { name: 'DIY vs Pro', description: 'Compare DIY vs professional service' },
};

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    // First check for items already processing (continue where we left off)
    // Only get ONE processing item - the oldest one by started_at
    let { data: processingItems } = await supabase
      .from('carousel_queue')
      .select('*')
      .eq('status', 'processing')
      .order('started_at', { ascending: true });

    let queueItem = processingItems?.[0] || null;

    // If there are multiple items stuck in "processing", that's a problem
    // Only work on the oldest one, ignore others until it's done
    if (processingItems && processingItems.length > 1) {
      console.warn(`Warning: ${processingItems.length} items in processing state. Only working on oldest.`);
    }

    // Check if processing item is stuck (started more than 10 minutes ago with no progress)
    if (queueItem) {
      const startedAt = new Date(queueItem.started_at).getTime();
      const now = Date.now();
      const minutesSinceStart = (now - startedAt) / 1000 / 60;
      
      // If started over 10 mins ago and still on same slide, it might be stuck
      if (minutesSinceStart > 10 && queueItem.current_slide === 0 && queueItem.progress === 0) {
        console.warn(`Queue item ${queueItem.id} appears stuck. Resetting...`);
        await supabase
          .from('carousel_queue')
          .update({ 
            status: 'pending',
            started_at: null,
            current_slide: 0,
            progress: 0
          })
          .eq('id', queueItem.id);
        queueItem = null; // Will pick up as pending below
      }
    }

    // If no processing items, get next pending
    if (!queueItem) {
      const { data: pendingItem } = await supabase
        .from('carousel_queue')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!pendingItem) {
        return NextResponse.json({ message: 'No items in queue' });
      }

      queueItem = pendingItem;

      // Mark as processing with a timestamp
      const { error: updateError } = await supabase
        .from('carousel_queue')
        .update({ 
          status: 'processing', 
          started_at: new Date().toISOString(),
          current_slide: 0,
          progress: 0 
        })
        .eq('id', queueItem.id)
        .eq('status', 'pending'); // Only update if still pending (prevents race condition)
      
      if (updateError) {
        console.error('Failed to mark as processing:', updateError);
        return NextResponse.json({ error: 'Failed to acquire queue item' }, { status: 500 });
      }
    }

    // Re-fetch to get latest state and check if item was cancelled or grabbed by another process
    const { data: freshItem } = await supabase
      .from('carousel_queue')
      .select('*')
      .eq('id', queueItem.id)
      .single();
    
    if (!freshItem) {
      return NextResponse.json({ message: 'Queue item no longer exists' });
    }
    
    if (freshItem.status === 'cancelled') {
      return NextResponse.json({ message: 'Item was cancelled' });
    }
    
    if (freshItem.status !== 'processing') {
      return NextResponse.json({ message: 'Item status changed, skipping' });
    }

    // Use fresh data
    queueItem = freshItem;

    // Determine which slide to generate next
    const currentSlide = queueItem.current_slide || 0;
    const existingIds = queueItem.generated_image_ids || [];

    // If we've done all slides, mark complete
    if (currentSlide >= queueItem.slide_count) {
      await supabase
        .from('carousel_queue')
        .update({ 
          status: 'complete',
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq('id', queueItem.id);

      return NextResponse.json({ 
        success: true, 
        message: 'Carousel complete',
        id: queueItem.id,
        slides: existingIds.length
      });
    }

    console.log(`Processing queue ${queueItem.id}: slide ${currentSlide + 1} of ${queueItem.slide_count}`);

    const category = CAROUSEL_CATEGORIES[queueItem.category] || { name: queueItem.category, description: '' };
    const i = currentSlide;

    // Build prompt for this slide
    const slidePosition = i === 0 ? 'opening hook slide' : 
                         i === queueItem.slide_count - 1 ? 'closing CTA slide' :
                         `slide ${i + 1} of ${queueItem.slide_count}`;

    let prompt: string;
    
    // Check if we have pre-generated slide prompts (from AI Create)
    if (queueItem.slide_prompts && Array.isArray(queueItem.slide_prompts) && queueItem.slide_prompts[i]) {
      // Use the pre-generated prompt directly
      prompt = queueItem.slide_prompts[i];
      console.log(`Using pre-generated prompt for slide ${i + 1}`);
    } else if (queueItem.open_prompt) {
      prompt = `${queueItem.open_prompt}

This is ${slidePosition} in a ${queueItem.slide_count}-slide carousel.

CRITICAL REQUIREMENTS:
- Industry/Niche: ${queueItem.niche.toUpperCase()} business content ONLY
- Primary color: ${queueItem.primary_color} (use this as the dominant accent color)
- Secondary color: ${queueItem.secondary_color} (use this as the background or secondary elements)
- Create a visually distinct slide that fits this position in the carousel narrative
- Optimize for Instagram/social media square format (1:1)
- Include readable, well-positioned text
- Make it premium and professional
${i === 0 ? '- This is the HOOK - make it attention-grabbing and make people want to swipe' : ''}
${i === queueItem.slide_count - 1 ? '- This is the CLOSING - include a compelling call-to-action' : ''}

DO NOT create content for any other industry. This MUST be ${queueItem.niche} specific.`;
    } else {
      prompt = `Create a premium ${queueItem.style} style carousel slide for a ${queueItem.niche.toUpperCase()} business.

INDUSTRY: ${queueItem.niche.toUpperCase()} - All visuals and text MUST be specific to this industry.
This is ${slidePosition} in a ${queueItem.slide_count}-slide ${category.name} carousel.
${queueItem.business_name ? `Business Name: "${queueItem.business_name}"` : ''}
Topic: ${queueItem.topic || category.description}

${i === 0 ? 'This is the HOOK slide - it should grab attention and make people want to swipe.' : ''}
${i === queueItem.slide_count - 1 ? 'This is the CLOSING slide - include a strong call-to-action.' : ''}

REQUIRED COLOR SCHEME (must follow exactly):
- Primary/Accent Color: ${queueItem.primary_color}
- Background/Secondary Color: ${queueItem.secondary_color}
Use these exact colors throughout the design.

The slide should be visually distinct from other slides while maintaining brand consistency.
Include readable text that fits the slide position in the carousel narrative.
Optimize for Instagram/social media square format (1:1 aspect ratio).

IMPORTANT: This is for a ${queueItem.niche} business. Do NOT create content for any other industry.`;
    }

    if (queueItem.reference_analysis) {
      prompt = `REFERENCE STYLE TO MATCH:\n${queueItem.reference_analysis}\n\n${prompt}\n\nMatch the visual style, colors, and aesthetic of the reference image.`;
    }

    // Generate the image
    const imageUrl = await generateImage(prompt);
    
    if (!imageUrl) {
      // Mark as failed
      await supabase
        .from('carousel_queue')
        .update({ 
          status: 'failed',
          error_message: `Failed to generate slide ${i + 1}`
        })
        .eq('id', queueItem.id);

      return NextResponse.json({ error: `Failed to generate slide ${i + 1}` }, { status: 500 });
    }

    // Upload to storage
    const fileName = `queue-${queueItem.id}-slide-${i + 1}-${Date.now()}.png`;
    const storageUrl = await uploadToStorage(imageUrl, fileName, supabase);

    // Save to generated_images
    const carouselTitle = queueItem.title || `${queueItem.niche} ${category.name}`;
    const { data: savedImage } = await supabase
      .from('generated_images')
      .insert({
        title: `${carouselTitle} - Slide ${i + 1}`,
        image_url: storageUrl,
        prompt_used: prompt,
        niche: queueItem.niche,
        style: queueItem.style,
        content_type: 'carousel',
      })
      .select()
      .single();

    // Update queue progress
    const newImageIds = [...existingIds];
    if (savedImage) {
      newImageIds.push(savedImage.id);
    }

    const nextSlide = currentSlide + 1;
    const progress = Math.round((nextSlide / queueItem.slide_count) * 100);
    const isComplete = nextSlide >= queueItem.slide_count;

    await supabase
      .from('carousel_queue')
      .update({ 
        current_slide: nextSlide,
        progress,
        generated_image_ids: newImageIds,
        ...(isComplete ? {
          status: 'complete',
          completed_at: new Date().toISOString()
        } : {})
      })
      .eq('id', queueItem.id);

    console.log(`Generated slide ${nextSlide}/${queueItem.slide_count} for queue ${queueItem.id}`);

    return NextResponse.json({ 
      success: true, 
      queueId: queueItem.id,
      slide: nextSlide,
      total: queueItem.slide_count,
      complete: isComplete
    });

  } catch (error: any) {
    console.error('Queue processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
