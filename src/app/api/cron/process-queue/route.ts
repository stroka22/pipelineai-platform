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
    let { data: queueItem } = await supabase
      .from('carousel_queue')
      .select('*')
      .eq('status', 'processing')
      .order('started_at', { ascending: true })
      .limit(1)
      .single();

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

      // Mark as processing
      await supabase
        .from('carousel_queue')
        .update({ 
          status: 'processing', 
          started_at: new Date().toISOString(),
          current_slide: 0,
          progress: 0 
        })
        .eq('id', queueItem.id);
    }

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
    
    if (queueItem.open_prompt) {
      prompt = `${queueItem.open_prompt}

This is ${slidePosition} in a ${queueItem.slide_count}-slide carousel.

Requirements:
- Create a visually distinct slide that fits this position in the carousel narrative
- Maintain visual consistency with the overall carousel theme
- Optimize for Instagram/social media square format (1:1)
- Include readable, well-positioned text
- Make it premium and professional
${i === 0 ? '- This is the HOOK - make it attention-grabbing and make people want to swipe' : ''}
${i === queueItem.slide_count - 1 ? '- This is the CLOSING - include a compelling call-to-action' : ''}`;
    } else {
      prompt = `Create a premium ${queueItem.style} style carousel slide for a ${queueItem.niche.toLowerCase()} business.

This is ${slidePosition} in a ${queueItem.slide_count}-slide ${category.name} carousel.
${queueItem.business_name ? `Business: "${queueItem.business_name}"` : ''}
Topic: ${queueItem.topic || category.description}

${i === 0 ? 'This is the HOOK slide - it should grab attention and make people want to swipe.' : ''}
${i === queueItem.slide_count - 1 ? 'This is the CLOSING slide - include a strong call-to-action.' : ''}

Color scheme: primary ${queueItem.primary_color}, secondary ${queueItem.secondary_color}.
The slide should be visually distinct from other slides while maintaining brand consistency.
Include readable text that fits the slide position in the carousel narrative.
Optimize for Instagram/social media square format.`;
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
