import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { 
      headshotBase64, 
      name, 
      company, 
      industry, 
      goal 
    } = await request.json();

    if (!headshotBase64) {
      return NextResponse.json({ error: 'Headshot image required' }, { status: 400 });
    }

    // Step 1: Ask GPT-4o to analyze the headshot - simple and fast
    console.log('Step 1: Analyzing headshot...');
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Describe this person's appearance in precise detail for AI image generation. Include:
- Gender, approximate age
- Face shape, skin tone
- Hair color, style, length
- Facial hair if any
- Eye color if visible
- Any distinguishing features
- What they're wearing (if visible)

Be specific and detailed. This will be used to generate images of this exact person in different scenes.`
            },
            {
              type: 'image_url',
              image_url: { url: headshotBase64, detail: 'high' }
            }
          ]
        }
      ],
      max_tokens: 400,
    });

    const personDescription = analysisResponse.choices[0].message.content || '';
    console.log('Person description complete');

    // Step 2: Generate ONE scene - keep it simple
    console.log('Step 2: Generating image...');
    
    const sceneDescription = industry?.toLowerCase().includes('fund') || industry?.toLowerCase().includes('loan') || industry?.toLowerCase().includes('capital')
      ? 'sitting at a modern executive desk in a premium office, reviewing financial documents with a client seated across from them. Natural light from large windows, bookshelf in background.'
      : 'in a professional consultation meeting at a modern office, confidently explaining something to a client. Premium corporate environment with excellent lighting.';

    const imagePrompt = `Photorealistic professional photograph of a business professional.

THIS PERSON MUST LOOK EXACTLY LIKE:
${personDescription}

SCENE: ${sceneDescription}

REQUIREMENTS:
- The person described above is the main subject
- Match their EXACT appearance - face, hair, skin tone, features
- Professional photography quality
- Square 1:1 format
- Premium corporate aesthetic
- Photorealistic, NOT illustrated`;

    const imageResponse = await openai.images.generate({
      model: 'gpt-image-2',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
    });

    console.log('Image generation complete');

    let imageUrl = '';
    if (imageResponse.data?.[0]?.b64_json) {
      imageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
    } else if (imageResponse.data?.[0]?.url) {
      imageUrl = imageResponse.data[0].url;
    }

    return NextResponse.json({
      success: true,
      personDescription,
      results: [{
        scene: 'Professional Consultation',
        headline: `${name || 'Your'} - Trusted Expert`,
        subtext: `${company || 'Professional'} - Building success together`,
        imageUrl,
        success: !!imageUrl,
      }],
    });

  } catch (error: any) {
    console.error('Authority test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate'
    }, { status: 500 });
  }
}
