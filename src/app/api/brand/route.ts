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
      headshotImage,
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

    // Step 1: Analyze the carousel image with GPT-4 Vision
    const analysisMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an expert at analyzing images and creating detailed descriptions for image generation. 
Your job is to analyze a carousel/social media image and describe it in detail so it can be recreated with branding elements added.
Focus on: layout, composition, colors, style, typography style, any graphics or icons, background elements.
Be very specific about positioning (top, bottom, left, right, center).`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this carousel image in detail. Describe the layout, style, colors, and composition so it can be recreated with custom branding.'
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

    // If headshot is provided, analyze it too
    if (headshotImage) {
      analysisMessages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Also analyze this professional headshot photo. Describe the person\'s appearance, attire, and professional presentation so they can be included in the generated image:'
          },
          {
            type: 'image_url',
            image_url: {
              url: headshotImage,
              detail: 'high'
            }
          }
        ]
      });
    }

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: analysisMessages,
      max_tokens: 1000,
    });

    const imageAnalysis = analysisResponse.choices[0].message.content;

    // Step 2: Create the branding prompt
    const brandingPromptMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an expert at creating DALL-E 3 prompts for branded social media images.
Your job is to take an image analysis and branding information, then create a prompt that will generate a similar image WITH the branding incorporated.

Rules:
- Keep the same style, layout, and composition as the original
- Strategically place the business name prominently (usually at top or as a header)
- Add phone number and website at the bottom if provided
- Incorporate the brand colors throughout
- Make it look professional and cohesive
- The text should be readable and well-positioned
- DO NOT include any text that says "placeholder" or generic text

Output ONLY the DALL-E prompt, nothing else.`
      },
      {
        role: 'user',
        content: `Original Image Analysis:
${imageAnalysis}

Branding Information:
- Business Name: ${businessName}
- Website: ${websiteUrl || 'None provided'}
- Phone: ${phoneNumber || 'None provided'}
- Brand Colors: ${brandColors || 'Use colors from the original image'}
${logoImage ? '- Logo style should be incorporated' : ''}
${headshotImage ? '- Include a professional person matching the headshot description in the image' : ''}

Create a DALL-E 3 prompt to recreate this image with the branding incorporated. The business name "${businessName}" must appear prominently.${phoneNumber ? ` Include the phone number "${phoneNumber}".` : ''}${websiteUrl ? ` Include the website "${websiteUrl}".` : ''}${headshotImage ? ' Include a professional person based on the headshot analysis.' : ''}`
      }
    ];

    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: brandingPromptMessages,
      max_tokens: 500,
    });

    const dallePrompt = promptResponse.choices[0].message.content;

    // Step 3: Generate the branded image
    const imagePrompt = dallePrompt || `Professional social media carousel image for ${businessName}`;
    console.log('Attempting to generate image with prompt:', imagePrompt.substring(0, 100));
    
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
    console.log('Image API response:', JSON.stringify(imageResponse, null, 2));

    if (!imageApiResponse.ok) {
      return NextResponse.json({ 
        error: imageResponse.error?.message || 'Image generation failed',
        details: imageResponse.error
      }, { status: 400 });
    }

    // Handle both URL and base64 responses
    let generatedImageUrl = imageResponse.data?.[0]?.url;
    
    // If we got base64 data instead, convert it to a data URL
    if (!generatedImageUrl && imageResponse.data?.[0]?.b64_json) {
      generatedImageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
    }

    if (!generatedImageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      prompt: dallePrompt,
    });
  } catch (error: any) {
    console.error('Branding error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    const errorMessage = error?.error?.message || error?.message || 'Failed to generate branded image';
    return NextResponse.json({ 
      error: errorMessage,
      details: error?.error || error?.code || 'Unknown error'
    }, { status: 500 });
  }
}
