/**
 * Integrity Score Service for Shift Journey
 *
 * Delegates tier/badge lookups to badgeDefinitions.js (single source of truth).
 *
 * Score Rules:
 * - KEPT: +2 (max 100)
 * - BROKEN: -10 (first), -15 (2nd consecutive), -20 (3rd+ consecutive)
 * - Goal completed: +10 bonus (one-time per goal)
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getIntegrityTier, getTierName, detectTierChange } from '../lib/badgeDefinitions';

// Re-export for consumers
export { detectTierChange };

// =====================================================
// CONSTANTS
// =====================================================

export const INTEGRITY_CONFIG = {
  INITIAL_SCORE: 100,
  MAX_SCORE: 100,
  MIN_SCORE: 0,

  // Score changes
  KEPT_BONUS: 2,
  BROKEN_PENALTY_BASE: 10,
  BROKEN_PENALTY_STREAK_2: 15,
  BROKEN_PENALTY_STREAK_3_PLUS: 20,
  GOAL_COMPLETED_BONUS: 10,
};

// =====================================================
// BADGE/STATUS FUNCTIONS (delegated to badgeDefinitions)
// =====================================================

/**
 * Get badge/status from integrity score
 */
export function getBadgeFromScore(score) {
  const tier = getIntegrityTier(score);
  return {
    name: tier.name,
    description: tier.description,
    tier: tier.id,
    color: {
      primary: tier.color.primary,
      text: tier.color.text,
      bg: tier.color.bg,
    },
  };
}

/**
 * Get status label from score
 */
export function getStatusFromScore(score) {
  return getTierName(score);
}

// =====================================================
// SCORE CALCULATION FUNCTIONS
// =====================================================

/**
 * Calculate penalty for a broken promise based on failure streak
 * @param {number} failureStreak - Current consecutive failure count (before this failure)
 * @returns {number} Penalty amount (positive number to subtract)
 */
export function calculateBrokenPenalty(failureStreak) {
  const { BROKEN_PENALTY_BASE, BROKEN_PENALTY_STREAK_2, BROKEN_PENALTY_STREAK_3_PLUS } = INTEGRITY_CONFIG;

  // failureStreak is the count BEFORE this failure
  // So if failureStreak is 0, this is the 1st failure
  // If failureStreak is 1, this is the 2nd consecutive failure
  // If failureStreak is 2+, this is the 3rd+ consecutive failure

  if (failureStreak >= 2) {
    return BROKEN_PENALTY_STREAK_3_PLUS; // -20
  }
  if (failureStreak === 1) {
    return BROKEN_PENALTY_STREAK_2; // -15
  }
  return BROKEN_PENALTY_BASE; // -10
}

/**
 * Calculate new integrity score after a promise result
 * @param {number} currentScore - Current integrity score
 * @param {string} result - 'KEPT' or 'BROKEN'
 * @param {number} failureStreak - Current consecutive failure count
 * @returns {object} { newScore, scoreChange, newFailureStreak }
 */
export function calculateIntegrityChange(currentScore, result, failureStreak = 0) {
  const { MAX_SCORE, MIN_SCORE, KEPT_BONUS } = INTEGRITY_CONFIG;

  let scoreChange = 0;
  let newFailureStreak = failureStreak;

  if (result === 'KEPT') {
    scoreChange = KEPT_BONUS;
    newFailureStreak = 0; // Reset streak on success
  } else if (result === 'BROKEN') {
    scoreChange = -calculateBrokenPenalty(failureStreak);
    newFailureStreak = failureStreak + 1; // Increment streak
  }

  // Clamp score between MIN and MAX
  const newScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, currentScore + scoreChange));

  const tierChange = detectTierChange(currentScore, newScore);

  return {
    newScore,
    scoreChange,
    newFailureStreak,
    badge: getBadgeFromScore(newScore),
    tierChange,
  };
}

/**
 * Calculate bonus for completing a goal
 * @param {number} currentScore - Current integrity score
 * @returns {object} { newScore, scoreChange }
 */
export function calculateGoalCompletedBonus(currentScore) {
  const { MAX_SCORE, GOAL_COMPLETED_BONUS } = INTEGRITY_CONFIG;

  const scoreChange = GOAL_COMPLETED_BONUS;
  const newScore = Math.min(MAX_SCORE, currentScore + scoreChange);
  const tierChange = detectTierChange(currentScore, newScore);

  return {
    newScore,
    scoreChange,
    badge: getBadgeFromScore(newScore),
    tierChange,
  };
}

// =====================================================
// SUPABASE INTEGRATION
// =====================================================

/**
 * Update user integrity in database
 */
export async function updateUserIntegrity(userId, newScore, newFailureStreak) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping integrity update');
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      integrity_score: newScore,
      failure_streak: newFailureStreak,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user integrity data from database
 */
export async function getUserIntegrity(userId) {
  if (!isSupabaseConfigured()) {
    return { integrity_score: INTEGRITY_CONFIG.INITIAL_SCORE, failure_streak: 0 };
  }

  const { data, error } = await supabase
    .from('users')
    .select('integrity_score, failure_streak')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Record integrity change in history (for analytics/debugging)
 */
export async function recordIntegrityChange(userId, change) {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('integrity_history')
    .insert({
      user_id: userId,
      previous_score: change.previousScore,
      new_score: change.newScore,
      change_amount: change.scoreChange,
      reason: change.reason, // 'PROMISE_KEPT', 'PROMISE_BROKEN', 'GOAL_COMPLETED'
      failure_streak: change.failureStreak,
      milestone_id: change.milestoneId,
      goal_id: change.goalId,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to record integrity history:', error);
    // Don't throw - history is optional
    return null;
  }
  return data;
}

// =====================================================
// HIGH-LEVEL OPERATIONS
// =====================================================

/**
 * Process a promise being kept
 * @param {string} userId - User ID
 * @param {number} currentScore - Current integrity score
 * @param {number} currentStreak - Current failure streak
 * @param {string} milestoneId - Milestone ID (optional, for history)
 * @param {string} goalId - Goal ID (optional, for history)
 * @returns {object} Updated integrity data
 */
export async function processPromiseKept(userId, currentScore, currentStreak, milestoneId = null, goalId = null) {
  const result = calculateIntegrityChange(currentScore, 'KEPT', currentStreak);

  // Update database
  await updateUserIntegrity(userId, result.newScore, result.newFailureStreak);

  // Record history
  await recordIntegrityChange(userId, {
    previousScore: currentScore,
    newScore: result.newScore,
    scoreChange: result.scoreChange,
    reason: 'PROMISE_KEPT',
    failureStreak: result.newFailureStreak,
    milestoneId,
    goalId,
  });

  return result;
}

/**
 * Process a promise being broken
 * @param {string} userId - User ID
 * @param {number} currentScore - Current integrity score
 * @param {number} currentStreak - Current failure streak
 * @param {string} milestoneId - Milestone ID (optional, for history)
 * @param {string} goalId - Goal ID (optional, for history)
 * @returns {object} Updated integrity data
 */
export async function processPromiseBroken(userId, currentScore, currentStreak, milestoneId = null, goalId = null) {
  const result = calculateIntegrityChange(currentScore, 'BROKEN', currentStreak);

  // Update database
  await updateUserIntegrity(userId, result.newScore, result.newFailureStreak);

  // Record history
  await recordIntegrityChange(userId, {
    previousScore: currentScore,
    newScore: result.newScore,
    scoreChange: result.scoreChange,
    reason: 'PROMISE_BROKEN',
    failureStreak: result.newFailureStreak,
    milestoneId,
    goalId,
  });

  return result;
}

/**
 * Process a goal being completed
 * @param {string} userId - User ID
 * @param {number} currentScore - Current integrity score
 * @param {string} goalId - Goal ID
 * @returns {object} Updated integrity data
 */
export async function processGoalCompleted(userId, currentScore, goalId) {
  const result = calculateGoalCompletedBonus(currentScore);

  // Get current streak (don't reset it for goal completion)
  const userData = await getUserIntegrity(userId);
  const currentStreak = userData?.failure_streak || 0;

  // Update database (keep streak, just update score)
  await updateUserIntegrity(userId, result.newScore, currentStreak);

  // Record history
  await recordIntegrityChange(userId, {
    previousScore: currentScore,
    newScore: result.newScore,
    scoreChange: result.scoreChange,
    reason: 'GOAL_COMPLETED',
    failureStreak: currentStreak,
    milestoneId: null,
    goalId,
  });

  return result;
}

// =====================================================
// EXAMPLE STATE TRANSITIONS
// =====================================================

/**
 * Example usage and state transitions:
 *
 * Initial State:
 *   User joins → Score: 100, Streak: 0, Badge: "Reliable"
 *
 * Scenario 1 - Keeping promises:
 *   Keep promise → Score: 100 (capped), Streak: 0, Badge: "Reliable"
 *
 * Scenario 2 - First failure:
 *   Break promise → Score: 90 (100 - 10), Streak: 1, Badge: "Reliable"
 *
 * Scenario 3 - Recovery then fail:
 *   Keep promise → Score: 92 (90 + 2), Streak: 0, Badge: "Reliable"
 *   Break promise → Score: 82 (92 - 10), Streak: 1, Badge: "Reliable"
 *
 * Scenario 4 - Consecutive failures:
 *   Start: Score: 80, Streak: 0
 *   Break → Score: 70 (80 - 10), Streak: 1, Badge: "Inconsistent"
 *   Break → Score: 55 (70 - 15), Streak: 2, Badge: "Inconsistent"
 *   Break → Score: 35 (55 - 20), Streak: 3, Badge: "Inconsistent"
 *   Break → Score: 15 (35 - 20), Streak: 4, Badge: "Unreliable"
 *
 * Scenario 5 - Recovery from rock bottom:
 *   Start: Score: 15, Streak: 4
 *   Keep → Score: 17 (15 + 2), Streak: 0, Badge: "Unreliable"
 *   Keep → Score: 19, Streak: 0
 *   ... (many keeps later)
 *   Keep → Score: 71, Streak: 0, Badge: "Reliable"
 *
 * Scenario 6 - Goal completion bonus:
 *   Start: Score: 65, complete goal
 *   Goal done → Score: 75 (65 + 10), Badge: "Reliable"
 */

export default {
  // Config
  INTEGRITY_CONFIG,

  // Badge functions
  getBadgeFromScore,
  getStatusFromScore,
  detectTierChange,

  // Calculation functions
  calculateBrokenPenalty,
  calculateIntegrityChange,
  calculateGoalCompletedBonus,

  // Database operations
  updateUserIntegrity,
  getUserIntegrity,
  recordIntegrityChange,

  // High-level operations
  processPromiseKept,
  processPromiseBroken,
  processGoalCompleted,
};
