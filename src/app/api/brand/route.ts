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

// Create text SVG
function createTextSvg(
  text: string, 
  fontSize: number, 
  color: string, 
  maxWidth: number,
  fontWeight: string = 'bold',
  align: string = 'left'
): Buffer {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  const textAnchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
  const x = align === 'center' ? maxWidth / 2 : align === 'right' ? maxWidth - 10 : 10;
  const height = fontSize + 10;
  
  const svg = `
    <svg width="${maxWidth}" height="${height}">
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

    // Step 1: Analyze the image to find the best placement positions
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing images for branding placement. Analyze this carousel/social media image and identify:

1. The PRIMARY COLOR used (hex code) - for the contact bar background
2. The SECONDARY/TEXT COLOR (hex code) - for text on the contact bar
3. Where is the best position for a contact info bar? (usually bottom)
4. Is there an existing headshot/person photo? If yes, where? (top-left, center-right, etc.)
5. Is there an existing logo? If yes, where?
6. What areas have empty/clean space suitable for overlays?

Respond in this exact JSON format:
{
  "primaryColor": "#hex",
  "textColor": "#hex",
  "contactBarPosition": "bottom",
  "existingHeadshot": { "found": true/false, "position": "position or null" },
  "existingLogo": { "found": true/false, "position": "position or null" },
  "cleanSpaces": ["list of positions with clean space"]
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image for branding element placement. Return JSON only.'
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
      max_tokens: 500,
    });

    let analysis: any = {};
    try {
      const content = analysisResponse.choices[0].message.content || '{}';
      // Extract JSON from response (might have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('Could not parse analysis, using defaults');
      analysis = {
        primaryColor: '#1e3a5f',
        textColor: '#ffffff',
        contactBarPosition: 'bottom'
      };
    }

    console.log('Image analysis:', analysis);

    // Step 2: Process the original image - just resize to standard size
    const originalBuffer = base64ToBuffer(carouselImage);
    const imageSize = 1024;
    
    // Resize original to 1024x1024
    let baseImage = await sharp(originalBuffer)
      .resize(imageSize, imageSize, { fit: 'cover' })
      .png()
      .toBuffer();

    // Step 3: Build composite operations
    const compositeOperations: sharp.OverlayOptions[] = [];
    
    // Determine colors
    const barColor = analysis.primaryColor || brandColors?.split(',')[0]?.trim() || '#1e3a5f';
    const textColor = analysis.textColor || '#ffffff';
    
    // Create contact bar at bottom (120px height)
    const barHeight = 120;
    const contactBar = Buffer.from(`
      <svg width="${imageSize}" height="${barHeight}">
        <rect width="${imageSize}" height="${barHeight}" fill="${barColor}"/>
      </svg>
    `);
    
    compositeOperations.push({
      input: contactBar,
      top: imageSize - barHeight,
      left: 0,
    });

    // Add headshot to contact bar (left side) if provided
    let textStartX = 30;
    if (headshotImage) {
      try {
        const headshotBuffer = base64ToBuffer(headshotImage);
        const headshotSize = 90;
        const circularHeadshot = await createCircularImage(headshotBuffer, headshotSize);
        
        // Add white border
        const borderSize = 3;
        const totalSize = headshotSize + (borderSize * 2);
        const withBorder = await sharp({
          create: {
            width: totalSize,
            height: totalSize,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          }
        })
          .composite([{
            input: circularHeadshot,
            top: borderSize,
            left: borderSize,
          }])
          .png()
          .toBuffer();
        
        const borderMask = Buffer.from(
          `<svg><circle cx="${totalSize/2}" cy="${totalSize/2}" r="${totalSize/2}" fill="white"/></svg>`
        );
        
        const finalHeadshot = await sharp(withBorder)
          .composite([{ input: borderMask, blend: 'dest-in' }])
          .png()
          .toBuffer();
        
        compositeOperations.push({
          input: finalHeadshot,
          top: imageSize - barHeight + Math.round((barHeight - totalSize) / 2),
          left: 20,
        });
        
        textStartX = 140; // Move text to the right of headshot
      } catch (e) {
        console.error('Failed to process headshot:', e);
      }
    }

    // Add business name text
    const nameText = createTextSvg(businessName, 28, textColor, 400, 'bold', 'left');
    compositeOperations.push({
      input: nameText,
      top: imageSize - barHeight + 25,
      left: textStartX,
    });

    // Add phone number if provided
    if (phoneNumber) {
      // Phone icon + number
      const phoneText = createTextSvg(`📞 ${phoneNumber}`, 22, textColor, 300, 'normal', 'left');
      compositeOperations.push({
        input: phoneText,
        top: imageSize - barHeight + 65,
        left: textStartX,
      });
    }

    // Add website if provided (smaller, below phone)
    if (websiteUrl) {
      const cleanUrl = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const webText = createTextSvg(`🌐 ${cleanUrl}`, 18, textColor, 300, 'normal', 'left');
      compositeOperations.push({
        input: webText,
        top: imageSize - barHeight + (phoneNumber ? 92 : 65),
        left: textStartX,
      });
    }

    // Add logo (right side of contact bar) if provided
    if (logoImage) {
      try {
        const logoBuffer = base64ToBuffer(logoImage);
        const logoMeta = await sharp(logoBuffer).metadata();
        const maxLogoHeight = 80;
        const maxLogoWidth = 180;
        
        // Calculate dimensions maintaining aspect ratio
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
          top: imageSize - barHeight + Math.round((barHeight - logoHeight) / 2),
          left: imageSize - logoWidth - 30,
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
      analysis: analysis,
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
