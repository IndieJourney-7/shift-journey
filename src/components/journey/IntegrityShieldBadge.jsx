import React from 'react';

/**
 * Integrity Shield Badge Component
 *
 * SVG badges with white glow effect for 3 integrity tiers:
 * - 0-30: "Unreliable" - Cracked dark shield with subtle glow
 * - 31-70: "Inconsistent" - Half silver/dark shield with glow
 * - 71-100: "Reliable" - Golden shield with bright white/gold glow
 */

const getIntegrityLevel = (score) => {
  if (score <= 30) {
    return {
      label: 'Unreliable',
      description: 'Integrity needs rebuilding',
    };
  }
  if (score <= 70) {
    return {
      label: 'Inconsistent',
      description: 'Building consistency',
    };
  }
  return {
    label: 'Reliable',
    description: 'Strong integrity maintained',
  };
};

// UNRELIABLE: Cracked Dark Shield (0-30) with subtle white glow
const ShieldCracked = ({ className }) => (
  <svg viewBox="0 0 64 76" fill="none" className={className}>
    <defs>
      <linearGradient id="crackedShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4a4a4a" />
        <stop offset="50%" stopColor="#3a3a3a" />
        <stop offset="100%" stopColor="#2a2a2a" />
      </linearGradient>
      <filter id="crackedGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feFlood floodColor="#ffffff" floodOpacity="0.15"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="crackedShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.6"/>
      </filter>
    </defs>
    {/* Shield base with glow */}
    <g filter="url(#crackedGlow)">
      <path
        d="M32 4L6 14V34C6 52.778 17.574 67.666 32 74C46.426 67.666 58 52.778 58 34V14L32 4Z"
        fill="url(#crackedShieldGrad)"
        filter="url(#crackedShadow)"
      />
    </g>
    {/* Shield border */}
    <path
      d="M32 4L6 14V34C6 52.778 17.574 67.666 32 74C46.426 67.666 58 52.778 58 34V14L32 4Z"
      stroke="#5a5a5a"
      strokeWidth="2"
      fill="none"
    />
    {/* Main crack */}
    <path
      d="M32 12 L28 28 L35 38 L30 52 L32 68"
      stroke="#1a1a1a"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Branch cracks */}
    <path d="M28 28 L18 32" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    <path d="M35 38 L46 42" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 52 L20 56" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// INCONSISTENT: Half Silver/Dark Shield (31-70) with white glow
const ShieldHalf = ({ className }) => (
  <svg viewBox="0 0 64 76" fill="none" className={className}>
    <defs>
      <linearGradient id="halfSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e0e0e0" />
        <stop offset="30%" stopColor="#f5f5f5" />
        <stop offset="70%" stopColor="#c0c0c0" />
        <stop offset="100%" stopColor="#a0a0a0" />
      </linearGradient>
      <linearGradient id="halfDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4a4a4a" />
        <stop offset="100%" stopColor="#2a2a2a" />
      </linearGradient>
      <clipPath id="leftHalfClip">
        <rect x="0" y="0" width="32" height="80" />
      </clipPath>
      <clipPath id="rightHalfClip">
        <rect x="32" y="0" width="32" height="80" />
      </clipPath>
      <filter id="halfGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feFlood floodColor="#ffffff" floodOpacity="0.25"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="halfShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
      </filter>
    </defs>
    <g filter="url(#halfGlow)">
      {/* Dark half (left) */}
      <g clipPath="url(#leftHalfClip)">
        <path
          d="M32 4L6 14V34C6 52.778 17.574 67.666 32 74C46.426 67.666 58 52.778 58 34V14L32 4Z"
          fill="url(#halfDarkGrad)"
          filter="url(#halfShadow)"
        />
      </g>
      {/* Silver half (right) */}
      <g clipPath="url(#rightHalfClip)">
        <path
          d="M32 4L6 14V34C6 52.778 17.574 67.666 32 74C46.426 67.666 58 52.778 58 34V14L32 4Z"
          fill="url(#halfSilverGrad)"
          filter="url(#halfShadow)"
        />
      </g>
    </g>
    {/* Shield border */}
    <path
      d="M32 4L6 14V34C6 52.778 17.574 67.666 32 74C46.426 67.666 58 52.778 58 34V14L32 4Z"
      stroke="#808080"
      strokeWidth="2"
      fill="none"
    />
    {/* Center divider */}
    <path d="M32 4 L32 74" stroke="#606060" strokeWidth="1" />
    {/* Shine on silver half */}
    <path
      d="M42 14 L52 20 L52 36"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

// RELIABLE: Golden Shield (71-100) with bright white/gold glow
const ShieldGold = ({ className }) => (
  <svg viewBox="0 0 64 76" fill="none" className={className}>
    <defs>
      <linearGradient id="goldShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="20%" stopColor="#ffec8b" />
        <stop offset="40%" stopColor="#fff8dc" />
        <stop offset="60%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#b8860b" />
      </linearGradient>
      <linearGradient id="goldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#daa520" />
        <stop offset="50%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#b8860b" />
      </linearGradient>
      <radialGradient id="goldShine" cx="30%" cy="25%" r="50%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
        <stop offset="40%" stopColor="rgba(255,255,255,0.3)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      {/* Main white/gold glow */}
      <filter id="goldGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feFlood floodColor="#ffffff" floodOpacity="0.7"/>
        <feComposite in2="blur" operator="in" result="whiteGlow"/>
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2"/>
        <feFlood floodColor="#ffd700" floodOpacity="0.5"/>
        <feComposite in2="blur2" operator="in" result="goldGlow"/>
        <feMerge>
          <feMergeNode in="whiteGlow"/>
          <feMergeNode in="goldGlow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer glow layer */}
    <g filter="url(#goldGlow)">
      {/* Shield base */}
      <path
        d="M32 4L6 14V34C6 52.778 17.574 67.666 32 74C46.426 67.666 58 52.778 58 34V14L32 4Z"
        fill="url(#goldShieldGrad)"
      />
    </g>
    {/* Inner shine highlight */}
    <path
      d="M32 8L10 16V34C10 50 19 63 32 70C45 63 54 50 54 34V16L32 8Z"
      fill="url(#goldShine)"
    />
    {/* Shield border - gold rim */}
    <path
      d="M32 4L6 14V34C6 52.778 17.574 67.666 32 74C46.426 67.666 58 52.778 58 34V14L32 4Z"
      stroke="url(#goldBorderGrad)"
      strokeWidth="3"
      fill="none"
    />
    {/* Top highlight arc */}
    <path
      d="M14 16 Q32 8 50 16"
      stroke="rgba(255,255,255,0.8)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    {/* Additional shine lines */}
    <path
      d="M20 20 L24 28"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function IntegrityShieldBadge({
  score = 0,
  size = 'md',
  showScore = true,
  showLabel = true,
  showDescription = false,
  className = '',
}) {
  const level = getIntegrityLevel(score);

  const sizeConfig = {
    xs: { shield: 'w-8 h-10', score: 'text-xs', label: 'text-xs', container: 'gap-1.5' },
    sm: { shield: 'w-10 h-12', score: 'text-sm', label: 'text-xs', container: 'gap-2' },
    md: { shield: 'w-14 h-16', score: 'text-lg', label: 'text-sm', container: 'gap-3' },
    lg: { shield: 'w-20 h-24', score: 'text-2xl', label: 'text-base', container: 'gap-4' },
    xl: { shield: 'w-28 h-32', score: 'text-3xl', label: 'text-lg', container: 'gap-5' },
  };

  const config = sizeConfig[size];

  // Get shield component and styles based on level
  const getShieldConfig = () => {
    if (score <= 30) {
      return {
        Shield: ShieldCracked,
        scoreClass: 'text-obsidian-400',
        labelClass: 'text-obsidian-500',
      };
    }
    if (score <= 70) {
      return {
        Shield: ShieldHalf,
        scoreClass: 'text-obsidian-300',
        labelClass: 'text-obsidian-400',
      };
    }
    return {
      Shield: ShieldGold,
      scoreClass: 'text-gold-400',
      labelClass: 'text-gold-500',
    };
  };

  const shieldConfig = getShieldConfig();
  const { Shield } = shieldConfig;

  return (
    <div className={`flex items-center ${config.container} ${className}`}>
      {/* Shield Icon */}
      <div className="relative flex-shrink-0">
        <Shield className={config.shield} />
      </div>

      {/* Score and Label */}
      {(showScore || showLabel) && (
        <div className="flex flex-col">
          {showScore && (
            <span className={`font-bold ${config.score} ${shieldConfig.scoreClass}`}>
              {score} <span className="text-obsidian-600 font-normal text-sm">/ 100</span>
            </span>
          )}
          {showLabel && (
            <span className={`font-medium ${config.label} ${shieldConfig.labelClass}`}>
              {level.label}
            </span>
          )}
          {showDescription && (
            <span className="text-obsidian-500 text-xs mt-0.5">
              {level.description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact inline badge for dashboard/navbar
export function IntegrityBadgeInline({ score = 0, className = '' }) {
  const level = getIntegrityLevel(score);

  const getStyles = () => {
    if (score <= 30) {
      return {
        bg: 'bg-obsidian-800',
        border: 'border-obsidian-600',
        text: 'text-obsidian-400',
      };
    }
    if (score <= 70) {
      return {
        bg: 'bg-obsidian-800',
        border: 'border-obsidian-500',
        text: 'text-obsidian-300',
      };
    }
    return {
      bg: 'bg-obsidian-800/80',
      border: 'border-gold-500/30',
      text: 'text-gold-400',
    };
  };

  const styles = getStyles();
  const Shield = score <= 30 ? ShieldCracked : score <= 70 ? ShieldHalf : ShieldGold;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md border
        ${styles.bg} ${styles.border} ${className}
      `}
    >
      <Shield className="w-5 h-6" />
      <span className={`text-xs font-medium ${styles.text}`}>
        {score}
      </span>
    </div>
  );
}

// Export utility function for use in other components
export { getIntegrityLevel };
