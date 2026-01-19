import React, { useState } from 'react';
import { AlertTriangle, Check, Lock, User, TrendingUp } from 'lucide-react';
import { Card, Badge, Button, Modal } from '../components/ui';
import { IntegrityShieldBadge } from '../components/journey';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { user, failureHistory, milestones, beginRepair, nextPendingMilestone, currentLockedMilestone } = useApp();
  const [showRepairModal, setShowRepairModal] = useState(false);

  // Get badge variant based on new status labels
  const getStatusBadgeVariant = () => {
    switch (user.status) {
      case 'Reliable':
        return 'trusted';
      case 'Inconsistent':
        return 'building';
      default:
        return 'untrusted';
    }
  };

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const brokenCount = milestones.filter(m => m.status === 'broken').length;

  const getIconForMilestone = (milestone) => {
    if (milestone.status === 'broken') return AlertTriangle;
    return Lock;
  };

  const handleBeginRepair = () => {
    const repairInfo = beginRepair();
    setShowRepairModal(true);
  };

  // Calculate promises needed to reach next integrity level
  // 0-30: Unreliable, 31-70: Inconsistent, 71-100: Reliable
  const promisesToReach31 = user.integrityScore <= 30
    ? Math.ceil((31 - user.integrityScore) / 10)
    : 0;
  const promisesToReach71 = user.integrityScore <= 70
    ? Math.ceil((71 - user.integrityScore) / 10)
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-obsidian-100 mb-1">Profile</h1>
      </div>

      {/* Profile Card */}
      <Card variant="elevated" padding="lg" className="relative overflow-hidden">
        {/* Cracked background effect for low integrity */}
        {user.integrityScore < 50 && (
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
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-obsidian-700 border-2 border-obsidian-600 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-obsidian-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-obsidian-100 mb-1">
                {user.fullName}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getStatusBadgeVariant()}>
                  {user.status}
                </Badge>
              </div>
              <p className="text-obsidian-400 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Integrity Score Section - Primary Shield Badge Display */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="flex-1">
              <h3 className="text-obsidian-400 text-sm font-medium mb-4">
                Integrity Level
              </h3>
              <p className="text-obsidian-500 text-sm mb-4">
                {brokenCount > 0
                  ? `${brokenCount} broken promise${brokenCount > 1 ? 's' : ''} recorded`
                  : 'No broken promises recorded'
                }
              </p>
              {user.integrityScore < 100 && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleBeginRepair}
                  icon={TrendingUp}
                >
                  Begin Repair
                </Button>
              )}
            </div>

            {/* Primary Shield Badge */}
            <div className="flex-shrink-0">
              <IntegrityShieldBadge
                score={user.integrityScore}
                size="xl"
                showScore={true}
                showLabel={true}
                showDescription={true}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="default" padding="md" className="text-center">
          <div className="text-3xl font-bold text-obsidian-200 mb-1">
            {milestones.length}
          </div>
          <div className="text-obsidian-500 text-sm">Total Milestones</div>
        </Card>
        <Card variant="default" padding="md" className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {completedCount}
          </div>
          <div className="text-obsidian-500 text-sm">Promises Kept</div>
        </Card>
        <Card variant="default" padding="md" className="text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {brokenCount}
          </div>
          <div className="text-obsidian-500 text-sm">Promises Broken</div>
        </Card>
      </div>

      {/* Failure History */}
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-obsidian-100">Failure History</h3>
          <span className="text-obsidian-500 text-sm">{failureHistory.length}</span>
        </div>

        {failureHistory.length > 0 ? (
          <div className="space-y-4">
            {failureHistory.map((failure, index) => {
              const IconComponent = getIconForMilestone(failure);
              const isBroken = failure.status === 'broken';

              return (
                <div
                  key={index}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg border
                    ${isBroken ? 'bg-obsidian-800/50 border-red-900/30' : 'bg-obsidian-800/50 border-obsidian-700'}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isBroken ? 'bg-red-900/30' : 'bg-obsidian-700'}
                  `}>
                    <IconComponent className={`w-5 h-5 ${isBroken ? 'text-red-400' : 'text-obsidian-400'}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-obsidian-400 text-sm">
                        Milestone {failure.milestoneNumber}:
                      </span>
                      <span className="text-obsidian-200">{failure.title}</span>
                    </div>

                    {failure.reason ? (
                      <p className="text-obsidian-500 text-sm">{failure.reason}</p>
                    ) : (
                      <Badge variant="broken" size="sm">Promise Broken</Badge>
                    )}

                    {failure.autoExpired && (
                      <Badge variant="default" size="sm" className="ml-2 mt-1">
                        Auto-expired
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-obsidian-400">No failures recorded. Keep it up!</p>
          </div>
        )}
      </Card>

      {/* Account Info */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-obsidian-400 text-sm">Member since</p>
            <p className="text-obsidian-200">
              {new Date(user.joinedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
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
              Your current score: <span className="font-bold text-obsidian-100">{user.integrityScore}/100</span>
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

          {user.integrityScore <= 70 && (
            <Card variant="highlighted" padding="md" className="mb-6">
              <h4 className="text-obsidian-200 font-medium mb-2">Your Path Forward:</h4>
              <ul className="text-obsidian-400 text-sm space-y-1">
                {user.integrityScore <= 30 && (
                  <li>• Keep <strong className="text-obsidian-200">{promisesToReach31}</strong> promise{promisesToReach31 > 1 ? 's' : ''} to reach "Inconsistent"</li>
                )}
                <li>• Keep <strong className="text-obsidian-200">{promisesToReach71}</strong> promise{promisesToReach71 > 1 ? 's' : ''} to reach "Reliable" status</li>
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
    </div>
  );
}
