/**
 * Site Stats Manager Component
 * 
 * Admin interface for managing site statistics displayed on the landing page.
 * Features: Edit stats, Calculate from real data
 */

import { useState, useEffect } from 'react';
import { siteStatsService } from '../../services/adminContentService';
import { BarChart3, Users, TrendingUp, Shield, Save, RefreshCw, Check } from 'lucide-react';

const SiteStatsManager = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    promises_kept: 0,
    success_rate: 0,
    active_users: 0,
    avg_integrity_score: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await siteStatsService.get();
      setStats(data);
      if (data) {
        setFormData({
          promises_kept: data.promises_kept || 0,
          success_rate: data.success_rate || 0,
          active_users: data.active_users || 0,
          avg_integrity_score: data.avg_integrity_score || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await siteStatsService.update(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadStats();
    } catch (error) {
      console.error('Error saving stats:', error);
      alert('Error saving stats: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateFromData = async () => {
    try {
      setCalculating(true);
      await siteStatsService.calculateFromData();
      loadStats();
    } catch (error) {
      console.error('Error calculating stats:', error);
      alert('Error calculating stats: ' + error.message);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Site Statistics</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Manage statistics displayed on the landing page
          </p>
        </div>
        <button
          onClick={handleCalculateFromData}
          disabled={calculating}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
          Calculate from Data
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-blue-200 text-xs sm:text-sm">
          These stats are displayed in the "Social Proof" section of your landing page.
          Set manually or calculate from real data.
        </p>
      </div>

      {/* Stats Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Promises Kept */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Promises Kept</h3>
              <p className="text-[10px] sm:text-xs text-gray-400">Total completed milestones</p>
            </div>
          </div>
          <input
            type="number"
            min="0"
            value={formData.promises_kept}
            onChange={(e) => setFormData({ ...formData, promises_kept: parseInt(e.target.value) || 0 })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-xl sm:text-2xl font-bold focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Success Rate */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Success Rate</h3>
              <p className="text-[10px] sm:text-xs text-gray-400">Percentage of kept promises</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={formData.success_rate}
              onChange={(e) => setFormData({ ...formData, success_rate: parseInt(e.target.value) || 0 })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 bg-gray-900 border border-gray-600 rounded-lg text-white text-xl sm:text-2xl font-bold focus:outline-none focus:border-amber-500"
            />
            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg sm:text-xl">%</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Active Users</h3>
              <p className="text-[10px] sm:text-xs text-gray-400">Users with active goals</p>
            </div>
          </div>
          <input
            type="number"
            min="0"
            value={formData.active_users}
            onChange={(e) => setFormData({ ...formData, active_users: parseInt(e.target.value) || 0 })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-xl sm:text-2xl font-bold focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Average Integrity Score */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Avg Integrity Score</h3>
              <p className="text-[10px] sm:text-xs text-gray-400">Average score across users</p>
            </div>
          </div>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.avg_integrity_score}
            onChange={(e) => setFormData({ ...formData, avg_integrity_score: parseInt(e.target.value) || 0 })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-xl sm:text-2xl font-bold focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
        <h3 className="font-semibold text-white text-sm sm:text-base mb-3 sm:mb-4">Preview: How it appears on landing page</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-500">{formData.promises_kept.toLocaleString()}+</p>
            <p className="text-xs sm:text-sm text-gray-400">Promises Kept</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-500">{formData.success_rate}%</p>
            <p className="text-xs sm:text-sm text-gray-400">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-500">{formData.active_users.toLocaleString()}+</p>
            <p className="text-xs sm:text-sm text-gray-400">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-500">{formData.avg_integrity_score}</p>
            <p className="text-xs sm:text-sm text-gray-400">Avg Score</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white text-sm sm:text-base font-medium transition-colors ${
            saved
              ? 'bg-emerald-600'
              : 'bg-amber-600 hover:bg-amber-700'
          } disabled:opacity-50`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </>
          )}
        </button>
      </div>

      {/* Last Updated */}
      {stats?.updated_at && (
        <p className="text-center text-[10px] sm:text-xs text-gray-500">
          Last updated: {new Date(stats.updated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default SiteStatsManager;
