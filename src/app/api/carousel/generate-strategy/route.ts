import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { BrandProfile, SlideData, CarouselStrategy } from '@/lib/carousel-templates/types';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { brand, slideCount, topic, niche, layoutFamily } = await request.json() as {
      brand: BrandProfile;
      slideCount: number;
      topic?: string;
      niche?: string;
      layoutFamily: string;
    };

    if (!brand || !brand.company_name) {
      return NextResponse.json({ error: 'Brand profile required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert marketing strategist creating carousel content strategies. You output ONLY valid JSON.

Your job is to create a detailed, persuasive ${slideCount}-slide carousel strategy.

The output must be a JSON object with this EXACT structure:
{
  "overview": "Brief 1-2 sentence strategy overview",
  "targetAudience": "Who this carousel targets",
  "keyMessage": "The core message/takeaway",
  "slides": [
    {
      "id": "slide-1",
      "slideNumber": 1,
      "slideType": "hook",
      "headline": "ATTENTION-GRABBING HEADLINE",
      "subheadline": "Supporting tagline",
      "bodyText": "2-3 sentences of compelling copy",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "cta": "Call to action text",
      "stats": [{"value": "15+", "label": "Years Experience"}],
      "includeHeadshot": true,
      "includeLogo": true,
      "includeContactBar": false,
      "backgroundPrompt": "Detailed prompt for AI background generation"
    }
  ]
}

SLIDE STRUCTURE RULES:
1. Slide 1 (hook): Attention-grabbing headline, headshot + logo, strong visual impact
2. Middle slides: Build credibility, show expertise, provide value
3. Final slide (cta/contact): Strong CTA, all contact info, headshot + logo

CONTENT RULES:
- Headlines: Bold, benefit-focused, 3-8 words, can be UPPERCASE
- Subheadlines: Support the headline, add context
- Body text: Concise, persuasive, customer-focused
- Bullet points: Clear benefits or features (3-5 max)
- Stats: Impressive numbers that build credibility
- CTAs: Action-oriented, clear next step

BACKGROUND PROMPT RULES (CRITICAL):
Each backgroundPrompt must describe a premium corporate background that:
- Has visual interest on the RIGHT side (text goes on left)
- Uses brand colors: ${brand.primary_color}, ${brand.secondary_color}
- NO faces, people, portraits, or human figures
- NO logos or text
- NO generic stock photo feel
- Premium, sophisticated, high-end aesthetic
- Relevant to the slide's topic and ${niche || brand.industry || 'business'} industry`;

    const userPrompt = `Create a ${slideCount}-slide carousel strategy for:

BRAND:
- Company: ${brand.company_name}
- Person: ${brand.person_name || 'N/A'}
- Title: ${brand.title || 'N/A'}
- Industry: ${niche || brand.industry || 'Business Services'}
- Phone: ${brand.phone || 'N/A'}
- Email: ${brand.email || 'N/A'}
- Website: ${brand.website || 'N/A'}
- Tagline: ${brand.tagline || 'N/A'}

TOPIC/FOCUS:
${topic || `Showcase ${brand.company_name}'s expertise and services`}

BRAND COLORS:
- Primary: ${brand.primary_color}
- Secondary: ${brand.secondary_color}
- Accent: ${brand.accent_color}

LAYOUT FAMILY: ${layoutFamily}

Create a persuasive, professional carousel that:
1. Hooks attention immediately
2. Builds trust and credibility
3. Showcases unique value
4. Drives action with clear CTA

Return ONLY the JSON object, no explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    
    let strategy: CarouselStrategy;
    try {
      strategy = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse strategy:', content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Validate and fix slide data
    if (!strategy.slides || !Array.isArray(strategy.slides)) {
      return NextResponse.json({ error: 'Invalid strategy: missing slides array' }, { status: 500 });
    }

    // Ensure proper structure for each slide
    strategy.slides = strategy.slides.map((slide, index) => ({
      id: slide.id || `slide-${index + 1}`,
      slideNumber: index + 1,
      slideType: slide.slideType || (index === 0 ? 'hook' : index === strategy.slides.length - 1 ? 'cta' : 'benefits'),
      headline: slide.headline || 'Headline',
      subheadline: slide.subheadline || '',
      bodyText: slide.bodyText || '',
      bulletPoints: slide.bulletPoints || [],
      cta: slide.cta || '',
      stats: slide.stats || [],
      backgroundPrompt: slide.backgroundPrompt || '',
      includeHeadshot: slide.includeHeadshot ?? (index === 0 || index === strategy.slides.length - 1),
      includeLogo: slide.includeLogo ?? true,
      includeContactBar: slide.includeContactBar ?? (index === strategy.slides.length - 1),
    }));

    return NextResponse.json({
      success: true,
      strategy,
    });

  } catch (error: any) {
    console.error('Strategy generation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate strategy'
    }, { status: 500 });
  }
}
