/**
 * Badge & Integrity Tier Definitions for Shift Ascent
 *
 * Single source of truth for all tier thresholds, colors, and visuals.
 * 3-tier system: Unreliable → Inconsistent → Reliable
 *
 * Philosophy: "Your word is your identity. This badge proves it."
 */

// =====================================================
// INTEGRITY TIERS (3-tier system)
// =====================================================

export const INTEGRITY_TIERS = {
  UNRELIABLE: {
    id: 'unreliable',
    name: 'Unreliable',
    minScore: 0,
    maxScore: 30,
    tagline: 'Your word needs rebuilding',
    description: 'Keep promises consistently to restore trust and climb back up.',
    color: {
      primary: '#6b7280',
      secondary: '#4b5563',
      glow: 'rgba(107, 114, 128, 0.2)',
      bg: 'from-gray-600/20 to-slate-600/20',
      border: 'border-gray-500',
      text: 'text-gray-400',
    },
    visual: 'cracked-shield',
    shieldType: 'cracked',
  },

  INCONSISTENT: {
    id: 'inconsistent',
    name: 'Inconsistent',
    minScore: 31,
    maxScore: 70,
    tagline: 'Building consistency',
    description: 'Your word is gaining weight. Stay the course to become reliable.',
    color: {
      primary: '#9ca3af',
      secondary: '#d1d5db',
      glow: 'rgba(255, 255, 255, 0.25)',
      bg: 'from-slate-400/20 to-gray-400/20',
      border: 'border-slate-400',
      text: 'text-slate-300',
    },
    visual: 'half-shield',
    shieldType: 'half',
  },

  RELIABLE: {
    id: 'reliable',
    name: 'Reliable',
    minScore: 71,
    maxScore: 100,
    tagline: 'Your word is your bond',
    description: 'People can count on you. Your promises carry real weight.',
    color: {
      primary: '#ffd700',
      secondary: '#b8860b',
      glow: 'rgba(255, 215, 0, 0.4)',
      bg: 'from-amber-500/20 to-yellow-500/20',
      border: 'border-amber-400',
      text: 'text-amber-300',
    },
    visual: 'gold-shield',
    shieldType: 'gold',
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get the integrity tier for a given score
 */
export function getIntegrityTier(score) {
  if (score >= INTEGRITY_TIERS.RELIABLE.minScore) return INTEGRITY_TIERS.RELIABLE;
  if (score >= INTEGRITY_TIERS.INCONSISTENT.minScore) return INTEGRITY_TIERS.INCONSISTENT;
  return INTEGRITY_TIERS.UNRELIABLE;
}

/**
 * Get tier name from score (simple string)
 */
export function getTierName(score) {
  return getIntegrityTier(score).name;
}

/**
 * Get the next tier above current score (null if already at top)
 */
export function getNextTier(score) {
  if (score >= INTEGRITY_TIERS.RELIABLE.minScore) return null;
  if (score >= INTEGRITY_TIERS.INCONSISTENT.minScore) return INTEGRITY_TIERS.RELIABLE;
  return INTEGRITY_TIERS.INCONSISTENT;
}

/**
 * Calculate promises needed to reach next tier
 * Based on +2 per kept promise
 */
export function getPromisesToNextTier(score) {
  const nextTier = getNextTier(score);
  if (!nextTier) return 0;
  const pointsNeeded = nextTier.minScore - score;
  return Math.ceil(pointsNeeded / 2);
}

/**
 * Get tier progress percentage within current tier
 */
export function getTierProgress(score) {
  const tier = getIntegrityTier(score);
  const tierRange = tier.maxScore - tier.minScore;
  if (tierRange === 0) return 100;
  const progress = score - tier.minScore;
  return Math.min(100, Math.round((progress / tierRange) * 100));
}

/**
 * Get all tiers as an array (sorted by score descending)
 */
export function getAllTiers() {
  return Object.values(INTEGRITY_TIERS).sort((a, b) => b.minScore - a.minScore);
}

/**
 * Check if score crosses a tier boundary compared to previous score
 * Returns { changed, direction, newTier, oldTier }
 */
export function detectTierChange(previousScore, newScore) {
  const oldTier = getIntegrityTier(previousScore);
  const newTier = getIntegrityTier(newScore);

  if (oldTier.id === newTier.id) {
    return { changed: false, direction: null, newTier: null, oldTier: null };
  }

  return {
    changed: true,
    direction: newScore > previousScore ? 'up' : 'down',
    newTier,
    oldTier,
  };
}
