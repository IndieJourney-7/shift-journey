import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Lock, Check, AlertTriangle, Eye, Loader2 } from 'lucide-react';
import { Card } from '../components/ui';
import { IntegrityShieldBadge } from '../components/journey';
import { OpenGraphMeta, generateOGTitle, generateOGDescription } from '../components/seo';
import { milestoneService } from '../services/database';

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
        text-2xl sm:text-3xl md:text-4xl font-mono font-medium tracking-tight
        ${timeRemaining.expired ? 'text-obsidian-500' : 'text-obsidian-100'}
      `}>
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-obsidian-500 text-[10px] sm:text-xs mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );

  const Separator = () => (
    <div className="text-xl sm:text-2xl md:text-3xl font-mono text-obsidian-600 self-start mt-0.5 sm:mt-1">:</div>
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
  const location = useLocation();
  const [witnessed, setWitnessed] = useState(false);
  const [ogTimeRemaining, setOgTimeRemaining] = useState({ hours: 0, minutes: 0 });
  const [milestone, setMilestone] = useState(null);
  const [milestoneUser, setMilestoneUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch milestone data from database using share_id
  useEffect(() => {
    const fetchMilestone = async () => {
      if (!commitmentId) {
        setError('No commitment ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await milestoneService.getByShareId(commitmentId);

        if (!data) {
          setError('Commitment not found');
          setIsLoading(false);
          return;
        }

        // Transform the data
        setMilestone({
          id: data.id,
          title: data.title,
          status: data.status,
          promise: data.promise_text ? {
            text: data.promise_text,
            deadline: data.promise_deadline,
            consequence: data.promise_consequence,
            lockedAt: data.promise_locked_at,
            witnessCount: data.witness_count || 0,
          } : null,
          goalTitle: data.goals?.title,
        });

        // Set user info from the joined data
        if (data.users) {
          setMilestoneUser({
            name: data.users.name || 'User',
            integrityScore: data.users.integrity_score ?? 100,
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch milestone:', err);
        setError('Failed to load commitment');
        setIsLoading(false);
      }
    };

    fetchMilestone();
  }, [commitmentId]);

  // Calculate time remaining for OG meta tags
  useEffect(() => {
    if (!milestone?.promise?.deadline) return;

    const calculateTime = () => {
      const deadline = new Date(milestone.promise.deadline);
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        return { expired: true };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return { days, hours, minutes, expired: false };
    };

    setOgTimeRemaining(calculateTime());
    // Update every minute for OG description
    const interval = setInterval(() => setOgTimeRemaining(calculateTime()), 60000);
    return () => clearInterval(interval);
  }, [milestone?.promise?.deadline]);

  // Handle witness action - adds to the witness count
  const handleWitness = async () => {
    if (!witnessed && milestone) {
      setWitnessed(true);
      // Add witness count to the milestone in database
      try {
        await milestoneService.addWitness(milestone.id);
        // Update local state
        setMilestone(prev => ({
          ...prev,
          promise: {
            ...prev.promise,
            witnessCount: (prev.promise?.witnessCount || 0) + 1,
          },
        }));
      } catch (err) {
        console.error('Failed to add witness:', err);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-obsidian-400 animate-spin mx-auto mb-3" />
          <p className="text-obsidian-400">Loading commitment...</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !milestone) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-obsidian-400 mb-2">{error || 'No active commitment found'}</p>
          <p className="text-obsidian-600 text-sm">This link may have expired or the commitment was completed.</p>
        </div>
      </div>
    );
  }

  // Use milestoneUser for display
  const user = milestoneUser || { name: 'User', integrityScore: 50 };

  const statusConfig = getStatusConfig(milestone.status);
  const StatusIcon = statusConfig.icon;
  const witnessCount = milestone.promise?.witnessCount || 0;

  // Generate OG meta data
  const userName = user?.name || 'User';
  const ogTitle = generateOGTitle(userName, milestone.title);
  const ogDescription = generateOGDescription({
    timeRemaining: ogTimeRemaining,
    integrityScore: user?.integrityScore || 50,
    status: milestone.status,
  });
  const currentUrl = `${window.location.origin}${location.pathname}`;

  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* Open Graph Meta Tags */}
      <OpenGraphMeta
        title={ogTitle}
        description={ogDescription}
        url={currentUrl}
      />

      {/* Header */}
      <header className="border-b border-obsidian-800 bg-obsidian-900/80">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7">
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
            <span className="text-obsidian-300 text-xs sm:text-sm font-medium">Shift Ascent</span>
          </div>

          {witnessed && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-obsidian-400 text-[10px] sm:text-xs">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Witnessed</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* User Identity */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center">
            <span className="text-lg sm:text-xl font-medium text-obsidian-400">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-medium text-obsidian-200">
            {userName}
          </h1>
          <p className="text-obsidian-500 text-xs sm:text-sm mt-1">
            has made a commitment
          </p>
        </div>

        {/* Commitment Card */}
        <Card variant="elevated" padding="md" className="sm:p-6 mb-4 sm:mb-6">
          {/* Promise Status Badge */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className={`
              inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md
              ${statusConfig.bg} border ${statusConfig.border}
            `}>
              <StatusIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusConfig.text}`} />
              <span className={`text-xs sm:text-sm font-medium tracking-wide ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Milestone Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-medium text-obsidian-100 mb-2 sm:mb-3">
              {milestone.title}
            </h2>
            {milestone.promise?.text && (
              <p className="text-obsidian-400 text-xs sm:text-sm leading-relaxed">
                "{milestone.promise.text}"
              </p>
            )}
          </div>

          {/* Live Countdown Timer - uses actual milestone deadline */}
          {milestone.status === 'locked' && milestone.promise?.deadline && (
            <div className="border-t border-obsidian-700 pt-4 sm:pt-6 mb-4 sm:mb-6">
              <p className="text-obsidian-500 text-[10px] sm:text-xs text-center mb-3 sm:mb-4 uppercase tracking-wider">
                Time Remaining
              </p>
              <LiveCountdown deadline={milestone.promise.deadline} />
            </div>
          )}

          {/* Integrity Score with Shield Badge */}
          <div className="border-t border-obsidian-700 pt-4 sm:pt-6">
            <div className="flex items-center justify-center">
              <IntegrityShieldBadge
                score={user.integrityScore}
                size="md"
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
                inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg
                border transition-colors text-sm
                ${witnessed
                  ? 'bg-obsidian-800 border-obsidian-700 text-obsidian-500 cursor-default'
                  : 'bg-obsidian-800 border-obsidian-600 text-obsidian-200 hover:border-obsidian-500 hover:bg-obsidian-700'
                }
              `}
            >
              <span className="text-base sm:text-lg">👁️</span>
              <span className="text-xs sm:text-sm font-medium">
                {witnessed ? 'You are witnessing' : 'Witness this commitment'}
              </span>
            </button>

            {/* Show witness count */}
            {witnessCount > 0 && (
              <p className="text-obsidian-500 text-xs sm:text-sm mt-2 sm:mt-3">
                <span className="text-base sm:text-lg mr-1">👁️</span>
                {witnessCount} {witnessCount === 1 ? 'person is' : 'people are'} watching
              </p>
            )}

            <p className="text-obsidian-600 text-[10px] sm:text-xs mt-2 sm:mt-3">
              Silent accountability. No comments, just presence.
            </p>
          </div>
        )}

        {/* Minimal Footer */}
        <div className="mt-8 sm:mt-10 text-center">
          {milestone.promise?.lockedAt && (
            <p className="text-obsidian-600 text-[10px] sm:text-xs">
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
