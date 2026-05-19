import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp';

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

    // Step 1: Analyze the image to find the dominant/brand color
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Analyze this image and identify the PRIMARY BRAND COLOR used (usually a dark blue, navy, or accent color - NOT white or light gray). Return ONLY a JSON object like: {"brandColor": "#1e3a5f"}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What is the primary brand/accent color in this image? Return JSON only.'
            },
            {
              type: 'image_url',
              image_url: {
                url: carouselImage,
                detail: 'low'
              }
            }
          ]
        }
      ],
      max_tokens: 100,
    });

    let brandColor = '#1e3a5f'; // Default dark navy
    try {
      const content = analysisResponse.choices[0].message.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.brandColor) {
          brandColor = parsed.brandColor;
        }
      }
    } catch (e) {
      console.log('Could not parse color, using default navy');
    }

    // Override with user's brand colors if provided
    if (brandColors) {
      const firstColor = brandColors.split(',')[0]?.trim();
      if (firstColor && firstColor.startsWith('#')) {
        brandColor = firstColor;
      }
    }

    console.log('Using brand color:', brandColor);

    // Step 2: Process the original image
    const originalBuffer = base64ToBuffer(carouselImage);
    const imageSize = 1024;
    const barHeight = 140; // Taller bar for better visibility
    
    // Resize original to 1024x1024
    let baseImage = await sharp(originalBuffer)
      .resize(imageSize, imageSize, { fit: 'cover' })
      .png()
      .toBuffer();

    // Step 3: Build composite operations
    const compositeOperations: sharp.OverlayOptions[] = [];
    
    // Create solid contact bar at bottom
    const contactBarSvg = `<svg width="${imageSize}" height="${barHeight}">
      <rect x="0" y="0" width="${imageSize}" height="${barHeight}" fill="${brandColor}"/>
    </svg>`;
    
    compositeOperations.push({
      input: Buffer.from(contactBarSvg),
      top: imageSize - barHeight,
      left: 0,
    });

    // Track positions
    let currentX = 25;
    const barTop = imageSize - barHeight;

    // Add headshot (left side) if provided
    if (headshotImage) {
      try {
        const headshotBuffer = base64ToBuffer(headshotImage);
        const headshotSize = 100; // Larger headshot
        const circularHeadshot = await createCircularImage(headshotBuffer, headshotSize);
        
        // Add white border
        const borderSize = 4;
        const totalSize = headshotSize + (borderSize * 2);
        
        const borderCircle = Buffer.from(
          `<svg width="${totalSize}" height="${totalSize}">
            <circle cx="${totalSize/2}" cy="${totalSize/2}" r="${totalSize/2}" fill="white"/>
          </svg>`
        );
        
        const withBorder = await sharp(borderCircle)
          .composite([{
            input: circularHeadshot,
            top: borderSize,
            left: borderSize,
          }])
          .png()
          .toBuffer();
        
        compositeOperations.push({
          input: withBorder,
          top: barTop + Math.round((barHeight - totalSize) / 2),
          left: currentX,
        });
        
        currentX += totalSize + 20; // Move past headshot
      } catch (e) {
        console.error('Failed to process headshot:', e);
      }
    }

    // Add vertical divider line
    const dividerSvg = `<svg width="3" height="80">
      <rect x="0" y="0" width="3" height="80" fill="white" opacity="0.5"/>
    </svg>`;
    
    compositeOperations.push({
      input: Buffer.from(dividerSvg),
      top: barTop + 30,
      left: currentX,
    });
    
    currentX += 20;

    // Add business name (larger, bold)
    const nameSvg = `<svg width="350" height="40">
      <text x="0" y="30" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="white">${escapeXml(businessName)}</text>
    </svg>`;
    
    compositeOperations.push({
      input: Buffer.from(nameSvg),
      top: barTop + 35,
      left: currentX,
    });

    // Add phone number with icon
    if (phoneNumber) {
      const phoneSvg = `<svg width="350" height="35">
        <circle cx="12" cy="17" r="12" fill="white"/>
        <text x="10" y="22" font-family="Arial" font-size="14" fill="${brandColor}">☎</text>
        <text x="32" y="24" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="white">${escapeXml(phoneNumber)}</text>
      </svg>`;
      
      compositeOperations.push({
        input: Buffer.from(phoneSvg),
        top: barTop + 75,
        left: currentX,
      });
    }

    // Add logo (right side) if provided
    if (logoImage) {
      try {
        const logoBuffer = base64ToBuffer(logoImage);
        const logoMeta = await sharp(logoBuffer).metadata();
        const maxLogoHeight = 100;
        const maxLogoWidth = 200;
        
        let logoWidth = maxLogoWidth;
        let logoHeight = maxLogoHeight;
        if (logoMeta.width && logoMeta.height) {
          const aspectRatio = logoMeta.width / logoMeta.height;
          if (aspectRatio > maxLogoWidth / maxLogoHeight) {
            logoWidth = maxLogoWidth;
            logoHeight = Math.round(maxLogoWidth / aspectRatio);
          } else {
            logoHeight = maxLogoHeight;
            logoWidth = Math.round(maxLogoHeight * aspectRatio);
          }
        }
        
        const resizedLogo = await sharp(logoBuffer)
          .resize(logoWidth, logoHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        
        compositeOperations.push({
          input: resizedLogo,
          top: barTop + Math.round((barHeight - logoHeight) / 2),
          left: imageSize - logoWidth - 25,
        });
      } catch (e) {
        console.error('Failed to process logo:', e);
      }
    }

    // Compose final image
    const finalImage = await sharp(baseImage)
      .composite(compositeOperations)
      .png()
      .toBuffer();

    // Convert to base64 data URL
    const finalBase64 = `data:image/png;base64,${finalImage.toString('base64')}`;

    return NextResponse.json({
      success: true,
      imageUrl: finalBase64,
      brandColor: brandColor,
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

// Helper to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
