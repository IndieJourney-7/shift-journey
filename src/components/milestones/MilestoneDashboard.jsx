import React, { useState, useEffect } from 'react';
import { Target, Clock, Trophy, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card, Button } from '../ui';
import MilestoneList from './MilestoneList';
import LockPromiseModal from './LockPromiseModal';
import ReflectionModal from './ReflectionModal';
import { useMilestones, MILESTONE_STATUS } from '../../context/MilestoneContext';

// Countdown Timer Component
function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diff = deadlineDate - now;

      if (diff <= 0) {
        return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { expired: false, days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-mono font-bold">EXPIRED</span>
      </div>
    );
  }

  const formatNumber = (num) => String(num).padStart(2, '0');

  // Determine urgency color
  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isUrgent = totalSeconds < 3600; // Less than 1 hour
  const isWarning = totalSeconds < 86400; // Less than 1 day

  const colorClass = isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-green-400';

  return (
    <div className={`font-mono ${colorClass}`}>
      <div className="flex items-center gap-1 text-2xl font-bold">
        {timeLeft.days > 0 && (
          <>
            <span>{timeLeft.days}</span>
            <span className="text-obsidian-500 text-sm">d</span>
          </>
        )}
        <span>{formatNumber(timeLeft.hours)}</span>
        <span className="text-obsidian-500">:</span>
        <span>{formatNumber(timeLeft.minutes)}</span>
        <span className="text-obsidian-500">:</span>
        <span>{formatNumber(timeLeft.seconds)}</span>
      </div>
      <p className="text-obsidian-500 text-xs mt-1">Time Remaining</p>
    </div>
  );
}

// Stats display
function StatsDisplay({ milestones }) {
  const kept = milestones.filter(m => m.status === MILESTONE_STATUS.KEPT).length;
  const broken = milestones.filter(m => m.status === MILESTONE_STATUS.BROKEN && !m.needsReflection).length;
  const planned = milestones.filter(m => m.status === MILESTONE_STATUS.PLANNED).length;
  const locked = milestones.filter(m => m.status === MILESTONE_STATUS.LOCKED).length;

  const total = kept + broken;
  const successRate = total > 0 ? Math.round((kept / total) * 100) : 100;

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="text-center p-3 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
        <p className="text-2xl font-bold text-green-400">{kept}</p>
        <p className="text-obsidian-500 text-xs">Kept</p>
      </div>
      <div className="text-center p-3 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
        <p className="text-2xl font-bold text-red-400">{broken}</p>
        <p className="text-obsidian-500 text-xs">Broken</p>
      </div>
      <div className="text-center p-3 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
        <p className="text-2xl font-bold text-obsidian-300">{planned + locked}</p>
        <p className="text-obsidian-500 text-xs">Pending</p>
      </div>
      <div className="text-center p-3 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
        <p className={`text-2xl font-bold ${successRate >= 70 ? 'text-green-400' : successRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
          {successRate}%
        </p>
        <p className="text-obsidian-500 text-xs">Success</p>
      </div>
    </div>
  );
}

export default function MilestoneDashboard() {
  const {
    goal,
    milestones,
    lockedMilestone,
    hasLockedMilestone,
    milestonesNeedingReflection,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones,
    lockMilestone,
    markAsKept,
    markAsBroken,
    submitReflection,
    resetAll,
  } = useMilestones();

  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [reflectionModalOpen, setReflectionModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Auto-open reflection modal if there are milestones needing reflection
  useEffect(() => {
    if (milestonesNeedingReflection.length > 0 && !reflectionModalOpen) {
      setSelectedMilestone(milestonesNeedingReflection[0]);
      setReflectionModalOpen(true);
    }
  }, [milestonesNeedingReflection, reflectionModalOpen]);

  // Handle lock button click
  const handleLockClick = (milestone) => {
    if (hasLockedMilestone) {
      alert('Complete your current promise before locking another one.');
      return;
    }
    if (milestonesNeedingReflection.length > 0) {
      alert('Submit reflections for broken promises before locking another one.');
      return;
    }
    setSelectedMilestone(milestone);
    setLockModalOpen(true);
  };

  // Handle reflect button click
  const handleReflectClick = (milestone) => {
    setSelectedMilestone(milestone);
    setReflectionModalOpen(true);
  };

  // Handle lock submit
  const handleLock = (milestoneId, promiseData) => {
    try {
      lockMilestone(milestoneId, promiseData);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle complete
  const handleComplete = (milestoneId) => {
    try {
      markAsKept(milestoneId);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle break
  const handleBreak = (milestoneId) => {
    try {
      markAsBroken(milestoneId);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle reflection submit
  const handleReflectionSubmit = (milestoneId, reflectionData) => {
    try {
      submitReflection(milestoneId, reflectionData);
      setReflectionModalOpen(false);
      setSelectedMilestone(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Goal */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-gold-500" />
            <span className="text-obsidian-400 text-sm">Your Goal</span>
          </div>
          {goal ? (
            <>
              <h1 className="text-2xl font-bold text-obsidian-100 mb-1">
                {goal.title}
              </h1>
              {goal.description && (
                <p className="text-obsidian-400 text-sm">{goal.description}</p>
              )}
            </>
          ) : (
            <p className="text-obsidian-400 italic">No goal set yet</p>
          )}
        </div>

        {/* Reset button (for testing) */}
        <Button
          variant="ghost"
          size="sm"
          icon={RotateCcw}
          onClick={() => {
            if (confirm('Reset all data? This cannot be undone.')) {
              resetAll();
            }
          }}
          title="Reset all data"
        />
      </div>

      {/* Stats */}
      {milestones.length > 0 && <StatsDisplay milestones={milestones} />}

      {/* Active Promise with Countdown */}
      {lockedMilestone && (
        <Card variant="highlighted" padding="lg" className="border-amber-500/30 bg-amber-900/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Active Promise</span>
              </div>
              <p className="text-obsidian-200 font-medium mb-2">
                {lockedMilestone.promise?.text || lockedMilestone.title}
              </p>
              {lockedMilestone.promise?.consequence && (
                <p className="text-obsidian-500 text-sm">
                  If I fail: {lockedMilestone.promise.consequence}
                </p>
              )}
            </div>

            <div className="text-right">
              <CountdownTimer deadline={lockedMilestone.promise?.deadline} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-amber-700/30">
            <Button
              variant="gold"
              size="sm"
              className="flex-1"
              icon={Trophy}
              onClick={() => handleComplete(lockedMilestone.id)}
            >
              Mark Kept
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              icon={AlertTriangle}
              onClick={() => handleBreak(lockedMilestone.id)}
            >
              Mark Broken
            </Button>
          </div>
        </Card>
      )}

      {/* Milestone List */}
      <Card variant="default" padding="lg">
        <h2 className="text-obsidian-200 font-medium mb-4">Milestones</h2>
        <MilestoneList
          milestones={milestones}
          onAdd={addMilestone}
          onUpdate={updateMilestone}
          onDelete={deleteMilestone}
          onReorder={reorderMilestones}
          onLock={handleLockClick}
          onComplete={handleComplete}
          onBreak={handleBreak}
          onReflect={handleReflectClick}
          hasLockedMilestone={hasLockedMilestone}
          milestonesNeedingReflection={milestonesNeedingReflection}
        />
      </Card>

      {/* Lock Promise Modal */}
      <LockPromiseModal
        isOpen={lockModalOpen}
        onClose={() => {
          setLockModalOpen(false);
          setSelectedMilestone(null);
        }}
        milestone={selectedMilestone}
        onLock={handleLock}
      />

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={reflectionModalOpen}
        onClose={() => {
          setReflectionModalOpen(false);
          setSelectedMilestone(null);
        }}
        milestone={selectedMilestone}
        onSubmit={handleReflectionSubmit}
      />
    </div>
  );
}
