import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const maxDuration = 120;

// Convert base64 to Buffer
function base64ToBuffer(base64: string): Buffer {
  const data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(data, 'base64');
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { 
      headshotBase64, 
      name, 
      company, 
      industry, 
      phone,
      goal 
    } = await request.json();

    if (!headshotBase64) {
      return NextResponse.json({ error: 'Headshot image required' }, { status: 400 });
    }

    // Step 1: Ask GPT-4o to analyze the headshot and come up with scene concepts
    const conceptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a creative director specializing in personal branding and authority positioning for social media.

Your job is to:
1. Analyze the provided headshot photo to understand the person's appearance
2. Come up with 4 compelling SCENE CONCEPTS that would make them look like THE authority in their industry

Each scene should:
- Show the person in a dynamic, professional context (not just a headshot overlay)
- Position them as successful, trustworthy, and expert
- Be visually interesting for social media
- Feel premium and custom, not stock-photo-ish

Output JSON with this structure:
{
  "personDescription": "Detailed description of the person's appearance from the photo - face shape, skin tone, hair color/style, approximate age, any distinguishing features, clothing style visible",
  "scenes": [
    {
      "scene": "Short scene title",
      "imagePrompt": "Detailed prompt for AI image generation that includes the person description and the scene setting",
      "headline": "Bold headline for this slide",
      "subtext": "Supporting copy"
    }
  ]
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this person's headshot and create 4 authority-building scene concepts for:

Name: ${name || 'Business Professional'}
Company: ${company || 'Professional Services'}
Industry: ${industry || 'Business Consulting'}
Goal: ${goal || 'Position as the trusted authority and go-to expert in their field'}

IMPORTANT: 
- First, describe the person's appearance in detail from the photo
- Then create 4 scenes showing this EXACT person in professional settings
- Each imagePrompt must include the person description so the AI generates them accurately

Return ONLY the JSON object.`
            },
            {
              type: 'image_url',
              image_url: { url: headshotBase64, detail: 'high' }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
    });

    let parsed;
    try {
      parsed = JSON.parse(conceptResponse.choices[0].message.content || '{}');
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const personDescription = parsed.personDescription || '';
    const concepts = parsed.scenes || [];

    if (!Array.isArray(concepts) || concepts.length === 0) {
      return NextResponse.json({ error: 'No scenes generated' }, { status: 500 });
    }

    // Convert headshot to file for the edit API
    const headshotBuffer = base64ToBuffer(headshotBase64);
    const headshotFile = await toFile(headshotBuffer, 'headshot.png', { type: 'image/png' });

    // Step 2: Generate images using the edit API with the headshot as reference
    const results = [];
    
    for (const concept of concepts.slice(0, 4)) {
      try {
        // Build the image generation prompt with person description
        const imagePrompt = `Create a professional photograph for a social media carousel.

PERSON (must match exactly):
${personDescription}

SCENE:
${concept.imagePrompt}

REQUIREMENTS:
- The person described above must be the main subject
- Preserve their EXACT facial features, skin tone, hair style, and overall appearance  
- Professional, high-end photography style with excellent lighting
- Photorealistic quality, not illustrated or cartoonish
- Square format (1:1) suitable for Instagram
- Premium corporate aesthetic
- Natural pose and expression appropriate for the scene`;

        // Use images.edit with the headshot as input reference
        const imageResponse = await openai.images.edit({
          model: 'gpt-image-2',
          image: headshotFile,
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
        });

        let imageUrl = '';
        if (imageResponse.data?.[0]?.b64_json) {
          imageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
        } else if (imageResponse.data?.[0]?.url) {
          imageUrl = imageResponse.data[0].url;
        }

        results.push({
          scene: concept.scene,
          headline: concept.headline,
          subtext: concept.subtext,
          personDescription,
          imageUrl,
          success: !!imageUrl,
        });

      } catch (error: any) {
        console.error('Image generation error:', error);
        results.push({
          scene: concept.scene,
          headline: concept.headline,
          subtext: concept.subtext,
          personDescription,
          imageUrl: null,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      personDescription,
      concepts,
      results,
      note: 'These images use gpt-image-2 edit API with the headshot as reference. Check likeness accuracy.',
    });

  } catch (error: any) {
    console.error('Authority test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate'
    }, { status: 500 });
  }
}
