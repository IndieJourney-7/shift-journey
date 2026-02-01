/**
 * Admin Content Management Service
 * 
 * Provides CRUD operations for all admin-controlled content:
 * - Testimonials/Reviews
 * - FAQs
 * - Motivational Quotes
 * - Promotional Offers
 * - Site Statistics
 * - User Management
 */

import { supabase } from '../lib/supabase';

// ============================================================
// TESTIMONIALS SERVICE
// ============================================================
export const testimonialsService = {
  /**
   * Get all testimonials (admin view - includes inactive)
   */
  async getAll() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get active testimonials (public view)
   */
  async getActive() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get featured testimonials only
   */
  async getFeatured() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Create a new testimonial
   */
  async create(testimonial) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([{
        ...testimonial,
        initials: testimonial.initials || getInitials(testimonial.name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing testimonial
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('testimonials')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a testimonial
   */
  async delete(id) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Toggle testimonial active status
   */
  async toggleActive(id, isActive) {
    return this.update(id, { is_active: isActive });
  },

  /**
   * Toggle testimonial featured status
   */
  async toggleFeatured(id, isFeatured) {
    return this.update(id, { is_featured: isFeatured });
  },

  /**
   * Reorder testimonials
   */
  async reorder(orderedIds) {
    const updates = orderedIds.map((id, index) => ({
      id,
      sort_order: index + 1
    }));

    for (const update of updates) {
      await this.update(update.id, { sort_order: update.sort_order });
    }
    return true;
  }
};

// ============================================================
// FAQS SERVICE
// ============================================================
export const faqsService = {
  /**
   * Get all FAQs (admin view)
   */
  async getAll() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get active FAQs (public view)
   */
  async getActive() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get FAQs by category
   */
  async getByCategory(category) {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Create a new FAQ
   */
  async create(faq) {
    const { data, error } = await supabase
      .from('faqs')
      .insert([{
        ...faq,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing FAQ
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('faqs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a FAQ
   */
  async delete(id) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Toggle FAQ active status
   */
  async toggleActive(id, isActive) {
    return this.update(id, { is_active: isActive });
  },

  /**
   * Reorder FAQs
   */
  async reorder(orderedIds) {
    const updates = orderedIds.map((id, index) => ({
      id,
      sort_order: index + 1
    }));

    for (const update of updates) {
      await this.update(update.id, { sort_order: update.sort_order });
    }
    return true;
  }
};

// ============================================================
// QUOTES SERVICE
// ============================================================
export const quotesService = {
  /**
   * Get all quotes (admin view)
   */
  async getAll() {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get active quotes
   */
  async getActive() {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  /**
   * Get a random quote (for dashboard)
   */
  async getRandom() {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Return random quote
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  },

  /**
   * Get quotes by category
   */
  async getByCategory(category) {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('is_active', true)
      .eq('category', category);

    if (error) throw error;
    return data;
  },

  /**
   * Create a new quote
   */
  async create(quote) {
    const { data, error } = await supabase
      .from('quotes')
      .insert([{
        ...quote,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing quote
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a quote
   */
  async delete(id) {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Toggle quote active status
   */
  async toggleActive(id, isActive) {
    return this.update(id, { is_active: isActive });
  }
};

// ============================================================
// OFFERS SERVICE
// ============================================================
export const offersService = {
  /**
   * Get all offers (admin view)
   */
  async getAll() {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get active offers (public view)
   */
  async getActive() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get primary offer (first active)
   */
  async getPrimary() {
    const offers = await this.getActive();
    return offers && offers.length > 0 ? offers[0] : null;
  },

  /**
   * Create a new offer
   */
  async create(offer) {
    const { data, error } = await supabase
      .from('offers')
      .insert([{
        ...offer,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing offer
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('offers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an offer
   */
  async delete(id) {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Toggle offer active status
   */
  async toggleActive(id, isActive) {
    return this.update(id, { is_active: isActive });
  }
};

// ============================================================
// SITE STATS SERVICE
// ============================================================
export const siteStatsService = {
  /**
   * Get site statistics
   */
  async get() {
    const { data, error } = await supabase
      .from('site_stats')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update site statistics
   */
  async update(stats) {
    const { data, error } = await supabase
      .from('site_stats')
      .update({
        ...stats,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'main')
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Calculate and update stats from actual data
   */
  async calculateFromData() {
    // Get total kept promises
    const { data: milestones } = await supabase
      .from('milestones')
      .select('status')
      .eq('status', 'completed');

    // Get active users (users with goals)
    const { data: activeUsers } = await supabase
      .from('goals')
      .select('user_id')
      .eq('status', 'active');

    // Get average integrity score
    const { data: scores } = await supabase
      .from('users')
      .select('integrity_score')
      .not('integrity_score', 'is', null);

    const promisesKept = milestones?.length || 0;
    const activeUserCount = new Set(activeUsers?.map(g => g.user_id)).size;
    const avgScore = scores && scores.length > 0
      ? Math.round(scores.reduce((sum, u) => sum + (u.integrity_score || 0), 0) / scores.length)
      : 0;

    return this.update({
      promises_kept: promisesKept,
      active_users: activeUserCount,
      avg_integrity_score: avgScore
    });
  }
};

// ============================================================
// USERS SERVICE (Admin View)
// ============================================================
export const usersService = {
  /**
   * Get all users with their stats
   */
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar_url,
        integrity_score,
        status,
        joined_at,
        updated_at
      `)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get user count
   */
  async getCount() {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count;
  },

  /**
   * Get users with their goals
   */
  async getWithGoals() {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('joined_at', { ascending: false });

    if (usersError) throw usersError;

    // Get goals for each user
    const { data: goals } = await supabase
      .from('goals')
      .select('user_id, title, status');

    // Combine data
    return users.map(user => ({
      ...user,
      goals: goals?.filter(g => g.user_id === user.id) || []
    }));
  },

  /**
   * Get user statistics
   */
  async getStats() {
    const { data: users, error } = await supabase
      .from('users')
      .select('integrity_score, joined_at, status');

    if (error) throw error;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = users.length;
    const newThisWeek = users.filter(u => new Date(u.joined_at) > weekAgo).length;
    const newThisMonth = users.filter(u => new Date(u.joined_at) > monthAgo).length;
    const avgScore = totalUsers > 0
      ? Math.round(users.reduce((sum, u) => sum + (u.integrity_score || 0), 0) / totalUsers)
      : 0;

    return {
      total: totalUsers,
      newThisWeek,
      newThisMonth,
      avgIntegrityScore: avgScore
    };
  },

  /**
   * Search users
   */
  async search(query) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================================
// EXPORT ALL SERVICES
// ============================================================
export const adminContentService = {
  testimonials: testimonialsService,
  faqs: faqsService,
  quotes: quotesService,
  offers: offersService,
  siteStats: siteStatsService,
  users: usersService
};

export default adminContentService;
