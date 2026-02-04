import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  anonymousUserService,
  authService,
  goalService,
  milestoneService,
  calendarService,
  integrityService as dbIntegrityService,
  integrityHistoryService,
  userMotivationService,
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

  // Calendar/Journal state
  const [calendarData, setCalendarData] = useState({});

  // User motivation (personal "why" reminder) state
  const [userMotivation, setUserMotivation] = useState(null);

  // Tier change notification state
  // { direction: 'up'|'down', newTier, oldTier, scoreChange }
  const [tierChangeNotification, setTierChangeNotification] = useState(null);
  const dismissTierChange = () => setTierChangeNotification(null);

  // Initialization guards to prevent race conditions
  const isInitialized = useRef(false);

  // =====================================================
  // INITIALIZATION
  // =====================================================

  // Helper to load user data - optimized with parallel queries
  const loadUserData = async (dbUser) => {
    // Set user immediately so UI can render
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

    // Load all data in parallel for faster loading
    const [activeGoal, completedGoals, calData, motivationData] = await Promise.all([
      goalService.getActive(dbUser.id),
      goalService.getCompleted(dbUser.id),
      calendarService.getByUserId(dbUser.id).catch(() => []),
      userMotivationService.getByUserId(dbUser.id).catch(() => null),
    ]);

    // Process user motivation (personal "why" reminder)
    if (motivationData) {
      setUserMotivation({
        id: motivationData.id,
        heading: motivationData.heading,
        quoteText: motivationData.quote_text,
        bgColor: motivationData.bg_color,
        textColor: motivationData.text_color,
        fontStyle: motivationData.font_style,
        imageUrl: motivationData.image_url,
        imageType: motivationData.image_type,
        createdAt: motivationData.created_at,
        updatedAt: motivationData.updated_at,
      });
    } else {
      setUserMotivation(null);
    }

    // Process active goal
    if (activeGoal) {
      setCurrentGoal({
        id: activeGoal.id,
        title: activeGoal.title,
        description: activeGoal.description,
        targetDate: activeGoal.target_date,
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
        reason: m.break_reason,
        shareId: m.share_id,
      }));
      setMilestones(transformedMilestones);
    } else {
      setCurrentGoal(null);
      setMilestones([]);
    }

    // Process goal history
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

    // Process calendar data
    const calendarMap = {};
    (calData || []).forEach(entry => {
      calendarMap[entry.date] = {
        worked: entry.worked,
        journal: entry.notes,
      };
    });
    setCalendarData(calendarMap);
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
        // Add timeout to prevent infinite loading if Supabase is slow/paused
        const timeout = (ms) => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout. Please check your internet and refresh.')), ms)
        );

        const loadData = async () => {
          // ALWAYS ensure we have a Supabase auth session for RLS
          let session = await authService.getSession();

          if (!session?.user) {
            // No existing session - create anonymous auth session
            console.log('No session found, creating anonymous auth session...');
            const anonResult = await authService.signInAnonymously();
            session = anonResult?.session;
            
            if (!session?.user) {
              throw new Error('Failed to establish authentication session. Please refresh the page.');
            }
          }

          // We now ALWAYS have a session with auth.uid() for RLS
          let dbUser;
          
          // Set authUser only for Google (non-anonymous) users
          if (!session.user.is_anonymous) {
            setAuthUser(session.user);
          }
          
          // Get or create user record in database
          dbUser = await authService.getOrCreateAuthUser(session.user);
          
          if (!dbUser) {
            throw new Error('Failed to initialize user record.');
          }

          await loadUserData(dbUser);
        };

        await Promise.race([loadData(), timeout(15000)]);

      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err.message || 'Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    initializeApp();
  }, []);

  // Listen for auth state changes (sign in/out)
  // Skip events during initial setup to avoid race condition with initializeApp
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      // Skip events during initial load - initializeApp handles the first session
      if (!isInitialized.current) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in (Google or anonymous) - reload their data
        const isGoogleUser = !session.user.is_anonymous;
        if (isGoogleUser) {
          setAuthUser(session.user);
        }
        try {
          const dbUser = await authService.getOrCreateAuthUser(session.user);
          if (dbUser) {
            await loadUserData(dbUser);
          }
        } catch (err) {
          console.error('Failed to load user after sign in:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out of Google - re-establish anonymous session for RLS
        setAuthUser(null);
        try {
          // Create new anonymous session so RLS continues to work
          console.log('User signed out, re-establishing anonymous session...');
          const anonResult = await authService.signInAnonymously();
          
          if (!anonResult?.session?.user) {
            console.error('Failed to re-establish anonymous session');
            setError('Session lost. Please refresh the page.');
            return;
          }
          
          // Get or create anonymous user record
          const dbUser = await authService.getOrCreateAuthUser(anonResult.session.user);
          if (dbUser) {
            await loadUserData(dbUser);
          }
        } catch (err) {
          console.error('Failed to re-establish anonymous session:', err);
          setError('Session lost. Please refresh the page.');
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

  // Check if a promise has expired (deadline passed) - don't auto-break,
  // let the user reflect first via the dashboard break modal
  const isPromiseExpired = currentLockedMilestone?.promise?.deadline
    ? new Date() > new Date(currentLockedMilestone.promise.deadline)
    : false;

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
        targetDate: goalData.targetDate || null,
      });

      const newGoal = {
        id: dbGoal.id,
        title: dbGoal.title,
        description: dbGoal.description,
        targetDate: dbGoal.target_date,
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
  // Set forceComplete=true to skip deadline check (for late completions)
  const completeMilestone = async (milestoneId, forceComplete = false) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status !== 'locked') {
      throw new Error('Can only complete a locked milestone.');
    }

    // Check if deadline has passed (skip if forceComplete is true)
    if (!forceComplete && milestone.promise?.deadline && new Date() > new Date(milestone.promise.deadline)) {
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

      // Trigger tier-change notification if threshold crossed
      if (integrityResult.tierChange?.changed) {
        setTierChangeNotification({
          ...integrityResult.tierChange,
          scoreChange: integrityResult.scoreChange,
        });
      }
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

      // Trigger tier-change notification if threshold crossed
      if (integrityResult.tierChange?.changed) {
        setTierChangeNotification({
          ...integrityResult.tierChange,
          scoreChange: integrityResult.scoreChange,
        });
      }
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

  // =====================================================
  // CALENDAR/JOURNAL OPERATIONS
  // =====================================================

  // Save calendar day - worked status + journal in a single DB call
  const saveCalendarDay = async (dateKey, worked, journal) => {
    if (!user) return;

    const previousData = calendarData[dateKey] || {};

    // Update local state immediately
    setCalendarData(prev => ({
      ...prev,
      [dateKey]: { worked, journal },
    }));

    // Sync to database
    try {
      await calendarService.upsert(user.id, dateKey, worked, journal || null);
    } catch (err) {
      console.error('Failed to save calendar data:', err);
      // Revert to actual previous state on error
      setCalendarData(prev => ({
        ...prev,
        [dateKey]: previousData,
      }));
      throw err;
    }
  };

  // Get journal entry for a specific day
  const getJournalEntry = (dateKey) => {
    return calendarData[dateKey]?.journal || '';
  };

  // =====================================================
  // USER MOTIVATION OPERATIONS (Personal "Why" Reminder)
  // =====================================================

  // Save or update user motivation
  const saveUserMotivation = async (motivationData) => {
    if (!user) throw new Error('User not initialized');

    try {
      const dbMotivation = await userMotivationService.upsert(user.id, motivationData);

      const transformedMotivation = {
        id: dbMotivation.id,
        heading: dbMotivation.heading,
        quoteText: dbMotivation.quote_text,
        bgColor: dbMotivation.bg_color,
        textColor: dbMotivation.text_color,
        fontStyle: dbMotivation.font_style,
        imageUrl: dbMotivation.image_url,
        imageType: dbMotivation.image_type,
        createdAt: dbMotivation.created_at,
        updatedAt: dbMotivation.updated_at,
      };

      setUserMotivation(transformedMotivation);
      return transformedMotivation;
    } catch (err) {
      console.error('Failed to save user motivation:', err);
      throw new Error('Failed to save your motivation. Please try again.');
    }
  };

  // Delete user motivation
  const deleteUserMotivation = async () => {
    if (!user) throw new Error('User not initialized');

    try {
      await userMotivationService.delete(user.id);
      setUserMotivation(null);
    } catch (err) {
      console.error('Failed to delete user motivation:', err);
      throw new Error('Failed to delete your motivation. Please try again.');
    }
  };

  // Refresh data from database - optimized with parallel queries
  // Does NOT set isLoading to avoid showing full loading screen during refresh
  const refreshData = async () => {
    if (!user) return;

    try {
      // Load in parallel
      const [activeGoal, completedGoals] = await Promise.all([
        goalService.getActive(user.id),
        goalService.getCompleted(user.id),
      ]);

      // Process active goal
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
          reason: m.break_reason,
          shareId: m.share_id,
        }));
        setMilestones(transformedMilestones);
      } else {
        setCurrentGoal(null);
        setMilestones([]);
      }

      // Process history
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

    // Computed
    currentLockedMilestone,
    nextPendingMilestone,
    hasActivePromise,
    canFinishGoal,
    needsGoalSetup,
    isPromiseExpired,
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
    refreshData,

    // Calendar/Journal
    calendarData,
    saveCalendarDay,
    getJournalEntry,

    // User Motivation (Personal "Why" Reminder)
    userMotivation,
    saveUserMotivation,
    deleteUserMotivation,

    // Tier change notification
    tierChangeNotification,
    dismissTierChange,
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
