import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const { 
      carouselImage, 
      logoImage,
      businessName,
      websiteUrl,
      phoneNumber,
      brandColors,
    } = await request.json();

    if (!carouselImage) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!businessName) {
      return NextResponse.json({ error: 'Business name required' }, { status: 400 });
    }

    console.log('Processing single image for:', businessName);

    // Step 1: Analyze the carousel image with GPT-4 Vision
    const analysisMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an expert at analyzing images and creating detailed descriptions for image generation. 
Your job is to analyze a carousel/social media image and describe it in detail so it can be recreated with branding elements added.
Focus on: layout, composition, colors, style, typography style, any graphics or icons, background elements.
Be very specific about positioning (top, bottom, left, right, center).
Describe the EXACT text content, colors, and visual elements you see.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this carousel image in detail. Describe the layout, style, colors, text content, and composition so it can be recreated with custom branding added.'
          },
          {
            type: 'image_url',
            image_url: {
              url: carouselImage,
              detail: 'high'
            }
          }
        ]
      }
    ];

    // If logo is provided, analyze it too
    if (logoImage) {
      analysisMessages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Also analyze this logo for style, colors, and design elements to incorporate:'
          },
          {
            type: 'image_url',
            image_url: {
              url: logoImage,
              detail: 'low'
            }
          }
        ]
      });
    }

    console.log('Step 1: Analyzing image...');
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: analysisMessages,
      max_tokens: 1500,
    });

    const imageAnalysis = analysisResponse.choices[0].message.content;
    console.log('Image analysis complete');

    // Step 2: Create the branding prompt
    const brandingPromptMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an expert at creating image generation prompts for branded social media images.
Your job is to take an image analysis and branding information, then create a prompt that will generate a similar image WITH the branding incorporated.

CRITICAL RULES:
- Recreate the SAME style, layout, and visual composition as the original
- Keep the same color scheme and design aesthetic
- Add the business name prominently (usually at top or bottom)
- Include phone number and website somewhere visible if provided
- The branding should look professional and integrated, not slapped on
- Use the brand colors if provided, otherwise match the original style
- DO NOT include placeholder text - use the EXACT business info provided
- Keep the same mood, tone, and visual style as the original image

Output ONLY the image generation prompt, nothing else.`
      },
      {
        role: 'user',
        content: `Original Image Analysis:
${imageAnalysis}

Branding Information to ADD to the image:
- Business Name: ${businessName}
- Phone: ${phoneNumber || 'Not provided - do not include'}
- Website: ${websiteUrl || 'Not provided - do not include'}
- Brand Colors: ${brandColors || 'Use colors from the original image'}

Create a detailed image generation prompt to recreate this image with the branding "${businessName}" incorporated naturally into the design.${phoneNumber ? ` Include phone: "${phoneNumber}".` : ''}${websiteUrl ? ` Include website: "${websiteUrl}".` : ''}`
      }
    ];

    console.log('Step 2: Creating branding prompt...');
    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: brandingPromptMessages,
      max_tokens: 800,
    });

    const dallePrompt = promptResponse.choices[0].message.content;
    console.log('Branding prompt created');

    // Step 3: Generate the branded image
    const imagePrompt = dallePrompt || `Professional social media carousel image for ${businessName}`;
    console.log('Step 3: Generating branded image...');
    
    const imageApiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    const imageResponse = await imageApiResponse.json();

    if (!imageApiResponse.ok) {
      console.error('Image generation failed:', imageResponse.error);
      return NextResponse.json({ 
        error: imageResponse.error?.message || 'Image generation failed',
        details: imageResponse.error
      }, { status: 400 });
    }

    // Handle both URL and base64 responses
    let generatedImageUrl = imageResponse.data?.[0]?.url;
    
    if (!generatedImageUrl && imageResponse.data?.[0]?.b64_json) {
      generatedImageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
    }

    if (!generatedImageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    console.log('Image generated successfully');

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
    });
  } catch (error: any) {
    console.error('Branding error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate branded image',
    }, { status: 500 });
  }
}
