import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI, { toFile } from 'openai';

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Default scene variations (used if no custom prompt provided)
const DEFAULT_SCENE_VARIATIONS = [
  'confident professional pose, looking at camera',
  'reviewing documents at desk',
  'in a meeting with a client',
  'presenting to a small group',
  'standing confidently in professional setting',
];

async function urlToBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    const base64 = url.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64, 'base64');
  }
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const openai = getOpenAI();

  try {
    // Get next pending item (or one that's in progress but stuck)
    const { data: queueItem, error: fetchError } = await supabase
      .from('carousel_queue')
      .select('*')
      .or('status.eq.pending,status.eq.processing,status.eq.generating_slides')
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
        started_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    console.log(`Processing carousel queue item: ${queueItem.id}`);

    // Determine mode: headshot (person in scenes) vs prompt-only (graphics)
    const hasHeadshot = !!queueItem.headshot_url;
    const slideCount = queueItem.slide_count || 5;
    const customPrompt = queueItem.scene_prompt || '';

    const slides: any[] = queueItem.slides || [];
    const startSlide = queueItem.current_slide || 0;

    // Process ONE slide per cron run to avoid timeout
    if (startSlide < slideCount) {
      const slideIndex = startSlide;

      await supabase
        .from('carousel_queue')
        .update({ 
          status: 'generating_slides',
          current_slide: slideIndex 
        })
        .eq('id', queueItem.id);

      console.log(`Generating slide ${slideIndex + 1}/${slideCount} (mode: ${hasHeadshot ? 'person' : 'graphics'})`);

      try {
        let imageUrl = '';

        if (hasHeadshot) {
          // MODE 1: Person in scenes - use images.edit
          const headshotBuffer = await urlToBuffer(queueItem.headshot_url);
          const headshotFile = await toFile(headshotBuffer, 'headshot.png', { type: 'image/png' });

          // Add variation for each slide
          const variations = [
            'Variation: looking directly at camera with confidence',
            'Variation: slightly turned, engaged expression',
            'Variation: gesturing while explaining something',
            'Variation: reviewing documents or materials',
            'Variation: warm, approachable smile',
            'Variation: thoughtful expression, hand on chin',
            'Variation: pointing at something off-camera',
            'Variation: leaning forward, engaged in conversation',
            'Variation: standing with arms crossed confidently',
            'Variation: casual but professional stance',
          ];
          const variation = variations[slideIndex % variations.length];
          const sceneDescription = `${customPrompt}\n\n${variation}`;

          const editPrompt = `Transform this photo into a professional business scene.

SCENE INSTRUCTIONS:
${sceneDescription}

INDUSTRY: ${queueItem.industry || 'Business Professional'}
CONTEXT: ${queueItem.topic || 'Professional expertise and authority'}

CRITICAL REQUIREMENTS:
- Keep the EXACT same person - same face, same features, same hair, same beard, same appearance
- Only change the setting/scene/background around them
- Professional corporate photography style
- Premium quality, excellent lighting
- Photorealistic, not illustrated or cartoonish
- The person should look natural in the scene`;

          const imageResponse = await openai.images.edit({
            model: 'gpt-image-2',
            image: headshotFile,
            prompt: editPrompt,
            n: 1,
            size: '1024x1024',
          });

          if (imageResponse.data?.[0]?.b64_json) {
            imageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
          } else if (imageResponse.data?.[0]?.url) {
            imageUrl = imageResponse.data[0].url;
          }

        } else {
          // MODE 2: Graphics only - use images.generate
          const slideVariations = [
            `Slide ${slideIndex + 1} of ${slideCount} - opening/hook image`,
            `Slide ${slideIndex + 1} of ${slideCount} - supporting visual`,
            `Slide ${slideIndex + 1} of ${slideCount} - key point illustration`,
            `Slide ${slideIndex + 1} of ${slideCount} - detailed visual`,
            `Slide ${slideIndex + 1} of ${slideCount} - summary/CTA image`,
          ];
          const slideContext = slideVariations[slideIndex % slideVariations.length];

          const generatePrompt = `Create a professional social media carousel slide image.

CONTENT: ${customPrompt}

SLIDE CONTEXT: ${slideContext}
INDUSTRY: ${queueItem.industry || 'Business'}
TOPIC: ${queueItem.topic || customPrompt}

STYLE REQUIREMENTS:
- Professional, modern design suitable for Instagram/LinkedIn
- Clean, premium aesthetic
- Bold and eye-catching
- Square format (1:1)
- High contrast, readable even at small sizes
- NO text or words in the image - just visuals
- Photorealistic or high-quality graphic design style`;

          const imageResponse = await openai.images.generate({
            model: 'gpt-image-2',
            prompt: generatePrompt,
            n: 1,
            size: '1024x1024',
          });

          if (imageResponse.data?.[0]?.b64_json) {
            imageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
          } else if (imageResponse.data?.[0]?.url) {
            imageUrl = imageResponse.data[0].url;
          }
        }

        // Add slide to results
        slides[slideIndex] = {
          slideNumber: slideIndex + 1,
          mode: hasHeadshot ? 'person' : 'graphics',
          imageUrl,
          generatedAt: new Date().toISOString(),
        };

        // Update progress
        await supabase
          .from('carousel_queue')
          .update({ 
            slides,
            current_slide: slideIndex + 1,
            status: slideIndex + 1 >= slideCount ? 'complete' : 'generating_slides',
            completed_at: slideIndex + 1 >= slideCount ? new Date().toISOString() : null,
          })
          .eq('id', queueItem.id);

        console.log(`Slide ${slideIndex + 1} complete`);

      } catch (slideError: any) {
        console.error(`Error generating slide ${slideIndex + 1}:`, slideError);
        
        // Mark the slide as failed but continue
        slides[slideIndex] = {
          slideNumber: slideIndex + 1,
          imageUrl: null,
          error: slideError.message,
          generatedAt: new Date().toISOString(),
        };

        await supabase
          .from('carousel_queue')
          .update({ 
            slides,
            current_slide: slideIndex + 1,
            status: slideIndex + 1 >= slideCount ? 'complete' : 'generating_slides',
            completed_at: slideIndex + 1 >= slideCount ? new Date().toISOString() : null,
          })
          .eq('id', queueItem.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      itemId: queueItem.id,
      processed: `Slide ${startSlide + 1}/${slideCount}`,
    });

  } catch (error: any) {
    console.error('Carousel queue processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
