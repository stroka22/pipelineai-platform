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

    const { assets, slideCount } = await request.json();

    const systemPrompt = `You are an expert marketing strategist and carousel content creator. Your job is to create compelling, professional carousel strategies for businesses.

You will receive brand information and create a detailed carousel strategy with headlines, copy, and visual direction for each slide.

IMPORTANT RULES:
1. Each slide should have a clear purpose in the narrative arc
2. Slide 1 is always the HOOK - attention-grabbing headline
3. Middle slides build credibility, show expertise, explain services
4. Last slide is always the CTA with contact information
5. Write in a professional, authoritative tone
6. Headlines should be bold and impactful
7. Body text should be concise but persuasive
8. Indicate which slides should include the headshot and/or logo

Respond with valid JSON only.`;

    const userPrompt = `Create a ${slideCount}-slide carousel strategy for:

COMPANY: ${assets.companyName}
PERSON: ${assets.personName}
TITLE: ${assets.title || 'Professional'}
INDUSTRY: ${assets.industry}
TOPIC: ${assets.topic || `${assets.industry} services and expertise`}

CONTACT INFO (use exactly as provided):
- Phone: ${assets.phone || 'N/A'}
- Email: ${assets.email || 'N/A'}
- Website: ${assets.website || 'N/A'}

BRAND COLORS:
- Primary: ${assets.primaryColor}
- Secondary: ${assets.secondaryColor}
- Accent: ${assets.accentColor}

Create a JSON response with this exact structure:
{
  "overview": "Brief 1-2 sentence overview of the carousel theme",
  "slides": [
    {
      "headline": "BOLD HEADLINE TEXT",
      "subheadline": "Supporting subheadline or tagline",
      "bodyText": "2-3 sentences of body copy",
      "cta": "Call to action text if applicable",
      "visualDirection": "Description of background visual (e.g., 'modern office', 'business meeting', 'city skyline')",
      "includeHeadshot": true/false,
      "includeLogo": true/false
    }
  ]
}

Make sure:
- Slide 1 has includeHeadshot: true and includeLogo: true (the hook)
- Middle slides vary - some with headshot, some without
- Last slide has all contact info, headshot, and logo
- visualDirection describes professional backgrounds (no faces/people in background)
- Headlines are powerful and benefit-focused
- Copy builds trust and authority`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content || '{}';
    
    let strategy;
    try {
      strategy = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse strategy:', content);
      return NextResponse.json({ error: 'Failed to parse strategy response' }, { status: 500 });
    }

    if (!strategy.slides || !Array.isArray(strategy.slides)) {
      return NextResponse.json({ error: 'Invalid strategy format' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      strategy
    });

  } catch (error: any) {
    console.error('Strategy API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate strategy'
    }, { status: 500 });
  }
}
