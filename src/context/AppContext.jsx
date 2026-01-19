import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

// Storage keys
const STORAGE_KEYS = {
  USER: 'shift_journey_user',
  GOAL: 'shift_journey_goal',
  MILESTONES: 'shift_journey_milestones',
  CALENDAR: 'shift_journey_calendar',
  FAILURES: 'shift_journey_failures',
  AUTH: 'shift_journey_auth',
  HAS_COMPLETED_SETUP: 'shift_journey_has_completed_setup',
  GOAL_HISTORY: 'shift_journey_goal_history',
};

// Default data for new users
const defaultData = {
  user: {
    id: 1,
    name: 'User',
    fullName: 'New User',
    email: 'user@example.com',
    avatar: null,
    integrityScore: 100,
    status: 'Reliable',
    joinedAt: new Date().toISOString(),
  },
  currentGoal: null,
  milestones: [],
  calendarData: {},
  failureHistory: [],
};

// Demo data for demonstration
const demoData = {
  user: {
    id: 1,
    name: 'Sarah',
    fullName: 'Sarah Stevenson',
    email: 'stevenson@email.com',
    avatar: null,
    integrityScore: 41,
    status: 'Inconsistent',
    joinedAt: '2024-01-15',
  },
  currentGoal: {
    id: 1,
    title: 'Launch My Startup',
    description: 'Build and launch my startup MVP',
    createdAt: '2024-01-20',
    targetDate: '2024-06-30',
    status: 'active',
  },
  milestones: [
    {
      id: 1,
      goalId: 1,
      number: 1,
      title: 'Define MVP features',
      status: 'completed',
      completedAt: '2024-01-25',
      promise: null,
    },
    {
      id: 2,
      goalId: 1,
      number: 2,
      title: 'Design wireframes',
      status: 'completed',
      completedAt: '2024-02-01',
      promise: null,
    },
    {
      id: 3,
      goalId: 1,
      number: 3,
      title: 'Build landing page',
      status: 'broken',
      brokenAt: '2024-02-10',
      reason: 'Priorities shifted, lacked time',
      promise: {
        text: 'I promise that I will build the landing page before Feb 10, 8:00 PM.',
        deadline: '2024-02-10T20:00:00',
        consequence: 'I accept the consequence.',
        lockedAt: '2024-02-08T10:00:00',
      },
    },
    {
      id: 4,
      goalId: 1,
      number: 4,
      title: 'Set up backend server',
      status: 'broken',
      brokenAt: '2024-02-15',
      reason: "Wasn't prepared; need to focus more",
      promise: {
        text: 'I promise that I will set up the backend server before Feb 15, 7:00 PM.',
        deadline: '2024-02-15T19:00:00',
        consequence: 'I accept the consequence.',
        lockedAt: '2024-02-12T09:00:00',
      },
    },
    {
      id: 5,
      goalId: 1,
      number: 5,
      title: 'Prepare investor pitch',
      status: 'locked',
      promise: {
        text: 'I promise that I will write and refine the pitch deck before the deadline.',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000 + 7 * 60 * 1000 + 58 * 1000).toISOString(),
        consequence: 'I accept the consequence.',
        lockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      id: 6,
      goalId: 1,
      number: 6,
      title: 'Prepare API integrations',
      status: 'pending',
      promise: null,
    },
  ],
  calendarData: {
    '2024-02-01': { worked: true },
    '2024-02-02': { worked: true },
    '2024-02-03': { worked: false },
    '2024-02-04': { worked: true },
    '2024-02-05': { worked: true },
    '2024-02-06': { worked: false },
    '2024-02-07': { worked: true },
    '2024-02-08': { worked: true },
    '2024-02-09': { worked: false },
    '2024-02-10': { worked: false },
    '2024-02-11': { worked: true },
    '2024-02-12': { worked: true },
  },
  failureHistory: [
    {
      milestoneId: 4,
      milestoneNumber: 4,
      title: 'Set up backend server',
      status: 'broken',
      reason: "Wasn't prepared; need to focus more",
      brokenAt: '2024-02-15',
    },
    {
      milestoneId: 3,
      milestoneNumber: 3,
      title: 'Build landing page',
      status: 'broken',
      reason: 'Priorities shifted, lacked time',
      brokenAt: '2024-02-10',
    },
  ],
};

// Helper to load from localStorage
const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

// Helper to save to localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Get integrity status from score
// 0-30: Unreliable, 31-70: Inconsistent, 71-100: Reliable
const getIntegrityStatus = (score) => {
  if (score > 70) return 'Reliable';
  if (score > 30) return 'Inconsistent';
  return 'Unreliable';
};

export function AppProvider({ children }) {
  // Initialize state from localStorage or use demo data
  const [user, setUser] = useState(() =>
    loadFromStorage(STORAGE_KEYS.USER, demoData.user)
  );
  const [currentGoal, setCurrentGoal] = useState(() =>
    loadFromStorage(STORAGE_KEYS.GOAL, demoData.currentGoal)
  );
  const [milestones, setMilestones] = useState(() =>
    loadFromStorage(STORAGE_KEYS.MILESTONES, demoData.milestones)
  );
  const [calendarData, setCalendarData] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CALENDAR, demoData.calendarData)
  );
  const [failureHistory, setFailureHistory] = useState(() =>
    loadFromStorage(STORAGE_KEYS.FAILURES, demoData.failureHistory)
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    loadFromStorage(STORAGE_KEYS.AUTH, false)
  );
  const [hasCompletedSetup, setHasCompletedSetup] = useState(() =>
    loadFromStorage(STORAGE_KEYS.HAS_COMPLETED_SETUP, true) // Default true for demo data
  );
  const [goalHistory, setGoalHistory] = useState(() =>
    loadFromStorage(STORAGE_KEYS.GOAL_HISTORY, [])
  );

  // State for expired promise modal
  const [expiredPromise, setExpiredPromise] = useState(null);

  // Check if user needs to complete setup (create goal)
  const needsGoalSetup = !currentGoal && hasCompletedSetup === false;

  // Persist state changes to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER, user);
  }, [user]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOAL, currentGoal);
  }, [currentGoal]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MILESTONES, milestones);
  }, [milestones]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CALENDAR, calendarData);
  }, [calendarData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FAILURES, failureHistory);
  }, [failureHistory]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AUTH, isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HAS_COMPLETED_SETUP, hasCompletedSetup);
  }, [hasCompletedSetup]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOAL_HISTORY, goalHistory);
  }, [goalHistory]);

  // Get current locked milestone
  const currentLockedMilestone = milestones.find(m => m.status === 'locked');

  // Get next pending milestone
  const nextPendingMilestone = milestones.find(m => m.status === 'pending');

  // Check if there's an active (locked) promise
  const hasActivePromise = !!currentLockedMilestone;

  // Auto-expire promise function
  const autoExpirePromise = useCallback((milestone, reason = 'Deadline passed - promise automatically marked as broken') => {
    // Update milestone status
    setMilestones(prev => prev.map(m =>
      m.id === milestone.id
        ? { ...m, status: 'broken', brokenAt: new Date().toISOString(), reason, autoExpired: true }
        : m
    ));

    // Add to failure history
    setFailureHistory(prev => [
      {
        milestoneId: milestone.id,
        milestoneNumber: milestone.number,
        title: milestone.title,
        status: 'broken',
        reason,
        brokenAt: new Date().toISOString(),
        autoExpired: true,
      },
      ...prev,
    ]);

    // Decrease integrity score
    setUser(prev => {
      const newScore = Math.max(0, prev.integrityScore - 15);
      return {
        ...prev,
        integrityScore: newScore,
        status: getIntegrityStatus(newScore),
      };
    });

    // Set expired promise for modal notification
    setExpiredPromise(milestone);
  }, []);

  // Check for expired promises on mount and periodically
  useEffect(() => {
    const checkExpiredPromise = () => {
      if (!currentLockedMilestone?.promise?.deadline) return;

      const deadline = new Date(currentLockedMilestone.promise.deadline);
      const now = new Date();

      if (now > deadline) {
        // Deadline has passed - auto-expire
        autoExpirePromise(currentLockedMilestone);
      }
    };

    // Check immediately on mount
    checkExpiredPromise();

    // Check every second for deadline expiration
    const interval = setInterval(checkExpiredPromise, 1000);

    return () => clearInterval(interval);
  }, [currentLockedMilestone, autoExpirePromise]);

  // Calculate time remaining for locked milestone
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

  // Create a new goal (only if no active promise)
  const createGoal = (goalData) => {
    if (hasActivePromise) {
      throw new Error('Cannot create a new goal while you have an active locked promise.');
    }

    const newGoal = {
      id: Date.now(),
      ...goalData,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setCurrentGoal(newGoal);
    setMilestones([]);
    setHasCompletedSetup(true);
    return newGoal;
  };

  // Check if can create new goal
  const canCreateNewGoal = !hasActivePromise;

  // Add milestone
  const addMilestone = (title) => {
    const newMilestone = {
      id: Date.now(),
      goalId: currentGoal?.id,
      number: milestones.length + 1,
      title,
      status: 'pending',
      promise: null,
    };
    setMilestones([...milestones, newMilestone]);
    return newMilestone;
  };

  // Update milestone (only if pending)
  const updateMilestone = (id, updates) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone && milestone.status !== 'pending') {
      throw new Error('Cannot edit a locked, completed, or broken milestone.');
    }
    setMilestones(milestones.map(m =>
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  // Delete milestone (only if pending)
  const deleteMilestone = (id) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone && milestone.status !== 'pending') {
      throw new Error('Cannot delete a locked, completed, or broken milestone.');
    }
    const filtered = milestones.filter(m => m.id !== id);
    const renumbered = filtered.map((m, index) => ({ ...m, number: index + 1 }));
    setMilestones(renumbered);
  };

  // Lock a promise (only if no other promise is locked)
  const lockPromise = (milestoneId, promiseData) => {
    if (hasActivePromise) {
      throw new Error('Cannot lock a new promise while another is active.');
    }

    const promise = {
      text: promiseData.text,
      deadline: promiseData.deadline,
      consequence: promiseData.consequence,
      lockedAt: new Date().toISOString(),
    };

    setMilestones(milestones.map(m =>
      m.id === milestoneId
        ? { ...m, status: 'locked', promise }
        : m
    ));
  };

  // Complete milestone (promise kept)
  const completeMilestone = (milestoneId) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status !== 'locked') {
      throw new Error('Can only complete a locked milestone.');
    }

    // Check if deadline has passed
    if (milestone.promise?.deadline && new Date() > new Date(milestone.promise.deadline)) {
      throw new Error('Cannot mark as complete - deadline has already passed.');
    }

    setMilestones(milestones.map(m =>
      m.id === milestoneId
        ? { ...m, status: 'completed', completedAt: new Date().toISOString() }
        : m
    ));

    // Increase integrity score
    setUser(prev => {
      const newScore = Math.min(100, prev.integrityScore + 10);
      return {
        ...prev,
        integrityScore: newScore,
        status: getIntegrityStatus(newScore),
      };
    });
  };

  // Break promise (manual) - accepts structured reflection object
  const breakPromise = (milestoneId, reflection) => {
    // Support both string (legacy) and object (structured reflection)
    const reflectionData = typeof reflection === 'string'
      ? { whyFailed: reflection, whatWasInControl: '', whatWillChange: '' }
      : reflection;

    if (!reflectionData.whyFailed?.trim()) {
      throw new Error('You must explain why you failed.');
    }

    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status !== 'locked') {
      throw new Error('Can only break a locked milestone.');
    }

    setMilestones(milestones.map(m =>
      m.id === milestoneId
        ? {
            ...m,
            status: 'broken',
            brokenAt: new Date().toISOString(),
            reason: reflectionData.whyFailed,
            reflection: reflectionData,
          }
        : m
    ));

    // Add to failure history with full reflection
    setFailureHistory(prev => [
      {
        milestoneId,
        milestoneNumber: milestone.number,
        title: milestone.title,
        status: 'broken',
        reason: reflectionData.whyFailed,
        reflection: reflectionData,
        brokenAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    // Decrease integrity score
    setUser(prev => {
      const newScore = Math.max(0, prev.integrityScore - 15);
      return {
        ...prev,
        integrityScore: newScore,
        status: getIntegrityStatus(newScore),
      };
    });
  };

  // Upload consequence proof for a broken milestone
  const uploadConsequenceProof = (milestoneId, proofData) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status !== 'broken') {
      throw new Error('Can only upload proof for broken milestones.');
    }

    if (!proofData.description?.trim()) {
      throw new Error('Please describe how you fulfilled the consequence.');
    }

    const proof = {
      description: proofData.description,
      imageData: proofData.imageData || null, // Base64 data URI for image
      uploadedAt: new Date().toISOString(),
    };

    // Update milestone with proof
    setMilestones(milestones.map(m =>
      m.id === milestoneId
        ? { ...m, consequenceProof: proof }
        : m
    ));

    // Update failure history with proof
    setFailureHistory(prev => prev.map(f =>
      f.milestoneId === milestoneId
        ? { ...f, consequenceProof: proof }
        : f
    ));

    // Small integrity recovery for completing consequence (5 points)
    setUser(prev => {
      const newScore = Math.min(100, prev.integrityScore + 5);
      return {
        ...prev,
        integrityScore: newScore,
        status: getIntegrityStatus(newScore),
      };
    });
  };

  // Get broken milestones that need consequence proof
  const brokenMilestonesNeedingProof = milestones.filter(
    m => m.status === 'broken' && m.promise?.consequence && !m.consequenceProof
  );

  // Check if goal can be finished (all milestones resolved - none pending or locked)
  const canFinishGoal = currentGoal && milestones.length > 0 &&
    !milestones.some(m => m.status === 'pending' || m.status === 'locked');

  // Complete/finish the current goal and archive it
  const completeGoal = (reflection = '') => {
    if (!canFinishGoal) {
      throw new Error('Cannot finish goal - there are still pending or locked milestones.');
    }

    const completedMilestones = milestones.filter(m => m.status === 'completed');
    const brokenMilestones = milestones.filter(m => m.status === 'broken');

    // Calculate journey stats
    const stats = {
      totalMilestones: milestones.length,
      completed: completedMilestones.length,
      broken: brokenMilestones.length,
      successRate: milestones.length > 0
        ? Math.round((completedMilestones.length / milestones.length) * 100)
        : 0,
    };

    // Archive the completed goal
    const archivedGoal = {
      ...currentGoal,
      status: 'completed',
      completedAt: new Date().toISOString(),
      reflection,
      milestones: [...milestones],
      stats,
      finalIntegrityScore: user.integrityScore,
    };

    // Add to goal history
    setGoalHistory(prev => [archivedGoal, ...prev]);

    // Clear current goal and milestones
    setCurrentGoal(null);
    setMilestones([]);
    setHasCompletedSetup(false); // This will prompt for new goal creation

    return archivedGoal;
  };

  // Begin integrity repair (small recovery for completing promises)
  const beginRepair = () => {
    // Integrity can only be repaired by keeping future promises
    // This function is informational - actual repair happens in completeMilestone
    return {
      currentScore: user.integrityScore,
      message: 'Complete your locked promises to gradually rebuild your integrity.',
      recoveryPerPromise: 10,
    };
  };

  // Toggle calendar day
  const toggleCalendarDay = (date, worked) => {
    setCalendarData(prev => ({
      ...prev,
      [date]: { worked },
    }));
  };

  // Clear expired promise notification
  const clearExpiredPromise = () => {
    setExpiredPromise(null);
  };

  // Reset to demo data (for testing)
  const resetToDemo = () => {
    setUser(demoData.user);
    setCurrentGoal(demoData.currentGoal);
    setMilestones(demoData.milestones);
    setCalendarData(demoData.calendarData);
    setFailureHistory(demoData.failureHistory);
  };

  // Reset all data (danger zone)
  const resetAllData = () => {
    if (hasActivePromise) {
      throw new Error('Cannot reset while you have an active locked promise. You must complete or break it first.');
    }
    setUser(defaultData.user);
    setCurrentGoal(defaultData.currentGoal);
    setMilestones(defaultData.milestones);
    setCalendarData(defaultData.calendarData);
    setFailureHistory(defaultData.failureHistory);
  };

  // Login (for demo/existing users)
  const login = () => {
    setIsAuthenticated(true);
  };

  // Sign up (for new users - starts with blank slate)
  const signUp = (userData) => {
    // Create new user with provided data
    const newUser = {
      id: Date.now(),
      name: userData.name?.split(' ')[0] || 'User',
      fullName: userData.name || 'New User',
      email: userData.email || 'user@example.com',
      avatar: null,
      integrityScore: 100,
      status: 'Trusted',
      joinedAt: new Date().toISOString(),
    };

    setUser(newUser);
    setCurrentGoal(null);
    setMilestones([]);
    setCalendarData({});
    setFailureHistory([]);
    setHasCompletedSetup(false);
    setIsAuthenticated(true);
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
  };

  const value = {
    // State
    user,
    setUser,
    currentGoal,
    setCurrentGoal,
    milestones,
    setMilestones,
    calendarData,
    failureHistory,
    isAuthenticated,
    currentLockedMilestone,
    nextPendingMilestone,
    hasActivePromise,
    canCreateNewGoal,
    expiredPromise,
    needsGoalSetup,
    hasCompletedSetup,
    brokenMilestonesNeedingProof,
    canFinishGoal,
    goalHistory,

    // Functions
    getTimeRemaining,
    uploadConsequenceProof,
    completeGoal,
    createGoal,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    lockPromise,
    completeMilestone,
    breakPromise,
    beginRepair,
    toggleCalendarDay,
    clearExpiredPromise,
    resetToDemo,
    resetAllData,
    login,
    signUp,
    logout,
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
