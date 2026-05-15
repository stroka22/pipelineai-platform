import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const { 
      carouselImage, 
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

    // Extract base64 data from data URL
    const base64Data = carouselImage.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Get image dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1080;
    const height = metadata.height || 1080;

    // Parse brand colors or use defaults
    const primaryColor = brandColors?.split(',')[0]?.trim() || '#C96A2B';
    
    // Create text overlay SVG
    const fontSize = Math.floor(width * 0.05); // 5% of width
    const smallFontSize = Math.floor(width * 0.03); // 3% of width
    const padding = Math.floor(width * 0.04); // 4% padding
    const bannerHeight = Math.floor(height * 0.15); // 15% of height for banner

    // Build contact line
    const contactParts = [];
    if (phoneNumber) contactParts.push(phoneNumber);
    if (websiteUrl) {
      // Clean up website URL for display
      const cleanUrl = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      contactParts.push(cleanUrl);
    }
    const contactLine = contactParts.join('  •  ');

    const svgOverlay = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="bannerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(0,0,0,0.85)"/>
            <stop offset="100%" style="stop-color:rgba(0,0,0,0.95)"/>
          </linearGradient>
        </defs>
        
        <!-- Bottom banner -->
        <rect x="0" y="${height - bannerHeight}" width="${width}" height="${bannerHeight}" fill="url(#bannerGradient)"/>
        
        <!-- Business name -->
        <text 
          x="${width / 2}" 
          y="${height - bannerHeight + fontSize + padding}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle"
        >${escapeXml(businessName)}</text>
        
        <!-- Contact info -->
        ${contactLine ? `
        <text 
          x="${width / 2}" 
          y="${height - padding - smallFontSize * 0.3}" 
          font-family="Arial, Helvetica, sans-serif" 
          font-size="${smallFontSize}" 
          fill="rgba(255,255,255,0.8)" 
          text-anchor="middle"
        >${escapeXml(contactLine)}</text>
        ` : ''}
      </svg>
    `;

    // Composite the overlay onto the original image
    const outputBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Convert to base64 data URL
    const outputBase64 = `data:image/png;base64,${outputBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      imageUrl: outputBase64,
    });
  } catch (error: any) {
    console.error('Branding error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to brand image',
    }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
