// Corporate Authority Layout Family
// Premium corporate design with strong visual hierarchy

import { BrandProfile, SlideData } from './types';

export function generateSlideHTML(
  slide: SlideData,
  brand: BrandProfile,
  backgroundUrl?: string
): string {
  const {
    slideNumber,
    slideType,
    headline,
    subheadline,
    bodyText,
    bulletPoints,
    cta,
    stats,
    includeHeadshot,
    includeLogo,
    includeContactBar,
  } = slide;

  const {
    company_name,
    person_name,
    title,
    phone,
    email,
    website,
    logo_url,
    headshot_url,
    primary_color,
    secondary_color,
    accent_color,
  } = brand;

  const isLastSlide = includeContactBar;

  // Base styles
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body { 
      font-family: 'Inter', Arial, sans-serif;
      width: 1080px;
      height: 1080px;
      overflow: hidden;
    }
  `;

  // Common layout elements
  const slideNumberBadge = `
    <div style="
      position: absolute;
      top: 30px;
      right: 30px;
      background: ${primary_color};
      color: white;
      font-size: 24px;
      font-weight: 800;
      padding: 15px 20px 25px 20px;
      clip-path: polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%);
    ">${String(slideNumber).padStart(2, '0')}</div>
  `;

  const logoElement = includeLogo && logo_url ? `
    <div style="position: absolute; top: 30px; left: 40px;">
      <img src="${logo_url}" style="height: 80px; width: auto; max-width: 200px; object-fit: contain;" />
    </div>
  ` : '';

  const headshotElement = includeHeadshot && headshot_url ? `
    <div style="
      position: absolute;
      ${isLastSlide ? 'bottom: 180px; left: 50px;' : 'top: 50%; right: 50px; transform: translateY(-50%);'}
    ">
      <img src="${headshot_url}" style="
        width: ${isLastSlide ? '130px' : '320px'};
        height: ${isLastSlide ? '130px' : '400px'};
        object-fit: cover;
        border-radius: ${isLastSlide ? '50%' : '20px'};
        border: 4px solid white;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      " />
    </div>
  ` : '';

  const contactBar = isLastSlide ? `
    <div style="
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 160px;
      background: ${primary_color};
      display: flex;
      align-items: center;
      padding: 0 200px 0 50px;
    ">
      ${headshot_url ? `
        <img src="${headshot_url}" style="
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          margin-right: 25px;
        " />
      ` : ''}
      <div style="flex: 1; color: white;">
        <div style="font-size: 28px; font-weight: 700;">${person_name || company_name}</div>
        ${title ? `<div style="font-size: 18px; opacity: 0.9; margin-top: 2px;">${title}</div>` : ''}
        <div style="display: flex; gap: 30px; margin-top: 12px; font-size: 18px;">
          ${phone ? `<span>📞 ${phone}</span>` : ''}
          ${website ? `<span>🌐 ${website.replace(/^https?:\/\//, '')}</span>` : ''}
        </div>
      </div>
      ${logo_url ? `
        <img src="${logo_url}" style="height: 100px; width: auto; max-width: 180px; object-fit: contain;" />
      ` : ''}
    </div>
  ` : '';

  // Content area (left side for text)
  const contentWidth = includeHeadshot && !isLastSlide ? '580px' : '800px';
  
  const headlineHTML = `
    <h1 style="
      font-size: ${headline.length > 40 ? '48px' : '56px'};
      font-weight: 800;
      color: ${primary_color};
      line-height: 1.1;
      text-transform: uppercase;
      margin-bottom: 20px;
    ">${headline}</h1>
  `;

  const accentLine = `
    <div style="width: 60px; height: 5px; background: ${secondary_color}; margin: 20px 0;"></div>
  `;

  const subheadlineHTML = subheadline ? `
    <p style="font-size: 24px; color: ${secondary_color}; font-style: italic; margin-bottom: 15px;">${subheadline}</p>
  ` : '';

  const bodyTextHTML = bodyText ? `
    <p style="font-size: 20px; color: #444; line-height: 1.6; max-width: 500px;">${bodyText}</p>
  ` : '';

  const bulletPointsHTML = bulletPoints && bulletPoints.length > 0 ? `
    <ul style="list-style: none; margin-top: 20px;">
      ${bulletPoints.map(point => `
        <li style="
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 15px;
          font-size: 18px;
          color: #333;
        ">
          <span style="
            width: 28px;
            height: 28px;
            background: ${accent_color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">✓</span>
          ${point}
        </li>
      `).join('')}
    </ul>
  ` : '';

  const statsHTML = stats && stats.length > 0 ? `
    <div style="display: flex; gap: 30px; margin-top: 30px;">
      ${stats.map(stat => `
        <div style="text-align: center;">
          <div style="font-size: 42px; font-weight: 800; color: ${primary_color};">${stat.value}</div>
          <div style="font-size: 14px; color: #666; text-transform: uppercase;">${stat.label}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const ctaHTML = cta ? `
    <div style="
      margin-top: 30px;
      background: ${primary_color};
      color: white;
      padding: 18px 35px;
      font-size: 20px;
      font-weight: 700;
      border-radius: 12px;
      display: inline-block;
    ">${cta}</div>
  ` : '';

  // Assemble the full HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div style="
        width: 1080px;
        height: 1080px;
        position: relative;
        background: ${backgroundUrl ? `url('${backgroundUrl}') center/cover` : '#f8f9fa'};
        overflow: hidden;
      ">
        <!-- Gradient overlay for text readability -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 65%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 70%, rgba(255,255,255,0) 100%);
        "></div>

        ${slideNumberBadge}
        ${logoElement}
        
        <!-- Main content area -->
        <div style="
          position: absolute;
          top: 130px;
          left: 50px;
          width: ${contentWidth};
          ${isLastSlide ? 'bottom: 180px;' : 'bottom: 50px;'}
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          ${headlineHTML}
          ${accentLine}
          ${subheadlineHTML}
          ${bodyTextHTML}
          ${bulletPointsHTML}
          ${statsHTML}
          ${!isLastSlide ? ctaHTML : ''}
        </div>

        ${!isLastSlide ? headshotElement : ''}
        ${contactBar}
      </div>
    </body>
    </html>
  `;
}

// Generate background prompt for this layout family
export function generateBackgroundPrompt(
  slideType: string,
  brand: BrandProfile,
  slideContent: string
): string {
  const { primary_color, secondary_color, industry } = brand;
  
  const basePrompt = `Create a premium corporate background image for a ${industry || 'business'} carousel slide.

STYLE:
- Premium, sophisticated, high-end corporate aesthetic
- Colors: Use ${primary_color} and ${secondary_color} as accents
- Clean, elegant, professional
- Subtle gradients and soft lighting
- Modern business environment feel

COMPOSITION:
- Leave the LEFT 60% relatively clean/empty for text overlay
- Visual interest on the RIGHT side
- NO faces, people, or portraits
- NO logos or text
- NO generic stock photo feel

VISUAL ELEMENTS FOR THIS SLIDE TYPE (${slideType}):`;

  const slideTypePrompts: Record<string, string> = {
    hook: '- Impressive cityscape or modern architecture\n- Upward momentum, success imagery\n- Subtle charts or growth indicators',
    benefits: '- Abstract success/growth visuals\n- Professional workspace elements\n- Subtle icons or infographic elements',
    stats: '- Data visualization aesthetic\n- Clean geometric shapes\n- Modern dashboard feel',
    services: '- Professional service imagery\n- Modern office or consultation setting\n- Trust and expertise visual cues',
    experience: '- Timeline or journey visual\n- Professional achievement imagery\n- Sophisticated milestone markers',
    trust: '- Handshake or partnership imagery (no actual hands)\n- Security and stability symbols\n- Professional certifications aesthetic',
    cta: '- Forward momentum, opportunity imagery\n- Door opening or path forward\n- Invitation and welcome aesthetic',
  };

  return `${basePrompt}
${slideTypePrompts[slideType] || slideTypePrompts.benefits}

FORMAT: 1080x1080 square, social media optimized
CRITICAL: This is a BACKGROUND only. Real photos and text will be overlaid.`;
}
