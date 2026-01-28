import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Database Service Layer for Shift Ascent
 * Provides all database operations with Supabase
 */

// =====================================================
// DEVICE ID HELPERS (For anonymous users)
// =====================================================

const DEVICE_ID_KEY = 'shift_ascent_device_id';

/**
 * Get or create a unique device ID for anonymous user identification
 */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'device_' + crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// =====================================================
// ANONYMOUS USER SERVICE
// =====================================================

export const anonymousUserService = {
  /**
   * Get or create anonymous user by device ID
   */
  async getOrCreate() {
    if (!isSupabaseConfigured()) return null;

    const deviceId = getDeviceId();

    // Try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (existingUser) {
      return existingUser;
    }

    // Create new user if not found
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          device_id: deviceId,
          name: 'User',
          integrity_score: 100,
          failure_streak: 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newUser;
    }

    if (fetchError) throw fetchError;
    return null;
  },

  /**
   * Update user integrity score
   */
  async updateIntegrityScore(userId, newScore) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('users')
      .update({ integrity_score: newScore })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user name
   */
  async updateName(userId, name) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// USER OPERATIONS
// =====================================================

export const userService = {
  /**
   * Get user profile by ID
   */
  async getById(userId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user profile by email
   */
  async getByEmail(email) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create or update user profile
   */
  async upsert(userData) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName,
        avatar_url: userData.avatar,
        integrity_score: userData.integrityScore ?? 50,
        status: userData.status ?? 'Inconsistent',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update integrity score
   */
  async updateIntegrityScore(userId, change) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .rpc('update_integrity_score', {
        p_user_id: userId,
        p_change: change,
      });

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async update(userId, updates) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: updates.fullName,
        avatar_url: updates.avatar,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// GOAL OPERATIONS
// =====================================================

export const goalService = {
  /**
   * Get all goals for a user
   */
  async getByUserId(userId) {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('goals')
      .select('*, milestones(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get active goal for a user (with milestones sorted by number)
   */
  async getActive(userId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      // Fetch milestones separately to ensure proper ordering
      const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
        .eq('goal_id', data.id)
        .order('number', { ascending: true });

      data.milestones = milestones || [];
    }

    return data;
  },

  /**
   * Get completed goals for history
   */
  async getCompleted(userId) {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) throw error;

    // Fetch milestones for each goal
    for (const goal of data) {
      const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
        .eq('goal_id', goal.id)
        .order('number', { ascending: true });

      goal.milestones = milestones || [];
    }

    return data;
  },

  /**
   * Create a new goal
   */
  async create(goalData) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: goalData.userId,
        title: goalData.title,
        description: goalData.description,
        target_date: goalData.targetDate || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a goal
   */
  async update(goalId, updates) {
    if (!isSupabaseConfigured()) return null;

    const updateData = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;
    if (updates.completedAt) updateData.completed_at = updates.completedAt;
    if (updates.reflection !== undefined) updateData.reflection = updates.reflection;
    if (updates.finalIntegrityScore !== undefined) {
      updateData.final_integrity_score = updates.finalIntegrityScore;
    }
    if (updates.stats) updateData.stats = updates.stats;

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Complete a goal with reflection and stats
   */
  async complete(goalId, reflection, finalScore, stats) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('goals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        reflection,
        final_integrity_score: finalScore,
        stats,
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a goal and its milestones
   */
  async delete(goalId) {
    if (!isSupabaseConfigured()) return null;

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
    return true;
  },
};

// =====================================================
// MILESTONE OPERATIONS
// =====================================================

export const milestoneService = {
  /**
   * Get all milestones for a goal
   */
  async getByGoalId(goalId) {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('number', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get milestone by ID
   */
  async getById(milestoneId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .select('*, users(name, integrity_score)')
      .eq('id', milestoneId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get milestone by share ID (for public sharing)
   */
  async getByShareId(shareId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .select('*, users(name, integrity_score), goals(title)')
      .eq('share_id', shareId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get current locked milestone for a user
   */
  async getCurrentLocked(userId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'locked')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create a single milestone
   */
  async create(goalId, userId, title, number) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .insert({
        goal_id: goalId,
        user_id: userId,
        number,
        title,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create multiple milestones for a goal
   */
  async createBulk(goalId, userId, milestones) {
    if (!isSupabaseConfigured()) return [];

    const milestonesData = milestones.map((m, index) => ({
      goal_id: goalId,
      user_id: userId,
      number: index + 1,
      title: m.title || m,
      status: 'pending',
    }));

    const { data, error } = await supabase
      .from('milestones')
      .insert(milestonesData)
      .select()
      .order('number', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Lock a milestone with a promise
   */
  async lock(milestoneId, promiseData) {
    if (!isSupabaseConfigured()) return null;

    // Generate share ID if not provided
    const shareId = promiseData.shareId || `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('milestones')
      .update({
        status: 'locked',
        promise_text: promiseData.text,
        promise_deadline: promiseData.deadline,
        promise_consequence: promiseData.consequence,
        promise_locked_at: new Date().toISOString(),
        share_id: shareId,
      })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Complete a milestone (promise kept)
   */
  async complete(milestoneId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Break a milestone (promise broken)
   */
  async break(milestoneId, reason) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .update({
        status: 'broken',
        broken_at: new Date().toISOString(),
        broken_reason: reason,
      })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update milestone title (only if pending)
   */
  async updateTitle(milestoneId, title) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .update({ title })
      .eq('id', milestoneId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a milestone (only if pending)
   */
  async delete(milestoneId) {
    if (!isSupabaseConfigured()) return null;

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId)
      .eq('status', 'pending');

    if (error) throw error;
    return true;
  },

  /**
   * Add a witness to a milestone
   */
  async addWitness(milestoneId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .update({
        witness_count: supabase.rpc('increment', { x: 1 }),
      })
      .eq('id', milestoneId)
      .select()
      .single();

    // Fallback: increment manually
    if (error) {
      const { data: current } = await supabase
        .from('milestones')
        .select('witness_count')
        .eq('id', milestoneId)
        .single();

      const { data: updated, error: updateError } = await supabase
        .from('milestones')
        .update({ witness_count: (current?.witness_count || 0) + 1 })
        .eq('id', milestoneId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updated;
    }

    return data;
  },

  /**
   * Renumber milestones after deletion
   */
  async renumber(goalId) {
    if (!isSupabaseConfigured()) return [];

    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, number')
      .eq('goal_id', goalId)
      .order('number', { ascending: true });

    // Update numbers sequentially
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].number !== i + 1) {
        await supabase
          .from('milestones')
          .update({ number: i + 1 })
          .eq('id', milestones[i].id);
      }
    }

    return await this.getByGoalId(goalId);
  },
};

// =====================================================
// WITNESS OPERATIONS
// =====================================================

export const witnessService = {
  /**
   * Add a witness to a milestone
   */
  async add(milestoneId, witnessIdentifier) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('witnesses')
      .insert({
        milestone_id: milestoneId,
        witness_identifier: witnessIdentifier,
      })
      .select()
      .single();

    // Ignore duplicate witness errors
    if (error && error.code !== '23505') throw error;
    return data;
  },

  /**
   * Get witness count for a milestone
   */
  async getCount(milestoneId) {
    if (!isSupabaseConfigured()) return 0;

    const { count, error } = await supabase
      .from('witnesses')
      .select('*', { count: 'exact', head: true })
      .eq('milestone_id', milestoneId);

    if (error) throw error;
    return count;
  },
};

// =====================================================
// FAILURE HISTORY OPERATIONS
// =====================================================

export const failureHistoryService = {
  /**
   * Get all failure history for a user
   */
  async getByUserId(userId) {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('failure_history')
      .select('*')
      .eq('user_id', userId)
      .order('broken_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Add a failure to history
   */
  async add(failureData) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('failure_history')
      .insert({
        user_id: failureData.userId,
        milestone_id: failureData.milestoneId,
        milestone_number: failureData.milestoneNumber,
        milestone_title: failureData.milestoneTitle,
        goal_title: failureData.goalTitle,
        break_reason: failureData.reason,
        broken_at: failureData.brokenAt || new Date().toISOString(),
        auto_expired: failureData.autoExpired || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update failure with reflection
   */
  async addReflection(failureId, reflection) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('failure_history')
      .update({ reflection })
      .eq('id', failureId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update failure with consequence proof
   */
  async addConsequenceProof(failureId, proofData) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('failure_history')
      .update({
        consequence_proof: {
          description: proofData.description,
          image_url: proofData.imageUrl,
          uploaded_at: new Date().toISOString(),
        },
      })
      .eq('id', failureId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// CALENDAR OPERATIONS
// =====================================================

export const calendarService = {
  /**
   * Get calendar data for a user
   */
  async getByUserId(userId, startDate, endDate) {
    if (!isSupabaseConfigured()) return [];

    let query = supabase
      .from('calendar_data')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Mark a day as worked/not worked with journal notes
   */
  async upsert(userId, date, worked, notes) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('calendar_data')
      .upsert(
        {
          user_id: userId,
          date,
          worked,
          notes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,date',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get a single day's data
   */
  async getByDate(userId, date) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('calendar_data')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Delete a day's data
   */
  async delete(userId, date) {
    if (!isSupabaseConfigured()) return null;

    const { error } = await supabase
      .from('calendar_data')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (error) throw error;
    return true;
  },
};

// =====================================================
// WAITLIST
// =====================================================

export const waitlistService = {
  /**
   * Add entry to waitlist
   */
  async add({ userId, email, notes, goalsCompleted, integrityScore }) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('waitlist')
      .upsert(
        {
          user_id: userId || null,
          email,
          notes: notes || null,
          source: 'goal_completion',
          goals_completed: goalsCompleted || 1,
          integrity_score: integrityScore || null,
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check if email is already on waitlist
   */
  async exists(email) {
    if (!isSupabaseConfigured()) return false;

    const { data, error } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },
};

// =====================================================
// PUBLIC DATA (For shareable pages)
// =====================================================

export const publicDataService = {
  /**
   * Get public milestone data for witnessing
   */
  async getLockedMilestone(milestoneId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('public_locked_milestones')
      .select('*')
      .eq('id', milestoneId)
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// AUTH HELPERS
// =====================================================

export const authService = {
  /**
   * Get current session
   */
  async getSession() {
    if (!isSupabaseConfigured()) return null;

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get current user
   */
  async getUser() {
    if (!isSupabaseConfigured()) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Sign up with email
   */
  async signUp(email, password, fullName) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with Google (shortcut)
   */
  async signInWithGoogle() {
    return this.signInWithProvider('google');
  },

  /**
   * Sign in anonymously (gives auth.uid() for RLS without Google)
   */
  async signInAnonymously() {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };

    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Get or create user from Supabase Auth user.
   * Uses a SECURITY DEFINER RPC function to bypass RLS for user lookup/creation.
   * Handles: returning users (by auth_id), linking anonymous→Google (by device_id), new users.
   */
  async getOrCreateAuthUser(authUser) {
    if (!isSupabaseConfigured() || !authUser) return null;

    const deviceId = getDeviceId();
    const provider = authUser.is_anonymous
      ? 'anonymous'
      : (authUser.app_metadata?.provider || 'google');

    const { data, error } = await supabase.rpc('find_or_create_user', {
      p_device_id: deviceId,
      p_auth_id: authUser.id,
      p_email: authUser.email || null,
      p_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
      p_avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
      p_auth_provider: provider,
    }).single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user by auth_id (for authenticated users)
   */
  async getUserByAuthId(authId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

// =====================================================
// INTEGRITY SCORE OPERATIONS
// =====================================================

export const integrityHistoryService = {
  /**
   * Get integrity history for a user
   */
  async getByUserId(userId, limit = 50) {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('integrity_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Record an integrity change
   */
  async record(changeData) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('integrity_history')
      .insert({
        user_id: changeData.userId,
        previous_score: changeData.previousScore,
        new_score: changeData.newScore,
        change_amount: changeData.changeAmount,
        reason: changeData.reason,
        failure_streak: changeData.failureStreak || 0,
        milestone_id: changeData.milestoneId || null,
        goal_id: changeData.goalId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to record integrity history:', error);
      // Don't throw - history is optional
      return null;
    }
    return data;
  },

  /**
   * Get stats for a user's integrity history
   */
  async getStats(userId) {
    if (!isSupabaseConfigured()) {
      return {
        totalKept: 0,
        totalBroken: 0,
        goalsCompleted: 0,
        longestStreak: 0,
      };
    }

    const { data, error } = await supabase
      .from('integrity_history')
      .select('reason, failure_streak')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      totalKept: data.filter(h => h.reason === 'PROMISE_KEPT').length,
      totalBroken: data.filter(h => h.reason === 'PROMISE_BROKEN').length,
      goalsCompleted: data.filter(h => h.reason === 'GOAL_COMPLETED').length,
      longestStreak: Math.max(0, ...data.map(h => h.failure_streak || 0)),
    };

    return stats;
  },
};

// Extend anonymousUserService with integrity operations
export const integrityService = {
  /**
   * Update user integrity score and streak
   */
  async updateIntegrity(userId, newScore, newStreak) {
    if (!isSupabaseConfigured()) return null;

    // Clamp values
    newScore = Math.max(0, Math.min(100, newScore));
    newStreak = Math.max(0, newStreak);

    const { data, error } = await supabase
      .from('users')
      .update({
        integrity_score: newScore,
        failure_streak: newStreak,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('integrity_score, failure_streak')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get current integrity data for a user
   */
  async getIntegrity(userId) {
    if (!isSupabaseConfigured()) {
      return { integrity_score: 100, failure_streak: 0 };
    }

    const { data, error } = await supabase
      .from('users')
      .select('integrity_score, failure_streak')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return {
      integrity_score: data.integrity_score ?? 100,
      failure_streak: data.failure_streak ?? 0,
    };
  },
};

// =====================================================
// PUBLIC PRICING SERVICE (For pricing page)
// =====================================================

export const pricingService = {
  /**
   * Get all active pricing plans (for public pricing page)
   */
  async getActivePlans() {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get a specific plan by ID
   */
  async getPlanById(planId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get plan limits for a specific plan (used for feature gating)
   */
  async getPlanLimits(planId) {
    if (!isSupabaseConfigured()) {
      // Return default free plan limits when Supabase not configured
      return {
        maxActiveGoals: 1,
        maxMilestonesPerGoal: null,
        maxSharesPerMonth: 5,
        features: {},
      };
    }

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('max_active_goals, max_milestones_per_goal, max_shares_per_month, features')
      .eq('id', planId)
      .single();

    if (error) {
      console.error('Failed to fetch plan limits:', error);
      // Return default limits on error
      return {
        maxActiveGoals: 1,
        maxMilestonesPerGoal: null,
        maxSharesPerMonth: 5,
        features: {},
      };
    }

    return {
      maxActiveGoals: data.max_active_goals,
      maxMilestonesPerGoal: data.max_milestones_per_goal,
      maxSharesPerMonth: data.max_shares_per_month,
      features: data.features || {},
    };
  },
};

// =====================================================
// ADMIN - PRICING PLANS OPERATIONS
// =====================================================

export const adminPricingService = {
  /**
   * Get all pricing plans (including inactive)
   */
  async getAll() {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single pricing plan by ID
   */
  async getById(planId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a pricing plan
   */
  async update(planId, updates) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('pricing_plans')
      .update({
        name: updates.name,
        tagline: updates.tagline,
        price_monthly: updates.priceMonthly,
        price_yearly: updates.priceYearly,
        discount_percent: updates.discountPercent,
        max_active_goals: updates.maxActiveGoals,
        max_milestones_per_goal: updates.maxMilestonesPerGoal,
        max_shares_per_month: updates.maxSharesPerMonth,
        features: updates.features,
        is_featured: updates.isFeatured,
        badge_text: updates.badgeText,
        cta_text: updates.ctaText,
        sort_order: updates.sortOrder,
        is_active: updates.isActive,
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new pricing plan
   */
  async create(planData) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('pricing_plans')
      .insert({
        id: planData.id,
        name: planData.name,
        tagline: planData.tagline,
        price_monthly: planData.priceMonthly || 0,
        price_yearly: planData.priceYearly || 0,
        discount_percent: planData.discountPercent || 0,
        max_active_goals: planData.maxActiveGoals,
        max_milestones_per_goal: planData.maxMilestonesPerGoal,
        max_shares_per_month: planData.maxSharesPerMonth,
        features: planData.features || {},
        is_featured: planData.isFeatured || false,
        badge_text: planData.badgeText,
        cta_text: planData.ctaText,
        sort_order: planData.sortOrder || 0,
        is_active: planData.isActive !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a pricing plan
   */
  async delete(planId) {
    if (!isSupabaseConfigured()) return null;

    const { error } = await supabase
      .from('pricing_plans')
      .delete()
      .eq('id', planId);

    if (error) throw error;
    return true;
  },

  /**
   * Toggle plan active status
   */
  async toggleActive(planId, isActive) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('pricing_plans')
      .update({ is_active: isActive })
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// ADMIN - USER SUBSCRIPTIONS OPERATIONS
// =====================================================

export const adminSubscriptionService = {
  /**
   * Get all subscriptions with user info
   */
  async getAll() {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        users (id, email, full_name),
        pricing_plans (id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get subscription stats
   */
  async getStats() {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan_id, status, billing_cycle');

    if (error) throw error;

    // Calculate stats
    const stats = {
      total: data.length,
      byPlan: {},
      byStatus: {},
      byBillingCycle: {},
    };

    data.forEach(sub => {
      stats.byPlan[sub.plan_id] = (stats.byPlan[sub.plan_id] || 0) + 1;
      stats.byStatus[sub.status] = (stats.byStatus[sub.status] || 0) + 1;
      stats.byBillingCycle[sub.billing_cycle] = (stats.byBillingCycle[sub.billing_cycle] || 0) + 1;
    });

    return stats;
  },

  /**
   * Update user subscription (admin override)
   */
  async update(subscriptionId, updates) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: updates.planId,
        status: updates.status,
        billing_cycle: updates.billingCycle,
        current_period_end: updates.currentPeriodEnd,
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// ADMIN - ANALYTICS OPERATIONS
// =====================================================

export const adminAnalyticsService = {
  /**
   * Get user count
   */
  async getUserCount() {
    if (!isSupabaseConfigured()) return 0;

    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count;
  },

  /**
   * Get goal stats
   */
  async getGoalStats() {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('goals')
      .select('status');

    if (error) throw error;

    return {
      total: data.length,
      active: data.filter(g => g.status === 'active').length,
      completed: data.filter(g => g.status === 'completed').length,
    };
  },

  /**
   * Get milestone stats
   */
  async getMilestoneStats() {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .select('status');

    if (error) throw error;

    return {
      total: data.length,
      pending: data.filter(m => m.status === 'pending').length,
      locked: data.filter(m => m.status === 'locked').length,
      completed: data.filter(m => m.status === 'completed').length,
      broken: data.filter(m => m.status === 'broken').length,
    };
  },
};
