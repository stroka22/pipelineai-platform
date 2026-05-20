import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const maxDuration = 30;

function base64ToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

async function urlToBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    return base64ToBuffer(url);
  }
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function createCircularHeadshot(imageBuffer: Buffer, size: number): Promise<Buffer> {
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
  );
  
  const resized = await sharp(imageBuffer)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  
  // Add white border
  const borderSize = 4;
  const totalSize = size + borderSize * 2;
  
  const withBorder = await sharp({
    create: { width: totalSize, height: totalSize, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
    .composite([{ input: resized, top: borderSize, left: borderSize }])
    .png()
    .toBuffer();
  
  const borderMask = Buffer.from(
    `<svg width="${totalSize}" height="${totalSize}"><circle cx="${totalSize/2}" cy="${totalSize/2}" r="${totalSize/2}" fill="white"/></svg>`
  );
  
  return sharp(withBorder)
    .composite([{ input: borderMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const { backgroundImage, logo, headshot, slideNumber, totalSlides, isLastSlide } = await request.json();

    const imageSize = 1024;
    
    // Get background
    let bgBuffer = await urlToBuffer(backgroundImage);
    bgBuffer = await sharp(bgBuffer).resize(imageSize, imageSize, { fit: 'cover' }).png().toBuffer();

    const composites: sharp.OverlayOptions[] = [];

    // Add logo (top left)
    if (logo) {
      try {
        const logoBuffer = base64ToBuffer(logo);
        const logoMeta = await sharp(logoBuffer).metadata();
        
        const maxH = 80;
        const maxW = 180;
        let w = maxW, h = maxH;
        if (logoMeta.width && logoMeta.height) {
          const ratio = logoMeta.width / logoMeta.height;
          if (ratio > maxW / maxH) { w = maxW; h = Math.round(maxW / ratio); }
          else { h = maxH; w = Math.round(maxH * ratio); }
        }
        
        const resizedLogo = await sharp(logoBuffer)
          .resize(w, h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        
        composites.push({ input: resizedLogo, top: 30, left: 30 });
      } catch (e) {
        console.error('Logo error:', e);
      }
    }

    // Add slide number badge (top right)
    const badgeSvg = `<svg width="60" height="70">
      <path d="M0,0 L60,0 L60,50 L30,70 L0,50 Z" fill="#1e3a5f"/>
      <text x="30" y="35" font-family="Arial" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${String(slideNumber).padStart(2, '0')}</text>
    </svg>`;
    composites.push({ input: Buffer.from(badgeSvg), top: 25, left: imageSize - 85 });

    // Add headshot
    if (headshot) {
      try {
        const headshotBuffer = base64ToBuffer(headshot);
        
        if (isLastSlide) {
          // Circular headshot in bottom area for last slide
          const circularHeadshot = await createCircularHeadshot(headshotBuffer, 120);
          composites.push({ input: circularHeadshot, top: imageSize - 180, left: 40 });
        } else if (slideNumber === 1 || slideNumber % 2 === 0) {
          // Larger headshot on right side for some slides
          const largeHeadshot = await sharp(headshotBuffer)
            .resize(320, 400, { fit: 'cover' })
            .png()
            .toBuffer();
          
          // Add rounded corners
          const mask = Buffer.from(
            `<svg width="320" height="400"><rect width="320" height="400" rx="16" ry="16" fill="white"/></svg>`
          );
          const maskedHeadshot = await sharp(largeHeadshot)
            .composite([{ input: mask, blend: 'dest-in' }])
            .png()
            .toBuffer();
          
          // Add border
          const borderSvg = `<svg width="328" height="408"><rect x="0" y="0" width="328" height="408" rx="20" ry="20" fill="none" stroke="white" stroke-width="4"/></svg>`;
          
          composites.push({ input: maskedHeadshot, top: 280, left: 660 });
        }
      } catch (e) {
        console.error('Headshot error:', e);
      }
    }

    // Composite everything
    const finalImage = await sharp(bgBuffer)
      .composite(composites)
      .png()
      .toBuffer();

    const base64 = `data:image/png;base64,${finalImage.toString('base64')}`;

    return NextResponse.json({ success: true, imageUrl: base64 });

  } catch (error: any) {
    console.error('Composite error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
