import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Stripe from 'stripe';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  const stripe = getStripe();

  try {
    const { sessionId, carouselImage, logoImage } = await request.json();

    // Verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const businessName = session.metadata?.business_name || '';
    const websiteUrl = session.metadata?.website_url || '';
    const phoneNumber = session.metadata?.phone_number || '';
    const brandColors = session.metadata?.brand_colors || '';

    if (!carouselImage) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
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

Create a DALL-E 3 prompt to recreate this image with the branding incorporated. The business name "${businessName}" must appear prominently.${phoneNumber ? ` Include the phone number "${phoneNumber}".` : ''}${websiteUrl ? ` Include the website "${websiteUrl}".` : ''}`
      }
    ];

    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: brandingPromptMessages,
      max_tokens: 500,
    });

    const dallePrompt = promptResponse.choices[0].message.content;

    // Step 3: Generate the branded image with DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-2',
      prompt: dallePrompt || `Professional social media carousel image for ${businessName}`,
      n: 1,
      size: '1024x1024',
    });

    const generatedImageUrl = imageResponse.data?.[0]?.url;

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
    return NextResponse.json({ 
      error: error.message || 'Failed to generate branded image' 
    }, { status: 500 });
  }
}
