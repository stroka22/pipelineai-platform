import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verify cron secret to prevent unauthorized access
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

    // Handle both URL and base64 responses
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
  // If already a Supabase URL, return it
  if (imageUrl.includes('supabase.co/storage')) {
    return imageUrl;
  }

  let imageData: Blob;

  if (imageUrl.startsWith('data:')) {
    // Handle base64
    const base64Content = imageUrl.split(',')[1];
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    imageData = new Blob([byteArray], { type: 'image/png' });
  } else {
    // Fetch from URL
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

// Carousel categories for prompt building
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
  // Verify this is a legitimate cron request
  if (process.env.NODE_ENV === 'production' && !verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    // Get next pending item from queue
    const { data: queueItem, error: fetchError } = await supabase
      .from('carousel_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !queueItem) {
      return NextResponse.json({ message: 'No items in queue' });
    }

    // Mark as processing
    await supabase
      .from('carousel_queue')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString(),
        progress: 0 
      })
      .eq('id', queueItem.id);

    console.log(`Processing queue item: ${queueItem.id} - ${queueItem.title || queueItem.niche}`);

    const generatedImageIds: string[] = [];
    const category = CAROUSEL_CATEGORIES[queueItem.category] || { name: queueItem.category, description: '' };

    // Generate each slide
    for (let i = 0; i < queueItem.slide_count; i++) {
      // Update progress
      await supabase
        .from('carousel_queue')
        .update({ 
          current_slide: i + 1,
          progress: Math.round(((i) / queueItem.slide_count) * 100)
        })
        .eq('id', queueItem.id);

      // Build prompt
      const slidePosition = i === 0 ? 'opening hook slide' : 
                           i === queueItem.slide_count - 1 ? 'closing CTA slide' :
                           `slide ${i + 1} of ${queueItem.slide_count}`;

      let prompt: string;
      
      if (queueItem.open_prompt) {
        // Open prompt mode
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
        // Category mode
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

      // Add reference style if available
      if (queueItem.reference_analysis) {
        prompt = `REFERENCE STYLE TO MATCH:
${queueItem.reference_analysis}

${prompt}

Match the visual style, colors, and aesthetic of the reference image while creating this carousel slide.`;
      }

      // Generate the image
      const imageUrl = await generateImage(prompt);
      
      if (!imageUrl) {
        console.error(`Failed to generate slide ${i + 1}`);
        continue;
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

      if (savedImage) {
        generatedImageIds.push(savedImage.id);
      }

      console.log(`Generated slide ${i + 1}/${queueItem.slide_count}`);
    }

    // Mark as complete
    await supabase
      .from('carousel_queue')
      .update({ 
        status: 'complete',
        progress: 100,
        completed_at: new Date().toISOString(),
        generated_image_ids: generatedImageIds
      })
      .eq('id', queueItem.id);

    console.log(`Completed queue item: ${queueItem.id}`);

    return NextResponse.json({ 
      success: true, 
      processed: queueItem.id,
      slides_generated: generatedImageIds.length
    });

  } catch (error: any) {
    console.error('Queue processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
