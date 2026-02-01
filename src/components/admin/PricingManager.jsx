/**
 * Pricing Manager Component
 * 
 * Admin interface for managing pricing plans with full CRUD operations.
 * Features: Create, Edit, Delete plans, Toggle active status, Feature management
 */

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Settings,
  Eye,
  Star,
} from 'lucide-react';
import { adminPricingService } from '../../services/database';

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

// Plan Editor Modal
function PlanEditorModal({ plan, onSave, onClose, isNew = false }) {
  const [formData, setFormData] = useState({
    id: plan?.id || '',
    name: plan?.name || '',
    tagline: plan?.tagline || '',
    priceMonthly: plan?.price_monthly || 0,
    priceYearly: plan?.price_yearly || 0,
    discountPercent: plan?.discount_percent || 0,
    maxActiveGoals: plan?.max_active_goals,
    maxMilestonesPerGoal: plan?.max_milestones_per_goal,
    maxSharesPerMonth: plan?.max_shares_per_month,
    features: plan?.features || {},
    isFeatured: plan?.is_featured || false,
    badgeText: plan?.badge_text || '',
    ctaText: plan?.cta_text || '',
    sortOrder: plan?.sort_order || 0,
    isActive: plan?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
    
    if (!formData.id.trim()) {
      setError('Plan ID is required');
      return;
    }
    if (!formData.name.trim()) {
      setError('Plan name is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(formData, isNew);
      onClose();
    } catch (err) {
      console.error('Failed to save plan:', err);
      setError(err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-obsidian-700 sticky top-0 bg-obsidian-900 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-obsidian-100">
              {isNew ? 'Create New Plan' : `Edit ${plan?.name} Plan`}
            </h3>
            <button
              onClick={onClose}
              className="text-obsidian-400 hover:text-obsidian-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-400 text-xs sm:text-sm">{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-obsidian-300 text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Plan ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={!isNew}
                  placeholder="e.g., starter, pro"
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500 disabled:opacity-50"
                />
                <p className="text-obsidian-500 text-[10px] sm:text-xs mt-1">Unique identifier</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Plan Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Starter, Pro"
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g., Perfect for getting started"
                className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-obsidian-300 text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Monthly Price (cents)
                </label>
                <input
                  type="number"
                  value={formData.priceMonthly}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceMonthly: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-gold-500 text-[10px] sm:text-xs mt-1">
                  = ${(formData.priceMonthly / 100).toFixed(2)}/mo
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Yearly Price (cents)
                </label>
                <input
                  type="number"
                  value={formData.priceYearly}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceYearly: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-gold-500 text-[10px] sm:text-xs mt-1">
                  = ${(formData.priceYearly / 100).toFixed(2)}/yr
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Discount %
                </label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-obsidian-500 text-[10px] sm:text-xs mt-1">Shown for yearly billing</p>
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-obsidian-300 text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" />
              Plan Limits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Max Active Goals
                </label>
                <input
                  type="text"
                  placeholder="unlimited"
                  value={formData.maxActiveGoals === null ? '' : formData.maxActiveGoals}
                  onChange={(e) => handleNumberChange('maxActiveGoals', e.target.value || 'unlimited')}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-obsidian-500 text-[10px] sm:text-xs mt-1">Empty = unlimited</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Max Milestones/Goal
                </label>
                <input
                  type="text"
                  placeholder="unlimited"
                  value={formData.maxMilestonesPerGoal === null ? '' : formData.maxMilestonesPerGoal}
                  onChange={(e) => handleNumberChange('maxMilestonesPerGoal', e.target.value || 'unlimited')}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-obsidian-500 text-[10px] sm:text-xs mt-1">Empty = unlimited</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Max Shares/Month
                </label>
                <input
                  type="text"
                  placeholder="unlimited"
                  value={formData.maxSharesPerMonth === null ? '' : formData.maxSharesPerMonth}
                  onChange={(e) => handleNumberChange('maxSharesPerMonth', e.target.value || 'unlimited')}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
                <p className="text-obsidian-500 text-[10px] sm:text-xs mt-1">Empty = unlimited</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-3 sm:space-y-4">
            <button
              type="button"
              onClick={() => setShowFeatures(!showFeatures)}
              className="w-full flex items-center justify-between text-obsidian-300 text-xs sm:text-sm font-semibold uppercase tracking-wider"
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
              <div className="bg-obsidian-800/50 rounded-lg p-3 sm:p-4 space-y-1 max-h-60 overflow-y-auto">
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
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-obsidian-300 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Display Options
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Badge Text
                </label>
                <input
                  type="text"
                  name="badgeText"
                  value={formData.badgeText}
                  onChange={handleChange}
                  placeholder="e.g., Most Popular"
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleChange}
                  placeholder="e.g., Get Started"
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-obsidian-300 mb-1.5 sm:mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 sm:px-4 py-2 text-sm text-obsidian-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div className="flex items-end gap-4 sm:gap-6">
                <label className="flex items-center gap-2 sm:gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 sm:w-10 sm:h-6 rounded-full transition-colors ${
                    formData.isFeatured ? 'bg-gold-500' : 'bg-obsidian-700'
                  }`}>
                    <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full mt-0.5 sm:mt-1 transition-transform ${
                      formData.isFeatured ? 'translate-x-4 sm:translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="text-obsidian-300 text-xs sm:text-sm">Featured</span>
                </label>

                <label className="flex items-center gap-2 sm:gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 sm:w-10 sm:h-6 rounded-full transition-colors ${
                    formData.isActive ? 'bg-emerald-500' : 'bg-obsidian-700'
                  }`}>
                    <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full mt-0.5 sm:mt-1 transition-transform ${
                      formData.isActive ? 'translate-x-4 sm:translate-x-5' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="text-obsidian-300 text-xs sm:text-sm">Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-obsidian-700">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-gold-500 hover:bg-gold-600 text-obsidian-950 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isNew ? 'Create Plan' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2.5 sm:py-3 bg-obsidian-700 hover:bg-obsidian-600 text-obsidian-200 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ plan, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(plan.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-obsidian-100">Delete Plan</h3>
        </div>
        
        <p className="text-obsidian-400 mb-6">
          Are you sure you want to delete the <span className="text-obsidian-200 font-medium">"{plan.name}"</span> plan? 
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-6 py-2 bg-obsidian-700 hover:bg-obsidian-600 text-obsidian-200 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Main PricingManager Component
export default function PricingManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminPricingService.getAll();
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData, isNew) => {
    const planData = {
      id: formData.id.toLowerCase().replace(/\s+/g, '-'),
      name: formData.name,
      tagline: formData.tagline,
      priceMonthly: formData.priceMonthly,
      priceYearly: formData.priceYearly,
      discountPercent: formData.discountPercent,
      maxActiveGoals: formData.maxActiveGoals,
      maxMilestonesPerGoal: formData.maxMilestonesPerGoal,
      maxSharesPerMonth: formData.maxSharesPerMonth,
      features: formData.features,
      isFeatured: formData.isFeatured,
      badgeText: formData.badgeText || null,
      ctaText: formData.ctaText || null,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    };

    if (isNew) {
      await adminPricingService.create(planData);
      showSuccess('Plan created successfully!');
    } else {
      await adminPricingService.update(planData.id, planData);
      showSuccess('Plan updated successfully!');
    }
    
    loadPlans();
  };

  const handleDelete = async (planId) => {
    await adminPricingService.delete(planId);
    showSuccess('Plan deleted successfully!');
    loadPlans();
  };

  const handleToggleActive = async (planId, isActive) => {
    try {
      await adminPricingService.toggleActive(planId, isActive);
      showSuccess(`Plan ${isActive ? 'activated' : 'deactivated'} successfully!`);
      loadPlans();
    } catch (err) {
      console.error('Failed to toggle plan:', err);
      setError('Failed to update plan status');
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const formatPrice = (cents) => {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatLimit = (value) => {
    if (value === null || value === undefined) return 'Unlimited';
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-obsidian-100">Pricing Plans</h2>
          <p className="text-obsidian-400 text-xs sm:text-sm mt-1">
            Manage subscription plans and pricing
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-obsidian-700 hover:bg-obsidian-600 text-obsidian-200 text-sm rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View Page</span>
          </a>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gold-500 hover:bg-gold-600 text-obsidian-950 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Plan</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 sm:gap-3">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-400 text-xs sm:text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 sm:gap-3">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-400 text-xs sm:text-sm">{successMessage}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-obsidian-800/50 border border-obsidian-700 rounded-lg p-3 sm:p-4">
          <p className="text-obsidian-400 text-[10px] sm:text-sm">Total Plans</p>
          <p className="text-xl sm:text-2xl font-bold text-obsidian-100">{plans.length}</p>
        </div>
        <div className="bg-obsidian-800/50 border border-obsidian-700 rounded-lg p-3 sm:p-4">
          <p className="text-obsidian-400 text-[10px] sm:text-sm">Active Plans</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-500">{plans.filter(p => p.is_active).length}</p>
        </div>
        <div className="bg-obsidian-800/50 border border-obsidian-700 rounded-lg p-3 sm:p-4">
          <p className="text-obsidian-400 text-[10px] sm:text-sm">Featured</p>
          <p className="text-xl sm:text-2xl font-bold text-gold-500">{plans.filter(p => p.is_featured).length}</p>
        </div>
      </div>

      {/* Plans Table - Desktop */}
      <div className="hidden md:block bg-obsidian-800/30 border border-obsidian-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-obsidian-700 bg-obsidian-800/50">
              <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Plan</th>
              <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Price</th>
              <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Limits</th>
              <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Features</th>
              <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Status</th>
              <th className="text-left py-3 px-4 text-obsidian-400 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const enabledFeatures = Object.values(plan.features || {}).filter(Boolean).length;
              
              return (
                <tr key={plan.id} className="border-b border-obsidian-700/50 hover:bg-obsidian-800/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        plan.is_featured ? 'bg-gold-500/20 border border-gold-500/30' : 'bg-obsidian-700'
                      }`}>
                        <span className={`text-sm font-bold ${plan.is_featured ? 'text-gold-500' : 'text-obsidian-400'}`}>
                          {plan.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-obsidian-100 font-medium">{plan.name}</p>
                          {plan.is_featured && <Star className="w-3 h-3 text-gold-500" />}
                        </div>
                        <p className="text-obsidian-500 text-xs">{plan.tagline || plan.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-obsidian-300">
                    <div className="text-sm">
                      <p>{formatPrice(plan.price_monthly)}/mo</p>
                      <p className="text-obsidian-500 text-xs">{formatPrice(plan.price_yearly)}/yr</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-obsidian-300 text-sm">
                    <div className="space-y-0.5">
                      <p>{formatLimit(plan.max_active_goals)} goals</p>
                      <p className="text-obsidian-500 text-xs">{formatLimit(plan.max_shares_per_month)} shares/mo</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-obsidian-300 text-sm">
                    {enabledFeatures} features
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(plan.id, !plan.is_active)}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="p-2 text-obsidian-400 hover:text-gold-500 hover:bg-obsidian-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingPlan(plan)}
                        className="p-2 text-obsidian-400 hover:text-red-500 hover:bg-obsidian-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {plans.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-obsidian-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pricing plans found</p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="mt-3 text-gold-500 hover:text-gold-400 text-sm"
                  >
                    Create your first plan
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Plans Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {plans.length === 0 ? (
          <div className="bg-obsidian-800/30 border border-obsidian-700 rounded-xl p-8 text-center text-obsidian-500">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No pricing plans found</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-3 text-gold-500 hover:text-gold-400 text-sm"
            >
              Create your first plan
            </button>
          </div>
        ) : (
          plans.map((plan) => {
            const enabledFeatures = Object.values(plan.features || {}).filter(Boolean).length;
            
            return (
              <div key={plan.id} className="bg-obsidian-800/30 border border-obsidian-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      plan.is_featured ? 'bg-gold-500/20 border border-gold-500/30' : 'bg-obsidian-700'
                    }`}>
                      <span className={`text-sm font-bold ${plan.is_featured ? 'text-gold-500' : 'text-obsidian-400'}`}>
                        {plan.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-obsidian-100 font-medium text-sm">{plan.name}</p>
                        {plan.is_featured && <Star className="w-3 h-3 text-gold-500" />}
                      </div>
                      <p className="text-obsidian-500 text-xs">{plan.tagline || plan.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="p-1.5 text-obsidian-400 hover:text-gold-500 hover:bg-obsidian-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingPlan(plan)}
                      className="p-1.5 text-obsidian-400 hover:text-red-500 hover:bg-obsidian-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-obsidian-800/50 rounded-lg p-2">
                    <p className="text-obsidian-100 text-sm font-medium">{formatPrice(plan.price_monthly)}</p>
                    <p className="text-obsidian-500 text-[10px]">/month</p>
                  </div>
                  <div className="bg-obsidian-800/50 rounded-lg p-2">
                    <p className="text-obsidian-100 text-sm font-medium">{formatLimit(plan.max_active_goals)}</p>
                    <p className="text-obsidian-500 text-[10px]">goals</p>
                  </div>
                  <div className="bg-obsidian-800/50 rounded-lg p-2">
                    <p className="text-obsidian-100 text-sm font-medium">{enabledFeatures}</p>
                    <p className="text-obsidian-500 text-[10px]">features</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-obsidian-700/50">
                  <span className="text-obsidian-400 text-xs">Status</span>
                  <button
                    onClick={() => handleToggleActive(plan.id, !plan.is_active)}
                    className="flex items-center gap-1.5"
                  >
                    {plan.is_active ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                        <span className="text-emerald-500 text-xs">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-obsidian-500" />
                        <span className="text-obsidian-500 text-xs">Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {(editingPlan || isCreating) && (
        <PlanEditorModal
          plan={editingPlan}
          isNew={isCreating}
          onSave={handleSave}
          onClose={() => {
            setEditingPlan(null);
            setIsCreating(false);
          }}
        />
      )}

      {deletingPlan && (
        <DeleteConfirmModal
          plan={deletingPlan}
          onConfirm={handleDelete}
          onClose={() => setDeletingPlan(null)}
        />
      )}
    </div>
  );
}
