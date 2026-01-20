import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Check, AlertTriangle, Eye } from 'lucide-react';
import { Card } from '../components/ui';
import { IntegrityShieldBadge } from '../components/journey';
import { useApp } from '../context/AppContext';

/**
 * Shareable Page - Public witness page for locked milestones
 *
 * SHARING RULES:
 * - Shows ONLY the currently locked milestone
 * - Does NOT show: goal deadline, future milestones, full plan, progress %, failure history
 * - Purpose: Short-term accountability and witness pressure
 */

// Get status styling
const getStatusConfig = (status) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-obsidian-800',
        border: 'border-obsidian-600',
        text: 'text-obsidian-200',
        icon: Check,
        label: 'KEPT',
      };
    case 'broken':
      return {
        bg: 'bg-obsidian-800',
        border: 'border-obsidian-600',
        text: 'text-obsidian-400',
        icon: AlertTriangle,
        label: 'BROKEN',
      };
    default:
      return {
        bg: 'bg-obsidian-800',
        border: 'border-obsidian-500',
        text: 'text-obsidian-100',
        icon: Lock,
        label: 'LOCKED',
      };
  }
};

// Live Countdown Timer Component - uses actual milestone deadline
function LiveCountdown({ deadline }) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    if (!deadline) return;

    const calculateTimeRemaining = () => {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diff = deadlineDate - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, expired: false };
    };

    setTimeRemaining(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const TimeUnit = ({ value, label }) => (
    <div className="text-center">
      <div className={`
        text-3xl md:text-4xl font-mono font-medium tracking-tight
        ${timeRemaining.expired ? 'text-obsidian-500' : 'text-obsidian-100'}
      `}>
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-obsidian-500 text-xs mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );

  const Separator = () => (
    <div className="text-2xl md:text-3xl font-mono text-obsidian-600 self-start mt-1">:</div>
  );

  if (timeRemaining.expired) {
    return (
      <div className="text-center py-4">
        <p className="text-obsidian-400 text-sm">Deadline has passed</p>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center gap-2 md:gap-3">
      {timeRemaining.days > 0 && (
        <>
          <TimeUnit value={timeRemaining.days} label="Days" />
          <Separator />
        </>
      )}
      <TimeUnit value={timeRemaining.hours} label="Hours" />
      <Separator />
      <TimeUnit value={timeRemaining.minutes} label="Min" />
      <Separator />
      <TimeUnit value={timeRemaining.seconds} label="Sec" />
    </div>
  );
}

export default function ShareablePage() {
  const { commitmentId } = useParams();
  const { user, currentLockedMilestone, milestones, addWitness } = useApp();
  const [witnessed, setWitnessed] = useState(false);

  // Find the milestone by ID from URL, or use current locked milestone
  const milestone = commitmentId
    ? milestones.find(m => m.id === parseInt(commitmentId))
    : currentLockedMilestone;

  // Handle witness action - adds to the witness count
  const handleWitness = () => {
    if (!witnessed) {
      setWitnessed(true);
      // Add witness count to the milestone
      addWitness();
    }
  };

  if (!milestone) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-obsidian-400 mb-2">No active commitment found</p>
          <p className="text-obsidian-600 text-sm">This link may have expired or the commitment was completed.</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(milestone.status);
  const StatusIcon = statusConfig.icon;
  const witnessCount = milestone.promise?.witnessCount || 0;

  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* Header */}
      <header className="border-b border-obsidian-800 bg-obsidian-900/80">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <defs>
                  <linearGradient id="shareLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a0a0a0" />
                    <stop offset="100%" stopColor="#808080" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="url(#shareLogoGold)" strokeWidth="1.5" />
                <path d="M10 18 Q16 10 22 18" stroke="url(#shareLogoGold)" strokeWidth="2" fill="none" />
                <circle cx="16" cy="12" r="2" fill="url(#shareLogoGold)" />
              </svg>
            </div>
            <span className="text-obsidian-300 text-sm font-medium">Shift Journey</span>
          </div>

          {witnessed && (
            <div className="flex items-center gap-1.5 text-obsidian-400 text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>Witnessed</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-8">
        {/* User Identity */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center">
            <span className="text-xl font-medium text-obsidian-400">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-lg font-medium text-obsidian-200">
            {user.fullName}
          </h1>
          <p className="text-obsidian-500 text-sm mt-1">
            has made a commitment
          </p>
        </div>

        {/* Commitment Card */}
        <Card variant="elevated" padding="lg" className="mb-6">
          {/* Promise Status Badge */}
          <div className="flex justify-center mb-6">
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-md
              ${statusConfig.bg} border ${statusConfig.border}
            `}>
              <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
              <span className={`text-sm font-medium tracking-wide ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Milestone Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-obsidian-100 mb-3">
              {milestone.title}
            </h2>
            {milestone.promise?.text && (
              <p className="text-obsidian-400 text-sm leading-relaxed">
                "{milestone.promise.text}"
              </p>
            )}
          </div>

          {/* Live Countdown Timer - uses actual milestone deadline */}
          {milestone.status === 'locked' && milestone.promise?.deadline && (
            <div className="border-t border-obsidian-700 pt-6 mb-6">
              <p className="text-obsidian-500 text-xs text-center mb-4 uppercase tracking-wider">
                Time Remaining
              </p>
              <LiveCountdown deadline={milestone.promise.deadline} />
            </div>
          )}

          {/* Integrity Score with Shield Badge */}
          <div className="border-t border-obsidian-700 pt-6">
            <div className="flex items-center justify-center">
              <IntegrityShieldBadge
                score={user.integrityScore}
                size="lg"
                showScore={true}
                showLabel={true}
                showDescription={false}
              />
            </div>
          </div>
        </Card>

        {/* Witness Action */}
        {milestone.status === 'locked' && (
          <div className="text-center">
            <button
              onClick={handleWitness}
              disabled={witnessed}
              className={`
                inline-flex items-center gap-2 px-6 py-3 rounded-lg
                border transition-colors
                ${witnessed
                  ? 'bg-obsidian-800 border-obsidian-700 text-obsidian-500 cursor-default'
                  : 'bg-obsidian-800 border-obsidian-600 text-obsidian-200 hover:border-obsidian-500 hover:bg-obsidian-700'
                }
              `}
            >
              <span className="text-lg">👁️</span>
              <span className="text-sm font-medium">
                {witnessed ? 'You are witnessing this commitment' : 'Witness this commitment'}
              </span>
            </button>

            {/* Show witness count */}
            {witnessCount > 0 && (
              <p className="text-obsidian-500 text-sm mt-3">
                <span className="text-lg mr-1">👁️</span>
                {witnessCount} {witnessCount === 1 ? 'person is' : 'people are'} watching
              </p>
            )}

            <p className="text-obsidian-600 text-xs mt-3">
              Silent accountability. No comments, just presence.
            </p>
          </div>
        )}

        {/* Minimal Footer */}
        <div className="mt-10 text-center">
          {milestone.promise?.lockedAt && (
            <p className="text-obsidian-600 text-xs">
              Locked {new Date(milestone.promise.lockedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
