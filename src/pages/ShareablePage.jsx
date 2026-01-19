import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Check, AlertTriangle, Eye } from 'lucide-react';
import { Card } from '../components/ui';
import { IntegrityGauge } from '../components/journey';

// Mock data for demonstration - in real app this would come from an API
const getMockCommitmentData = (id) => ({
  id,
  userName: 'Sarah S.',
  milestoneTitle: 'Prepare investor pitch',
  milestoneNumber: 5,
  goalTitle: 'Launch My Startup',
  promiseText: 'I promise that I will write and refine the pitch deck before the deadline.',
  deadline: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), // 2h 15m from now
  status: 'locked', // 'locked' | 'completed' | 'broken'
  integrityScore: 41,
  lockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  encouragements: {
    support: 12,
    respect: 8,
    witnessed: 23,
  },
});

// Emoji encouragement options
const ENCOURAGEMENT_OPTIONS = [
  { key: 'support', emoji: '👍', label: 'Support' },
  { key: 'respect', emoji: '🔥', label: 'Respect' },
  { key: 'witnessed', emoji: '👀', label: 'Witnessed' },
];

// Get integrity status label
const getIntegrityLabel = (score) => {
  if (score >= 85) return 'Highly Trusted';
  if (score >= 70) return 'Trusted';
  if (score >= 50) return 'Building Trust';
  if (score >= 30) return 'Inconsistent';
  return 'Untrusted';
};

// Get status styling
const getStatusStyle = (status) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-green-900/20',
        border: 'border-green-700/50',
        text: 'text-green-400',
        icon: Check,
        label: 'PROMISE KEPT',
      };
    case 'broken':
      return {
        bg: 'bg-red-900/20',
        border: 'border-red-700/50',
        text: 'text-red-400',
        icon: AlertTriangle,
        label: 'PROMISE BROKEN',
      };
    default:
      return {
        bg: 'bg-gold-500/10',
        border: 'border-gold-500/30',
        text: 'text-gold-400',
        icon: Lock,
        label: 'LOCKED',
      };
  }
};

export default function ShareablePage() {
  const { commitmentId } = useParams();
  const [commitment, setCommitment] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  const [encouragements, setEncouragements] = useState({ support: 0, respect: 0, witnessed: 0 });
  const [witnessedCount, setWitnessedCount] = useState(0);
  const [clickedEmojis, setClickedEmojis] = useState({});

  // Load mock commitment data
  useEffect(() => {
    const data = getMockCommitmentData(commitmentId);
    setCommitment(data);
    setEncouragements(data.encouragements);
  }, [commitmentId]);

  // Countdown timer
  useEffect(() => {
    if (!commitment?.deadline) return;

    const calculateTimeRemaining = () => {
      const deadline = new Date(commitment.deadline);
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds, expired: false };
    };

    setTimeRemaining(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [commitment?.deadline]);

  // Handle emoji click
  const handleEncouragement = (key) => {
    setEncouragements(prev => ({
      ...prev,
      [key]: prev[key] + 1,
    }));

    // Track that user clicked this emoji (for visual feedback)
    setClickedEmojis(prev => ({
      ...prev,
      [key]: true,
    }));

    // Increment witnessed count (simulates the encourager's stat)
    setWitnessedCount(prev => prev + 1);

    // Reset click animation after delay
    setTimeout(() => {
      setClickedEmojis(prev => ({
        ...prev,
        [key]: false,
      }));
    }, 300);
  };

  if (!commitment) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <div className="text-obsidian-400">Loading...</div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(commitment.status);
  const StatusIcon = statusStyle.icon;

  return (
    <div className="min-h-screen bg-obsidian-950 noise-bg">
      {/* Header */}
      <header className="border-b border-obsidian-800 bg-obsidian-900/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <defs>
                  <linearGradient id="shareLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c9a962" />
                    <stop offset="100%" stopColor="#d4b978" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="url(#shareLogoGold)" strokeWidth="1.5" />
                <path d="M10 18 Q16 10 22 18" stroke="url(#shareLogoGold)" strokeWidth="2" fill="none" />
                <circle cx="16" cy="12" r="2" fill="url(#shareLogoGold)" />
              </svg>
            </div>
            <span className="text-obsidian-100 font-semibold">Shift Journey</span>
          </div>

          {/* Witnessed count badge */}
          {witnessedCount > 0 && (
            <div className="flex items-center gap-2 text-obsidian-400 text-sm">
              <Eye className="w-4 h-4" />
              <span>You witnessed {witnessedCount} time{witnessedCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* User Info */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
            <span className="text-2xl font-semibold text-obsidian-300">
              {commitment.userName.charAt(0)}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-obsidian-100 mb-1">
            {commitment.userName}
          </h1>
          <p className="text-obsidian-500 text-sm">
            has made a commitment
          </p>
        </div>

        {/* Promise Card */}
        <Card variant="elevated" padding="lg" className="mb-6">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              ${statusStyle.bg} border ${statusStyle.border}
            `}>
              <StatusIcon className={`w-4 h-4 ${statusStyle.text}`} />
              <span className={`text-sm font-semibold ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
            </div>
          </div>

          {/* Milestone Info */}
          <div className="text-center mb-6">
            <p className="text-obsidian-500 text-sm mb-2">
              Milestone {commitment.milestoneNumber} of "{commitment.goalTitle}"
            </p>
            <h2 className="text-2xl font-bold text-obsidian-100 mb-4">
              {commitment.milestoneTitle}
            </h2>
            <p className="text-obsidian-300 italic">
              "{commitment.promiseText}"
            </p>
          </div>

          {/* Countdown Timer */}
          {commitment.status === 'locked' && (
            <div className="border-t border-b border-obsidian-700 py-6 mb-6">
              <p className="text-obsidian-500 text-sm text-center mb-4">
                {timeRemaining.expired ? 'Deadline Passed' : 'Time Remaining'}
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className={`
                    text-4xl font-mono font-bold
                    ${timeRemaining.expired ? 'text-red-400' : 'text-obsidian-100'}
                  `}>
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <div className="text-obsidian-500 text-xs mt-1">HOURS</div>
                </div>
                <div className="text-4xl font-mono text-obsidian-600">:</div>
                <div className="text-center">
                  <div className={`
                    text-4xl font-mono font-bold
                    ${timeRemaining.expired ? 'text-red-400' : 'text-obsidian-100'}
                  `}>
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-obsidian-500 text-xs mt-1">MINUTES</div>
                </div>
                <div className="text-4xl font-mono text-obsidian-600">:</div>
                <div className="text-center">
                  <div className={`
                    text-4xl font-mono font-bold
                    ${timeRemaining.expired ? 'text-red-400' : 'text-obsidian-100'}
                  `}>
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-obsidian-500 text-xs mt-1">SECONDS</div>
                </div>
              </div>
            </div>
          )}

          {/* Integrity Score */}
          <div className="flex items-center justify-center gap-6">
            <IntegrityGauge
              score={commitment.integrityScore}
              size="md"
              animated={false}
              showLabel={false}
            />
            <div className="text-left">
              <div className="text-3xl font-bold text-obsidian-100">
                {commitment.integrityScore}
              </div>
              <div className={`text-sm font-medium ${
                commitment.integrityScore >= 70 ? 'text-green-400' :
                commitment.integrityScore >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {getIntegrityLabel(commitment.integrityScore)}
              </div>
              <div className="text-obsidian-500 text-xs mt-1">
                Integrity Score
              </div>
            </div>
          </div>
        </Card>

        {/* Encouragement Section */}
        <Card variant="default" padding="lg">
          <h3 className="text-obsidian-300 text-sm font-medium text-center mb-4">
            Send Encouragement
          </h3>
          <p className="text-obsidian-500 text-xs text-center mb-6">
            Your support is silent but visible. No comments, just presence.
          </p>

          <div className="flex justify-center gap-4">
            {ENCOURAGEMENT_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => handleEncouragement(option.key)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg
                  bg-obsidian-800/50 border border-obsidian-700
                  hover:border-obsidian-500 hover:bg-obsidian-800
                  transition-all duration-200
                  ${clickedEmojis[option.key] ? 'scale-110' : ''}
                `}
              >
                <span className={`
                  text-3xl transition-transform duration-200
                  ${clickedEmojis[option.key] ? 'scale-125' : ''}
                `}>
                  {option.emoji}
                </span>
                <span className="text-obsidian-400 text-xs">
                  {option.label}
                </span>
                <span className="text-obsidian-500 text-sm font-medium">
                  {encouragements[option.key]}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-obsidian-600 text-xs">
            This is a read-only commitment page. No login required to view.
          </p>
          <p className="text-obsidian-600 text-xs mt-1">
            Locked on {new Date(commitment.lockedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
      </main>
    </div>
  );
}
