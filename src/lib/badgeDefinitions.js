/**
 * Badge & Integrity Tier Definitions for Shift Ascent
 *
 * 6-TIER SYSTEM with Rarity Labels
 * Philosophy: "Your word is your identity. This badge proves it."
 *
 * Tiers: Shattered → Mending → Rising → Steady → Trusted → Legendary
 */

// =====================================================
// INTEGRITY TIERS (6-tier system with rarity)
// =====================================================

export const INTEGRITY_TIERS = {
  SHATTERED: {
    id: 'shattered',
    name: 'Shattered',
    minScore: 0,
    maxScore: 20,
    tagline: 'Every journey starts somewhere',
    description: 'Your foundation needs rebuilding. One kept promise at a time.',
    rarity: 'Common',
    color: {
      primary: '#4a5568',
      secondary: '#2d3748',
      glow: 'rgba(74, 85, 104, 0.2)',
      bg: 'from-gray-700/20 to-slate-800/20',
      border: 'border-gray-600',
      text: 'text-gray-500',
      accent: '#718096',
    },
    visual: 'broken-fragments',
    shieldType: 'shattered',
    emoji: '💔',
  },

  MENDING: {
    id: 'mending',
    name: 'Mending',
    minScore: 21,
    maxScore: 40,
    tagline: 'Piece by piece, rebuilding trust',
    description: 'You\'re putting the pieces back together. Keep going.',
    rarity: 'Common',
    color: {
      primary: '#6b7280',
      secondary: '#4b5563',
      glow: 'rgba(107, 114, 128, 0.25)',
      bg: 'from-gray-600/20 to-slate-600/20',
      border: 'border-gray-500',
      text: 'text-gray-400',
      accent: '#9ca3af',
    },
    visual: 'repairing-shield',
    shieldType: 'mending',
    emoji: '🔧',
  },

  RISING: {
    id: 'rising',
    name: 'Rising',
    minScore: 41,
    maxScore: 60,
    tagline: 'The climb has begun',
    description: 'Your word is gaining weight. Momentum is building.',
    rarity: 'Uncommon',
    color: {
      primary: '#94a3b8',
      secondary: '#64748b',
      glow: 'rgba(148, 163, 184, 0.3)',
      bg: 'from-slate-500/20 to-gray-500/20',
      border: 'border-slate-400',
      text: 'text-slate-300',
      accent: '#cbd5e1',
    },
    visual: 'half-shield',
    shieldType: 'rising',
    emoji: '📈',
  },

  STEADY: {
    id: 'steady',
    name: 'Steady',
    minScore: 61,
    maxScore: 75,
    tagline: 'Consistency is your superpower',
    description: 'People are starting to count on you. Stay the course.',
    rarity: 'Uncommon',
    color: {
      primary: '#c0c0c0',
      secondary: '#a8a8a8',
      glow: 'rgba(192, 192, 192, 0.35)',
      bg: 'from-slate-400/25 to-gray-400/25',
      border: 'border-slate-300',
      text: 'text-slate-200',
      accent: '#e2e8f0',
    },
    visual: 'silver-shield',
    shieldType: 'steady',
    emoji: '⚡',
  },

  TRUSTED: {
    id: 'trusted',
    name: 'Trusted',
    minScore: 76,
    maxScore: 90,
    tagline: 'Your word is golden',
    description: 'You\'ve earned real trust. Your promises carry weight.',
    rarity: 'Rare',
    color: {
      primary: '#f59e0b',
      secondary: '#d97706',
      glow: 'rgba(245, 158, 11, 0.4)',
      bg: 'from-amber-500/25 to-yellow-500/25',
      border: 'border-amber-400',
      text: 'text-amber-300',
      accent: '#fbbf24',
    },
    visual: 'gold-shield',
    shieldType: 'trusted',
    emoji: '🏆',
  },

  LEGENDARY: {
    id: 'legendary',
    name: 'Legendary',
    minScore: 91,
    maxScore: 100,
    tagline: 'Unbreakable. Unstoppable.',
    description: 'You are the top 1%. Your word is law.',
    rarity: 'Legendary',
    color: {
      primary: '#ffd700',
      secondary: '#ffec8b',
      glow: 'rgba(255, 215, 0, 0.6)',
      bg: 'from-yellow-400/30 to-amber-400/30',
      border: 'border-yellow-400',
      text: 'text-yellow-300',
      accent: '#fff9c4',
    },
    visual: 'legendary-shield',
    shieldType: 'legendary',
    emoji: '👑',
  },
};

// =====================================================
// ACHIEVEMENT BADGES (Collectibles)
// =====================================================

export const ACHIEVEMENTS = {
  FIRE_STARTER: {
    id: 'fire_starter',
    name: 'Fire Starter',
    description: 'Kept your first promise',
    icon: '🔥',
    trigger: 'first_kept',
    rarity: 'Common',
    color: '#f97316',
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day keeping streak',
    icon: '⚡',
    trigger: 'streak_7',
    rarity: 'Uncommon',
    color: '#eab308',
  },
  FORTNIGHT_FURY: {
    id: 'fortnight_fury',
    name: 'Fortnight Fury',
    description: '14-day keeping streak',
    icon: '💪',
    trigger: 'streak_14',
    rarity: 'Rare',
    color: '#ef4444',
  },
  MONTHLY_MASTER: {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: '30-day perfect streak',
    icon: '🌟',
    trigger: 'streak_30',
    rarity: 'Epic',
    color: '#a855f7',
  },
  DECADE_KEEPER: {
    id: 'decade_keeper',
    name: 'Decade Keeper',
    description: '10 promises kept',
    icon: '🎯',
    trigger: 'kept_10',
    rarity: 'Common',
    color: '#22c55e',
  },
  HALF_CENTURY: {
    id: 'half_century',
    name: 'Half Century',
    description: '50 promises kept',
    icon: '💎',
    trigger: 'kept_50',
    rarity: 'Rare',
    color: '#06b6d4',
  },
  CENTURION: {
    id: 'centurion',
    name: 'Centurion',
    description: '100 promises kept',
    icon: '🏛️',
    trigger: 'kept_100',
    rarity: 'Epic',
    color: '#8b5cf6',
  },
  COMEBACK_KING: {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Recovered from <30 to >70',
    icon: '🦁',
    trigger: 'recovery',
    rarity: 'Rare',
    color: '#f59e0b',
  },
  GOAL_GETTER: {
    id: 'goal_getter',
    name: 'Goal Getter',
    description: 'Completed first goal',
    icon: '🎯',
    trigger: 'first_goal',
    rarity: 'Common',
    color: '#10b981',
  },
  FIVE_STAR: {
    id: 'five_star',
    name: 'Five Star',
    description: 'Completed 5 goals',
    icon: '⭐',
    trigger: 'goals_5',
    rarity: 'Rare',
    color: '#fbbf24',
  },
  WATCHED: {
    id: 'watched',
    name: 'Watched',
    description: '10+ witnesses on a promise',
    icon: '👁️',
    trigger: 'witnesses_10',
    rarity: 'Uncommon',
    color: '#64748b',
  },
  PERFECT_WEEK: {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Kept all promises for 7 days',
    icon: '✨',
    trigger: 'perfect_week',
    rarity: 'Uncommon',
    color: '#ec4899',
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Completed 24+ hours before deadline',
    icon: '🐦',
    trigger: 'early_completion',
    rarity: 'Common',
    color: '#0ea5e9',
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Completed promise after midnight',
    icon: '🦉',
    trigger: 'late_night',
    rarity: 'Common',
    color: '#6366f1',
  },
  UNSTOPPABLE: {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Reached Legendary tier',
    icon: '👑',
    trigger: 'legendary_tier',
    rarity: 'Legendary',
    color: '#ffd700',
  },
};

// Rarity colors for badges
export const RARITY_COLORS = {
  Common: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  Uncommon: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  Rare: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  Epic: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  Legendary: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get the integrity tier for a given score
 */
export function getIntegrityTier(score) {
  if (score >= INTEGRITY_TIERS.LEGENDARY.minScore) return INTEGRITY_TIERS.LEGENDARY;
  if (score >= INTEGRITY_TIERS.TRUSTED.minScore) return INTEGRITY_TIERS.TRUSTED;
  if (score >= INTEGRITY_TIERS.STEADY.minScore) return INTEGRITY_TIERS.STEADY;
  if (score >= INTEGRITY_TIERS.RISING.minScore) return INTEGRITY_TIERS.RISING;
  if (score >= INTEGRITY_TIERS.MENDING.minScore) return INTEGRITY_TIERS.MENDING;
  return INTEGRITY_TIERS.SHATTERED;
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
  if (score >= INTEGRITY_TIERS.LEGENDARY.minScore) return null;
  if (score >= INTEGRITY_TIERS.TRUSTED.minScore) return INTEGRITY_TIERS.LEGENDARY;
  if (score >= INTEGRITY_TIERS.STEADY.minScore) return INTEGRITY_TIERS.TRUSTED;
  if (score >= INTEGRITY_TIERS.RISING.minScore) return INTEGRITY_TIERS.STEADY;
  if (score >= INTEGRITY_TIERS.MENDING.minScore) return INTEGRITY_TIERS.RISING;
  return INTEGRITY_TIERS.MENDING;
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
 * Get all tiers as an array (sorted by score ascending)
 */
export function getAllTiers() {
  return Object.values(INTEGRITY_TIERS).sort((a, b) => a.minScore - b.minScore);
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

/**
 * Calculate unlocked achievements based on user stats
 */
export function getUnlockedAchievements(stats) {
  const {
    totalKept = 0,
    totalBroken = 0,
    currentStreak = 0,
    bestStreak = 0,
    goalsCompleted = 0,
    maxWitnesses = 0,
    integrityScore = 0,
    lowestScore = 100,
    hasEarlyCompletion = false,
    hasLateNightCompletion = false,
  } = stats;

  const unlocked = [];

  // Kept-based achievements
  if (totalKept >= 1) unlocked.push(ACHIEVEMENTS.FIRE_STARTER);
  if (totalKept >= 10) unlocked.push(ACHIEVEMENTS.DECADE_KEEPER);
  if (totalKept >= 50) unlocked.push(ACHIEVEMENTS.HALF_CENTURY);
  if (totalKept >= 100) unlocked.push(ACHIEVEMENTS.CENTURION);

  // Streak-based achievements
  if (bestStreak >= 7) unlocked.push(ACHIEVEMENTS.WEEK_WARRIOR);
  if (bestStreak >= 14) unlocked.push(ACHIEVEMENTS.FORTNIGHT_FURY);
  if (bestStreak >= 30) unlocked.push(ACHIEVEMENTS.MONTHLY_MASTER);

  // Goal achievements
  if (goalsCompleted >= 1) unlocked.push(ACHIEVEMENTS.GOAL_GETTER);
  if (goalsCompleted >= 5) unlocked.push(ACHIEVEMENTS.FIVE_STAR);

  // Special achievements
  if (maxWitnesses >= 10) unlocked.push(ACHIEVEMENTS.WATCHED);
  if (lowestScore < 30 && integrityScore >= 70) unlocked.push(ACHIEVEMENTS.COMEBACK_KING);
  if (integrityScore >= 91) unlocked.push(ACHIEVEMENTS.UNSTOPPABLE);
  if (hasEarlyCompletion) unlocked.push(ACHIEVEMENTS.EARLY_BIRD);
  if (hasLateNightCompletion) unlocked.push(ACHIEVEMENTS.NIGHT_OWL);

  return unlocked;
}

/**
 * Get all achievements with locked/unlocked status
 */
export function getAllAchievementsWithStatus(stats) {
  const unlocked = getUnlockedAchievements(stats);
  const unlockedIds = unlocked.map(a => a.id);

  return Object.values(ACHIEVEMENTS).map(achievement => ({
    ...achievement,
    unlocked: unlockedIds.includes(achievement.id),
  }));
}

/**
 * Calculate user percentile (mock for now - will integrate with Supabase later)
 */
export function getUserPercentile(score) {
  // Rough estimation based on score
  // In production, this would query actual user distribution
  if (score >= 91) return 1;
  if (score >= 76) return 5;
  if (score >= 61) return 15;
  if (score >= 41) return 35;
  if (score >= 21) return 60;
  return 85;
}

/**
 * Get streak fire level for visual display
 */
export function getStreakFireLevel(streak) {
  if (streak >= 21) return { level: 4, name: 'Inferno', color: '#60a5fa', emoji: '🔵' }; // Blue fire
  if (streak >= 14) return { level: 3, name: 'Blaze', color: '#f97316', emoji: '🔥' };
  if (streak >= 7) return { level: 2, name: 'Burning', color: '#fbbf24', emoji: '🔥' };
  if (streak >= 3) return { level: 1, name: 'Spark', color: '#ef4444', emoji: '✨' };
  return { level: 0, name: 'Cold', color: '#6b7280', emoji: '' };
}
