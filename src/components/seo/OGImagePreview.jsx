import React from 'react';
import { Lock, Check, AlertTriangle } from 'lucide-react';

/**
 * OGImagePreview - Visual preview component for OG images
 *
 * This component renders what the OG image should look like.
 * For actual OG image generation, you would:
 *
 * 1. Server-side: Use a service like Vercel OG (@vercel/og) or
 *    a headless browser (Puppeteer) to screenshot this component
 *
 * 2. Static: Pre-generate images for each milestone state
 *
 * 3. Third-party: Use services like Cloudinary, imgix, or
 *    og-image.vercel.app with URL parameters
 *
 * Recommended OG Image Size: 1200x630 pixels (1.91:1 ratio)
 */

const getStatusConfig = (status) => {
  switch (status) {
    case 'completed':
      return { icon: Check, label: 'KEPT', color: '#6b7280' };
    case 'broken':
      return { icon: AlertTriangle, label: 'BROKEN', color: '#6b7280' };
    default:
      return { icon: Lock, label: 'LOCKED', color: '#e5e5e5' };
  }
};

const getIntegrityLabel = (score) => {
  if (score > 70) return 'Reliable';
  if (score > 30) return 'Inconsistent';
  return 'Unreliable';
};

export default function OGImagePreview({
  userName = 'User',
  milestoneTitle = 'Milestone',
  timeRemaining = { hours: 0, minutes: 0 },
  integrityScore = 50,
  status = 'locked',
}) {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const formatTime = () => {
    if (timeRemaining.expired) return 'EXPIRED';
    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}D`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}H`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}M`);
    return parts.join(' ') || '< 1M';
  };

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #1a1a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#e5e5e5',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header - Logo and branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #c9a962',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1a1a1a',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 32 32">
              <path d="M10 18 Q16 10 22 18" stroke="#c9a962" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="12" r="2.5" fill="#c9a962" />
            </svg>
          </div>
          <span style={{ color: '#737373', fontSize: '18px', fontWeight: 500 }}>
            Shift Ascent
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* User name */}
          <div style={{ color: '#737373', fontSize: '24px', marginBottom: '16px' }}>
            {userName}
          </div>

          {/* Milestone title */}
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#e5e5e5',
              margin: '0 0 32px 0',
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {milestoneTitle}
          </h1>

          {/* Status and metrics row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {/* Status badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            >
              <StatusIcon size={20} color={statusConfig.color} />
              <span style={{ fontSize: '18px', fontWeight: 600, color: statusConfig.color }}>
                {statusConfig.label}
              </span>
            </div>

            {/* Time remaining */}
            {status === 'locked' && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'monospace', color: '#e5e5e5' }}>
                  {formatTime()}
                </span>
                <span style={{ fontSize: '16px', color: '#737373' }}>remaining</span>
              </div>
            )}

            {/* Integrity score */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '36px', fontWeight: 700, color: '#a3a3a3' }}>
                {integrityScore}
              </span>
              <span style={{ fontSize: '16px', color: '#737373' }}>
                {getIntegrityLabel(integrityScore)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ color: '#525252', fontSize: '16px' }}>
          Public commitment page
        </div>
      </div>
    </div>
  );
}

/**
 * Generate OG image URL using a third-party service
 * This is a template for services like Cloudinary or og-image.vercel.app
 */
export function generateOGImageUrl({
  userName,
  milestoneTitle,
  timeRemaining,
  integrityScore,
  status,
  baseUrl = 'https://your-og-image-service.com',
}) {
  const params = new URLSearchParams({
    user: userName,
    title: milestoneTitle,
    time: formatTimeForUrl(timeRemaining),
    integrity: integrityScore.toString(),
    status,
  });

  return `${baseUrl}/api/og?${params.toString()}`;
}

function formatTimeForUrl(time) {
  if (!time || time.expired) return 'expired';
  const parts = [];
  if (time.days > 0) parts.push(`${time.days}d`);
  if (time.hours > 0) parts.push(`${time.hours}h`);
  if (time.minutes > 0) parts.push(`${time.minutes}m`);
  return parts.join('') || '0m';
}
