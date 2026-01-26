import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Lock, User, TrendingUp, Share2, Target, Trophy, Flame, CheckCircle } from 'lucide-react';
import { Card, Badge, Button, Modal } from '../components/ui';
import { IntegrityShieldBadge } from '../components/journey';
import { IntegrityBadgeCard, ShareableBadgeImage } from '../components/badges';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, milestones, nextPendingMilestone, currentLockedMilestone, currentGoal, goalHistory } = useApp();
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Derive failure history from broken milestones
  const failureHistory = milestones.filter(m => m.status === 'broken');

  // Get badge variant based on new status labels
  const getStatusBadgeVariant = () => {
    switch (user?.status) {
      case 'Reliable':
        return 'trusted';
      case 'Inconsistent':
        return 'building';
      default:
        return 'untrusted';
    }
  };

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const brokenCount = failureHistory.length;

  // Calculate current streak (consecutive kept promises from most recent)
  const calculateStreak = () => {
    const resolvedMilestones = milestones
      .filter(m => m.status === 'completed' || m.status === 'broken')
      .sort((a, b) => new Date(b.completedAt || b.brokenAt) - new Date(a.completedAt || a.brokenAt));

    let streak = 0;
    for (const m of resolvedMilestones) {
      if (m.status === 'completed') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();
  const goalsCompletedCount = goalHistory?.length || 0;

  // Stats for badge sharing
  const badgeStats = {
    totalKept: completedCount,
    totalBroken: brokenCount,
    currentStreak: currentStreak,
    goalsCompleted: goalsCompletedCount,
    totalWitnesses: milestones.reduce((acc, m) => acc + (m.promise?.witnessCount || 0), 0),
  };

  const profileUrl = `${window.location.origin}/p/${user?.id}`;

  const getIconForMilestone = (milestone) => {
    if (milestone.status === 'broken') return AlertTriangle;
    return Lock;
  };

  const handleBeginRepair = () => {
    setShowRepairModal(true);
  };

  // Calculate promises needed to reach next integrity level
  // 0-30: Unreliable, 31-70: Inconsistent, 71-100: Reliable
  const integrityScore = user?.integrityScore || 50;
  const promisesToReach31 = integrityScore <= 30
    ? Math.ceil((31 - integrityScore) / 10)
    : 0;
  const promisesToReach71 = integrityScore <= 70
    ? Math.ceil((71 - integrityScore) / 10)
    : 0;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-obsidian-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-obsidian-100 mb-1">Profile</h1>
      </div>

      {/* Profile Card */}
      <Card variant="elevated" padding="md" className="sm:p-6 relative overflow-hidden">
        {/* Cracked background effect for low integrity */}
        {integrityScore < 50 && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="cracks" patternUnits="userSpaceOnUse" width="100" height="100">
                  <path d="M50 0 L48 30 L35 50 L50 55 L45 80 L50 100" stroke="#4a4a4a" strokeWidth="1" fill="none" />
                  <path d="M50 55 L65 60 L80 50" stroke="#4a4a4a" strokeWidth="0.8" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cracks)" />
            </svg>
          </div>
        )}

        <div className="relative z-10">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-obsidian-700 border-2 border-obsidian-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-obsidian-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-obsidian-100 mb-1">
                {user.name || 'Anonymous User'}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Badge variant={getStatusBadgeVariant()}>
                  {user.status}
                </Badge>
              </div>
              <p className="text-obsidian-400 text-xs sm:text-sm">Building integrity through kept promises</p>
            </div>
          </div>

          {/* Integrity Score Section - Primary Shield Badge Display */}
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:gap-8 mb-6 sm:mb-8">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-obsidian-400 text-xs sm:text-sm font-medium mb-2 sm:mb-4">
                Integrity Level
              </h3>
              <p className="text-obsidian-500 text-xs sm:text-sm mb-3 sm:mb-4">
                {brokenCount > 0
                  ? `${brokenCount} broken promise${brokenCount > 1 ? 's' : ''} recorded`
                  : 'No broken promises recorded'
                }
              </p>
              <div className="flex flex-wrap gap-2">
                {integrityScore < 100 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBeginRepair}
                    icon={TrendingUp}
                  >
                    Begin Repair
                  </Button>
                )}
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  icon={Share2}
                >
                  Share Badge
                </Button>
              </div>
            </div>

            {/* Primary Shield Badge */}
            <div className="flex-shrink-0">
              <IntegrityShieldBadge
                score={integrityScore}
                size="lg"
                showScore={true}
                showLabel={true}
                showDescription={true}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Current Goal */}
      {currentGoal && (
        <Card variant="highlighted" padding="md" className="sm:p-6 border-gold-500/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <p className="text-obsidian-400 text-xs mb-1">Current Goal</p>
                <h3 className="text-obsidian-100 font-semibold">{currentGoal.title}</h3>
                {currentGoal.description && (
                  <p className="text-obsidian-400 text-sm mt-1">{currentGoal.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-obsidian-500">
                  <span>{milestones.length} milestones</span>
                  <span>{completedCount} completed</span>
                  {currentLockedMilestone && <span className="text-gold-500">1 active</span>}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              View
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card variant="default" padding="sm" className="sm:p-4 text-center">
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-xl sm:text-2xl font-bold text-green-400 mb-0.5">
            {completedCount}
          </div>
          <div className="text-obsidian-500 text-[10px] sm:text-xs">Promises Kept</div>
        </Card>
        <Card variant="default" padding="sm" className="sm:p-4 text-center">
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <div className="text-xl sm:text-2xl font-bold text-red-400 mb-0.5">
            {brokenCount}
          </div>
          <div className="text-obsidian-500 text-[10px] sm:text-xs">Promises Broken</div>
        </Card>
        <Card variant="default" padding="sm" className="sm:p-4 text-center">
          <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mb-0.5">
            {currentStreak}
          </div>
          <div className="text-obsidian-500 text-[10px] sm:text-xs">Current Streak</div>
        </Card>
        <Card variant="default" padding="sm" className="sm:p-4 text-center">
          <Trophy className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-0.5">
            {goalsCompletedCount}
          </div>
          <div className="text-obsidian-500 text-[10px] sm:text-xs">Goals Completed</div>
        </Card>
      </div>

      {/* Completed Goals History */}
      {goalHistory.length > 0 && (
        <Card variant="default" padding="md" className="sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-obsidian-100">Completed Goals</h3>
            <span className="text-obsidian-500 text-xs sm:text-sm">{goalHistory.length}</span>
          </div>
          <div className="space-y-3">
            {goalHistory.slice(0, 3).map((goal, index) => (
              <div
                key={goal.id || index}
                className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-800/50 border border-obsidian-700"
              >
                <div className="w-8 h-8 rounded-lg bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-obsidian-200 font-medium text-sm truncate">{goal.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-obsidian-500">
                    <span>{goal.stats?.completed || 0}/{goal.stats?.totalMilestones || 0} milestones</span>
                    {goal.completedAt && (
                      <span>{new Date(goal.completedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                {goal.finalIntegrityScore && (
                  <Badge variant="completed" size="sm">{goal.finalIntegrityScore}</Badge>
                )}
              </div>
            ))}
            {goalHistory.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/history')}>
                View All ({goalHistory.length})
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Failure History */}
      <Card variant="default" padding="md" className="sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-obsidian-100">Failure History</h3>
          <span className="text-obsidian-500 text-xs sm:text-sm">{failureHistory.length}</span>
        </div>

        {failureHistory.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {failureHistory.map((failure, index) => {
              const IconComponent = getIconForMilestone(failure);

              return (
                <div
                  key={failure.id || index}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-obsidian-800/50 border-red-900/30"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-900/30">
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                      <span className="text-obsidian-400 text-xs sm:text-sm">
                        Milestone {failure.number}:
                      </span>
                      <span className="text-obsidian-200 text-sm sm:text-base">{failure.title}</span>
                    </div>

                    {failure.reason ? (
                      <p className="text-obsidian-500 text-xs sm:text-sm">{failure.reason}</p>
                    ) : (
                      <Badge variant="broken" size="sm">Promise Broken</Badge>
                    )}

                    {failure.brokenAt && (
                      <p className="text-obsidian-600 text-xs mt-1">
                        {new Date(failure.brokenAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <Check className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-obsidian-400 text-sm sm:text-base">No failures recorded. Keep it up!</p>
          </div>
        )}
      </Card>

      {/* Account Info */}
      <Card variant="default" padding="sm" className="sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <p className="text-obsidian-400 text-xs sm:text-sm">Member since</p>
            <p className="text-obsidian-200 text-sm sm:text-base">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }) : 'Today'}
            </p>
          </div>
          <Button variant="ghost" size="sm">
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Begin Repair Modal */}
      <Modal
        isOpen={showRepairModal}
        onClose={() => setShowRepairModal(false)}
        title="Repair Your Integrity"
        size="md"
      >
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gold-500" />
          </div>

          <div className="text-center mb-6">
            <p className="text-obsidian-200 text-lg mb-2">
              Your current score: <span className="font-bold text-obsidian-100">{integrityScore}/100</span>
            </p>
            <p className="text-obsidian-300 mb-1">{user.status}</p>
            <p className="text-obsidian-400">
              Integrity can only be rebuilt by <strong>keeping future promises</strong>.
            </p>
          </div>

          <Card variant="default" padding="md" className="mb-6">
            <h4 className="text-obsidian-200 font-medium mb-3">How to Repair:</h4>
            <ul className="text-obsidian-400 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gold-500">+10</span>
                <span>points for each promise you complete on time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">-15</span>
                <span>points for each promise you break</span>
              </li>
            </ul>
          </Card>

          {integrityScore <= 70 && (
            <Card variant="highlighted" padding="md" className="mb-6">
              <h4 className="text-obsidian-200 font-medium mb-2">Your Path Forward:</h4>
              <ul className="text-obsidian-400 text-sm space-y-1">
                {integrityScore <= 30 && (
                  <li>Keep <strong className="text-obsidian-200">{promisesToReach31}</strong> promise{promisesToReach31 > 1 ? 's' : ''} to reach "Inconsistent"</li>
                )}
                <li>Keep <strong className="text-obsidian-200">{promisesToReach71}</strong> promise{promisesToReach71 > 1 ? 's' : ''} to reach "Reliable" status</li>
              </ul>
            </Card>
          )}

          <div className="text-center">
            {currentLockedMilestone ? (
              <p className="text-obsidian-400 text-sm mb-4">
                You have an active promise. Complete it to start rebuilding.
              </p>
            ) : nextPendingMilestone ? (
              <p className="text-obsidian-400 text-sm mb-4">
                Lock your next milestone to begin your repair journey.
              </p>
            ) : (
              <p className="text-obsidian-400 text-sm mb-4">
                Add milestones to your goal and start keeping promises.
              </p>
            )}

            <Button
              variant="gold"
              onClick={() => setShowRepairModal(false)}
            >
              I Understand
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Badge Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Integrity Badge"
        size="lg"
      >
        <div className="space-y-6">
          {/* Badge Preview Card */}
          <IntegrityBadgeCard
            score={integrityScore}
            stats={badgeStats}
            username={user.name || 'User'}
            showProgress={false}
            showStats={true}
            variant="compact"
          />

          {/* Shareable Image Generator */}
          <ShareableBadgeImage
            score={integrityScore}
            username={user.name || 'User'}
            stats={badgeStats}
            goal={currentGoal}
            milestone={currentLockedMilestone}
            profileUrl={profileUrl}
            onDownload={() => {
              console.log('Badge downloaded');
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
