import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getDeviceId, anonymousUserService } from '../services/database';

const MilestoneContext = createContext();

// Milestone states
export const MILESTONE_STATUS = {
  PLANNED: 'planned',
  LOCKED: 'locked',
  KEPT: 'kept',
  BROKEN: 'broken',
};

// Map frontend status to database status
const STATUS_MAP = {
  [MILESTONE_STATUS.PLANNED]: 'pending',
  [MILESTONE_STATUS.LOCKED]: 'locked',
  [MILESTONE_STATUS.KEPT]: 'completed',
  [MILESTONE_STATUS.BROKEN]: 'broken',
};

// Map database status to frontend status
const REVERSE_STATUS_MAP = {
  'pending': MILESTONE_STATUS.PLANNED,
  'locked': MILESTONE_STATUS.LOCKED,
  'completed': MILESTONE_STATUS.KEPT,
  'broken': MILESTONE_STATUS.BROKEN,
};

// Transform database milestone to frontend format
const transformMilestone = (dbMilestone) => ({
  id: dbMilestone.id,
  title: dbMilestone.title,
  status: REVERSE_STATUS_MAP[dbMilestone.status] || MILESTONE_STATUS.PLANNED,
  order: dbMilestone.sort_order || dbMilestone.number || 0,
  createdAt: dbMilestone.created_at,
  needsReflection: dbMilestone.needs_reflection || false,
  autoExpired: dbMilestone.auto_expired || false,
  promise: dbMilestone.promise_text ? {
    text: dbMilestone.promise_text,
    deadline: dbMilestone.promise_deadline,
    consequence: dbMilestone.promise_consequence,
    lockedAt: dbMilestone.promise_locked_at,
  } : null,
  reflection: dbMilestone.reflection,
  keptAt: dbMilestone.completed_at,
  brokenAt: dbMilestone.broken_at,
  shareId: dbMilestone.share_id,
});

// Transform database goal to frontend format
const transformGoal = (dbGoal) => ({
  id: dbGoal.id,
  title: dbGoal.title,
  description: dbGoal.description,
  createdAt: dbGoal.created_at,
  status: dbGoal.status,
});

export function MilestoneProvider({ children }) {
  const [user, setUser] = useState(null);
  const [goal, setGoalState] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize - load user and data from Supabase
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isSupabaseConfigured()) {
          console.warn('Supabase not configured. Milestone system requires Supabase.');
          setError('Database not configured');
          setIsLoading(false);
          return;
        }

        // Get or create anonymous user
        const dbUser = await anonymousUserService.getOrCreate();
        if (!dbUser) {
          throw new Error('Failed to initialize user');
        }
        setUser(dbUser);

        // Load active goal
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', dbUser.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (goalError) throw goalError;

        if (goalData) {
          setGoalState(transformGoal(goalData));

          // Load milestones for the goal
          const { data: milestonesData, error: milestonesError } = await supabase
            .from('milestones')
            .select('*')
            .eq('goal_id', goalData.id)
            .order('sort_order', { ascending: true });

          if (milestonesError) throw milestonesError;
          setMilestones((milestonesData || []).map(transformMilestone));
        }

      } catch (err) {
        console.error('Failed to initialize milestone system:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Get current locked milestone
  const lockedMilestone = milestones.find(m => m.status === MILESTONE_STATUS.LOCKED);
  const hasLockedMilestone = !!lockedMilestone;

  // Auto-expire check for locked milestone
  useEffect(() => {
    if (!lockedMilestone?.promise?.deadline) return;

    const checkExpiry = async () => {
      const deadline = new Date(lockedMilestone.promise.deadline);
      const now = new Date();

      if (now > deadline && lockedMilestone.status === MILESTONE_STATUS.LOCKED) {
        // Auto-mark as broken
        try {
          const { error } = await supabase
            .from('milestones')
            .update({
              status: 'broken',
              broken_at: now.toISOString(),
              auto_expired: true,
              needs_reflection: true,
            })
            .eq('id', lockedMilestone.id);

          if (error) throw error;

          // Update local state
          setMilestones(prev =>
            prev.map(m =>
              m.id === lockedMilestone.id
                ? {
                    ...m,
                    status: MILESTONE_STATUS.BROKEN,
                    brokenAt: now.toISOString(),
                    autoExpired: true,
                    needsReflection: true,
                  }
                : m
            )
          );
        } catch (err) {
          console.error('Failed to auto-expire milestone:', err);
        }
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [lockedMilestone]);

  // =====================================================
  // GOAL OPERATIONS
  // =====================================================

  const setGoal = useCallback(async (goalData) => {
    if (!user) throw new Error('User not initialized');

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goalData.title,
          description: goalData.description,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      setGoalState(transformGoal(data));
      setMilestones([]);
      return data;
    } catch (err) {
      console.error('Failed to create goal:', err);
      throw err;
    }
  }, [user]);

  // =====================================================
  // MILESTONE CRUD OPERATIONS
  // =====================================================

  const addMilestone = useCallback(async (title) => {
    if (!goal || !user) throw new Error('Goal or user not initialized');

    try {
      const newOrder = milestones.length;

      const { data, error } = await supabase
        .from('milestones')
        .insert({
          goal_id: goal.id,
          user_id: user.id,
          title,
          number: newOrder + 1,
          sort_order: newOrder,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const newMilestone = transformMilestone(data);
      setMilestones(prev => [...prev, newMilestone]);
      return newMilestone;
    } catch (err) {
      console.error('Failed to add milestone:', err);
      throw err;
    }
  }, [goal, user, milestones.length]);

  const updateMilestone = useCallback(async (id, updates) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone?.status !== MILESTONE_STATUS.PLANNED) {
      throw new Error('Cannot edit milestone that is not PLANNED');
    }

    try {
      const { error } = await supabase
        .from('milestones')
        .update({ title: updates.title })
        .eq('id', id);

      if (error) throw error;

      setMilestones(prev =>
        prev.map(m => m.id === id ? { ...m, ...updates } : m)
      );
    } catch (err) {
      console.error('Failed to update milestone:', err);
      throw err;
    }
  }, [milestones]);

  const deleteMilestone = useCallback(async (id) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone?.status !== MILESTONE_STATUS.PLANNED) {
      throw new Error('Cannot delete milestone that is not PLANNED');
    }

    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMilestones(prev => {
        const filtered = prev.filter(m => m.id !== id);
        return filtered.map((m, index) => ({ ...m, order: index }));
      });
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      throw err;
    }
  }, [milestones]);

  const reorderMilestones = useCallback(async (startIndex, endIndex) => {
    const items = Array.from(milestones);
    const [removed] = items.splice(startIndex, 1);

    if (removed.status !== MILESTONE_STATUS.PLANNED) {
      throw new Error('Cannot reorder milestone that is not PLANNED');
    }

    items.splice(endIndex, 0, removed);
    const reordered = items.map((m, index) => ({ ...m, order: index }));

    // Update local state immediately
    setMilestones(reordered);

    // Update database
    try {
      for (const m of reordered) {
        await supabase
          .from('milestones')
          .update({ sort_order: m.order, number: m.order + 1 })
          .eq('id', m.id);
      }
    } catch (err) {
      console.error('Failed to reorder milestones:', err);
      // Revert on error
      setMilestones(milestones);
      throw err;
    }
  }, [milestones]);

  // =====================================================
  // PROMISE LOCKING
  // =====================================================

  const lockMilestone = useCallback(async (id, promiseData) => {
    if (hasLockedMilestone) {
      throw new Error('Another milestone is already locked. Complete it first.');
    }

    const milestone = milestones.find(m => m.id === id);
    if (milestone?.status !== MILESTONE_STATUS.PLANNED) {
      throw new Error('Can only lock PLANNED milestones');
    }

    try {
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error } = await supabase
        .from('milestones')
        .update({
          status: 'locked',
          promise_text: promiseData.text,
          promise_deadline: promiseData.deadline,
          promise_consequence: promiseData.consequence || null,
          promise_locked_at: new Date().toISOString(),
          share_id: shareId,
        })
        .eq('id', id);

      if (error) throw error;

      setMilestones(prev =>
        prev.map(m =>
          m.id === id
            ? {
                ...m,
                status: MILESTONE_STATUS.LOCKED,
                promise: {
                  text: promiseData.text,
                  deadline: promiseData.deadline,
                  consequence: promiseData.consequence || null,
                  lockedAt: new Date().toISOString(),
                },
                shareId,
              }
            : m
        )
      );
    } catch (err) {
      console.error('Failed to lock milestone:', err);
      throw err;
    }
  }, [hasLockedMilestone, milestones]);

  // =====================================================
  // MILESTONE COMPLETION
  // =====================================================

  const markAsKept = useCallback(async (id) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone?.status !== MILESTONE_STATUS.LOCKED) {
      throw new Error('Can only mark LOCKED milestones as KEPT');
    }

    if (milestone.promise?.deadline && new Date() > new Date(milestone.promise.deadline)) {
      throw new Error('Deadline has passed. Cannot mark as KEPT.');
    }

    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setMilestones(prev =>
        prev.map(m =>
          m.id === id
            ? { ...m, status: MILESTONE_STATUS.KEPT, keptAt: new Date().toISOString() }
            : m
        )
      );
    } catch (err) {
      console.error('Failed to mark milestone as kept:', err);
      throw err;
    }
  }, [milestones]);

  const markAsBroken = useCallback(async (id) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone?.status !== MILESTONE_STATUS.LOCKED) {
      throw new Error('Can only mark LOCKED milestones as BROKEN');
    }

    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          status: 'broken',
          broken_at: new Date().toISOString(),
          needs_reflection: true,
        })
        .eq('id', id);

      if (error) throw error;

      setMilestones(prev =>
        prev.map(m =>
          m.id === id
            ? {
                ...m,
                status: MILESTONE_STATUS.BROKEN,
                brokenAt: new Date().toISOString(),
                needsReflection: true,
              }
            : m
        )
      );
    } catch (err) {
      console.error('Failed to mark milestone as broken:', err);
      throw err;
    }
  }, [milestones]);

  // =====================================================
  // REFLECTION (Required for BROKEN milestones)
  // =====================================================

  const submitReflection = useCallback(async (id, reflectionData) => {
    if (!reflectionData.whyFailed?.trim()) {
      throw new Error('Must explain why you failed');
    }
    if (!reflectionData.whatWasInControl?.trim()) {
      throw new Error('Must explain what was in your control');
    }
    if (!reflectionData.whatWillChange?.trim()) {
      throw new Error('Must explain what you will change');
    }

    const milestone = milestones.find(m => m.id === id);
    if (milestone?.status !== MILESTONE_STATUS.BROKEN) {
      throw new Error('Can only add reflection to BROKEN milestones');
    }

    // Check if consequence proof is required
    if (milestone.promise?.consequence) {
      if (!reflectionData.consequenceProof) {
        throw new Error('Must provide proof of your consequence');
      }
    }

    try {
      const reflection = {
        whyFailed: reflectionData.whyFailed,
        whatWasInControl: reflectionData.whatWasInControl,
        whatWillChange: reflectionData.whatWillChange,
        consequenceProof: reflectionData.consequenceProof || null,
        consequenceProofType: reflectionData.consequenceProofType || null,
        submittedAt: new Date().toISOString(),
      };

      // Also store consequence proof separately for easier querying
      const consequenceProof = reflectionData.consequenceProof ? {
        type: reflectionData.consequenceProofType,
        data: reflectionData.consequenceProof,
        submittedAt: new Date().toISOString(),
      } : null;

      const { error } = await supabase
        .from('milestones')
        .update({
          reflection,
          consequence_proof: consequenceProof,
          needs_reflection: false,
        })
        .eq('id', id);

      if (error) throw error;

      setMilestones(prev =>
        prev.map(m =>
          m.id === id
            ? { ...m, reflection, consequenceProof, needsReflection: false }
            : m
        )
      );
    } catch (err) {
      console.error('Failed to submit reflection:', err);
      throw err;
    }
  }, [milestones]);

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const getTimeRemaining = useCallback(() => {
    if (!lockedMilestone?.promise?.deadline) return null;

    const deadline = new Date(lockedMilestone.promise.deadline);
    const now = new Date();
    const diff = deadline - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  }, [lockedMilestone]);

  // Get milestones needing reflection
  const milestonesNeedingReflection = milestones.filter(
    m => m.status === MILESTONE_STATUS.BROKEN && m.needsReflection
  );

  // Get next available milestone to lock
  const nextAvailableMilestone = !hasLockedMilestone && milestonesNeedingReflection.length === 0
    ? milestones.find(m => m.status === MILESTONE_STATUS.PLANNED)
    : null;

  // Reset all data (for testing)
  const resetAll = useCallback(async () => {
    if (!user) return;

    try {
      // Delete all goals for this user (cascades to milestones)
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setGoalState(null);
      setMilestones([]);
    } catch (err) {
      console.error('Failed to reset:', err);
      throw err;
    }
  }, [user]);

  // History (completed/broken milestones)
  const history = milestones.filter(
    m => m.status === MILESTONE_STATUS.KEPT || (m.status === MILESTONE_STATUS.BROKEN && !m.needsReflection)
  );

  const value = {
    // Loading state
    isLoading,
    error,

    // State
    goal,
    milestones,
    history,
    lockedMilestone,
    hasLockedMilestone,
    milestonesNeedingReflection,
    nextAvailableMilestone,

    // Goal operations
    setGoal,

    // Milestone CRUD
    addMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones,

    // Promise operations
    lockMilestone,
    markAsKept,
    markAsBroken,
    submitReflection,

    // Utility
    getTimeRemaining,
    resetAll,

    // Constants
    MILESTONE_STATUS,
  };

  return (
    <MilestoneContext.Provider value={value}>
      {children}
    </MilestoneContext.Provider>
  );
}

export function useMilestones() {
  const context = useContext(MilestoneContext);
  if (!context) {
    throw new Error('useMilestones must be used within a MilestoneProvider');
  }
  return context;
}

export default MilestoneContext;
