import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const maxDuration = 300;

// Convert base64 to Buffer
function base64ToBuffer(base64: string): Buffer {
  const data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(data, 'base64');
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();

  try {
    const { 
      headshotBase64, 
      name, 
      company, 
      industry, 
    } = await request.json();

    if (!headshotBase64) {
      return NextResponse.json({ error: 'Headshot image required' }, { status: 400 });
    }

    console.log('Converting headshot to file...');
    const headshotBuffer = base64ToBuffer(headshotBase64);
    const headshotFile = await toFile(headshotBuffer, 'headshot.png', { type: 'image/png' });

    // Use the EDIT API with the actual image as input
    // This should preserve the person while changing the scene
    console.log('Calling images.edit API...');
    
    const editPrompt = `Transform this photo into a professional business scene.

Keep the EXACT same person - same face, same features, same beard, same hair - but place them:
- Sitting at an executive desk in a premium corporate office
- Reviewing documents or having a consultation
- With professional lighting and a modern office background
- Add a second person (client) visible from behind/side

CRITICAL: The person's face, beard, hair, and appearance must remain EXACTLY as shown in the original image. Only change the setting/scene around them.

Style: Professional corporate photography, photorealistic, premium quality.`;

    const imageResponse = await openai.images.edit({
      model: 'gpt-image-2',
      image: headshotFile,
      prompt: editPrompt,
      n: 1,
      size: '1024x1024',
    });

    console.log('Edit API response received');

    let imageUrl = '';
    if (imageResponse.data?.[0]?.b64_json) {
      imageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
    } else if (imageResponse.data?.[0]?.url) {
      imageUrl = imageResponse.data[0].url;
    }

    return NextResponse.json({
      success: true,
      method: 'edit',
      results: [{
        scene: 'Professional Consultation (Edit API)',
        headline: `${name || 'Expert'} - Trusted Advisor`,
        subtext: `${company || 'Professional Services'}`,
        imageUrl,
        success: !!imageUrl,
      }],
    });

  } catch (error: any) {
    console.error('Authority test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate',
      details: error.toString()
    }, { status: 500 });
  }
}
