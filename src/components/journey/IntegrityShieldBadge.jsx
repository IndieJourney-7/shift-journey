import React from 'react';

/**
 * Integrity Shield Badge Component
 *
 * Displays user's integrity score with a shield-style badge.
 * Status is derived automatically from score:
 * - 0-30: "Unreliable" (cracked shield, dull gray)
 * - 31-70: "Inconsistent" (half-solid shield, muted gray)
 * - 71-100: "Reliable" (solid shield, subtle gold outline, soft glow)
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

// Shield SVG paths for different states
const ShieldSolid = ({ className }) => (
  <svg viewBox="0 0 24 28" fill="none" className={className}>
    <path
      d="M12 1L2 5V12C2 18.627 6.373 24.502 12 27C17.627 24.502 22 18.627 22 12V5L12 1Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldHalf = ({ className }) => (
  <svg viewBox="0 0 24 28" fill="none" className={className}>
    <defs>
      <linearGradient id="halfShield" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    <path
      d="M12 1L2 5V12C2 18.627 6.373 24.502 12 27C17.627 24.502 22 18.627 22 12V5L12 1Z"
      fill="url(#halfShield)"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.5"
    />
    {/* Half-filled inner shield */}
    <path
      d="M12 4L5 7V12C5 16.5 8 21 12 23V4Z"
      fill="currentColor"
      fillOpacity="0.5"
    />
  </svg>
);

const ShieldCracked = ({ className }) => (
  <svg viewBox="0 0 24 28" fill="none" className={className}>
    <path
      d="M12 1L2 5V12C2 18.627 6.373 24.502 12 27C17.627 24.502 22 18.627 22 12V5L12 1Z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.4"
    />
    {/* Crack lines */}
    <path
      d="M12 5L10 10L13 13L11 18L12 23"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.6"
    />
    <path
      d="M10 10L7 11"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeOpacity="0.4"
    />
    <path
      d="M13 13L17 14"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeOpacity="0.4"
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
    xs: { shield: 'w-4 h-5', score: 'text-xs', label: 'text-xs', container: 'gap-1' },
    sm: { shield: 'w-5 h-6', score: 'text-sm', label: 'text-xs', container: 'gap-1.5' },
    md: { shield: 'w-8 h-10', score: 'text-lg', label: 'text-sm', container: 'gap-2' },
    lg: { shield: 'w-12 h-14', score: 'text-2xl', label: 'text-base', container: 'gap-3' },
    xl: { shield: 'w-16 h-20', score: 'text-3xl', label: 'text-lg', container: 'gap-4' },
  };

  const config = sizeConfig[size];

  // Get shield component and styles based on level
  const getShieldConfig = () => {
    if (score <= 30) {
      return {
        Shield: ShieldCracked,
        shieldClass: 'text-obsidian-500',
        scoreClass: 'text-obsidian-400',
        labelClass: 'text-obsidian-400',
        containerClass: '',
      };
    }
    if (score <= 70) {
      return {
        Shield: ShieldHalf,
        shieldClass: 'text-obsidian-400',
        scoreClass: 'text-obsidian-300',
        labelClass: 'text-obsidian-400',
        containerClass: '',
      };
    }
    return {
      Shield: ShieldSolid,
      shieldClass: 'text-obsidian-200',
      scoreClass: 'text-obsidian-100',
      labelClass: 'text-obsidian-300',
      containerClass: 'shield-reliable',
    };
  };

  const shieldConfig = getShieldConfig();
  const { Shield } = shieldConfig;

  return (
    <div className={`flex items-center ${config.container} ${className}`}>
      {/* Shield Icon */}
      <div className={`relative ${shieldConfig.containerClass}`}>
        <Shield className={`${config.shield} ${shieldConfig.shieldClass}`} />
        {/* Subtle glow for Reliable status only */}
        {score > 70 && (
          <div
            className="absolute inset-0 blur-sm opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(201, 169, 98, 0.3) 0%, transparent 70%)',
            }}
          />
        )}
      </div>

      {/* Score and Label */}
      {(showScore || showLabel) && (
        <div className="flex flex-col">
          {showScore && (
            <span className={`font-medium ${config.score} ${shieldConfig.scoreClass}`}>
              {score} <span className="text-obsidian-600 font-normal">/ 100</span>
            </span>
          )}
          {showLabel && (
            <span className={`${config.label} ${shieldConfig.labelClass}`}>
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
      bg: 'bg-obsidian-800',
      border: 'border-obsidian-400/50',
      text: 'text-obsidian-200',
    };
  };

  const styles = getStyles();
  const Shield = score <= 30 ? ShieldCracked : score <= 70 ? ShieldHalf : ShieldSolid;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md border
        ${styles.bg} ${styles.border} ${className}
      `}
    >
      <Shield className={`w-3.5 h-4 ${styles.text}`} />
      <span className={`text-xs font-medium ${styles.text}`}>
        {score}
      </span>
    </div>
  );
}

// Export utility function for use in other components
export { getIntegrityLevel };
