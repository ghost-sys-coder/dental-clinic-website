import { ImageResponse } from 'next/og';
import { getClinic } from '@/lib/useClinic';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  const clinic = getClinic();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0c1445 0%, #0EA5E9 100%)',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo / Clinic name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}>
            🦷
          </div>
          <div style={{ color: 'white', fontSize: '36px', fontWeight: 700 }}>
            {clinic.meta.name}
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '28px',
          textAlign: 'center',
          maxWidth: '800px',
          lineHeight: 1.4,
          marginBottom: '40px',
        }}>
          {clinic.meta.tagline}
        </div>

        {/* Location + Rating */}
        <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
          <div style={{ color: 'white', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 {clinic.meta.city}, {clinic.meta.region}
          </div>
          <div style={{ color: '#FFD700', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⭐ {clinic.meta.googleRating} ({clinic.meta.reviewCount} reviews)
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
