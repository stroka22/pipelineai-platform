import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const maxDuration = 60;

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

// Create circular headshot
async function createCircularHeadshot(imageBuffer: Buffer, size: number, borderColor: string): Promise<Buffer> {
  const borderWidth = 4;
  const innerSize = size - (borderWidth * 2);
  
  // Create circular mask
  const circleMask = Buffer.from(
    `<svg width="${innerSize}" height="${innerSize}">
      <circle cx="${innerSize/2}" cy="${innerSize/2}" r="${innerSize/2}" fill="white"/>
    </svg>`
  );
  
  // Resize and crop to circle
  const resized = await sharp(imageBuffer)
    .resize(innerSize, innerSize, { fit: 'cover' })
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  
  // Add border
  const withBorder = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{
      input: resized,
      top: borderWidth,
      left: borderWidth,
    }])
    .png()
    .toBuffer();
  
  // Make border circular
  const borderMask = Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
    </svg>`
  );
  
  return sharp(withBorder)
    .composite([{ input: borderMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

// Generate AI background image
async function generateBackground(imagePrompt: string): Promise<Buffer | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
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

    const data = await response.json();
    
    if (data.data?.[0]?.b64_json) {
      return Buffer.from(data.data[0].b64_json, 'base64');
    } else if (data.data?.[0]?.url) {
      return urlToBuffer(data.data[0].url);
    }
    
    console.error('No image in response:', data);
    return null;
  } catch (error) {
    console.error('Background generation error:', error);
    return null;
  }
}

// Create text as SVG
function createTextSvg(
  text: string,
  fontSize: number,
  color: string,
  maxWidth: number,
  fontWeight: string = 'bold',
  align: string = 'left'
): Buffer {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  const textAnchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
  const x = align === 'center' ? maxWidth / 2 : align === 'right' ? maxWidth - 10 : 10;
  
  const svg = `<svg width="${maxWidth}" height="${fontSize + 15}">
    <text x="${x}" y="${fontSize}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" text-anchor="${textAnchor}">${escaped}</text>
  </svg>`;
  
  return Buffer.from(svg);
}

export async function POST(request: NextRequest) {
  try {
    const { slideNumber, totalSlides, brandAnalysis, slideStrategy, logo, headshot } = await request.json();

    const {
      companyName,
      personName,
      title,
      phone,
      email,
      website,
      primaryColor,
      secondaryColor,
    } = brandAnalysis;

    const {
      headline,
      subheadline,
      bodyText,
      cta,
      includeHeadshot,
      includeLogo,
      includeContactBar,
      imagePrompt,
    } = slideStrategy;

    const imageSize = 1080;
    const isLastSlide = slideNumber === totalSlides;

    // Step 1: Generate AI background
    const enhancedPrompt = `${imagePrompt}

CRITICAL STYLE REQUIREMENTS:
- Premium corporate design, NOT generic or cheap looking
- Colors: Use ${primaryColor} and ${secondaryColor} as primary palette
- 1080x1080 square format for Instagram carousel
- Leave clear space on left side for text overlay
- ${includeHeadshot ? 'Leave space on right side for a circular headshot overlay' : ''}
- Clean, sophisticated, high-end business aesthetic
- Subtle gradients, soft lighting, elegant composition
- NO text, NO faces, NO logos - these will be added separately
- Modern financial/corporate visual style
- Professional, trustworthy, premium feel`;

    let backgroundBuffer = await generateBackground(enhancedPrompt);
    
    if (!backgroundBuffer) {
      // Fallback: create gradient background
      const fallbackSvg = `<svg width="${imageSize}" height="${imageSize}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <rect width="${imageSize}" height="${imageSize}" fill="url(#bg)"/>
      </svg>`;
      backgroundBuffer = await sharp(Buffer.from(fallbackSvg)).png().toBuffer();
    }

    // Resize background to exact size
    backgroundBuffer = await sharp(backgroundBuffer)
      .resize(imageSize, imageSize, { fit: 'cover' })
      .png()
      .toBuffer();

    // Step 2: Build composite layers
    const composites: sharp.OverlayOptions[] = [];

    // Add semi-transparent overlay for text readability (left side)
    const textOverlay = `<svg width="600" height="${imageSize}">
      <defs>
        <linearGradient id="textbg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#000000;stop-opacity:0.7" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
        </linearGradient>
      </defs>
      <rect width="600" height="${imageSize}" fill="url(#textbg)"/>
    </svg>`;
    composites.push({
      input: Buffer.from(textOverlay),
      top: 0,
      left: 0,
    });

    // Add slide number badge (top right)
    const badgeSvg = `<svg width="70" height="80">
      <path d="M0,0 L70,0 L70,60 L35,80 L0,60 Z" fill="${primaryColor}"/>
      <text x="35" y="42" font-family="Arial" font-size="28" font-weight="bold" fill="white" text-anchor="middle">${String(slideNumber).padStart(2, '0')}</text>
    </svg>`;
    composites.push({
      input: Buffer.from(badgeSvg),
      top: 30,
      left: imageSize - 100, // Position from left instead of right
    });

    // Add logo (top left)
    if (includeLogo && logo) {
      try {
        const logoBuffer = base64ToBuffer(logo);
        const logoMeta = await sharp(logoBuffer).metadata();
        const maxLogoHeight = 90;
        const maxLogoWidth = 220;
        
        let logoWidth = maxLogoWidth;
        let logoHeight = maxLogoHeight;
        if (logoMeta.width && logoMeta.height) {
          const ratio = logoMeta.width / logoMeta.height;
          if (ratio > maxLogoWidth / maxLogoHeight) {
            logoWidth = maxLogoWidth;
            logoHeight = Math.round(maxLogoWidth / ratio);
          } else {
            logoHeight = maxLogoHeight;
            logoWidth = Math.round(maxLogoHeight * ratio);
          }
        }
        
        const resizedLogo = await sharp(logoBuffer)
          .resize(logoWidth, logoHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        
        composites.push({
          input: resizedLogo,
          top: 35,
          left: 40,
        });
      } catch (e) {
        console.error('Logo processing error:', e);
      }
    }

    // Add headline
    let textY = 160;
    if (headline) {
      const headlineSvg = createTextSvg(headline, 48, '#FFFFFF', 550, 'bold', 'left');
      composites.push({
        input: headlineSvg,
        top: textY,
        left: 40,
      });
      textY += 70;
    }

    // Add accent line
    const accentLine = `<svg width="60" height="5"><rect width="60" height="5" fill="${secondaryColor}"/></svg>`;
    composites.push({
      input: Buffer.from(accentLine),
      top: textY,
      left: 50,
    });
    textY += 30;

    // Add subheadline
    if (subheadline) {
      const subSvg = createTextSvg(subheadline, 24, '#CCCCCC', 500, 'normal', 'left');
      composites.push({
        input: subSvg,
        top: textY,
        left: 40,
      });
      textY += 50;
    }

    // Add body text (simplified)
    if (bodyText) {
      const bodySvg = createTextSvg(bodyText.substring(0, 150), 20, '#AAAAAA', 480, 'normal', 'left');
      composites.push({
        input: bodySvg,
        top: textY,
        left: 40,
      });
    }

    // Add headshot (right side or in contact bar)
    if (includeHeadshot && headshot) {
      try {
        const headshotBuffer = base64ToBuffer(headshot);
        
        if (isLastSlide || includeContactBar) {
          // Smaller circular headshot for contact bar
          const circularHeadshot = await createCircularHeadshot(headshotBuffer, 110, '#FFFFFF');
          composites.push({
            input: circularHeadshot,
            top: imageSize - 150,
            left: 40,
          });
        } else {
          // Larger headshot on right side
          const largeHeadshot = await sharp(headshotBuffer)
            .resize(380, 450, { fit: 'cover' })
            .png()
            .toBuffer();
          
          // Add rounded corners
          const mask = Buffer.from(
            `<svg width="380" height="450"><rect width="380" height="450" rx="20" ry="20" fill="white"/></svg>`
          );
          
          const maskedHeadshot = await sharp(largeHeadshot)
            .composite([{ input: mask, blend: 'dest-in' }])
            .png()
            .toBuffer();
          
          composites.push({
            input: maskedHeadshot,
            top: 200,
            left: 660,
          });
        }
      } catch (e) {
        console.error('Headshot processing error:', e);
      }
    }

    // Add contact bar (last slide)
    if (isLastSlide || includeContactBar) {
      const barHeight = 160;
      const barSvg = `<svg width="${imageSize}" height="${barHeight}">
        <rect width="${imageSize}" height="${barHeight}" fill="${primaryColor}"/>
      </svg>`;
      composites.push({
        input: Buffer.from(barSvg),
        top: imageSize - barHeight,
        left: 0,
      });

      // Add contact info text
      let contactX = 170;
      
      // Name
      const nameSvg = createTextSvg(personName, 26, '#FFFFFF', 300, 'bold', 'left');
      composites.push({
        input: nameSvg,
        top: imageSize - 140,
        left: contactX,
      });

      // Title
      const titleSvg = createTextSvg(title, 18, '#CCCCCC', 300, 'normal', 'left');
      composites.push({
        input: titleSvg,
        top: imageSize - 110,
        left: contactX,
      });

      // Phone
      if (phone) {
        const phoneSvg = createTextSvg(`📞 ${phone}`, 20, '#FFFFFF', 300, 'normal', 'left');
        composites.push({
          input: phoneSvg,
          top: imageSize - 75,
          left: contactX,
        });
      }

      // Website
      if (website) {
        const cleanUrl = website.replace(/^https?:\/\//, '');
        const webSvg = createTextSvg(`🌐 ${cleanUrl}`, 18, '#AAAAAA', 300, 'normal', 'left');
        composites.push({
          input: webSvg,
          top: imageSize - 45,
          left: contactX,
        });
      }

      // Logo in contact bar (right side)
      if (logo) {
        try {
          const logoBuffer = base64ToBuffer(logo);
          const smallLogo = await sharp(logoBuffer)
            .resize(160, 100, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();
          
          composites.push({
            input: smallLogo,
            top: imageSize - 130,
            left: imageSize - 200,
          });
        } catch (e) {
          console.error('Contact bar logo error:', e);
        }
      }
    }

    // Composite everything
    const finalImage = await sharp(backgroundBuffer)
      .composite(composites)
      .png()
      .toBuffer();

    // Convert to base64
    const base64 = finalImage.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
    });

  } catch (error: any) {
    console.error('Render API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to render slide'
    }, { status: 500 });
  }
}
