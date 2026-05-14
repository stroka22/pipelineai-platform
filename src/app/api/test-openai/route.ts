import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const data = await response.json();
    
    // Filter for image-related models
    const imageModels = data.data?.filter((m: any) => 
      m.id.includes('dall') || 
      m.id.includes('image') || 
      m.id.includes('gpt-image')
    ) || [];

    return NextResponse.json({
      hasKey: !!process.env.OPENAI_API_KEY,
      keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
      imageModels: imageModels.map((m: any) => m.id),
      allModelsCount: data.data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
