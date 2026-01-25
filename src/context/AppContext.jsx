import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  anonymousUserService,
  authService,
  goalService,
  milestoneService,
  pricingService,
  calendarService,
  integrityService as dbIntegrityService,
  integrityHistoryService,
} from '../services/database';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  INTEGRITY_CONFIG,
  calculateIntegrityChange,
  calculateGoalCompletedBonus,
  getBadgeFromScore,
  getStatusFromScore,
} from '../services/integrityService';

const AppContext = createContext();

// Get integrity status from score (using service thresholds)
const getIntegrityStatus = (score) => {
  return getStatusFromScore(score);
};

export function AppProvider({ children }) {
  // Core state
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null); // Supabase auth user (Google)
  const [currentGoal, setCurrentGoal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [goalHistory, setGoalHistory] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiredPromise, setExpiredPromise] = useState(null);

  // Calendar/Journal state
  const [calendarData, setCalendarData] = useState({});

  // =====================================================
  // INITIALIZATION
  // =====================================================

  // Helper to load user data
  const loadUserData = async (dbUser) => {
    setUser({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatarUrl: dbUser.avatar_url,
      authProvider: dbUser.auth_provider || 'anonymous',
      integrityScore: dbUser.integrity_score ?? INTEGRITY_CONFIG.INITIAL_SCORE,
      failureStreak: dbUser.failure_streak ?? 0,
      status: getIntegrityStatus(dbUser.integrity_score ?? INTEGRITY_CONFIG.INITIAL_SCORE),
      badge: getBadgeFromScore(dbUser.integrity_score ?? INTEGRITY_CONFIG.INITIAL_SCORE),
      createdAt: dbUser.created_at,
    });

    // Load active goal with milestones
    const activeGoal = await goalService.getActive(dbUser.id);
    if (activeGoal) {
      setCurrentGoal({
        id: activeGoal.id,
        title: activeGoal.title,
        description: activeGoal.description,
        createdAt: activeGoal.created_at,
        status: activeGoal.status,
      });

      // Transform milestones from DB format
      const transformedMilestones = (activeGoal.milestones || []).map(m => ({
        id: m.id,
        goalId: m.goal_id,
        number: m.number,
        title: m.title,
        status: m.status,
        promise: m.promise_text ? {
          text: m.promise_text,
          deadline: m.promise_deadline,
          consequence: m.promise_consequence,
          lockedAt: m.promise_locked_at,
          witnessCount: m.witness_count || 0,
        } : null,
        completedAt: m.completed_at,
        brokenAt: m.broken_at,
        reason: m.broken_reason,
        shareId: m.share_id,
      }));
      setMilestones(transformedMilestones);
    } else {
      setCurrentGoal(null);
      setMilestones([]);
    }

    // Load goal history
    const completedGoals = await goalService.getCompleted(dbUser.id);
    const transformedHistory = completedGoals.map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      createdAt: g.created_at,
      completedAt: g.completed_at,
      reflection: g.reflection,
      finalIntegrityScore: g.final_integrity_score,
      stats: g.stats || {},
      milestones: (g.milestones || []).map(m => ({
        id: m.id,
        number: m.number,
        title: m.title,
        status: m.status,
        completedAt: m.completed_at,
        brokenAt: m.broken_at,
        reason: m.broken_reason,
      })),
    }));
    setGoalHistory(transformedHistory);

    // Load calendar data
    try {
      const calData = await calendarService.getByUserId(dbUser.id);
      const calendarMap = {};
      calData.forEach(entry => {
        calendarMap[entry.date] = {
          worked: entry.worked,
          journal: entry.notes,
        };
      });
      setCalendarData(calendarMap);
    } catch (calErr) {
      console.warn('Calendar data not available:', calErr);
      setCalendarData({});
    }
  };

  // Initialize user and load data on mount
  useEffect(() => {
    const initializeApp = async () => {
      if (!isSupabaseConfigured()) {
        setError('Database not configured. Please set up Supabase.');
        setIsLoading(false);
        return;
      }

      try {
        // First, check if user is signed in with Google
        const session = await authService.getSession();

        let dbUser;
        if (session?.user) {
          // User is signed in with Google - get or link their account
          setAuthUser(session.user);
          dbUser = await authService.getOrCreateAuthUser(session.user);
        } else {
          // No auth session - use anonymous user
          dbUser = await anonymousUserService.getOrCreate();
        }

        if (!dbUser) {
          setError('Failed to initialize user.');
          setIsLoading(false);
          return;
        }

        await loadUserData(dbUser);

      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Listen for auth state changes (sign in/out)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User just signed in - reload their data
        setAuthUser(session.user);
        try {
          const dbUser = await authService.getOrCreateAuthUser(session.user);
          if (dbUser) {
            await loadUserData(dbUser);
          }
        } catch (err) {
          console.error('Failed to load user after sign in:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out - switch back to anonymous
        setAuthUser(null);
        try {
          const dbUser = await anonymousUserService.getOrCreate();
          if (dbUser) {
            await loadUserData(dbUser);
          }
        } catch (err) {
          console.error('Failed to load anonymous user:', err);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await authService.signOut();
      // Auth state change listener will handle the rest
    } catch (err) {
      console.error('Failed to sign out:', err);
      throw new Error('Failed to sign out. Please try again.');
    }
  };

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  // Get current locked milestone
  const currentLockedMilestone = milestones.find(m => m.status === 'locked');

  // Get next pending milestone
  const nextPendingMilestone = milestones.find(m => m.status === 'pending');

  // Check if there's an active (locked) promise
  const hasActivePromise = !!currentLockedMilestone;

  // Check if goal can be finished (all milestones resolved)
  const canFinishGoal = currentGoal && milestones.length > 0 &&
    !milestones.some(m => m.status === 'pending' || m.status === 'locked');

  // Check if user needs to create a goal
  const needsGoalSetup = !currentGoal && !isLoading;

  // =====================================================
  // PROMISE EXPIRATION CHECK
  // =====================================================

  // Auto-expire promise function
  const autoExpirePromise = useCallback(async (milestone) => {
    if (!user) return;

    try {
      // Update milestone in database
      await milestoneService.break(milestone.id, 'Deadline passed - promise automatically broken');

      // Update local state
      setMilestones(prev => prev.map(m =>
        m.id === milestone.id
          ? { ...m, status: 'broken', brokenAt: new Date().toISOString(), reason: 'Deadline passed - promise automatically broken' }
          : m
      ));

      // Calculate integrity change with streak penalty
      const integrityResult = calculateIntegrityChange(
        user.integrityScore,
        'BROKEN',
        user.failureStreak || 0
      );

      // Update integrity in database
      await dbIntegrityService.updateIntegrity(user.id, integrityResult.newScore, integrityResult.newFailureStreak);

      // Record in history
      await integrityHistoryService.record({
        userId: user.id,
        previousScore: user.integrityScore,
        newScore: integrityResult.newScore,
        changeAmount: integrityResult.scoreChange,
        reason: 'PROMISE_BROKEN',
        failureStreak: integrityResult.newFailureStreak,
        milestoneId: milestone.id,
        goalId: currentGoal?.id,
      });

      // Update local user state
      setUser(prev => ({
        ...prev,
        integrityScore: integrityResult.newScore,
        failureStreak: integrityResult.newFailureStreak,
        status: getIntegrityStatus(integrityResult.newScore),
        badge: getBadgeFromScore(integrityResult.newScore),
      }));

      // Show expired promise notification
      setExpiredPromise(milestone);
    } catch (err) {
      console.error('Failed to auto-expire promise:', err);
    }
  }, [user, currentGoal]);

  // Check for expired promises
  useEffect(() => {
    if (!currentLockedMilestone?.promise?.deadline) return;

    const checkExpiredPromise = () => {
      const deadline = new Date(currentLockedMilestone.promise.deadline);
      const now = new Date();

      if (now > deadline) {
        autoExpirePromise(currentLockedMilestone);
      }
    };

    checkExpiredPromise();
    const interval = setInterval(checkExpiredPromise, 1000);

    return () => clearInterval(interval);
  }, [currentLockedMilestone, autoExpirePromise]);

  // =====================================================
  // GOAL OPERATIONS
  // =====================================================

  // Create a new goal
  const createGoal = async (goalData) => {
    if (!user) throw new Error('User not initialized');
    if (hasActivePromise) throw new Error('Cannot create a new goal while you have an active locked promise.');

    try {
      const dbGoal = await goalService.create({
        userId: user.id,
        title: goalData.title,
        description: goalData.description,
      });

      const newGoal = {
        id: dbGoal.id,
        title: dbGoal.title,
        description: dbGoal.description,
        createdAt: dbGoal.created_at,
        status: dbGoal.status,
      };

      setCurrentGoal(newGoal);
      setMilestones([]);

      return newGoal;
    } catch (err) {
      console.error('Failed to create goal:', err);
      throw new Error('Failed to create goal. Please try again.');
    }
  };

  // Complete goal with reflection
  const completeGoal = async (reflection = '') => {
    if (!currentGoal) throw new Error('No active goal');
    if (!canFinishGoal) throw new Error('Cannot finish goal - there are still pending or locked milestones.');

    try {
      const completedMilestones = milestones.filter(m => m.status === 'completed');
      const brokenMilestones = milestones.filter(m => m.status === 'broken');

      const stats = {
        totalMilestones: milestones.length,
        completed: completedMilestones.length,
        broken: brokenMilestones.length,
        successRate: milestones.length > 0
          ? Math.round((completedMilestones.length / milestones.length) * 100)
          : 0,
      };

      // Calculate goal completion bonus: +10
      const integrityResult = calculateGoalCompletedBonus(user.integrityScore);

      // Update integrity in database (keep current streak, just add bonus)
      await dbIntegrityService.updateIntegrity(user.id, integrityResult.newScore, user.failureStreak || 0);

      // Record in history
      await integrityHistoryService.record({
        userId: user.id,
        previousScore: user.integrityScore,
        newScore: integrityResult.newScore,
        changeAmount: integrityResult.scoreChange,
        reason: 'GOAL_COMPLETED',
        failureStreak: user.failureStreak || 0,
        milestoneId: null,
        goalId: currentGoal.id,
      });

      // Update goal in database with new integrity score
      await goalService.complete(currentGoal.id, reflection, integrityResult.newScore, stats);

      // Create archived goal for history
      const archivedGoal = {
        ...currentGoal,
        status: 'completed',
        completedAt: new Date().toISOString(),
        reflection,
        milestones: [...milestones],
        stats,
        finalIntegrityScore: integrityResult.newScore,
      };

      // Update local user state
      setUser(prev => ({
        ...prev,
        integrityScore: integrityResult.newScore,
        status: getIntegrityStatus(integrityResult.newScore),
        badge: getBadgeFromScore(integrityResult.newScore),
      }));

      // Update local state
      setGoalHistory(prev => [archivedGoal, ...prev]);
      setCurrentGoal(null);
      setMilestones([]);

      return archivedGoal;
    } catch (err) {
      console.error('Failed to complete goal:', err);
      throw new Error('Failed to complete goal. Please try again.');
    }
  };

  // =====================================================
  // MILESTONE OPERATIONS
  // =====================================================

  // Add a new milestone
  const addMilestone = async (title) => {
    if (!user || !currentGoal) throw new Error('No active goal');

    try {
      const nextNumber = milestones.length + 1;
      const dbMilestone = await milestoneService.create(
        currentGoal.id,
        user.id,
        title,
        nextNumber
      );

      const newMilestone = {
        id: dbMilestone.id,
        goalId: dbMilestone.goal_id,
        number: dbMilestone.number,
        title: dbMilestone.title,
        status: dbMilestone.status,
        promise: null,
      };

      setMilestones(prev => [...prev, newMilestone]);
      return newMilestone;
    } catch (err) {
      console.error('Failed to add milestone:', err);
      throw new Error('Failed to add milestone. Please try again.');
    }
  };

  // Update milestone title (only if pending)
  const updateMilestone = async (id, updates) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) throw new Error('Milestone not found');
    if (milestone.status !== 'pending') throw new Error('Cannot edit a locked, completed, or broken milestone.');

    try {
      await milestoneService.updateTitle(id, updates.title);
      setMilestones(prev => prev.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ));
    } catch (err) {
      console.error('Failed to update milestone:', err);
      throw new Error('Failed to update milestone. Please try again.');
    }
  };

  // Delete milestone (only if pending)
  const deleteMilestone = async (id) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) throw new Error('Milestone not found');
    if (milestone.status !== 'pending') throw new Error('Cannot delete a locked, completed, or broken milestone.');

    try {
      await milestoneService.delete(id);

      // Remove from local state and renumber
      const filtered = milestones.filter(m => m.id !== id);
      const renumbered = filtered.map((m, index) => ({ ...m, number: index + 1 }));
      setMilestones(renumbered);

      // Renumber in database
      if (currentGoal) {
        await milestoneService.renumber(currentGoal.id);
      }
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      throw new Error('Failed to delete milestone. Please try again.');
    }
  };

  // Lock a promise
  const lockPromise = async (milestoneId, promiseData) => {
    if (hasActivePromise) throw new Error('Cannot lock a new promise while another is active.');

    try {
      const dbMilestone = await milestoneService.lock(milestoneId, {
        text: promiseData.text,
        deadline: promiseData.deadline,
        consequence: promiseData.consequence,
      });

      setMilestones(prev => prev.map(m =>
        m.id === milestoneId
          ? {
              ...m,
              status: 'locked',
              promise: {
                text: promiseData.text,
                deadline: promiseData.deadline,
                consequence: promiseData.consequence,
                lockedAt: dbMilestone.promise_locked_at,
                witnessCount: 0,
              },
              shareId: dbMilestone.share_id,
            }
          : m
      ));
    } catch (err) {
      console.error('Failed to lock promise:', err);
      throw new Error('Failed to lock promise. Please try again.');
    }
  };

  // Complete milestone (promise kept)
  const completeMilestone = async (milestoneId) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status !== 'locked') {
      throw new Error('Can only complete a locked milestone.');
    }

    // Check if deadline has passed
    if (milestone.promise?.deadline && new Date() > new Date(milestone.promise.deadline)) {
      throw new Error('Cannot mark as complete - deadline has already passed.');
    }

    try {
      await milestoneService.complete(milestoneId);

      setMilestones(prev => prev.map(m =>
        m.id === milestoneId
          ? { ...m, status: 'completed', completedAt: new Date().toISOString() }
          : m
      ));

      // Calculate integrity change: +2 for kept promise, reset streak
      const integrityResult = calculateIntegrityChange(
        user.integrityScore,
        'KEPT',
        user.failureStreak || 0
      );

      // Update integrity in database
      await dbIntegrityService.updateIntegrity(user.id, integrityResult.newScore, integrityResult.newFailureStreak);

      // Record in history
      await integrityHistoryService.record({
        userId: user.id,
        previousScore: user.integrityScore,
        newScore: integrityResult.newScore,
        changeAmount: integrityResult.scoreChange,
        reason: 'PROMISE_KEPT',
        failureStreak: integrityResult.newFailureStreak,
        milestoneId: milestoneId,
        goalId: currentGoal?.id,
      });

      // Update local user state
      setUser(prev => ({
        ...prev,
        integrityScore: integrityResult.newScore,
        failureStreak: integrityResult.newFailureStreak,
        status: getIntegrityStatus(integrityResult.newScore),
        badge: getBadgeFromScore(integrityResult.newScore),
      }));
    } catch (err) {
      console.error('Failed to complete milestone:', err);
      throw new Error('Failed to complete milestone. Please try again.');
    }
  };

  // Break promise (mark as failed)
  const breakPromise = async (milestoneId, reason) => {
    if (!reason?.trim()) throw new Error('You must explain why you failed.');

    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status !== 'locked') {
      throw new Error('Can only break a locked milestone.');
    }

    try {
      await milestoneService.break(milestoneId, reason);

      setMilestones(prev => prev.map(m =>
        m.id === milestoneId
          ? { ...m, status: 'broken', brokenAt: new Date().toISOString(), reason }
          : m
      ));

      // Calculate integrity change with streak penalty
      // -10 (first), -15 (2nd consecutive), -20 (3rd+ consecutive)
      const integrityResult = calculateIntegrityChange(
        user.integrityScore,
        'BROKEN',
        user.failureStreak || 0
      );

      // Update integrity in database
      await dbIntegrityService.updateIntegrity(user.id, integrityResult.newScore, integrityResult.newFailureStreak);

      // Record in history
      await integrityHistoryService.record({
        userId: user.id,
        previousScore: user.integrityScore,
        newScore: integrityResult.newScore,
        changeAmount: integrityResult.scoreChange,
        reason: 'PROMISE_BROKEN',
        failureStreak: integrityResult.newFailureStreak,
        milestoneId: milestoneId,
        goalId: currentGoal?.id,
      });

      // Update local user state
      setUser(prev => ({
        ...prev,
        integrityScore: integrityResult.newScore,
        failureStreak: integrityResult.newFailureStreak,
        status: getIntegrityStatus(integrityResult.newScore),
        badge: getBadgeFromScore(integrityResult.newScore),
      }));
    } catch (err) {
      console.error('Failed to break promise:', err);
      throw new Error('Failed to record broken promise. Please try again.');
    }
  };

  // Add a witness to current locked milestone
  const addWitness = async () => {
    if (!currentLockedMilestone) return;

    try {
      await milestoneService.addWitness(currentLockedMilestone.id);

      setMilestones(prev => prev.map(m =>
        m.id === currentLockedMilestone.id
          ? {
              ...m,
              promise: {
                ...m.promise,
                witnessCount: (m.promise?.witnessCount || 0) + 1,
              },
            }
          : m
      ));
    } catch (err) {
      console.error('Failed to add witness:', err);
    }
  };

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  // Get time remaining for locked milestone
  const getTimeRemaining = () => {
    if (!currentLockedMilestone?.promise?.deadline) return null;

    const deadline = new Date(currentLockedMilestone.promise.deadline);
    const now = new Date();
    const diff = deadline - now;

    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false };
  };

  // Clear expired promise notification
  const clearExpiredPromise = () => {
    setExpiredPromise(null);
  };

  // =====================================================
  // CALENDAR/JOURNAL OPERATIONS
  // =====================================================

  // Toggle calendar day worked status
  const toggleCalendarDay = async (dateKey, worked) => {
    if (!user) return;

    // Update local state immediately
    setCalendarData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        worked,
      },
    }));

    // Sync to database
    try {
      await calendarService.upsert(user.id, dateKey, worked, calendarData[dateKey]?.journal || null);
    } catch (err) {
      console.error('Failed to save calendar data:', err);
      // Revert on error
      setCalendarData(prev => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          worked: !worked,
        },
      }));
    }
  };

  // Update journal entry for a specific day
  const updateJournalEntry = async (dateKey, journal) => {
    if (!user) return;

    // Update local state immediately
    setCalendarData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        journal,
      },
    }));

    // Sync to database
    try {
      const worked = calendarData[dateKey]?.worked ?? null;
      await calendarService.upsert(user.id, dateKey, worked, journal);
    } catch (err) {
      console.error('Failed to save journal:', err);
    }
  };

  // Get journal entry for a specific day
  const getJournalEntry = (dateKey) => {
    return calendarData[dateKey]?.journal || '';
  };

  // Refresh data from database
  const refreshData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Reload active goal
      const activeGoal = await goalService.getActive(user.id);
      if (activeGoal) {
        setCurrentGoal({
          id: activeGoal.id,
          title: activeGoal.title,
          description: activeGoal.description,
          createdAt: activeGoal.created_at,
          status: activeGoal.status,
        });

        const transformedMilestones = (activeGoal.milestones || []).map(m => ({
          id: m.id,
          goalId: m.goal_id,
          number: m.number,
          title: m.title,
          status: m.status,
          promise: m.promise_text ? {
            text: m.promise_text,
            deadline: m.promise_deadline,
            consequence: m.promise_consequence,
            lockedAt: m.promise_locked_at,
            witnessCount: m.witness_count || 0,
          } : null,
          completedAt: m.completed_at,
          brokenAt: m.broken_at,
          reason: m.broken_reason,
          shareId: m.share_id,
        }));
        setMilestones(transformedMilestones);
      } else {
        setCurrentGoal(null);
        setMilestones([]);
      }

      // Reload history
      const completedGoals = await goalService.getCompleted(user.id);
      const transformedHistory = completedGoals.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        createdAt: g.created_at,
        completedAt: g.completed_at,
        reflection: g.reflection,
        finalIntegrityScore: g.final_integrity_score,
        stats: g.stats || {},
        milestones: (g.milestones || []).map(m => ({
          id: m.id,
          number: m.number,
          title: m.title,
          status: m.status,
        })),
      }));
      setGoalHistory(transformedHistory);

    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = {
    // State
    user,
    authUser,
    currentGoal,
    milestones,
    goalHistory,
    isLoading,
    error,
    expiredPromise,

    // Computed
    currentLockedMilestone,
    nextPendingMilestone,
    hasActivePromise,
    canFinishGoal,
    needsGoalSetup,
    isAuthenticated: !!user, // Has a user account (anonymous or Google)
    isSignedIn: !!authUser, // Signed in with Google

    // Auth operations
    signOut,

    // Goal operations
    createGoal,
    completeGoal,

    // Milestone operations
    addMilestone,
    updateMilestone,
    deleteMilestone,
    lockPromise,
    completeMilestone,
    breakPromise,
    addWitness,

    // Utility
    getTimeRemaining,
    clearExpiredPromise,
    refreshData,

    // Calendar/Journal
    calendarData,
    toggleCalendarDay,
    updateJournalEntry,
    getJournalEntry,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
