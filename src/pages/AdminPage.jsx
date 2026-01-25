import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Target,
  Milestone,
  DollarSign,
  Edit2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Plus,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import {
  adminPricingService,
  adminSubscriptionService,
  adminAnalyticsService,
} from '../services/database';

/**
 * Admin Dashboard - Full Control Center
 *
 * Features:
 * - Overview stats (users, goals, milestones, subscriptions)
 * - Pricing plan management (edit names, prices, limits, features)
 * - Feature toggles for each plan
 * - Toggle plans active/inactive
 * - View subscription stats
 */

// All available features that can be toggled for plans
const AVAILABLE_FEATURES = {
  basicIntegrity: {
    label: 'Basic Integrity Tracking',
    description: 'Track and display user integrity score',
  },
  publicShareLinks: {
    label: 'Public Share Links',
    description: 'Generate shareable links for commitments',
  },
  communityWitnessing: {
    label: 'Community Witnessing',
    description: 'Allow others to witness commitments',
  },
  advancedAnalytics: {
    label: 'Advanced Analytics',
    description: 'Detailed analytics dashboard and insights',
  },
  customConsequences: {
    label: 'Custom Consequences',
    description: 'Create custom consequence library',
  },
  priorityWitness: {
    label: 'Priority Witness Notifications',
    description: 'Get notified first about witness requests',
  },
  exportJourney: {
    label: 'Export Journey',
    description: 'Export goals and progress as PDF/JSON',
  },
  calendarViews: {
    label: 'Calendar & History Views',
    description: 'Access calendar and history features',
  },
  apiAccess: {
    label: 'API Access',
    description: 'Access to REST API for integrations',
  },
  prioritySupport: {
    label: 'Priority Support',
    description: '24/7 priority customer support',
  },
  earlyAccess: {
    label: 'Early Access',
    description: 'Early access to new features',
  },
  customBadges: {
    label: 'Custom Badges',
    description: 'Custom integrity badges and achievements',
  },
  lifetimeArchive: {
    label: 'Lifetime Archive',
    description: 'Permanent access to failure history',
  },
  teamAccountability: {
    label: 'Team Accountability',
    description: 'Team features for group accountability',
  },
};

// Stat Card Component
function StatCard({ icon: Icon, label, value, subValue, color = 'gold' }) {
  const colorClasses = {
    gold: 'bg-gold-500/10 border-gold-500/20 text-gold-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
  };

  return (
    <div className="bg-obsidian-800/50 border border-obsidian-700 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-obsidian-400 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-obsidian-100">{value}</p>
          {subValue && (
            <p className="text-obsidian-500 text-xs mt-1">{subValue}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Feature Toggle Component
function FeatureToggle({ featureKey, enabled, onChange, feature }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-obsidian-700/50 last:border-0">
      <div className="flex-1">
        <p className="text-obsidian-200 text-sm font-medium">{feature.label}</p>
        <p className="text-obsidian-500 text-xs">{feature.description}</p>
      </div>
      <button
        onClick={() => onChange(featureKey, !enabled)}
        className="ml-4 flex-shrink-0"
      >
        {enabled ? (
          <ToggleRight className="w-8 h-8 text-emerald-500" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-obsidian-600" />
        )}
      </button>
    </div>
  );
}

// Plan Editor Modal - Full Featured
function PlanEditorModal({ plan, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: plan.name || '',
    tagline: plan.tagline || '',
    priceMonthly: plan.price_monthly || 0,
    priceYearly: plan.price_yearly || 0,
    discountPercent: plan.discount_percent || 0,
    maxActiveGoals: plan.max_active_goals,
    maxMilestonesPerGoal: plan.max_milestones_per_goal,
    maxSharesPerMonth: plan.max_shares_per_month,
    features: plan.features || {},
    isFeatured: plan.is_featured || false,
    badgeText: plan.badge_text || '',
    ctaText: plan.cta_text || '',
    sortOrder: plan.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);
  const [showFeatures, setShowFeatures] = useState(true);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (name, value) => {
    const numValue = value === '' || value === 'unlimited' ? null : parseInt(value, 10);
    setFormData(prev => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handleFeatureChange = (featureKey, enabled) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: enabled,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(plan.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to save plan:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-obsidian-700 sticky top-0 bg-obsidian-900 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-obsidian-100">
              Edit {plan.name} Plan
            </h3>
            <button
              onClick={onClose}
              className="text-obsidian-400 hover:text-obsidian-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-obsidian-300 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h4 className="text-obsidian-300 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Monthly (cents)
                </label>
                <input
                  type="number"
                  value={formData.priceMonthly}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceMonthly: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-gold-500 text-xs mt-1">
                  = ${(formData.priceMonthly / 100).toFixed(2)}/mo
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Yearly (cents)
                </label>
                <input
                  type="number"
                  value={formData.priceYearly}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceYearly: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-gold-500 text-xs mt-1">
                  = ${(formData.priceYearly / 100).toFixed(2)}/yr
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Discount %
                </label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-4">
            <h4 className="text-obsidian-300 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" />
              Plan Limits
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Max Active Goals
                </label>
                <input
                  type="text"
                  placeholder="unlimited"
                  value={formData.maxActiveGoals === null ? '' : formData.maxActiveGoals}
                  onChange={(e) => handleNumberChange('maxActiveGoals', e.target.value || 'unlimited')}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-obsidian-500 text-xs mt-1">Empty = unlimited</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Max Milestones/Goal
                </label>
                <input
                  type="text"
                  placeholder="unlimited"
                  value={formData.maxMilestonesPerGoal === null ? '' : formData.maxMilestonesPerGoal}
                  onChange={(e) => handleNumberChange('maxMilestonesPerGoal', e.target.value || 'unlimited')}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-obsidian-500 text-xs mt-1">Empty = unlimited</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Max Shares/Month
                </label>
                <input
                  type="text"
                  placeholder="unlimited"
                  value={formData.maxSharesPerMonth === null ? '' : formData.maxSharesPerMonth}
                  onChange={(e) => handleNumberChange('maxSharesPerMonth', e.target.value || 'unlimited')}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-obsidian-500 text-xs mt-1">Empty = unlimited</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowFeatures(!showFeatures)}
              className="w-full flex items-center justify-between text-obsidian-300 text-sm font-semibold uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Features ({Object.values(formData.features).filter(Boolean).length} enabled)
              </span>
              {showFeatures ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showFeatures && (
              <div className="bg-obsidian-800/50 rounded-lg p-4 space-y-1">
                {Object.entries(AVAILABLE_FEATURES).map(([key, feature]) => (
                  <FeatureToggle
                    key={key}
                    featureKey={key}
                    feature={feature}
                    enabled={!!formData.features[key]}
                    onChange={handleFeatureChange}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <h4 className="text-obsidian-300 text-sm font-semibold uppercase tracking-wider">
              Display Options
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Badge Text
                </label>
                <input
                  type="text"
                  name="badgeText"
                  value={formData.badgeText}
                  onChange={handleChange}
                  placeholder="e.g., Most Popular"
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleChange}
                  placeholder="e.g., Get Started"
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-4 py-2 text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    formData.isFeatured ? 'bg-gold-500' : 'bg-obsidian-700'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      formData.isFeatured ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="text-obsidian-300 text-sm">Featured Plan (highlighted)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-obsidian-700">
            <Button
              type="submit"
              variant="gold"
              icon={Save}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Plan Row Component
function PlanRow({ plan, onEdit, onToggleActive }) {
  const formatPrice = (cents) => {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatLimit = (value) => {
    if (value === null || value === undefined) return 'Unlimited';
    return value;
  };

  const enabledFeatures = Object.values(plan.features || {}).filter(Boolean).length;

  return (
    <tr className="border-b border-obsidian-700/50 hover:bg-obsidian-800/30">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            plan.is_active ? 'bg-gold-500/20' : 'bg-obsidian-700'
          }`}>
            <span className={`text-sm font-bold ${plan.is_active ? 'text-gold-500' : 'text-obsidian-500'}`}>
              {plan.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-obsidian-100 font-medium">{plan.name}</p>
            <p className="text-obsidian-500 text-xs">{plan.tagline}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-obsidian-300">
        <div className="text-sm">
          <p>{formatPrice(plan.price_monthly)}/mo</p>
          <p className="text-obsidian-500">{formatPrice(plan.price_yearly)}/yr</p>
        </div>
      </td>
      <td className="py-4 px-4 text-obsidian-300 text-sm">
        {formatLimit(plan.max_active_goals)} goals
      </td>
      <td className="py-4 px-4 text-obsidian-300 text-sm">
        {enabledFeatures} features
      </td>
      <td className="py-4 px-4">
        <button
          onClick={() => onToggleActive(plan.id, !plan.is_active)}
          className="flex items-center gap-2"
        >
          {plan.is_active ? (
            <>
              <ToggleRight className="w-6 h-6 text-emerald-500" />
              <span className="text-emerald-500 text-sm">Active</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-6 h-6 text-obsidian-500" />
              <span className="text-obsidian-500 text-sm">Inactive</span>
            </>
          )}
        </button>
      </td>
      <td className="py-4 px-4">
        <Button
          variant="ghost"
          size="sm"
          icon={Edit2}
          onClick={() => onEdit(plan)}
        >
          Edit
        </Button>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useApp();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Data states
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    goals: { total: 0, active: 0, completed: 0 },
    milestones: { total: 0, completed: 0, broken: 0 },
    subscriptions: { total: 0, byPlan: {} },
  });

  // Edit modal state
  const [editingPlan, setEditingPlan] = useState(null);

  // Simple admin check - bypassed for development
  // TODO: In production, use proper role-based auth
  const isAdmin = true;

  const loadData = async () => {
    try {
      setError(null);

      // Load all data in parallel
      const [
        plansData,
        userCount,
        goalStats,
        milestoneStats,
        subscriptionStats,
      ] = await Promise.all([
        adminPricingService.getAll(),
        adminAnalyticsService.getUserCount(),
        adminAnalyticsService.getGoalStats(),
        adminAnalyticsService.getMilestoneStats(),
        adminSubscriptionService.getStats(),
      ]);

      setPlans(plansData || []);
      setStats({
        users: userCount || 0,
        goals: goalStats || { total: 0, active: 0, completed: 0 },
        milestones: milestoneStats || { total: 0, completed: 0, broken: 0 },
        subscriptions: subscriptionStats || { total: 0, byPlan: {} },
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Failed to load data. Make sure Supabase is configured correctly.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSavePlan = async (planId, updates) => {
    try {
      await adminPricingService.update(planId, updates);
      setSuccessMessage('Plan updated successfully! Changes will reflect on pricing page.');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to save plan:', err);
      setError('Failed to save plan. Please try again.');
    }
  };

  const handleToggleActive = async (planId, isActive) => {
    try {
      await adminPricingService.toggleActive(planId, isActive);
      setSuccessMessage(`Plan ${isActive ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to toggle plan:', err);
      setError('Failed to update plan status.');
    }
  };

  // Auth check bypassed for development
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-obsidian-950 noise-bg flex items-center justify-center">
  //       <div className="text-center">
  //         <AlertTriangle className="w-12 h-12 text-gold-500 mx-auto mb-4" />
  //         <h1 className="text-xl font-semibold text-obsidian-100 mb-2">Access Denied</h1>
  //         <p className="text-obsidian-400 mb-4">Please log in to access the admin panel.</p>
  //         <Button variant="gold" onClick={() => navigate('/login')}>
  //           Log In
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-obsidian-950 noise-bg flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-obsidian-100 mb-2">Admin Access Required</h1>
          <p className="text-obsidian-400 mb-4">You don't have permission to access this page.</p>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 noise-bg">
      {/* Header */}
      <header className="border-b border-obsidian-800 bg-obsidian-900/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-gold-500" />
              <h1 className="text-xl font-semibold text-obsidian-100">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefresh}
                disabled={refreshing}
                className={refreshing ? 'animate-spin' : ''}
              >
                Refresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/pricing')}
              >
                View Pricing Page
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-emerald-400 text-sm">{successMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-obsidian-100 mb-4">Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={stats.users}
                  color="blue"
                />
                <StatCard
                  icon={Target}
                  label="Total Goals"
                  value={stats.goals.total}
                  subValue={`${stats.goals.active} active, ${stats.goals.completed} completed`}
                  color="gold"
                />
                <StatCard
                  icon={Milestone}
                  label="Total Milestones"
                  value={stats.milestones.total}
                  subValue={`${stats.milestones.completed} completed, ${stats.milestones.broken} broken`}
                  color="purple"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Subscriptions"
                  value={stats.subscriptions.total}
                  subValue={Object.entries(stats.subscriptions.byPlan || {})
                    .map(([plan, count]) => `${plan}: ${count}`)
                    .join(', ') || 'No subscriptions'}
                  color="green"
                />
              </div>
            </section>

            {/* Pricing Plans Management */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-obsidian-100">Pricing Plans</h2>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-obsidian-500" />
                  <span className="text-obsidian-500 text-sm">
                    {plans.filter(p => p.is_active).length} active / {plans.length} total
                  </span>
                </div>
              </div>

              <div className="bg-obsidian-800/30 border border-obsidian-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-obsidian-700 bg-obsidian-800/50">
                      <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Plan</th>
                      <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Price</th>
                      <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Goals Limit</th>
                      <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Features</th>
                      <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <PlanRow
                        key={plan.id}
                        plan={plan}
                        onEdit={setEditingPlan}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                    {plans.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-obsidian-500">
                          No pricing plans found. Run the database schema to create default plans.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Quick Tips */}
            <section className="bg-obsidian-800/30 border border-obsidian-700 rounded-xl p-6">
              <h3 className="text-obsidian-100 font-medium mb-3">How It Works</h3>
              <ul className="space-y-2 text-obsidian-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-gold-500">1.</span>
                  <span>Edit a plan to change its name, price, limits, and features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500">2.</span>
                  <span>Toggle features on/off - they immediately reflect on the pricing page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500">3.</span>
                  <span>Set a plan as "Featured" to highlight it on the pricing page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500">4.</span>
                  <span>Deactivate plans to hide them from customers without deleting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-500">5.</span>
                  <span>Prices are in cents (e.g., 900 = $9.00)</span>
                </li>
              </ul>
            </section>
          </>
        )}
      </main>

      {/* Edit Modal */}
      {editingPlan && (
        <PlanEditorModal
          plan={editingPlan}
          onSave={handleSavePlan}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}
