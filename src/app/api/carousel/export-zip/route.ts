import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export const maxDuration = 120;

interface SlideExport {
  slideNumber: number;
  imageUrl: string; // base64 data URL
  filename?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { slides, projectName } = await request.json() as {
      slides: SlideExport[];
      projectName?: string;
    };

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: 'No slides to export' }, { status: 400 });
    }

    const zip = new JSZip();
    const folderName = projectName || 'carousel';

    for (const slide of slides) {
      if (!slide.imageUrl) continue;

      // Extract base64 data
      let imageData: Buffer;
      
      if (slide.imageUrl.startsWith('data:image/')) {
        const base64 = slide.imageUrl.split(',')[1];
        imageData = Buffer.from(base64, 'base64');
      } else {
        // Fetch from URL
        const response = await fetch(slide.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        imageData = Buffer.from(arrayBuffer);
      }

      const filename = slide.filename || `slide-${String(slide.slideNumber).padStart(2, '0')}.png`;
      zip.file(`${folderName}/${filename}`, imageData);
    }

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // Return as base64 for download
    const base64Zip = zipBuffer.toString('base64');

    return NextResponse.json({
      success: true,
      zipData: base64Zip,
      filename: `${folderName}-${Date.now()}.zip`,
    });

  } catch (error: any) {
    console.error('ZIP export error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to export ZIP'
    }, { status: 500 });
  }
}
