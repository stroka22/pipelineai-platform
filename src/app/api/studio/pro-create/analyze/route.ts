import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const { prompt, images, slideCount } = await request.json();

    // Build image content for GPT-4 Vision
    const imageContent: any[] = [];
    
    const logo = images.find((img: any) => img.type === 'logo');
    const headshot = images.find((img: any) => img.type === 'headshot');
    const references = images.filter((img: any) => img.type === 'reference');

    if (logo) {
      imageContent.push({
        type: 'image_url',
        image_url: { url: logo.data, detail: 'high' }
      });
    }

    if (headshot) {
      imageContent.push({
        type: 'image_url',
        image_url: { url: headshot.data, detail: 'low' }
      });
    }

    for (const ref of references.slice(0, 3)) {
      imageContent.push({
        type: 'image_url',
        image_url: { url: ref.data, detail: 'low' }
      });
    }

    // Step 1: Analyze brand assets
    const analysisPrompt = `You are an expert brand analyst. Analyze the uploaded images and the user's prompt to extract brand information.

USER'S INPUT:
${prompt || 'No additional context provided'}

IMAGES PROVIDED:
- Logo image (analyze for: company name, brand colors, industry, style)
- Professional headshot
${references.length > 0 ? `- ${references.length} reference image(s)` : ''}

Extract and return a JSON object with this EXACT structure:
{
  "companyName": "Company name from logo or prompt",
  "personName": "Person's name from prompt",
  "title": "Job title from prompt or infer from industry",
  "phone": "Phone number from prompt or empty string",
  "email": "Email from prompt or empty string",
  "website": "Website from prompt or empty string",
  "primaryColor": "#hexcode - main brand color from logo (usually dark blue, navy, etc)",
  "secondaryColor": "#hexcode - secondary brand color from logo (usually green, gold, etc)",
  "accentColor": "#hexcode - accent color from logo or complementary",
  "industry": "Industry/business type inferred from logo and context",
  "logoDescription": "Brief description of the logo style and elements",
  "styleNotes": "Design style notes (corporate, modern, friendly, etc)"
}

Be precise with the hex colors - analyze the actual logo colors.
If information isn't available, make a reasonable inference or use empty string.`;

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            ...imageContent
          ]
        }
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const analysisContent = analysisResponse.choices[0].message.content || '{}';
    let brandAnalysis;
    try {
      brandAnalysis = JSON.parse(analysisContent);
    } catch (e) {
      console.error('Failed to parse brand analysis:', analysisContent);
      return NextResponse.json({ error: 'Failed to analyze brand' }, { status: 500 });
    }

    // Step 2: Generate carousel strategy with DETAILED image prompts
    const strategyPrompt = `You are an expert marketing strategist and creative director creating a PREMIUM ${slideCount}-slide square carousel.

BRAND INFO:
- Company: ${brandAnalysis.companyName}
- Person: ${brandAnalysis.personName}
- Title: ${brandAnalysis.title}
- Industry: ${brandAnalysis.industry}
- Phone: ${brandAnalysis.phone || ''}
- Email: ${brandAnalysis.email || ''}
- Website: ${brandAnalysis.website || ''}
- Primary Color: ${brandAnalysis.primaryColor}
- Secondary Color: ${brandAnalysis.secondaryColor}
- Accent Color: ${brandAnalysis.accentColor}
- Logo Style: ${brandAnalysis.logoDescription}
- Design Style: ${brandAnalysis.styleNotes}

USER CONTEXT:
${prompt || 'Create a compelling carousel showcasing expertise and services'}

CRITICAL DESIGN DIRECTION:
This must NOT look like generic AI content, Canva templates, or cheap marketing graphics.
The design should feel:
- premium corporate
- modern professional brand
- high trust
- polished and sophisticated
- authority-driven
- visually expensive

STYLE ELEMENTS TO USE:
- Brand colors: ${brandAnalysis.primaryColor}, ${brandAnalysis.secondaryColor}, ${brandAnalysis.accentColor}
- Clean white typography
- Premium corporate aesthetic
- Modern infographic style
- Cinematic business branding
- Soft glow accents
- Sleek layouts
- Elegant spacing
- Sharp visual hierarchy

Create a JSON response with this EXACT structure:
{
  "overview": "1-2 sentence overview of the carousel theme",
  "slides": [
    {
      "headline": "BOLD HEADLINE IN CAPS",
      "subheadline": "Supporting tagline",
      "bodyText": "2-3 sentences or bullet points of compelling copy",
      "benefitPoints": ["Point 1", "Point 2", "Point 3"],
      "cta": "Call to action text",
      "includeHeadshot": true/false,
      "includeLogo": true/false,
      "includeContactBar": true/false,
      "visualDirection": "Detailed description of background/layout style for this slide",
      "imagePrompt": "DETAILED prompt for AI image generation - describe the background, layout style, visual elements, mood, lighting. DO NOT include the person or logo in this prompt - those will be composited separately. Focus on: background environment, graphic elements, shapes, gradients, icons, supporting visuals that match the headline theme."
    }
  ]
}

SLIDE STRUCTURE RULES:
1. Slide 1 = Hook - attention-grabbing headline, headshot prominent, logo, phone/website
2. Middle slides = Build credibility/expertise with infographic layouts, some with headshot
3. Last slide = Strong CTA with full contact info, headshot, logo

IMAGE PROMPT RULES (CRITICAL):
- Each imagePrompt should describe a PREMIUM background/layout only
- DO NOT mention the person, face, headshot, or portrait in imagePrompt
- DO NOT mention the logo in imagePrompt  
- Focus on: elegant backgrounds, subtle business graphics, modern shapes, professional environments
- Include specific colors: ${brandAnalysis.primaryColor}, ${brandAnalysis.secondaryColor}
- Describe mood: premium, corporate, trustworthy, sophisticated
- Mention: soft lighting, clean composition, visual hierarchy areas for text overlay
- Format: 1080x1080 square, social media carousel

Make every slide feel unique but cohesive as a set.`;

    const strategyResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: strategyPrompt }
      ],
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    });

    const strategyContent = strategyResponse.choices[0].message.content || '{}';
    let carouselStrategy;
    try {
      carouselStrategy = JSON.parse(strategyContent);
    } catch (e) {
      console.error('Failed to parse strategy:', strategyContent);
      return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      brandAnalysis,
      carouselStrategy,
    });

  } catch (error: any) {
    console.error('Analyze API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to analyze'
    }, { status: 500 });
  }
}
