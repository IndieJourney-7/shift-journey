/**
 * Badge Definitions for Shift Ascent
 *
 * Core Philosophy: "Your word is your identity. This badge proves it."
 */

// =====================================================
// INTEGRITY TIER BADGES (Based on Score)
// =====================================================

export const INTEGRITY_TIERS = {
  UNBREAKABLE: {
    id: 'unbreakable',
    name: 'Unbreakable',
    minScore: 90,
    maxScore: 100,
    tagline: 'My word is absolute',
    description: 'You have achieved the highest level of personal integrity. Your promises are unshakeable.',
    color: {
      primary: '#FFD700',      // Gold
      secondary: '#FFA500',    // Orange gold
      glow: 'rgba(255, 215, 0, 0.4)',
      bg: 'from-amber-500/20 to-yellow-500/20',
      border: 'border-amber-400',
      text: 'text-amber-300',
    },
    visual: 'diamond-shield',
    rarity: 'legendary',
  },

  WORD_KEEPER: {
    id: 'word_keeper',
    name: 'Word Keeper',
    minScore: 70,
    maxScore: 89,
    tagline: 'I honor my commitments',
    description: 'You consistently keep your promises. People can rely on your word.',
    color: {
      primary: '#C0C0C0',      // Silver
      secondary: '#A8A8A8',
      glow: 'rgba(192, 192, 192, 0.3)',
      bg: 'from-slate-400/20 to-gray-400/20',
      border: 'border-slate-400',
      text: 'text-slate-300',
    },
    visual: 'solid-shield',
    rarity: 'rare',
  },

  RISING: {
    id: 'rising',
    name: 'Rising',
    minScore: 50,
    maxScore: 69,
    tagline: 'Building my reputation',
    description: 'You are on the path to becoming reliable. Keep pushing forward.',
    color: {
      primary: '#3B82F6',      // Blue
      secondary: '#60A5FA',
      glow: 'rgba(59, 130, 246, 0.3)',
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-400',
      text: 'text-blue-300',
    },
    visual: 'half-shield',
    rarity: 'uncommon',
  },

  REBUILDING: {
    id: 'rebuilding',
    name: 'Rebuilding',
    minScore: 30,
    maxScore: 49,
    tagline: 'Learning from failures',
    description: 'You have stumbled, but you are getting back up. Every kept promise rebuilds trust.',
    color: {
      primary: '#F59E0B',      // Amber
      secondary: '#FBBF24',
      glow: 'rgba(245, 158, 11, 0.2)',
      bg: 'from-amber-600/20 to-orange-500/20',
      border: 'border-amber-500',
      text: 'text-amber-400',
    },
    visual: 'cracked-healing-shield',
    rarity: 'common',
  },

  AWAKENING: {
    id: 'awakening',
    name: 'Awakening',
    minScore: 0,
    maxScore: 29,
    tagline: 'Beginning my journey',
    description: 'The first step is awareness. You are now conscious of your commitments.',
    color: {
      primary: '#6B7280',      // Gray
      secondary: '#9CA3AF',
      glow: 'rgba(107, 114, 128, 0.2)',
      bg: 'from-gray-600/20 to-slate-600/20',
      border: 'border-gray-500',
      text: 'text-gray-400',
    },
    visual: 'dim-shield',
    rarity: 'starter',
  },
};

// =====================================================
// STREAK BADGES (Future Implementation)
// =====================================================

export const STREAK_BADGES = {
  FIRST_STEP: {
    id: 'first_step',
    name: 'First Step',
    streak: 1,
    tagline: 'Everyone starts somewhere',
    icon: 'flame',
  },
  CONSISTENCY: {
    id: 'consistency',
    name: 'Consistency',
    streak: 7,
    tagline: 'A week of keeping your word',
    icon: 'calendar-check',
  },
  MOMENTUM: {
    id: 'momentum',
    name: 'Momentum',
    streak: 30,
    tagline: '30 days of integrity',
    icon: 'fire',
  },
  UNSTOPPABLE: {
    id: 'unstoppable',
    name: 'Unstoppable',
    streak: 90,
    tagline: "90 days - you're the real deal",
    icon: 'lightning',
  },
  LEGENDARY: {
    id: 'legendary',
    name: 'Legendary',
    streak: 365,
    tagline: 'A year of unbroken promises',
    icon: 'crown',
  },
};

// =====================================================
// JOURNEY BADGES (Future Implementation)
// =====================================================

export const JOURNEY_BADGES = {
  FIRST_BLOOD: {
    id: 'first_blood',
    name: 'First Blood',
    trigger: 'first_promise_kept',
    tagline: 'The beginning',
  },
  IRONCLAD: {
    id: 'ironclad',
    name: 'Ironclad',
    trigger: 'ten_promises_kept',
    tagline: 'Building steel',
  },
  CENTURION: {
    id: 'centurion',
    name: 'Centurion',
    trigger: 'hundred_promises_kept',
    tagline: 'The elite',
  },
  DIAMOND_HANDS: {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    trigger: 'fifty_kept_zero_broken',
    tagline: 'Never wavered',
  },
  GOAL_CRUSHER: {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    trigger: 'first_goal_completed',
    tagline: 'Finished what you started',
  },
};

// =====================================================
// REDEMPTION BADGES (Future Implementation)
// =====================================================

export const REDEMPTION_BADGES = {
  PHOENIX: {
    id: 'phoenix',
    name: 'Phoenix',
    trigger: 'score_zero_to_seventy',
    tagline: 'Rose from the ashes',
  },
  COMEBACK: {
    id: 'comeback',
    name: 'Comeback',
    trigger: 'five_broken_then_ten_kept',
    tagline: 'Learned from failure',
  },
  REFORGED: {
    id: 'reforged',
    name: 'Reforged',
    trigger: 'ten_reflections_completed',
    tagline: 'Turned pain into growth',
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get the integrity tier for a given score
 */
export function getIntegrityTier(score) {
  if (score >= 90) return INTEGRITY_TIERS.UNBREAKABLE;
  if (score >= 70) return INTEGRITY_TIERS.WORD_KEEPER;
  if (score >= 50) return INTEGRITY_TIERS.RISING;
  if (score >= 30) return INTEGRITY_TIERS.REBUILDING;
  return INTEGRITY_TIERS.AWAKENING;
}

/**
 * Get the next tier above current score
 */
export function getNextTier(score) {
  if (score >= 90) return null; // Already at max
  if (score >= 70) return INTEGRITY_TIERS.UNBREAKABLE;
  if (score >= 50) return INTEGRITY_TIERS.WORD_KEEPER;
  if (score >= 30) return INTEGRITY_TIERS.RISING;
  return INTEGRITY_TIERS.REBUILDING;
}

/**
 * Calculate promises needed to reach next tier
 * Assuming +10 per kept promise
 */
export function getPromisesToNextTier(score) {
  const nextTier = getNextTier(score);
  if (!nextTier) return 0;

  const pointsNeeded = nextTier.minScore - score;
  return Math.ceil(pointsNeeded / 10);
}

/**
 * Get tier progress percentage within current tier
 */
export function getTierProgress(score) {
  const tier = getIntegrityTier(score);
  const tierRange = tier.maxScore - tier.minScore;
  const progress = score - tier.minScore;
  return Math.round((progress / tierRange) * 100);
}

/**
 * Get all tiers as an array (sorted by score)
 */
export function getAllTiers() {
  return Object.values(INTEGRITY_TIERS).sort((a, b) => b.minScore - a.minScore);
}

/**
 * Format score display with tier color
 */
export function formatScoreDisplay(score) {
  const tier = getIntegrityTier(score);
  return {
    score,
    tierName: tier.name,
    tagline: tier.tagline,
    color: tier.color,
  };
}
