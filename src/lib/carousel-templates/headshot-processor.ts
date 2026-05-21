// Headshot Processor - Apply visual effects while preserving the real image
// CRITICAL: Never regenerate or modify the actual face/person - only enhance around it

import sharp from 'sharp';
import { HeadshotLayout } from './types';

interface ProcessedHeadshot {
  buffer: Buffer;
  width: number;
  height: number;
}

// Size mappings (for 1080x1080 canvas)
const SIZE_MAP: Record<string, { width: number; height: number }> = {
  thumbnail: { width: 100, height: 100 },
  small: { width: 150, height: 180 },
  medium: { width: 280, height: 350 },
  large: { width: 380, height: 480 },
  hero: { width: 500, height: 620 },
};

/**
 * Process a headshot image with the specified layout options
 * Preserves the actual face/person - only applies framing, shadows, shapes
 */
export async function processHeadshot(
  imageBuffer: Buffer,
  layout: HeadshotLayout,
  brandColors: { primary: string; secondary: string; accent: string }
): Promise<ProcessedHeadshot> {
  const size = SIZE_MAP[layout.size] || SIZE_MAP.medium;
  
  // Start with resizing to target dimensions
  const processed = sharp(imageBuffer)
    .resize(size.width, size.height, { fit: 'cover', position: 'top' });

  // Get the resized buffer for further processing
  let buffer = await processed.png().toBuffer();
  
  // Apply shape mask
  buffer = await applyShapeMask(buffer, size.width, size.height, layout.shape);
  
  // Apply style effects (border, shadow, glow)
  buffer = await applyStyleEffects(buffer, size.width, size.height, layout, brandColors);
  
  // Get final dimensions (may have changed due to effects)
  const metadata = await sharp(buffer).metadata();
  
  return {
    buffer,
    width: metadata.width || size.width,
    height: metadata.height || size.height,
  };
}

/**
 * Apply shape mask to create different headshot shapes
 */
async function applyShapeMask(
  buffer: Buffer,
  width: number,
  height: number,
  shape: string
): Promise<Buffer> {
  let maskSvg: string;
  
  switch (shape) {
    case 'circle':
      const radius = Math.min(width, height) / 2;
      maskSvg = `<svg width="${width}" height="${height}">
        <circle cx="${width/2}" cy="${height/2}" r="${radius}" fill="white"/>
      </svg>`;
      break;
      
    case 'rounded-rect':
      const cornerRadius = Math.min(width, height) * 0.12;
      maskSvg = `<svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white"/>
      </svg>`;
      break;
      
    case 'hexagon':
      const hx = width / 2;
      const hy = height / 2;
      const hr = Math.min(width, height) / 2;
      maskSvg = `<svg width="${width}" height="${height}">
        <polygon points="${hx},${hy-hr} ${hx+hr*0.866},${hy-hr*0.5} ${hx+hr*0.866},${hy+hr*0.5} ${hx},${hy+hr} ${hx-hr*0.866},${hy+hr*0.5} ${hx-hr*0.866},${hy-hr*0.5}" fill="white"/>
      </svg>`;
      break;
      
    case 'arch':
      maskSvg = `<svg width="${width}" height="${height}">
        <path d="M0,${height} L0,${height*0.4} Q0,0 ${width/2},0 Q${width},0 ${width},${height*0.4} L${width},${height} Z" fill="white"/>
      </svg>`;
      break;
      
    case 'blob':
      maskSvg = `<svg width="${width}" height="${height}">
        <ellipse cx="${width/2}" cy="${height*0.45}" rx="${width*0.48}" ry="${height*0.44}" fill="white"/>
      </svg>`;
      break;
      
    case 'square':
    default:
      // No mask needed for square
      return buffer;
  }
  
  const mask = Buffer.from(maskSvg);
  
  return sharp(buffer)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

/**
 * Apply visual style effects (borders, shadows, glows)
 */
async function applyStyleEffects(
  buffer: Buffer,
  width: number,
  height: number,
  layout: HeadshotLayout,
  brandColors: { primary: string; secondary: string; accent: string }
): Promise<Buffer> {
  const padding = 20; // Extra space for effects
  const borderWidth = layout.style.includes('border') ? 6 : 4;
  const shadowSize = layout.style.includes('dramatic') ? 30 : 15;
  const glowSize = layout.style === 'glow' ? 20 : 0;
  
  // Calculate canvas size
  const canvasWidth = width + padding * 2 + (glowSize * 2);
  const canvasHeight = height + padding * 2 + (glowSize * 2) + (layout.style.includes('shadow') ? shadowSize : 0);
  
  // Create canvas with transparent background
  const canvas = sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });
  
  const composites: sharp.OverlayOptions[] = [];
  
  // Add shadow if needed
  if (layout.style.includes('shadow')) {
    const shadowOffsetX = layout.shadowDirection === 'left' ? -shadowSize/2 : 
                          layout.shadowDirection === 'right' ? shadowSize/2 : 0;
    const shadowOffsetY = shadowSize / 2;
    
    // Create shadow by darkening and blurring the image
    const shadowBuffer = await sharp(buffer)
      .modulate({ brightness: 0 })
      .blur(shadowSize / 2)
      .png()
      .toBuffer();
    
    composites.push({
      input: shadowBuffer,
      top: Math.round(padding + glowSize + shadowOffsetY),
      left: Math.round(padding + glowSize + shadowOffsetX),
    });
  }
  
  // Add glow if needed
  if (layout.style === 'glow') {
    const glowColor = layout.glowColor || brandColors.accent;
    const rgb = hexToRgb(glowColor);
    
    // Create glow by tinting and blurring
    const glowBuffer = await sharp(buffer)
      .tint({ r: rgb.r, g: rgb.g, b: rgb.b })
      .blur(glowSize)
      .png()
      .toBuffer();
    
    composites.push({
      input: glowBuffer,
      top: padding,
      left: padding,
    });
  }
  
  // Add border if needed
  if (layout.style.includes('border') || layout.style === 'framed') {
    const borderColor = layout.borderColor || brandColors.primary;
    const rgb = hexToRgb(borderColor);
    
    // Create border based on shape
    let borderSvg: string;
    
    if (layout.shape === 'circle') {
      const radius = Math.min(width, height) / 2;
      borderSvg = `<svg width="${width + borderWidth*2}" height="${height + borderWidth*2}">
        <circle cx="${width/2 + borderWidth}" cy="${height/2 + borderWidth}" r="${radius + borderWidth/2}" 
          fill="none" stroke="rgb(${rgb.r},${rgb.g},${rgb.b})" stroke-width="${borderWidth}"/>
      </svg>`;
    } else {
      const cornerRadius = layout.shape === 'rounded-rect' ? Math.min(width, height) * 0.12 : 0;
      borderSvg = `<svg width="${width + borderWidth*2}" height="${height + borderWidth*2}">
        <rect x="${borderWidth/2}" y="${borderWidth/2}" width="${width + borderWidth}" height="${height + borderWidth}" 
          rx="${cornerRadius}" ry="${cornerRadius}"
          fill="none" stroke="rgb(${rgb.r},${rgb.g},${rgb.b})" stroke-width="${borderWidth}"/>
      </svg>`;
    }
    
    composites.push({
      input: Buffer.from(borderSvg),
      top: padding + glowSize - borderWidth,
      left: padding + glowSize - borderWidth,
    });
  }
  
  // Add the actual headshot
  composites.push({
    input: buffer,
    top: padding + glowSize,
    left: padding + glowSize,
  });
  
  // Add gradient border overlay for that style
  if (layout.style === 'gradient-border') {
    const gradient = `<svg width="${width + 8}" height="${height + 8}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${brandColors.primary}"/>
          <stop offset="100%" style="stop-color:${brandColors.accent}"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="${width + 4}" height="${height + 4}" rx="16" ry="16"
        fill="none" stroke="url(#grad)" stroke-width="4"/>
    </svg>`;
    
    composites.push({
      input: Buffer.from(gradient),
      top: padding + glowSize - 4,
      left: padding + glowSize - 4,
    });
  }
  
  return canvas
    .composite(composites)
    .png()
    .toBuffer();
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 30, g: 58, b: 95 };
}

/**
 * Get position coordinates for headshot placement on 1080x1080 canvas
 */
export function getHeadshotPosition(
  layout: HeadshotLayout,
  headshotWidth: number,
  headshotHeight: number
): { top: number; left: number } {
  const canvasSize = 1080;
  const margin = 40;
  
  switch (layout.position) {
    case 'left-center':
      return { top: (canvasSize - headshotHeight) / 2, left: margin };
    case 'right-center':
      return { top: (canvasSize - headshotHeight) / 2, left: canvasSize - headshotWidth - margin };
    case 'center':
      return { top: (canvasSize - headshotHeight) / 2, left: (canvasSize - headshotWidth) / 2 };
    case 'left-top':
      return { top: 120, left: margin };
    case 'right-top':
      return { top: 120, left: canvasSize - headshotWidth - margin };
    case 'left-bottom':
      return { top: canvasSize - headshotHeight - margin - 160, left: margin };
    case 'right-bottom':
      return { top: canvasSize - headshotHeight - margin - 160, left: canvasSize - headshotWidth - margin };
    case 'floating-right':
      return { top: 200, left: canvasSize - headshotWidth - 60 };
    case 'floating-left':
      return { top: 200, left: 60 };
    case 'hero-large':
      return { top: 150, left: (canvasSize - headshotWidth) / 2 };
    case 'contact-bar':
      return { top: canvasSize - 150, left: 50 };
    default:
      return { top: (canvasSize - headshotHeight) / 2, left: canvasSize - headshotWidth - margin };
  }
}
