import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { generateSlideHTML } from '@/lib/carousel-templates';
import { BrandProfile, SlideData } from '@/lib/carousel-templates/types';

export const maxDuration = 60;

// Chromium executable path for different environments
async function getBrowser() {
  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  if (isVercel) {
    const executablePath = await chromium.executablePath(
      'https://github.com/AlteredCarbonBucket/chromium/raw/refs/heads/main/chromium-v148.0.0-pack.tar'
    );
    
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1080, height: 1080 },
      executablePath,
      headless: true,
    });
  } else {
    // Local development - use system Chrome
    const possiblePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    ];
    
    let executablePath;
    for (const p of possiblePaths) {
      try {
        const fs = await import('fs');
        if (fs.existsSync(p)) {
          executablePath = p;
          break;
        }
      } catch {}
    }

    return puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1080, height: 1080 },
      executablePath,
      headless: true,
    });
  }
}

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { slide, brand, layoutFamily, backgroundUrl } = await request.json() as {
      slide: SlideData;
      brand: BrandProfile;
      layoutFamily: string;
      backgroundUrl?: string;
    };

    if (!slide || !brand) {
      return NextResponse.json({ error: 'Slide and brand data required' }, { status: 400 });
    }

    // Generate the HTML for this slide
    const html = generateSlideHTML(layoutFamily || 'corporate-authority', slide, brand, backgroundUrl);

    // Launch browser and render
    browser = await getBrowser();
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(html, { waitUntil: 'load' });
    
    // Wait for images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // Don't fail on missing images
          }))
      );
    });

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    });

    await browser.close();

    // Return as base64
    const base64 = Buffer.from(screenshot).toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      slideNumber: slide.slideNumber,
    });

  } catch (error: any) {
    console.error('Render error:', error);
    if (browser) {
      try { await browser.close(); } catch {}
    }
    return NextResponse.json({ 
      error: error.message || 'Failed to render slide'
    }, { status: 500 });
  }
}
