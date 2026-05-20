import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

// Slide component
function SlideTemplate({
  slideNumber,
  totalSlides,
  assets,
  slideStrategy,
}: {
  slideNumber: number;
  totalSlides: number;
  assets: any;
  slideStrategy: any;
}) {
  const {
    companyName,
    personName,
    title,
    phone,
    email,
    website,
    primaryColor,
    secondaryColor,
    accentColor,
    headshot,
    logo,
  } = assets;

  const {
    headline,
    subheadline,
    bodyText,
    cta,
    includeHeadshot,
    includeLogo,
  } = slideStrategy;

  const isLastSlide = slideNumber === totalSlides;
  const showContactBar = isLastSlide;

  return (
    <div
      style={{
        width: '1080px',
        height: '1080px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
          display: 'flex',
        }}
      />

      {/* Slide number badge */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: primaryColor,
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            padding: '15px 20px',
            borderRadius: '8px',
            display: 'flex',
          }}
        >
          {String(slideNumber).padStart(2, '0')}
        </div>
      </div>

      {/* Logo top left */}
      {includeLogo && logo && (
        <div
          style={{
            position: 'absolute',
            top: '30px',
            left: '40px',
            display: 'flex',
          }}
        >
          <img
            src={logo}
            style={{
              height: '80px',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          padding: '130px 50px 50px 50px',
        }}
      >
        {/* Text content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: includeHeadshot ? '40px' : '200px',
          }}
        >
          {/* Headline */}
          <div
            style={{
              fontSize: headline.length > 50 ? '42px' : '52px',
              fontWeight: 'bold',
              color: primaryColor,
              lineHeight: 1.1,
              textTransform: 'uppercase',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {headline}
          </div>

          {/* Accent line */}
          <div
            style={{
              width: '60px',
              height: '4px',
              backgroundColor: secondaryColor,
              marginBottom: '20px',
              display: 'flex',
            }}
          />

          {/* Subheadline */}
          {subheadline && (
            <div
              style={{
                fontSize: '22px',
                color: '#333',
                fontStyle: 'italic',
                marginBottom: '15px',
                display: 'flex',
              }}
            >
              {subheadline}
            </div>
          )}

          {/* Body text */}
          <div
            style={{
              fontSize: '20px',
              color: '#555',
              lineHeight: 1.5,
              maxWidth: '500px',
              display: 'flex',
            }}
          >
            {bodyText}
          </div>
        </div>

        {/* Headshot */}
        {includeHeadshot && headshot && (
          <div
            style={{
              width: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={headshot}
              style={{
                width: '320px',
                height: '380px',
                objectFit: 'cover',
                borderRadius: '16px',
                border: `4px solid ${secondaryColor}`,
              }}
            />
          </div>
        )}
      </div>

      {/* Contact bar (last slide) */}
      {showContactBar && (
        <div
          style={{
            height: '140px',
            backgroundColor: primaryColor,
            display: 'flex',
            alignItems: 'center',
            padding: '0 50px',
          }}
        >
          {headshot && (
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50px',
                overflow: 'hidden',
                border: '3px solid white',
                marginRight: '20px',
                display: 'flex',
              }}
            >
              <img
                src={headshot}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex' }}>{personName}</div>
            <div style={{ fontSize: '16px', opacity: 0.9, display: 'flex' }}>{title}</div>
            {phone && <div style={{ fontSize: '18px', marginTop: '5px', display: 'flex' }}>📞 {phone}</div>}
          </div>

          {logo && (
            <img
              src={logo}
              style={{
                height: '80px',
                objectFit: 'contain',
              }}
            />
          )}
        </div>
      )}

      {/* CTA bar (non-last slides) */}
      {!showContactBar && cta && (
        <div
          style={{
            height: '100px',
            backgroundColor: primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 50px',
          }}
        >
          <div style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', display: 'flex' }}>{cta}</div>
          {phone && (
            <div style={{ color: 'white', fontSize: '26px', fontWeight: 'bold', marginLeft: '30px', display: 'flex' }}>
              {phone}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slideNumber, totalSlides, assets, slideStrategy } = body;

    const imageResponse = new ImageResponse(
      <SlideTemplate
        slideNumber={slideNumber}
        totalSlides={totalSlides}
        assets={assets}
        slideStrategy={slideStrategy}
      />,
      {
        width: 1080,
        height: 1080,
      }
    );

    // Convert to base64
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
    });

  } catch (error: any) {
    console.error('Render API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to render slide'
    }, { status: 500 });
  }
}
