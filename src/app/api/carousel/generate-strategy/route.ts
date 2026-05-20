import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { BrandProfile, SlideData, CarouselStrategy, SlideLayout, HeadshotLayout } from '@/lib/carousel-templates/types';

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

    const systemPrompt = `You are an expert marketing strategist and visual designer creating premium carousel strategies. You output ONLY valid JSON.

Your job is to create a detailed, persuasive ${slideCount}-slide carousel strategy with ADAPTIVE LAYOUTS that feel custom-designed, not template-based.

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
      "layout": {
        "headshot": {
          "position": "right-center",
          "size": "large",
          "shape": "rounded-rect",
          "style": "dramatic-shadow",
          "shadowDirection": "left"
        },
        "logo": {
          "position": "top-left",
          "size": "medium",
          "style": "clean"
        },
        "content": {
          "position": "left",
          "alignment": "left",
          "width": "medium",
          "verticalAlign": "center"
        },
        "backgroundStyle": "gradient-overlay",
        "overlayOpacity": 0.85
      },
      "backgroundPrompt": "Detailed prompt for AI background generation"
    }
  ]
}

ADAPTIVE LAYOUT SYSTEM:
Each slide should have a unique, dynamic layout. Mix these options creatively:

HEADSHOT OPTIONS:
- position: "left-center", "right-center", "center", "left-top", "right-top", "left-bottom", "right-bottom", "floating-right", "floating-left", "hero-large", "contact-bar"
- size: "small", "medium", "large", "hero", "thumbnail"
- shape: "circle", "rounded-rect", "square", "hexagon", "arch", "blob"
- style: "clean", "soft-shadow", "dramatic-shadow", "glow", "gradient-border", "double-border", "cutout", "floating", "framed"
- shadowDirection: "left", "right", "bottom", "center"

LOGO OPTIONS:
- position: "top-left", "top-right", "bottom-left", "bottom-right", "contact-bar"
- size: "small", "medium", "large"
- style: "clean", "white-bg", "shadow"

CONTENT OPTIONS:
- position: "left", "right", "center", "bottom", "top"
- alignment: "left", "center", "right"
- width: "narrow", "medium", "wide", "full"
- verticalAlign: "top", "center", "bottom"

BACKGROUND STYLE:
- backgroundStyle: "full-bleed", "gradient-overlay", "split", "vignette"
- overlayOpacity: 0.7-0.95 (higher = more text readability)

DESIGN PRINCIPLES:
1. VARY the headshot position/style across slides - don't repeat the same layout
2. First slide: Make a BOLD impression - hero-sized headshot or dramatic positioning
3. Middle slides: Professional credibility - vary between left/right headshot placement
4. Last slide: Contact-focused layout with clear CTA
5. Match headshot shadowDirection with the side the light would come from in the background
6. When headshot is on right, content should be on left (and vice versa)
7. Use "glow" style with accent color for high-impact slides
8. Use "dramatic-shadow" for authority slides
9. Use "circle" shape for friendly/approachable, "rounded-rect" for professional

CONTENT RULES:
- Headlines: Bold, benefit-focused, 3-8 words, emotional hooks
- Subheadlines: Support headline, add credibility or context
- Body text: Concise, value-driven, customer-focused
- CTAs: Action-oriented, urgent, clear benefit

BACKGROUND PROMPT RULES (CRITICAL):
Each backgroundPrompt must describe where to leave CLEAR SPACE for the headshot based on its position.
Example: If headshot position is "right-center", prompt should say "leave the right side relatively clean for a portrait overlay"

Background requirements:
- Uses brand colors: ${brand.primary_color} (primary), ${brand.secondary_color} (secondary)
- NO faces, people, portraits, or human figures
- NO logos or text of any kind
- Premium, sophisticated, high-end aesthetic
- Visual interest that complements (not competes with) the headshot
- Lighting direction should match the headshot shadow direction
- Industry-appropriate for ${niche || brand.industry || 'business'}`;

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

ASSETS AVAILABLE:
- Headshot photo: ${brand.headshot_url ? 'YES - will be composited' : 'NO'}
- Company logo: ${brand.logo_url ? 'YES - will be composited' : 'NO'}

DESIGN DIRECTION: ${layoutFamily}

Create a premium, custom-feeling carousel that:
1. VARIES the layout across slides (not repetitive)
2. Positions the real headshot dynamically on each slide
3. Uses sophisticated visual treatments (shadows, glows, shapes)
4. Leaves appropriate space in backgrounds for asset compositing
5. Feels like a custom design, NOT a template

IMPORTANT: 
- The headshot and logo are REAL uploaded images that will be composited
- Each slide should feel like a unique custom design
- Background prompts must specify where to leave clear space for the headshot

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

    // Default layouts for different slide positions
    const getDefaultLayout = (index: number, total: number): SlideLayout => {
      const isFirst = index === 0;
      const isLast = index === total - 1;
      
      if (isFirst) {
        return {
          headshot: {
            position: 'right-center',
            size: 'large',
            shape: 'rounded-rect',
            style: 'dramatic-shadow',
            shadowDirection: 'left',
          },
          logo: { position: 'top-left', size: 'medium', style: 'clean' },
          content: { position: 'left', alignment: 'left', width: 'medium', verticalAlign: 'center' },
          backgroundStyle: 'gradient-overlay',
          overlayOpacity: 0.85,
        };
      }
      
      if (isLast) {
        return {
          headshot: {
            position: 'contact-bar',
            size: 'thumbnail',
            shape: 'circle',
            style: 'gradient-border',
          },
          logo: { position: 'contact-bar', size: 'medium', style: 'clean' },
          content: { position: 'center', alignment: 'center', width: 'wide', verticalAlign: 'center' },
          backgroundStyle: 'gradient-overlay',
          overlayOpacity: 0.9,
        };
      }
      
      // Alternate layouts for middle slides
      const positions: Array<'left-center' | 'right-center' | 'floating-right' | 'floating-left'> = 
        ['right-center', 'left-center', 'floating-right', 'floating-left'];
      const shapes: Array<'rounded-rect' | 'circle' | 'arch'> = ['rounded-rect', 'circle', 'arch'];
      const styles: Array<'soft-shadow' | 'glow' | 'gradient-border'> = ['soft-shadow', 'glow', 'gradient-border'];
      
      const pos = positions[index % positions.length];
      const contentPos: 'left' | 'right' = pos.includes('right') ? 'left' : 'right';
      
      return {
        headshot: {
          position: pos,
          size: 'medium',
          shape: shapes[index % shapes.length],
          style: styles[index % styles.length],
          shadowDirection: pos.includes('right') ? 'left' : 'right',
        },
        logo: { position: 'top-left', size: 'small', style: 'clean' },
        content: { 
          position: contentPos, 
          alignment: contentPos, 
          width: 'medium', 
          verticalAlign: 'center' 
        },
        backgroundStyle: 'gradient-overlay',
        overlayOpacity: 0.8,
      };
    };

    // Ensure proper structure for each slide
    strategy.slides = strategy.slides.map((slide: any, index: number) => {
      const defaultLayout = getDefaultLayout(index, strategy.slides.length);
      
      return {
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
        layout: slide.layout || defaultLayout,
        // Legacy compatibility
        includeHeadshot: true,
        includeLogo: true,
        includeContactBar: index === strategy.slides.length - 1,
      };
    });

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
