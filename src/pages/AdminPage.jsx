import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Target,
  Milestone,
  DollarSign,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Star,
  HelpCircle,
  Quote,
  Gift,
  BarChart3,
} from 'lucide-react';
import { Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import {
  adminAnalyticsService,
  adminSubscriptionService,
} from '../services/database';

// Import Admin Components
import {
  TestimonialsManager,
  FAQsManager,
  QuotesManager,
  OffersManager,
  UsersManager,
  SiteStatsManager,
  PricingManager,
} from '../components/admin';

/**
 * Admin Dashboard - Full Control Center
 *
 * Features:
 * - Overview stats (users, goals, milestones, subscriptions)
 * - Pricing plan management
 * - Testimonials/Reviews management
 * - FAQs management
 * - Motivational quotes management
 * - Offers/Promotions management
 * - Users list
 * - Site statistics management
 */

// Admin Tabs Configuration
const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'testimonials', label: 'Testimonials', icon: Star },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'quotes', label: 'Quotes', icon: Quote },
  { id: 'offers', label: 'Offers', icon: Gift },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'stats', label: 'Site Stats', icon: TrendingUp },
];

// Stat Card Component
function StatCard({ icon: Icon, label, value, subValue, color = 'gold' }) {
  const colorClasses = {
    gold: 'bg-gold-500/10 border-gold-500/20 text-gold-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
  };

  return (
    <div className="bg-obsidian-800/50 border border-obsidian-700 rounded-xl p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-obsidian-400 text-xs sm:text-sm mb-1">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-obsidian-100">{value}</p>
          {subValue && (
            <p className="text-obsidian-500 text-[10px] sm:text-xs mt-1 truncate">{subValue}</p>
          )}
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Overview stats
  const [stats, setStats] = useState({
    users: 0,
    goals: { total: 0, active: 0, completed: 0 },
    milestones: { total: 0, completed: 0, broken: 0 },
    subscriptions: { total: 0, byPlan: {} },
  });

  // Simple admin check - bypassed for development
  // TODO: In production, check user.is_admin or user.role === 'admin'
  const isAdmin = user?.is_admin || true;

  const loadData = async () => {
    try {
      setError(null);

      // Load overview stats in parallel
      const [
        userCount,
        goalStats,
        milestoneStats,
        subscriptionStats,
      ] = await Promise.all([
        adminAnalyticsService.getUserCount(),
        adminAnalyticsService.getGoalStats(),
        adminAnalyticsService.getMilestoneStats(),
        adminSubscriptionService.getStats(),
      ]);

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500" />
              <h1 className="text-base sm:text-xl font-semibold text-obsidian-100">Admin</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefresh}
                disabled={refreshing}
                className={`${refreshing ? 'animate-spin' : ''} !px-2 sm:!px-3`}
              >
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/')}
                className="!px-2 sm:!px-3"
              >
                <span className="hidden sm:inline">View Site</span>
                <span className="sm:hidden">Site</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="!px-2 sm:!px-3"
              >
                <span className="hidden sm:inline">Back to App</span>
                <span className="sm:hidden">App</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 sm:gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-xs sm:text-sm flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 sm:gap-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-emerald-400 text-xs sm:text-sm">{successMessage}</p>
          </div>
        )}

        {/* Mobile Tab Navigation - Horizontal Scroll */}
        <nav className="lg:hidden mb-4 -mx-3 px-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2 min-w-max">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-gold-500/20 text-gold-500 border border-gold-500/30'
                      : 'text-obsidian-400 bg-obsidian-800/50 border border-obsidian-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex gap-6">
          {/* Desktop Sidebar Navigation */}
          <nav className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-gold-500/20 text-gold-500 border border-gold-500/30'
                        : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <>
                    <section className="mb-6 sm:mb-8">
                      <h2 className="text-base sm:text-lg font-semibold text-obsidian-100 mb-3 sm:mb-4">Overview</h2>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <StatCard icon={Users} label="Total Users" value={stats.users} color="blue" />
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

                    {/* Quick Actions */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <button
                        onClick={() => setActiveTab('testimonials')}
                        className="p-3 sm:p-4 bg-obsidian-800/50 border border-obsidian-700 rounded-xl hover:border-gold-500/50 transition-colors text-left"
                      >
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mb-1.5 sm:mb-2" />
                        <p className="font-medium text-white text-sm sm:text-base">Testimonials</p>
                        <p className="text-[10px] sm:text-xs text-obsidian-400">Manage reviews</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('faqs')}
                        className="p-3 sm:p-4 bg-obsidian-800/50 border border-obsidian-700 rounded-xl hover:border-gold-500/50 transition-colors text-left"
                      >
                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mb-1.5 sm:mb-2" />
                        <p className="font-medium text-white text-sm sm:text-base">FAQs</p>
                        <p className="text-[10px] sm:text-xs text-obsidian-400">Edit questions</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('quotes')}
                        className="p-3 sm:p-4 bg-obsidian-800/50 border border-obsidian-700 rounded-xl hover:border-gold-500/50 transition-colors text-left"
                      >
                        <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mb-1.5 sm:mb-2" />
                        <p className="font-medium text-white text-sm sm:text-base">Quotes</p>
                        <p className="text-[10px] sm:text-xs text-obsidian-400">Dashboard quotes</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('offers')}
                        className="p-3 sm:p-4 bg-obsidian-800/50 border border-obsidian-700 rounded-xl hover:border-gold-500/50 transition-colors text-left"
                      >
                        <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 mb-1.5 sm:mb-2" />
                        <p className="font-medium text-white text-sm sm:text-base">Offers</p>
                        <p className="text-[10px] sm:text-xs text-obsidian-400">Promotions</p>
                      </button>
                    </section>

                    {/* Quick Guide */}
                    <section className="bg-obsidian-800/30 border border-obsidian-700 rounded-xl p-4 sm:p-6">
                      <h3 className="text-obsidian-100 font-medium text-sm sm:text-base mb-2 sm:mb-3">Admin Quick Guide</h3>
                      <ul className="space-y-1.5 sm:space-y-2 text-obsidian-400 text-xs sm:text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-gold-500">•</span>
                          <span><strong>Testimonials:</strong> Manage reviews shown on the landing page</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold-500">•</span>
                          <span><strong>FAQs:</strong> Edit frequently asked questions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold-500">•</span>
                          <span><strong>Quotes:</strong> Motivational quotes shown on user dashboards</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold-500">•</span>
                          <span><strong>Offers:</strong> Promotional banners for the landing page</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold-500">•</span>
                          <span><strong>Pricing:</strong> Manage subscription plans and pricing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold-500">•</span>
                          <span><strong>Site Stats:</strong> Update statistics shown in social proof section</span>
                        </li>
                      </ul>
                    </section>
                  </>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && <UsersManager />}

                {/* Testimonials Tab */}
                {activeTab === 'testimonials' && <TestimonialsManager />}

                {/* FAQs Tab */}
                {activeTab === 'faqs' && <FAQsManager />}

                {/* Quotes Tab */}
                {activeTab === 'quotes' && <QuotesManager />}

                {/* Offers Tab */}
                {activeTab === 'offers' && <OffersManager />}

                {/* Site Stats Tab */}
                {activeTab === 'stats' && <SiteStatsManager />}

                {/* Pricing Tab */}
                {activeTab === 'pricing' && <PricingManager />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
