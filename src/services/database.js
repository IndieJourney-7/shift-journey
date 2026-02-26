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

/**
 * Map DB user record to app format (full_name -> name)
 */
function mapUserFromDB(dbUser) {
  if (!dbUser) return null;
  return {
    ...dbUser,
    name: dbUser.full_name || dbUser.name, // Map full_name to name for app compatibility
  };
}

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
    return mapUserFromDB(data);
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
    return mapUserFromDB(data);
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

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*, milestones(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Error in goalService.getByUserId:', err);
      return [];
    }
  },

  /**
   * Get active goal for a user (with milestones sorted by number)
   */
  async getActive(userId) {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error on no results

      if (error) {
        console.error('Error fetching active goal:', error);
        return null;
      }

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
    } catch (err) {
      console.error('Error in goalService.getActive:', err);
      return null;
    }
  },

  /**
   * Get completed goals for history
   */
  async getCompleted(userId) {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed goals:', error);
        return [];
      }

      // Fetch milestones for each goal
      for (const goal of (data || [])) {
        const { data: milestones } = await supabase
          .from('milestones')
          .select('*')
          .eq('goal_id', goal.id)
          .order('number', { ascending: true });

        goal.milestones = milestones || [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in goalService.getCompleted:', err);
      return [];
    }
  },

  /**
   * Create a new goal using RPC function
   */
  async create(goalData) {
    if (!isSupabaseConfigured()) return null;

    console.log('Creating goal for user:', goalData.userId);

    const { data, error } = await supabase
      .rpc('create_goal', {
        p_user_id: goalData.userId,
        p_title: goalData.title,
        p_description: goalData.description || null,
        p_target_date: goalData.targetDate || null,
      });

    if (error) {
      console.error('Supabase error creating goal:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }
    
    console.log('Goal created successfully:', data);
    return data;
  },

  /**
   * Update a goal using RPC function
   */
  async update(goalId, updates) {
    if (!isSupabaseConfigured()) return null;

    console.log('Updating goal:', goalId);

    const { data, error } = await supabase
      .rpc('update_goal', {
        p_goal_id: goalId,
        p_title: updates.title || null,
        p_description: updates.description !== undefined ? updates.description : null,
        p_status: updates.status || null,
        p_completed_at: updates.completedAt || null,
        p_reflection: updates.reflection !== undefined ? updates.reflection : null,
        p_final_integrity_score: updates.finalIntegrityScore !== undefined ? updates.finalIntegrityScore : null,
        p_stats: updates.stats || null,
      });

    if (error) {
      console.error('Supabase error updating goal:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }

    console.log('Goal updated successfully:', data);
    return data;
  },

  /**
   * Complete a goal with reflection and stats using RPC function
   */
  async complete(goalId, reflection, finalScore, stats) {
    if (!isSupabaseConfigured()) return null;

    console.log('Completing goal:', goalId);

    const { data, error } = await supabase
      .rpc('update_goal', {
        p_goal_id: goalId,
        p_status: 'completed',
        p_completed_at: new Date().toISOString(),
        p_reflection: reflection,
        p_final_integrity_score: finalScore,
        p_stats: stats,
      });

    if (error) {
      console.error('Supabase error completing goal:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }

    console.log('Goal completed successfully:', data);
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
      .select('*, users(full_name, integrity_score)')
      .eq('id', milestoneId)
      .single();

    if (error) throw error;
    // Map full_name to name for app compatibility
    if (data && data.users) {
      data.users.name = data.users.full_name || data.users.name;
    }
    return data;
  },

  /**
   * Get milestone by share ID (for public sharing)
   */
  async getByShareId(shareId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('milestones')
      .select('*, users(full_full_name, integrity_score), goals(title)')
      .eq('share_id', shareId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    // Map full_name to name for app compatibility
    if (data && data.users) {
      data.users.name = data.users.full_name || data.users.name;
    }
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
   * Create a single milestone using RPC function
   */
  async create(goalId, userId, title, number) {
    if (!isSupabaseConfigured()) return null;

    console.log('Creating milestone:', { goalId, userId, title, number });

    const { data, error } = await supabase
      .rpc('create_milestone', {
        p_goal_id: goalId,
        p_user_id: userId,
        p_title: title,
        p_number: number,
      });

    if (error) {
      console.error('Supabase error creating milestone:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }

    console.log('Milestone created successfully:', data);
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
   * Lock a milestone with a promise using RPC function
   */
  async lock(milestoneId, promiseData) {
    if (!isSupabaseConfigured()) return null;

    console.log('Locking milestone:', milestoneId);

    const { data, error } = await supabase
      .rpc('lock_milestone', {
        p_milestone_id: milestoneId,
        p_promise_text: promiseData.text,
        p_promise_deadline: promiseData.deadline,
        p_promise_consequence: promiseData.consequence,
      });

    if (error) {
      console.error('Supabase error locking milestone:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }

    console.log('Milestone locked successfully:', data);
    return data;
  },

  /**
   * Complete a milestone (promise kept) using RPC function
   */
  async complete(milestoneId) {
    if (!isSupabaseConfigured()) return null;

    console.log('Completing milestone:', milestoneId);

    const { data, error } = await supabase
      .rpc('complete_milestone', {
        p_milestone_id: milestoneId,
      });

    if (error) {
      console.error('Supabase error completing milestone:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }

    console.log('Milestone completed successfully:', data);
    return data;
  },

  /**
   * Break a milestone (promise broken) using RPC function
   */
  async break(milestoneId, reason) {
    if (!isSupabaseConfigured()) return null;

    console.log('Breaking milestone:', milestoneId);

    const { data, error } = await supabase
      .rpc('break_milestone', {
        p_milestone_id: milestoneId,
        p_reason: reason || null,
      });

    if (error) {
      console.error('Supabase error breaking milestone:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }

    console.log('Milestone broken successfully:', data);
    return data;
  },

  /**
   * Update milestone title (only if pending) using RPC function
   */
  async updateTitle(milestoneId, title) {
    if (!isSupabaseConfigured()) return null;

    console.log('Updating milestone title:', milestoneId);

    const { data, error } = await supabase
      .rpc('update_milestone', {
        p_milestone_id: milestoneId,
        p_title: title,
      });

    if (error) {
      console.error('Supabase error updating milestone:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }

    console.log('Milestone updated successfully:', data);
    return data;
  },

  /**
   * Delete a milestone (only if pending) using RPC function
   */
  async delete(milestoneId) {
    if (!isSupabaseConfigured()) return null;

    console.log('Deleting milestone:', milestoneId);

    const { data, error } = await supabase
      .rpc('delete_milestone', {
        p_milestone_id: milestoneId,
      });

    if (error) {
      console.error('Supabase error deleting milestone:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      throw error;
    }

    console.log('Milestone deleted successfully');
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
   * Get all subscriptions with user info using admin RPC function
   */
  async getAll() {
    if (!isSupabaseConfigured()) return [];

    try {
      // Try RPC function first (bypasses RLS)
      const { data, error } = await supabase.rpc('admin_get_all_subscriptions');
      
      if (!error && data) {
        return data;
      }
      
      // Fallback to direct query
      const { data: subs, error: subsError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          users (id, email, full_name),
          pricing_plans (id, name)
        `)
        .order('created_at', { ascending: false });

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        return [];
      }
      return subs || [];
    } catch (err) {
      console.error('Error in adminSubscriptionService.getAll:', err);
      return [];
    }
  },

  /**
   * Get subscription stats using admin RPC function
   */
  async getStats() {
    if (!isSupabaseConfigured()) return { total: 0, byPlan: {}, byStatus: {}, byBillingCycle: {} };

    try {
      // Try RPC function first (bypasses RLS)
      const { data, error } = await supabase.rpc('admin_get_subscription_stats');
      
      if (!error && data) {
        return {
          total: data.total || 0,
          byPlan: {},
          byStatus: data.by_status || {},
          byBillingCycle: {},
        };
      }
      
      // Fallback to direct query
      const { data: subs, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('plan_id, status, billing_cycle');

      if (subsError) {
        console.error('Error fetching subscription stats:', subsError);
        return { total: 0, byPlan: {}, byStatus: {}, byBillingCycle: {} };
      }

      // Calculate stats
      const stats = {
        total: subs?.length || 0,
        byPlan: {},
        byStatus: {},
        byBillingCycle: {},
      };

      (subs || []).forEach(sub => {
        stats.byPlan[sub.plan_id] = (stats.byPlan[sub.plan_id] || 0) + 1;
        stats.byStatus[sub.status] = (stats.byStatus[sub.status] || 0) + 1;
        stats.byBillingCycle[sub.billing_cycle] = (stats.byBillingCycle[sub.billing_cycle] || 0) + 1;
      });

      return stats;
    } catch (err) {
      console.error('Error in adminSubscriptionService.getStats:', err);
      return { total: 0, byPlan: {}, byStatus: {}, byBillingCycle: {} };
    }
  },

  /**
   * Update user subscription (admin override)
   */
  async update(subscriptionId, updates) {
    if (!isSupabaseConfigured()) return null;

    try {
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

      if (error) {
        console.error('Error updating subscription:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error in adminSubscriptionService.update:', err);
      return null;
    }
  },
};

// =====================================================
// ADMIN - ANALYTICS OPERATIONS
// =====================================================

export const adminAnalyticsService = {
  /**
   * Get user count using admin RPC function
   */
  async getUserCount() {
    if (!isSupabaseConfigured()) return 0;

    try {
      // Try RPC function first (bypasses RLS)
      const { data, error } = await supabase.rpc('admin_get_user_count');
      
      if (!error && data !== null) {
        return data;
      }
      
      // Fallback to direct query (may be blocked by RLS)
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error fetching user count:', countError);
        return 0;
      }
      return count || 0;
    } catch (err) {
      console.error('Error in adminAnalyticsService.getUserCount:', err);
      return 0;
    }
  },

  /**
   * Get goal stats using admin RPC function
   */
  async getGoalStats() {
    if (!isSupabaseConfigured()) return { total: 0, active: 0, completed: 0 };

    try {
      // Try RPC function first (bypasses RLS)
      const { data, error } = await supabase.rpc('admin_get_goal_stats');
      
      if (!error && data) {
        return data;
      }
      
      // Fallback to direct query
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('status');

      if (goalsError) {
        console.error('Error fetching goal stats:', goalsError);
        return { total: 0, active: 0, completed: 0 };
      }

      return {
        total: goals?.length || 0,
        active: (goals || []).filter(g => g.status === 'active').length,
        completed: (goals || []).filter(g => g.status === 'completed').length,
      };
    } catch (err) {
      console.error('Error in adminAnalyticsService.getGoalStats:', err);
      return { total: 0, active: 0, completed: 0 };
    }
  },

  /**
   * Get milestone stats using admin RPC function
   */
  async getMilestoneStats() {
    if (!isSupabaseConfigured()) return { total: 0, pending: 0, locked: 0, completed: 0, broken: 0 };

    try {
      // Try RPC function first (bypasses RLS)
      const { data, error } = await supabase.rpc('admin_get_milestone_stats');
      
      if (!error && data) {
        return data;
      }
      
      // Fallback to direct query
      const { data: milestones, error: milestonesError } = await supabase
        .from('milestones')
        .select('status');

      if (milestonesError) {
        console.error('Error fetching milestone stats:', milestonesError);
        return { total: 0, pending: 0, locked: 0, completed: 0, broken: 0 };
      }

      return {
        total: milestones?.length || 0,
        pending: (milestones || []).filter(m => m.status === 'pending').length,
        locked: (milestones || []).filter(m => m.status === 'locked').length,
        completed: (milestones || []).filter(m => m.status === 'completed').length,
        broken: (milestones || []).filter(m => m.status === 'broken').length,
      };
    } catch (err) {
      console.error('Error in adminAnalyticsService.getMilestoneStats:', err);
      return { total: 0, pending: 0, locked: 0, completed: 0, broken: 0 };
    }
  },
};

// =====================================================
// USER MOTIVATION SERVICE
// Stores personal "why" reminder with styling
// =====================================================

export const userMotivationService = {
  /**
   * Get user's motivation quote using RPC function
   */
  async getByUserId(userId) {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .rpc('get_user_motivation', { p_user_id: userId });

    // If no data found, return null (not an error)
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching motivation:', error);
      throw error;
    }
    return data;
  },

  /**
   * Create or update user's motivation using RPC function
   */
  async upsert(userId, motivationData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database not configured');
    }

    console.log('Saving motivation for user:', userId);

    const { data, error } = await supabase
      .rpc('upsert_user_motivation', {
        p_user_id: userId,
        p_display_type: motivationData.displayType || 'quote',
        p_heading: motivationData.heading || 'My Why',
        p_quote_text: motivationData.quoteText || null,
        p_bg_color: motivationData.bgColor || '#1a1a2e',
        p_text_color: motivationData.textColor || '#fcd34d',
        p_font_style: motivationData.fontStyle || 'italic',
        p_image_url: motivationData.imageUrl || null,
        p_image_caption: motivationData.imageCaption || null,
      });

    if (error) {
      console.error('Supabase error saving motivation:', error);
      // Provide user-friendly error messages
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('Permission denied. Please refresh the page and try again.');
      }
      if (error.message?.includes('Unauthorized')) {
        throw new Error('You can only modify your own motivation.');
      }
      throw new Error(error.message || 'Failed to save motivation');
    }
    
    console.log('Motivation saved successfully:', data);
    return data;
  },

  /**
   * Delete user's motivation using RPC function
   */
  async delete(userId) {
    if (!isSupabaseConfigured()) return null;

    console.log('Deleting motivation for user:', userId);

    const { data, error } = await supabase
      .rpc('delete_user_motivation', { p_user_id: userId });

    if (error) {
      console.error('Supabase error deleting motivation:', error);
      if (error.code === '42883') {
        throw new Error('Database function not found. Please run the migration SQL in Supabase.');
      }
      if (error.message?.includes('Unauthorized')) {
        throw new Error('You can only delete your own motivation.');
      }
      throw error;
    }
    
    console.log('Motivation deleted successfully');
    return true;
  },
};
