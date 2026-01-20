import { useEffect } from 'react';

/**
 * OpenGraphMeta - Dynamic OG meta tags for shareable pages
 *
 * OG Image recommended size: 1200x630 pixels
 *
 * For SPAs like this React app, OG tags need server-side rendering
 * or a pre-rendering service for social crawlers. This component
 * updates the DOM directly for browser display and can be used
 * with a pre-rendering service like:
 * - Prerender.io
 * - Rendertron
 * - Next.js (if migrating)
 */

export default function OpenGraphMeta({
  title,
  description,
  url,
  image,
  type = 'website',
  siteName = 'Shift Ascent',
}) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | ${siteName}`;
    }

    // Helper to set or create meta tag
    const setMetaTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Set OG meta tags
    if (title) setMetaTag('og:title', title);
    if (description) setMetaTag('og:description', description);
    if (type) setMetaTag('og:type', type);
    if (url) setMetaTag('og:url', url);
    if (image) setMetaTag('og:image', image);
    if (siteName) setMetaTag('og:site_name', siteName);

    // Twitter Card tags (for Twitter/X sharing)
    setMetaTag('twitter:card', 'summary_large_image');
    if (title) setMetaTag('twitter:title', title);
    if (description) setMetaTag('twitter:description', description);
    if (image) setMetaTag('twitter:image', image);

    // Cleanup on unmount
    return () => {
      document.title = siteName;
    };
  }, [title, description, url, image, type, siteName]);

  return null; // This component only manages meta tags
}

/**
 * Generate OG description for a milestone
 */
export function generateOGDescription({ timeRemaining, integrityScore, status }) {
  const getStatusLabel = (score) => {
    if (score > 70) return 'Reliable';
    if (score > 30) return 'Inconsistent';
    return 'Unreliable';
  };

  const formatTimeRemaining = (time) => {
    if (!time || time.expired) return 'Deadline passed';

    const parts = [];
    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);

    return parts.length > 0 ? `${parts.join(' ')} remaining` : 'Less than a minute';
  };

  const statusText = status === 'locked' ? 'Promise is locked' :
                     status === 'completed' ? 'Promise kept' : 'Promise broken';

  return `${statusText}. ${formatTimeRemaining(timeRemaining)}. Integrity: ${integrityScore} (${getStatusLabel(integrityScore)}).`;
}

/**
 * Generate OG title for a milestone
 */
export function generateOGTitle(userName, milestoneTitle) {
  // Truncate if too long (OG title should be ~60 chars)
  const maxLength = 60;
  const fullTitle = `${userName} — ${milestoneTitle}`;

  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }

  // Truncate milestone title
  const availableLength = maxLength - userName.length - 4; // 4 for " — " and "…"
  return `${userName} — ${milestoneTitle.substring(0, availableLength)}…`;
}
