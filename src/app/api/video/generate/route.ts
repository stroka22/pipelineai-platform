import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

async function urlToBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    const base64 = url.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64, 'base64');
  }
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadVideoToStorage(buffer: Buffer, filename: string): Promise<string | null> {
  const { error } = await supabase.storage
    .from('Vault')
    .upload(`videos/${filename}`, buffer, {
      contentType: 'video/mp4',
      upsert: true,
    });
  if (error) {
    console.error('Video storage upload error:', error);
    return null;
  }
  const { data } = supabase.storage.from('Vault').getPublicUrl(`videos/${filename}`);
  return data.publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, mode, images, aspectRatio, resolution, enhancePrompt } = await request.json();

    if (!prompt && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'Provide a prompt or images' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // Choose model based on speed vs quality
    const model = mode === 'fast' 
      ? 'veo-3.1-fast-generate-preview'
      : mode === 'lite'
      ? 'veo-3.1-lite-generate-preview'
      : 'veo-3.1-generate-preview';

    console.log(`Generating video with ${model}, aspect: ${aspectRatio || '16:9'}`);

    // Build config
    const config: any = {};
    if (aspectRatio) config.aspectRatio = aspectRatio;
    if (resolution) config.resolution = resolution;
    if (enhancePrompt) config.enhancePrompt = enhancePrompt;

    // Build the request
    const videoRequest: any = {
      model,
      prompt: prompt || 'A professional business video',
      config,
    };

    // Add image input if provided
    if (images && images.length > 0) {
      if (images.length === 1) {
        // Single image - use as starting frame
        const imageBuffer = await urlToBuffer(images[0]);
        videoRequest.image = {
          imageBytes: imageBuffer.toString('base64'),
          mimeType: 'image/png',
        };
      } else if (images.length === 2) {
        // Two images - first and last frame
        const firstBuffer = await urlToBuffer(images[0]);
        const lastBuffer = await urlToBuffer(images[1]);
        videoRequest.firstFrame = {
          imageBytes: firstBuffer.toString('base64'),
          mimeType: 'image/png',
        };
        videoRequest.lastFrame = {
          imageBytes: lastBuffer.toString('base64'),
          mimeType: 'image/png',
        };
      } else {
        // Multiple images - use first as starting frame, others as reference
        const firstBuffer = await urlToBuffer(images[0]);
        videoRequest.image = {
          imageBytes: firstBuffer.toString('base64'),
          mimeType: 'image/png',
        };
        // Up to 3 reference images supported
        const refImages = images.slice(1, 4).map((url: string) => {
          // Will convert below
          return url;
        });
        // Note: reference images need to be loaded
        const refBuffers = await Promise.all(refImages.map((url: string) => urlToBuffer(url)));
        videoRequest.referenceImages = refBuffers.map((buf: Buffer) => ({
          imageBytes: buf.toString('base64'),
          mimeType: 'image/png',
        }));
      }
    }

    // Start generation (async operation)
    let operation = await ai.models.generateVideos(videoRequest);

    // Poll until complete
    const maxWait = 240; // 4 minutes max
    const startTime = Date.now();
    while (!operation.done) {
      if (Date.now() - startTime > maxWait * 1000) {
        return NextResponse.json({ error: 'Video generation timed out' }, { status: 504 });
      }
      console.log('Waiting for video generation...');
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    // Check result
    if (!operation.response?.generatedVideos?.length) {
      return NextResponse.json({ error: 'No video was generated' }, { status: 500 });
    }

    // Get the video
    const generatedVideo = operation.response.generatedVideos[0];
    
    // Download the video
    const videoBuffer = generatedVideo.video?.videoBytes;
    if (!videoBuffer) {
      // Try downloading via URI
      const videoUri = generatedVideo.video?.uri;
      if (videoUri) {
        const downloadResponse = await fetch(videoUri, {
          headers: { 'x-goog-api-key': geminiApiKey },
        });
        const videoArrayBuffer = await downloadResponse.arrayBuffer();
        const buffer = Buffer.from(videoArrayBuffer);
        
        const timestamp = Date.now();
        const filename = `video-${timestamp}.mp4`;
        const storageUrl = await uploadVideoToStorage(buffer, filename);
        
        return NextResponse.json({
          success: true,
          videoUrl: storageUrl,
          filename,
        });
      }
      return NextResponse.json({ error: 'Could not retrieve video data' }, { status: 500 });
    }

    // Upload to Supabase Storage
    const buffer = Buffer.from(videoBuffer, 'base64');
    const timestamp = Date.now();
    const filename = `video-${timestamp}.mp4`;
    const storageUrl = await uploadVideoToStorage(buffer, filename);

    return NextResponse.json({
      success: true,
      videoUrl: storageUrl,
      filename,
    });

  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
