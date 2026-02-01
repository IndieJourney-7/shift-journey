import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Flame,
  Calendar,
  Clock,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from 'lucide-react';
import { Card, Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import { getIntegrityTier, INTEGRITY_TIERS } from '../lib/badgeDefinitions';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate analytics data from milestones and user data
 */
function calculateAnalytics(milestones, goalHistory, user) {
  const completed = milestones.filter(m => m.status === 'completed');
  const broken = milestones.filter(m => m.status === 'broken');
  const total = completed.length + broken.length;

  // Calculate streaks
  const sortedResolved = [...completed, ...broken]
    .filter(m => m.completedAt || m.brokenAt)
    .sort((a, b) => new Date(a.completedAt || a.brokenAt) - new Date(b.completedAt || b.brokenAt));

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  sortedResolved.forEach(m => {
    if (m.status === 'completed') {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  // Calculate current streak from the end
  for (let i = sortedResolved.length - 1; i >= 0; i--) {
    if (sortedResolved[i].status === 'completed') {
      currentStreak++;
    } else {
      break;
    }
  }

  // Days since last broken
  const lastBroken = broken
    .filter(m => m.brokenAt)
    .sort((a, b) => new Date(b.brokenAt) - new Date(a.brokenAt))[0];
  const daysSinceLastBroken = lastBroken
    ? Math.floor((new Date() - new Date(lastBroken.brokenAt)) / (1000 * 60 * 60 * 24))
    : null;

  // Success rate
  const successRate = total > 0 ? Math.round((completed.length / total) * 100) : 100;

  // Calculate weekly/monthly trends
  const now = new Date();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const thisWeekCompleted = completed.filter(m => new Date(m.completedAt) >= oneWeekAgo).length;
  const lastWeekCompleted = completed.filter(
    m => new Date(m.completedAt) >= twoWeeksAgo && new Date(m.completedAt) < oneWeekAgo
  ).length;

  const thisMonthCompleted = completed.filter(m => new Date(m.completedAt) >= oneMonthAgo).length;
  const thisMonthBroken = broken.filter(m => new Date(m.brokenAt) >= oneMonthAgo).length;

  // Calculate average completion time (hours before deadline)
  const completionTimes = completed
    .filter(m => m.completedAt && m.promise?.deadline)
    .map(m => {
      const deadline = new Date(m.promise.deadline);
      const completed = new Date(m.completedAt);
      return (deadline - completed) / (1000 * 60 * 60); // hours
    });
  const avgCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    : 0;

  // Day of week analysis
  const dayOfWeekStats = { 0: { kept: 0, broken: 0 }, 1: { kept: 0, broken: 0 }, 2: { kept: 0, broken: 0 }, 3: { kept: 0, broken: 0 }, 4: { kept: 0, broken: 0 }, 5: { kept: 0, broken: 0 }, 6: { kept: 0, broken: 0 } };
  
  completed.forEach(m => {
    if (m.promise?.deadline) {
      const day = new Date(m.promise.deadline).getDay();
      dayOfWeekStats[day].kept++;
    }
  });
  
  broken.forEach(m => {
    if (m.promise?.deadline) {
      const day = new Date(m.promise.deadline).getDay();
      dayOfWeekStats[day].broken++;
    }
  });

  // Find best performing day
  let bestDay = null;
  let bestDayRate = 0;
  Object.entries(dayOfWeekStats).forEach(([day, stats]) => {
    const total = stats.kept + stats.broken;
    if (total > 0) {
      const rate = stats.kept / total;
      if (rate > bestDayRate) {
        bestDayRate = rate;
        bestDay = parseInt(day);
      }
    }
  });

  // Goal stats
  const goalsCompleted = goalHistory.length;
  const avgMilestonesPerGoal = goalHistory.length > 0
    ? goalHistory.reduce((sum, g) => sum + (g.milestones?.length || 0), 0) / goalHistory.length
    : 0;

  return {
    // Core stats
    totalKept: completed.length,
    totalBroken: broken.length,
    totalResolved: total,
    successRate,
    currentStreak,
    bestStreak,
    daysSinceLastBroken,

    // Trends
    thisWeekCompleted,
    lastWeekCompleted,
    weekOverWeekChange: thisWeekCompleted - lastWeekCompleted,
    thisMonthCompleted,
    thisMonthBroken,

    // Time analysis
    avgCompletionTime,
    dayOfWeekStats,
    bestDay,
    bestDayRate: Math.round(bestDayRate * 100),

    // Goals
    goalsCompleted,
    avgMilestonesPerGoal: Math.round(avgMilestonesPerGoal * 10) / 10,

    // User
    integrityScore: user?.integrityScore ?? 50,
    failureStreak: user?.failureStreak ?? 0,
  };
}

// Day names for display
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// =====================================================
// SUB-COMPONENTS
// =====================================================

/**
 * Stat Card - Reusable stat display
 */
function StatCard({ icon: Icon, label, value, subValue, trend, trendValue, color = 'gold', size = 'md' }) {
  const colorClasses = {
    gold: 'text-gold-400 bg-gold-500/10 border-gold-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    gray: 'text-obsidian-400 bg-obsidian-700/50 border-obsidian-600/50',
  };

  const iconColorClasses = {
    gold: 'text-gold-500',
    green: 'text-green-500',
    red: 'text-red-500',
    amber: 'text-amber-500',
    gray: 'text-obsidian-400',
  };

  return (
    <div className={`p-4 sm:p-5 rounded-xl border ${colorClasses[color]} backdrop-blur-sm`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-obsidian-800/50`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColorClasses[color]}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-obsidian-500'
          }`}>
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      <div className={`${size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold text-obsidian-100 mb-1`}>
        {value}
      </div>
      <div className="text-obsidian-400 text-xs sm:text-sm">{label}</div>
      {subValue && <div className="text-obsidian-500 text-xs mt-1">{subValue}</div>}
    </div>
  );
}

/**
 * Circular Progress - Visual progress ring
 */
function CircularProgress({ value, size = 120, strokeWidth = 8, color = '#c9a962' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-obsidian-100">{value}%</span>
        <span className="text-obsidian-500 text-xs">Success</span>
      </div>
    </div>
  );
}

/**
 * Mini Bar Chart - Day of week performance
 */
function DayOfWeekChart({ data }) {
  const maxTotal = Math.max(...Object.values(data).map(d => d.kept + d.broken), 1);

  return (
    <div className="flex items-end justify-between gap-1 sm:gap-2 h-24 sm:h-32">
      {DAY_NAMES.map((day, index) => {
        const stats = data[index];
        const total = stats.kept + stats.broken;
        const keptHeight = total > 0 ? (stats.kept / maxTotal) * 100 : 0;
        const brokenHeight = total > 0 ? (stats.broken / maxTotal) * 100 : 0;

        return (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: '80%' }}>
              <div
                className="w-full bg-green-500/70 transition-all duration-500"
                style={{ height: `${keptHeight}%` }}
              />
              <div
                className="w-full bg-red-500/70 transition-all duration-500"
                style={{ height: `${brokenHeight}%` }}
              />
            </div>
            <span className="text-obsidian-500 text-[10px] sm:text-xs">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Integrity Score Gauge
 */
function IntegrityGauge({ score }) {
  const tier = getIntegrityTier(score);
  const percentage = score;

  // Calculate color based on score
  const getGradient = () => {
    if (score >= 71) return 'from-amber-400 to-gold-500';
    if (score >= 31) return 'from-slate-400 to-gray-300';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="relative">
      {/* Background track */}
      <div className="h-3 sm:h-4 rounded-full bg-obsidian-800 overflow-hidden">
        {/* Tier markers */}
        <div className="absolute inset-0 flex">
          <div className="w-[30%] border-r border-obsidian-600" />
          <div className="w-[40%] border-r border-obsidian-600" />
          <div className="w-[30%]" />
        </div>
        {/* Progress fill */}
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full blur-sm bg-white/20" />
        </div>
      </div>
      {/* Tier labels */}
      <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-obsidian-500">
        <span>Unreliable</span>
        <span>Inconsistent</span>
        <span>Reliable</span>
      </div>
    </div>
  );
}

/**
 * Insight Card - AI-style behavioral insight
 */
function InsightCard({ icon: Icon, title, description, type = 'info' }) {
  const typeStyles = {
    positive: 'border-green-500/30 bg-green-950/20',
    negative: 'border-red-500/30 bg-red-950/20',
    info: 'border-amber-500/30 bg-amber-950/20',
    neutral: 'border-obsidian-600 bg-obsidian-800/50',
  };

  const iconColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    info: 'text-amber-400',
    neutral: 'text-obsidian-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-obsidian-800/50 flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColors[type]}`} />
        </div>
        <div>
          <h4 className="text-obsidian-200 text-sm font-medium mb-1">{title}</h4>
          <p className="text-obsidian-400 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Streak Display
 */
function StreakDisplay({ current, best, type = 'fire' }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          {type === 'fire' && <Flame className="w-5 h-5 text-orange-500" />}
          <span className="text-2xl sm:text-3xl font-bold text-obsidian-100">{current}</span>
        </div>
        <span className="text-obsidian-500 text-xs">Current Streak</span>
      </div>
      <div className="h-10 w-px bg-obsidian-700" />
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Award className="w-5 h-5 text-gold-500" />
          <span className="text-2xl sm:text-3xl font-bold text-obsidian-100">{best}</span>
        </div>
        <span className="text-obsidian-500 text-xs">Best Streak</span>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { user, milestones, goalHistory, currentGoal, isLoading } = useApp();

  // Calculate all analytics
  const analytics = useMemo(() => {
    return calculateAnalytics(milestones, goalHistory, user);
  }, [milestones, goalHistory, user]);

  // Generate insights based on data
  const insights = useMemo(() => {
    const results = [];

    // Streak insight
    if (analytics.currentStreak >= 3) {
      results.push({
        icon: Flame,
        title: `You're on fire! 🔥`,
        description: `${analytics.currentStreak} promises kept in a row. Keep the momentum going!`,
        type: 'positive',
      });
    }

    // Week over week
    if (analytics.weekOverWeekChange > 0) {
      results.push({
        icon: TrendingUp,
        title: 'Improving Week Over Week',
        description: `You completed ${analytics.weekOverWeekChange} more ${analytics.weekOverWeekChange === 1 ? 'promise' : 'promises'} this week compared to last week.`,
        type: 'positive',
      });
    } else if (analytics.weekOverWeekChange < 0) {
      results.push({
        icon: TrendingDown,
        title: 'Slight Dip This Week',
        description: `You completed ${Math.abs(analytics.weekOverWeekChange)} fewer ${Math.abs(analytics.weekOverWeekChange) === 1 ? 'promise' : 'promises'} this week. Time to refocus?`,
        type: 'info',
      });
    }

    // Best day insight
    if (analytics.bestDay !== null && analytics.bestDayRate > 60) {
      results.push({
        icon: Calendar,
        title: `${DAY_NAMES_FULL[analytics.bestDay]}s Are Your Day`,
        description: `You have a ${analytics.bestDayRate}% success rate on ${DAY_NAMES_FULL[analytics.bestDay]}s. Consider scheduling important promises then.`,
        type: 'info',
      });
    }

    // Days since last broken
    if (analytics.daysSinceLastBroken !== null && analytics.daysSinceLastBroken > 7) {
      results.push({
        icon: Shield,
        title: 'Strong Recovery',
        description: `It's been ${analytics.daysSinceLastBroken} days since your last broken promise. Your integrity is strengthening.`,
        type: 'positive',
      });
    }

    // Failure streak warning
    if (analytics.failureStreak >= 2) {
      results.push({
        icon: AlertTriangle,
        title: 'Breaking Pattern Detected',
        description: `You've broken ${analytics.failureStreak} promises in a row. Consider setting smaller, more achievable goals.`,
        type: 'negative',
      });
    }

    // Completion time insight
    if (analytics.avgCompletionTime > 24) {
      results.push({
        icon: Clock,
        title: 'Ahead of Schedule',
        description: `On average, you complete promises ${Math.round(analytics.avgCompletionTime)} hours before the deadline. Great time management!`,
        type: 'positive',
      });
    } else if (analytics.avgCompletionTime >= 0 && analytics.avgCompletionTime < 2 && analytics.totalKept > 0) {
      results.push({
        icon: Clock,
        title: 'Cutting It Close',
        description: `You tend to complete promises just ${Math.round(analytics.avgCompletionTime)} hours before deadline. Try finishing earlier to reduce stress.`,
        type: 'info',
      });
    }

    // Success rate insight
    if (analytics.successRate >= 90 && analytics.totalResolved >= 5) {
      results.push({
        icon: Award,
        title: 'High Achiever',
        description: `With a ${analytics.successRate}% success rate, you're in the top tier of promise keepers. Your word truly matters.`,
        type: 'positive',
      });
    }

    return results;
  }, [analytics]);

  // Get current tier info
  const tier = getIntegrityTier(analytics.integrityScore);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-obsidian-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-obsidian-100 mb-1">Analytics</h1>
          <p className="text-obsidian-400 text-sm sm:text-base">
            Understand your promise-keeping patterns and growth
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Integrity Score Hero */}
      <Card variant="elevated" padding="lg" className="relative overflow-hidden">
        {/* Background glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 ${
          tier.id === 'reliable' ? 'bg-amber-500' : tier.id === 'inconsistent' ? 'bg-slate-400' : 'bg-gray-500'
        }`} />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className={`w-8 h-8 ${tier.color.text}`} />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-obsidian-100">
                    {analytics.integrityScore}
                  </h2>
                  <p className={`text-sm font-medium ${tier.color.text}`}>{tier.name}</p>
                </div>
              </div>
              <p className="text-obsidian-400 text-sm max-w-md">{tier.description}</p>
            </div>
            
            <StreakDisplay current={analytics.currentStreak} best={analytics.bestStreak} />
          </div>

          <IntegrityGauge score={analytics.integrityScore} />
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={CheckCircle}
          label="Promises Kept"
          value={analytics.totalKept}
          color="green"
          trend={analytics.weekOverWeekChange > 0 ? 'up' : analytics.weekOverWeekChange < 0 ? 'down' : 'neutral'}
          trendValue={analytics.weekOverWeekChange !== 0 ? `${Math.abs(analytics.weekOverWeekChange)} this week` : undefined}
        />
        <StatCard
          icon={XCircle}
          label="Promises Broken"
          value={analytics.totalBroken}
          color="red"
        />
        <StatCard
          icon={Target}
          label="Goals Completed"
          value={analytics.goalsCompleted}
          color="gold"
        />
        <StatCard
          icon={Calendar}
          label="Days Since Break"
          value={analytics.daysSinceLastBroken ?? '—'}
          subValue={analytics.daysSinceLastBroken !== null ? 'Clean streak' : 'No breaks yet'}
          color={analytics.daysSinceLastBroken > 7 ? 'green' : 'gray'}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Success Rate */}
        <Card variant="default" padding="md" className="sm:p-6">
          <h3 className="text-obsidian-200 font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gold-500" />
            Success Rate
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CircularProgress
              value={analytics.successRate}
              color={analytics.successRate >= 70 ? '#c9a962' : analytics.successRate >= 40 ? '#9ca3af' : '#6b7280'}
            />
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-obsidian-300 text-sm">Kept</span>
                </div>
                <span className="text-obsidian-200 font-medium">{analytics.totalKept}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-obsidian-300 text-sm">Broken</span>
                </div>
                <span className="text-obsidian-200 font-medium">{analytics.totalBroken}</span>
              </div>
              <div className="h-px bg-obsidian-700" />
              <div className="flex items-center justify-between">
                <span className="text-obsidian-400 text-sm">Total Resolved</span>
                <span className="text-obsidian-300 font-medium">{analytics.totalResolved}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Day of Week Performance */}
        <Card variant="default" padding="md" className="sm:p-6">
          <h3 className="text-obsidian-200 font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-500" />
            Performance by Day
          </h3>
          <DayOfWeekChart data={analytics.dayOfWeekStats} />
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-green-500/70" />
              <span className="text-obsidian-400">Kept</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-500/70" />
              <span className="text-obsidian-400">Broken</span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-obsidian-200 font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Personalized Insights
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {insights.map((insight, index) => (
              <InsightCard key={index} {...insight} />
            ))}
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      <Card variant="default" padding="md" className="sm:p-6">
        <h3 className="text-obsidian-200 font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gold-500" />
          This Month's Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-obsidian-800/50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-400">{analytics.thisMonthCompleted}</div>
            <div className="text-obsidian-500 text-xs sm:text-sm">Kept</div>
          </div>
          <div className="text-center p-3 bg-obsidian-800/50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-red-400">{analytics.thisMonthBroken}</div>
            <div className="text-obsidian-500 text-xs sm:text-sm">Broken</div>
          </div>
          <div className="text-center p-3 bg-obsidian-800/50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-obsidian-200">
              {analytics.thisMonthCompleted + analytics.thisMonthBroken > 0
                ? Math.round((analytics.thisMonthCompleted / (analytics.thisMonthCompleted + analytics.thisMonthBroken)) * 100)
                : 0}%
            </div>
            <div className="text-obsidian-500 text-xs sm:text-sm">Success Rate</div>
          </div>
          <div className="text-center p-3 bg-obsidian-800/50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-amber-400">
              {analytics.avgCompletionTime > 0 ? `${Math.round(analytics.avgCompletionTime)}h` : '—'}
            </div>
            <div className="text-obsidian-500 text-xs sm:text-sm">Avg. Early</div>
          </div>
        </div>
      </Card>

      {/* Goal Stats */}
      <Card variant="default" padding="md" className="sm:p-6">
        <h3 className="text-obsidian-200 font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-gold-500" />
          Goal Journey
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-obsidian-800/50 rounded-xl border border-obsidian-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gold-500/10">
                <Award className="w-5 h-5 text-gold-500" />
              </div>
              <span className="text-obsidian-400 text-sm">Goals Completed</span>
            </div>
            <div className="text-2xl font-bold text-obsidian-100">{analytics.goalsCompleted}</div>
          </div>
          <div className="p-4 bg-obsidian-800/50 rounded-xl border border-obsidian-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-obsidian-400 text-sm">Avg. Milestones/Goal</span>
            </div>
            <div className="text-2xl font-bold text-obsidian-100">{analytics.avgMilestonesPerGoal}</div>
          </div>
          <div className="p-4 bg-obsidian-800/50 rounded-xl border border-obsidian-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-obsidian-400 text-sm">Current Goal Progress</span>
            </div>
            <div className="text-2xl font-bold text-obsidian-100">
              {currentGoal ? `${milestones.filter(m => m.status === 'completed').length}/${milestones.length}` : '—'}
            </div>
          </div>
        </div>
      </Card>

      {/* Empty State for New Users */}
      {analytics.totalResolved === 0 && (
        <Card variant="highlighted" padding="lg" className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gold-500" />
          </div>
          <h3 className="text-lg font-semibold text-obsidian-100 mb-2">
            Start Building Your Analytics
          </h3>
          <p className="text-obsidian-400 text-sm mb-6 max-w-md mx-auto">
            Complete your first promise to unlock powerful insights about your promise-keeping patterns.
          </p>
          <Button variant="gold" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      )}

      {/* Footer Note */}
      <div className="text-center py-4">
        <p className="text-obsidian-600 text-xs flex items-center justify-center gap-1">
          <Info className="w-3 h-3" />
          Analytics update in real-time as you complete or break promises
        </p>
      </div>
    </div>
  );
}
