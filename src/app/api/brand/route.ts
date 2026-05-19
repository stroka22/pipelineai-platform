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
  align: string = 'left',
  bgColor?: string
): Buffer {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  const textAnchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
  const x = align === 'center' ? maxWidth / 2 : align === 'right' ? maxWidth - 10 : 10;
  const height = fontSize + 20;
  
  const bgRect = bgColor ? `<rect width="${maxWidth}" height="${height}" fill="${bgColor}" rx="4"/>` : '';
  
  const svg = `
    <svg width="${maxWidth}" height="${height}">
      ${bgRect}
      <text 
        x="${x}" 
        y="${fontSize + 5}" 
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

    // Step 1: Analyze the carousel image comprehensively
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing carousel/social media images. Provide a DETAILED description that would allow recreation of this exact image. Include:

1. LAYOUT: Exact positioning of elements (top-left, center, bottom-right, etc.)
2. COLORS: Specific hex colors or close approximations for background, text, accents
3. TYPOGRAPHY: Font styles (serif/sans-serif), sizes (large heading, medium body, small caption), text content word-for-word
4. IMAGERY: Any photos, illustrations, icons, shapes and their exact positions
5. STYLE: Overall aesthetic (minimal, bold, elegant, playful, corporate)
6. DECORATIVE ELEMENTS: Lines, gradients, shadows, borders, curves

Be extremely specific so the image can be recreated with modifications.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this carousel slide in detail. I need to recreate it with custom branding (different contact info, logo, headshot). Describe everything precisely.'
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
      max_tokens: 1500,
    });

    const imageAnalysis = analysisResponse.choices[0].message.content;
    console.log('Image analysis:', imageAnalysis?.substring(0, 500));

    // Step 2: Build a comprehensive prompt to recreate with new branding
    let brandingDetails = `
BRANDING TO ADD:
- Business/Agent Name: "${businessName}"
${phoneNumber ? `- Phone Number: ${phoneNumber}` : ''}
${websiteUrl ? `- Website: ${websiteUrl}` : ''}
${brandColors ? `- Brand Colors: ${brandColors}` : ''}`;

    if (headshotImage) {
      brandingDetails += `
- Include a professional headshot photo in a circular frame (the person is a professional in the industry)`;
    }

    if (logoImage) {
      brandingDetails += `
- Include the company logo prominently`;
    }

    const recreationPrompt = `RECREATE this carousel slide with new branding. Here is the original design analysis:

${imageAnalysis}

${brandingDetails}

CRITICAL INSTRUCTIONS:
1. PRESERVE the original layout, style, colors, and design aesthetic exactly
2. KEEP all the original text content, headlines, and messaging
3. ADD a professional contact info bar at the bottom with: name "${businessName}"${phoneNumber ? `, phone "${phoneNumber}"` : ''}${websiteUrl ? `, website` : ''}
4. The contact bar should be clean and professional with the business logo if space allows
5. If there's a headshot/photo placeholder in the original, include a professional headshot there
6. Make text READABLE and PROPERLY SPELLED
7. This should look like a professionally designed real estate/business carousel slide
8. Square format (1:1 ratio) for Instagram
9. Make sure ALL TEXT is crisp, clear, and correctly spelled

The final image should look like the original slide but with this person's professional branding added.`;

    console.log('Recreation prompt:', recreationPrompt.substring(0, 400));

    // Generate the branded image
    const imageApiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: recreationPrompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    const imageResponse = await imageApiResponse.json();

    if (!imageApiResponse.ok) {
      console.error('Image generation failed:', imageResponse.error);
      return NextResponse.json({ 
        error: imageResponse.error?.message || 'Image generation failed',
        details: imageResponse.error
      }, { status: 400 });
    }

    // Get the generated image
    let generatedBuffer: Buffer;
    if (imageResponse.data?.[0]?.b64_json) {
      generatedBuffer = Buffer.from(imageResponse.data[0].b64_json, 'base64');
    } else if (imageResponse.data?.[0]?.url) {
      generatedBuffer = await urlToBuffer(imageResponse.data[0].url);
    } else {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    // Step 3: If headshot or logo provided, composite them on top for accuracy
    const compositeOperations: sharp.OverlayOptions[] = [];
    const imageSize = 1024;

    // Add logo if provided (top-left or bottom corner)
    if (logoImage) {
      try {
        const logoBuffer = base64ToBuffer(logoImage);
        // Get logo dimensions to maintain aspect ratio
        const logoMeta = await sharp(logoBuffer).metadata();
        const logoMaxSize = 140;
        const logoWidth = logoMeta.width && logoMeta.height 
          ? (logoMeta.width > logoMeta.height ? logoMaxSize : Math.round(logoMaxSize * (logoMeta.width / logoMeta.height)))
          : logoMaxSize;
        const logoHeight = logoMeta.width && logoMeta.height
          ? (logoMeta.height > logoMeta.width ? logoMaxSize : Math.round(logoMaxSize * (logoMeta.height / logoMeta.width)))
          : logoMaxSize;
        
        const resizedLogo = await sharp(logoBuffer)
          .resize(logoWidth, logoHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        
        // Position in bottom right area
        compositeOperations.push({
          input: resizedLogo,
          top: imageSize - logoHeight - 30,
          left: imageSize - logoWidth - 30,
        });
      } catch (e) {
        console.error('Failed to process logo:', e);
      }
    }

    // Add headshot if provided
    if (headshotImage) {
      try {
        const headshotBuffer = base64ToBuffer(headshotImage);
        const headshotSize = 200;
        const circularHeadshot = await createCircularImage(headshotBuffer, headshotSize);
        
        // Add white border around headshot
        const borderSize = 6;
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
        
        // Create circular border
        const borderMask = Buffer.from(
          `<svg><circle cx="${totalSize/2}" cy="${totalSize/2}" r="${totalSize/2}" fill="white"/></svg>`
        );
        
        const finalHeadshot = await sharp(withBorder)
          .composite([{ input: borderMask, blend: 'dest-in' }])
          .png()
          .toBuffer();
        
        // Position center-left or where appropriate
        compositeOperations.push({
          input: finalHeadshot,
          top: Math.round((imageSize - totalSize) / 2),
          left: 40,
        });
      } catch (e) {
        console.error('Failed to process headshot:', e);
      }
    }

    // Compose final image if we have overlays
    let finalBuffer = generatedBuffer;
    if (compositeOperations.length > 0) {
      finalBuffer = await sharp(generatedBuffer)
        .composite(compositeOperations)
        .png()
        .toBuffer();
    }

    // Convert to base64 data URL
    const finalBase64 = `data:image/png;base64,${finalBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      imageUrl: finalBase64,
      analysis: imageAnalysis,
      prompt: recreationPrompt,
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
