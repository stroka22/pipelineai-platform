import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { BrandProfile, SlideData, SlideLayout } from '@/lib/carousel-templates/types';
import { processHeadshot, getHeadshotPosition } from '@/lib/carousel-templates/headshot-processor';

export const maxDuration = 60;

const CANVAS_SIZE = 1080;

/**
 * Convert base64 data URL to Buffer
 */
function base64ToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Fetch image from URL and return as Buffer
 */
async function urlToBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    return base64ToBuffer(url);
  }
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate text overlay SVG
 */
function generateTextSVG(slide: SlideData, brand: BrandProfile, layout: SlideLayout): string {
  const { headline, subheadline, bodyText, bulletPoints, cta, stats, slideNumber } = slide;
  const { content } = layout;
  const { primary_color, secondary_color, accent_color } = brand;
  
  // Calculate content area based on layout
  const contentWidth = content.width === 'narrow' ? 400 : content.width === 'wide' ? 700 : content.width === 'full' ? 1000 : 520;
  const contentX = content.position === 'left' ? 50 : 
                   content.position === 'right' ? CANVAS_SIZE - contentWidth - 50 : 
                   (CANVAS_SIZE - contentWidth) / 2;
  const contentY = content.verticalAlign === 'top' ? 150 : 
                   content.verticalAlign === 'bottom' ? 600 : 350;
  
  const textAlign = content.alignment;
  const textAnchor = textAlign === 'left' ? 'start' : textAlign === 'right' ? 'end' : 'middle';
  const alignX = textAlign === 'left' ? contentX : textAlign === 'right' ? contentX + contentWidth : contentX + contentWidth/2;
  
  let svgContent = '';
  let yOffset = contentY;
  
  // Slide number badge
  svgContent += `
    <g transform="translate(${CANVAS_SIZE - 90}, 25)">
      <path d="M0,0 L70,0 L70,55 L35,75 L0,55 Z" fill="${primary_color}"/>
      <text x="35" y="38" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="white" text-anchor="middle">${String(slideNumber).padStart(2, '0')}</text>
    </g>
  `;
  
  // Headline
  if (headline) {
    const fontSize = headline.length > 35 ? 42 : headline.length > 25 ? 48 : 56;
    const lines = wrapText(headline.toUpperCase(), contentWidth, fontSize * 0.6);
    lines.forEach((line, i) => {
      svgContent += `<text x="${alignX}" y="${yOffset + i * (fontSize + 8)}" font-family="Arial Black, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="${primary_color}" text-anchor="${textAnchor}">${escapeXml(line)}</text>`;
    });
    yOffset += lines.length * (fontSize + 8) + 15;
  }
  
  // Accent line
  const lineWidth = 70;
  const lineX = textAlign === 'left' ? contentX : textAlign === 'right' ? contentX + contentWidth - lineWidth : (CANVAS_SIZE - lineWidth) / 2;
  svgContent += `<rect x="${lineX}" y="${yOffset}" width="${lineWidth}" height="5" fill="${secondary_color}"/>`;
  yOffset += 30;
  
  // Subheadline
  if (subheadline) {
    const lines = wrapText(subheadline, contentWidth, 14);
    lines.forEach((line, i) => {
      svgContent += `<text x="${alignX}" y="${yOffset + i * 28}" font-family="Georgia, serif" font-size="22" font-style="italic" fill="${secondary_color}" text-anchor="${textAnchor}">${escapeXml(line)}</text>`;
    });
    yOffset += lines.length * 28 + 15;
  }
  
  // Body text
  if (bodyText) {
    const lines = wrapText(bodyText, contentWidth, 11);
    lines.slice(0, 4).forEach((line, i) => {
      svgContent += `<text x="${alignX}" y="${yOffset + i * 28}" font-family="Arial, sans-serif" font-size="20" fill="#333333" text-anchor="${textAnchor}">${escapeXml(line)}</text>`;
    });
    yOffset += Math.min(lines.length, 4) * 28 + 15;
  }
  
  // Bullet points
  if (bulletPoints && bulletPoints.length > 0) {
    bulletPoints.slice(0, 4).forEach((point, i) => {
      const bulletX = textAlign === 'left' ? contentX : textAlign === 'right' ? contentX + contentWidth - 300 : contentX + 50;
      svgContent += `
        <circle cx="${bulletX + 12}" cy="${yOffset + i * 38 - 6}" r="12" fill="${accent_color}"/>
        <text x="${bulletX + 12}" y="${yOffset + i * 38 - 2}" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">✓</text>
        <text x="${bulletX + 35}" y="${yOffset + i * 38}" font-family="Arial, sans-serif" font-size="18" fill="#333333">${escapeXml(point.substring(0, 50))}</text>
      `;
    });
    yOffset += bulletPoints.slice(0, 4).length * 38 + 15;
  }
  
  // Stats
  if (stats && stats.length > 0) {
    const statWidth = 120;
    const totalWidth = stats.length * statWidth;
    const startX = textAlign === 'left' ? contentX : textAlign === 'right' ? contentX + contentWidth - totalWidth : (CANVAS_SIZE - totalWidth) / 2;
    stats.slice(0, 3).forEach((stat, i) => {
      svgContent += `
        <text x="${startX + i * statWidth + statWidth/2}" y="${yOffset}" font-family="Arial Black, Arial, sans-serif" font-size="40" font-weight="900" fill="${primary_color}" text-anchor="middle">${escapeXml(stat.value)}</text>
        <text x="${startX + i * statWidth + statWidth/2}" y="${yOffset + 25}" font-family="Arial, sans-serif" font-size="12" fill="#666666" text-anchor="middle">${escapeXml(stat.label.toUpperCase())}</text>
      `;
    });
    yOffset += 55;
  }
  
  // CTA button
  if (cta && !slide.includeContactBar) {
    const ctaWidth = Math.min(cta.length * 14 + 60, 350);
    const ctaX = textAlign === 'left' ? contentX : textAlign === 'right' ? contentX + contentWidth - ctaWidth : (CANVAS_SIZE - ctaWidth) / 2;
    svgContent += `
      <rect x="${ctaX}" y="${yOffset}" width="${ctaWidth}" height="55" rx="12" fill="${primary_color}"/>
      <text x="${ctaX + ctaWidth/2}" y="${yOffset + 36}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${escapeXml(cta)}</text>
    `;
  }
  
  return `<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
}

/**
 * Generate contact bar SVG
 */
function generateContactBarSVG(brand: BrandProfile): string {
  const { person_name, company_name, title, phone, website, primary_color } = brand;
  const barHeight = 160;
  const y = CANVAS_SIZE - barHeight;
  
  return `<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="${y}" width="${CANVAS_SIZE}" height="${barHeight}" fill="${primary_color}"/>
    <text x="200" y="${y + 55}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">${escapeXml(person_name || company_name)}</text>
    ${title ? `<text x="200" y="${y + 85}" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.9)">${escapeXml(title)}</text>` : ''}
    <text x="200" y="${y + 125}" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.9)">
      ${phone ? `📞 ${escapeXml(phone)}` : ''}${phone && website ? '    ' : ''}${website ? `🌐 ${escapeXml(website.replace(/^https?:\/\//, ''))}` : ''}
    </text>
  </svg>`;
}

/**
 * Simple text wrapping
 */
function wrapText(text: string, maxWidth: number, charWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * charWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  return lines;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(request: NextRequest) {
  try {
    const { slide, brand, backgroundUrl } = await request.json() as {
      slide: SlideData;
      brand: BrandProfile;
      layoutFamily?: string;
      backgroundUrl?: string;
    };

    if (!slide || !brand) {
      return NextResponse.json({ error: 'Slide and brand data required' }, { status: 400 });
    }

    const layout = slide.layout || {
      headshot: { position: 'right-center', size: 'medium', shape: 'rounded-rect', style: 'soft-shadow' },
      logo: { position: 'top-left', size: 'medium', style: 'clean' },
      content: { position: 'left', alignment: 'left', width: 'medium', verticalAlign: 'center' },
      backgroundStyle: 'gradient-overlay',
      overlayOpacity: 0.85,
    };

    // Start with background or solid color
    let canvas: sharp.Sharp;
    
    if (backgroundUrl) {
      const bgBuffer = await urlToBuffer(backgroundUrl);
      canvas = sharp(bgBuffer).resize(CANVAS_SIZE, CANVAS_SIZE, { fit: 'cover' });
    } else {
      canvas = sharp({
        create: {
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          channels: 4,
          background: { r: 248, g: 249, b: 250, alpha: 1 }
        }
      });
    }

    const composites: sharp.OverlayOptions[] = [];

    // Add gradient overlay for text readability
    if (backgroundUrl && layout.backgroundStyle === 'gradient-overlay') {
      const opacity = layout.overlayOpacity || 0.85;
      const contentPos = layout.content.position;
      
      let gradientSvg: string;
      if (contentPos === 'left') {
        gradientSvg = `<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}">
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:white;stop-opacity:${opacity}"/>
            <stop offset="60%" style="stop-color:white;stop-opacity:${opacity * 0.7}"/>
            <stop offset="100%" style="stop-color:white;stop-opacity:0"/>
          </linearGradient></defs>
          <rect width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" fill="url(#g)"/>
        </svg>`;
      } else if (contentPos === 'right') {
        gradientSvg = `<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}">
          <defs><linearGradient id="g" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" style="stop-color:white;stop-opacity:${opacity}"/>
            <stop offset="60%" style="stop-color:white;stop-opacity:${opacity * 0.7}"/>
            <stop offset="100%" style="stop-color:white;stop-opacity:0"/>
          </linearGradient></defs>
          <rect width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" fill="url(#g)"/>
        </svg>`;
      } else {
        gradientSvg = `<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}">
          <rect width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" fill="white" fill-opacity="${opacity * 0.8}"/>
        </svg>`;
      }
      
      composites.push({ input: Buffer.from(gradientSvg), top: 0, left: 0 });
    }

    // Add headshot with effects
    if (layout.headshot && brand.headshot_url) {
      try {
        const headshotBuffer = await urlToBuffer(brand.headshot_url);
        const processed = await processHeadshot(headshotBuffer, layout.headshot, {
          primary: brand.primary_color,
          secondary: brand.secondary_color,
          accent: brand.accent_color,
        });
        
        const position = getHeadshotPosition(layout.headshot, processed.width, processed.height);
        
        composites.push({
          input: processed.buffer,
          top: Math.round(position.top),
          left: Math.round(position.left),
        });
      } catch (e) {
        console.error('Headshot processing error:', e);
      }
    }

    // Add logo
    if (layout.logo && brand.logo_url) {
      try {
        const logoBuffer = await urlToBuffer(brand.logo_url);
        const logoMeta = await sharp(logoBuffer).metadata();
        
        const maxSize = layout.logo.size === 'large' ? 200 : layout.logo.size === 'small' ? 100 : 150;
        let w = maxSize, h = maxSize * 0.6;
        
        if (logoMeta.width && logoMeta.height) {
          const ratio = logoMeta.width / logoMeta.height;
          if (ratio > 1.5) { w = maxSize; h = Math.round(maxSize / ratio); }
          else { h = maxSize * 0.6; w = Math.round(h * ratio); }
        }
        
        const resizedLogo = await sharp(logoBuffer)
          .resize(w, h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        
        // Position logo
        let logoTop = 30, logoLeft = 40;
        if (layout.logo.position === 'top-right') { logoLeft = CANVAS_SIZE - w - 40; }
        else if (layout.logo.position === 'bottom-left') { logoTop = CANVAS_SIZE - h - 200; }
        else if (layout.logo.position === 'bottom-right') { logoTop = CANVAS_SIZE - h - 200; logoLeft = CANVAS_SIZE - w - 40; }
        else if (layout.logo.position === 'contact-bar') { logoTop = CANVAS_SIZE - 130; logoLeft = CANVAS_SIZE - w - 40; }
        
        composites.push({ input: resizedLogo, top: logoTop, left: logoLeft });
      } catch (e) {
        console.error('Logo processing error:', e);
      }
    }

    // Add text overlay
    const textSvg = generateTextSVG(slide, brand, layout);
    composites.push({ input: Buffer.from(textSvg), top: 0, left: 0 });

    // Add contact bar if needed
    if (slide.includeContactBar) {
      const contactSvg = generateContactBarSVG(brand);
      composites.push({ input: Buffer.from(contactSvg), top: 0, left: 0 });
      
      // Add headshot in contact bar
      if (brand.headshot_url) {
        try {
          const headshotBuffer = await urlToBuffer(brand.headshot_url);
          const processed = await processHeadshot(headshotBuffer, {
            position: 'contact-bar',
            size: 'thumbnail',
            shape: 'circle',
            style: 'gradient-border',
          }, {
            primary: brand.primary_color,
            secondary: brand.secondary_color,
            accent: brand.accent_color,
          });
          
          composites.push({
            input: processed.buffer,
            top: CANVAS_SIZE - 145,
            left: 40,
          });
        } catch (e) {
          console.error('Contact bar headshot error:', e);
        }
      }
    }

    // Composite everything
    const finalBuffer = await canvas
      .composite(composites)
      .png()
      .toBuffer();

    const base64 = `data:image/png;base64,${finalBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      imageUrl: base64,
      slideNumber: slide.slideNumber,
    });

  } catch (error: any) {
    console.error('Render error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to render slide'
    }, { status: 500 });
  }
}
