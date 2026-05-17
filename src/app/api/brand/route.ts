import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp';
import path from 'path';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Convert base64 data URL to buffer
function base64ToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Download image from URL to buffer
async function urlToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Create circular mask for headshot
async function createCircularImage(imageBuffer: Buffer, size: number): Promise<Buffer> {
  const roundedCorners = Buffer.from(
    `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
  );
  
  const resized = await sharp(imageBuffer)
    .resize(size, size, { fit: 'cover' })
    .toBuffer();
  
  return sharp(resized)
    .composite([{
      input: roundedCorners,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();
}

// Create text as SVG for Sharp compositing
function createTextSvg(
  text: string, 
  fontSize: number, 
  color: string, 
  maxWidth: number,
  fontWeight: string = 'bold',
  align: string = 'center'
): Buffer {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  const textAnchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
  const x = align === 'center' ? maxWidth / 2 : align === 'right' ? maxWidth - 10 : 10;
  
  const svg = `
    <svg width="${maxWidth}" height="${fontSize + 20}">
      <text 
        x="${x}" 
        y="${fontSize}" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="${fontSize}" 
        font-weight="${fontWeight}"
        fill="${color}"
        text-anchor="${textAnchor}"
      >${escapedText}</text>
    </svg>
  `;
  
  return Buffer.from(svg);
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
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing images for recreation. Analyze the image and describe:
- Overall style and mood (corporate, playful, luxury, etc.)
- Color palette (specific colors)
- Background elements and patterns
- Layout structure
- Any graphical elements (shapes, icons, gradients)
Do NOT describe any text - we will add text separately. Focus only on visual/graphical elements.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image for visual style and elements. Ignore any text - describe only the graphical/visual elements.'
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
      ],
      max_tokens: 800,
    });

    const imageAnalysis = analysisResponse.choices[0].message.content;

    // Step 2: Generate background image (NO TEXT)
    const backgroundPrompt = `Create a professional social media graphic background with these characteristics:

${imageAnalysis}

${brandColors ? `Use these brand colors: ${brandColors}` : ''}

CRITICAL REQUIREMENTS:
- Do NOT include ANY text, words, letters, or numbers in the image
- Leave clean space at the top for a business name to be added later
- Leave clean space at the bottom for contact info to be added later
${headshotImage ? '- Leave space on the right side for a professional headshot to be added' : ''}
${logoImage ? '- Leave space in a corner for a logo to be added' : ''}
- Create a visually appealing background/template only
- Make it 1024x1024 pixels, suitable for Instagram

This is a BACKGROUND TEMPLATE - text and branding elements will be composited on top afterwards.`;

    console.log('Generating background with prompt:', backgroundPrompt.substring(0, 200));

    const imageApiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: backgroundPrompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    const imageResponse = await imageApiResponse.json();

    if (!imageApiResponse.ok) {
      return NextResponse.json({ 
        error: imageResponse.error?.message || 'Image generation failed',
        details: imageResponse.error
      }, { status: 400 });
    }

    // Get the generated background
    let backgroundBuffer: Buffer;
    if (imageResponse.data?.[0]?.b64_json) {
      backgroundBuffer = Buffer.from(imageResponse.data[0].b64_json, 'base64');
    } else if (imageResponse.data?.[0]?.url) {
      backgroundBuffer = await urlToBuffer(imageResponse.data[0].url);
    } else {
      return NextResponse.json({ error: 'Failed to generate background' }, { status: 500 });
    }

    // Step 3: Composite all elements with Sharp
    const compositeOperations: sharp.OverlayOptions[] = [];
    const imageSize = 1024;

    // Add business name at top
    const businessNameSvg = createTextSvg(
      businessName.toUpperCase(),
      56,
      '#FFFFFF',
      imageSize - 40,
      'bold',
      'center'
    );
    compositeOperations.push({
      input: businessNameSvg,
      top: 60,
      left: 20,
    });

    // Add logo if provided (top-left corner)
    if (logoImage) {
      try {
        const logoBuffer = base64ToBuffer(logoImage);
        const resizedLogo = await sharp(logoBuffer)
          .resize(120, 120, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        
        compositeOperations.push({
          input: resizedLogo,
          top: 40,
          left: 40,
        });

        // Shift business name if logo present
        compositeOperations[0] = {
          input: businessNameSvg,
          top: 70,
          left: 180,
        };
      } catch (e) {
        console.error('Failed to process logo:', e);
      }
    }

    // Add headshot if provided (right side, circular)
    if (headshotImage) {
      try {
        const headshotBuffer = base64ToBuffer(headshotImage);
        const circularHeadshot = await createCircularImage(headshotBuffer, 280);
        
        // Add white border around headshot
        const withBorder = await sharp({
          create: {
            width: 290,
            height: 290,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          }
        })
          .composite([{
            input: circularHeadshot,
            top: 5,
            left: 5,
          }])
          .png()
          .toBuffer();
        
        // Create circular border
        const borderMask = Buffer.from(
          `<svg><circle cx="145" cy="145" r="145" fill="white"/></svg>`
        );
        
        const finalHeadshot = await sharp(withBorder)
          .composite([{ input: borderMask, blend: 'dest-in' }])
          .png()
          .toBuffer();
        
        compositeOperations.push({
          input: finalHeadshot,
          top: 350,
          left: 700,
        });
      } catch (e) {
        console.error('Failed to process headshot:', e);
      }
    }

    // Add contact info at bottom
    const contactLines: string[] = [];
    if (phoneNumber) contactLines.push(phoneNumber);
    if (websiteUrl) contactLines.push(websiteUrl.replace(/^https?:\/\//, ''));
    
    if (contactLines.length > 0) {
      const contactText = contactLines.join('  •  ');
      const contactSvg = createTextSvg(
        contactText,
        32,
        '#FFFFFF',
        imageSize - 40,
        'normal',
        'center'
      );
      
      // Add semi-transparent background bar for contact info
      const contactBg = Buffer.from(
        `<svg width="${imageSize}" height="70">
          <rect width="${imageSize}" height="70" fill="rgba(0,0,0,0.5)"/>
        </svg>`
      );
      
      compositeOperations.push({
        input: contactBg,
        top: imageSize - 70,
        left: 0,
      });
      
      compositeOperations.push({
        input: contactSvg,
        top: imageSize - 55,
        left: 20,
      });
    }

    // Compose final image
    const finalImage = await sharp(backgroundBuffer)
      .composite(compositeOperations)
      .png()
      .toBuffer();

    // Convert to base64 data URL
    const finalBase64 = `data:image/png;base64,${finalImage.toString('base64')}`;

    return NextResponse.json({
      success: true,
      imageUrl: finalBase64,
      prompt: backgroundPrompt,
    });
  } catch (error: any) {
    console.error('Branding error:', error);
    
    const errorMessage = error?.error?.message || error?.message || 'Failed to generate branded image';
    return NextResponse.json({ 
      error: errorMessage,
      details: error?.error || error?.code || 'Unknown error'
    }, { status: 500 });
  }
}
