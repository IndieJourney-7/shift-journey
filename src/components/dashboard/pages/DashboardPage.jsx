import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, AlertTriangle, ChevronRight, Target, Share2, Copy, CheckCircle, Trophy, Upload, Camera, Shield, TrendingUp, TrendingDown, Quote, RefreshCw } from 'lucide-react';
import { Button, Card, Badge, Modal, Textarea } from '../../ui';
import { JourneyPath, MilestoneCard, CountdownTimer, IntegrityBadgeInline } from '../../journey';
import { useApp } from '../../../context/AppContext';
import { getIntegrityTier, getNextTier, getPromisesToNextTier, getTierProgress } from '../../../lib/badgeDefinitions';
import { quotesService } from '../../../services/adminContentService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    currentGoal,
    milestones,
    currentLockedMilestone,
    nextPendingMilestone,
    completeMilestone,
    breakPromise,
    needsGoalSetup,
    canFinishGoal,
    isPromiseExpired,
    user,
    isLoading,
    tierChangeNotification,
    dismissTierChange,
  } = useApp();

  // Redirect to goal creation if user hasn't set up a goal yet
  useEffect(() => {
    if (needsGoalSetup || !currentGoal) {
      navigate('/goal/create', { replace: true });
    }
  }, [needsGoalSetup, currentGoal, navigate]);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Motivational quote state
  const [dailyQuote, setDailyQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  // Load daily quote
  useEffect(() => {
    const loadQuote = async () => {
      try {
        const quote = await quotesService.getRandom();
        setDailyQuote(quote);
      } catch (err) {
        // Fallback quote if fetch fails
        setDailyQuote({
          text: "The only way to build trust is to keep your promises.",
          author: "Shift Ascent"
        });
      }
    };
    loadQuote();
  }, []);

  // Refresh quote function
  const handleRefreshQuote = async () => {
    setIsLoadingQuote(true);
    try {
      const quote = await quotesService.getRandom();
      setDailyQuote(quote);
    } catch (err) {
      // Keep current quote if refresh fails
    }
    setIsLoadingQuote(false);
  };

  // Structured failure reflection state
  const [reflection, setReflection] = useState({
    whyFailed: '',
    whatWasInControl: '',
    whatWillChange: '',
    consequenceProof: '', // Description of how they completed the consequence
  });
  const [consequenceProofImage, setConsequenceProofImage] = useState(null);
  const [consequenceProofPreview, setConsequenceProofPreview] = useState(null);

  // Auto-open break modal when promise deadline passes
  useEffect(() => {
    if (isPromiseExpired && currentLockedMilestone && !showBreakModal) {
      setActionError(null);
      setShowBreakModal(true);
    }
  }, [isPromiseExpired, currentLockedMilestone]);

  // Generate shareable link for current locked milestone
  const getShareableLink = () => {
    if (!currentLockedMilestone?.shareId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/c/${currentLockedMilestone.shareId}`;
  };

  const handleCopyLink = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleComplete = async () => {
    if (!currentLockedMilestone) return;

    setIsProcessing(true);
    setActionError(null);
    try {
      // Pass forceComplete=true if deadline has passed (user is marking as complete late)
      await completeMilestone(currentLockedMilestone.id, isPromiseExpired);
      setShowCompleteModal(false);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBreak = async () => {
    if (!currentLockedMilestone || !isReflectionComplete) return;

    setIsProcessing(true);
    setActionError(null);
    try {
      // Build structured reflection with all fields
      let fullReason = `WHY I FAILED:\n${reflection.whyFailed}\n\n`;
      fullReason += `WHAT WAS IN MY CONTROL:\n${reflection.whatWasInControl}\n\n`;
      fullReason += `WHAT I WILL CHANGE:\n${reflection.whatWillChange}`;

      // Add consequence proof if there was a custom consequence
      if (hasCustomConsequence && reflection.consequenceProof.trim()) {
        fullReason += `\n\nCONSEQUENCE COMMITTED:\n"${currentLockedMilestone.promise.consequence}"\n\n`;
        fullReason += `HOW I COMPLETED IT:\n${reflection.consequenceProof}`;
      }

      await breakPromise(currentLockedMilestone.id, fullReason);
      setReflection({ whyFailed: '', whatWasInControl: '', whatWillChange: '', consequenceProof: '' });
      setConsequenceProofImage(null);
      setConsequenceProofPreview(null);
      setShowBreakModal(false);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReflectionChange = (field, value) => {
    setReflection(prev => ({ ...prev, [field]: value }));
  };

  const handleConsequenceImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setConsequenceProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setConsequenceProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if consequence was set (not just default)
  const hasCustomConsequence = currentLockedMilestone?.promise?.consequence &&
    currentLockedMilestone.promise.consequence !== 'I accept the consequence.';

  // Reflection is complete when all fields are filled, plus consequence proof if there was a custom consequence
  const isReflectionComplete = reflection.whyFailed.trim() &&
    reflection.whatWasInControl.trim() &&
    reflection.whatWillChange.trim() &&
    (!hasCustomConsequence || reflection.consequenceProof.trim());

  const completedMilestones = milestones.filter(m => m.status === 'completed');
  const brokenMilestones = milestones.filter(m => m.status === 'broken');
  const recentMilestones = [...completedMilestones, ...brokenMilestones]
    .sort((a, b) => new Date(b.completedAt || b.brokenAt) - new Date(a.completedAt || a.brokenAt))
    .slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page Title with Integrity Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-obsidian-100 mb-1">My Journey</h1>
          <p className="text-obsidian-400 text-sm sm:text-base">{currentGoal?.title || 'Your Goal'}</p>
          {/* Goal Deadline Reminder */}
          {currentGoal?.targetDate && (
            <div className="flex items-center gap-2 mt-2">
              <Target className="w-4 h-4 text-gold-500" />
              <span className="text-gold-400 text-xs sm:text-sm font-medium">
                Goal Deadline: {new Date(currentGoal.targetDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {new Date(currentGoal.targetDate) < new Date() && (
                <span className="text-red-400 text-xs">(Overdue)</span>
              )}
            </div>
          )}
        </div>
        {/* Small Integrity Indicator */}
        <IntegrityBadgeInline score={user.integrityScore} />
      </div>

      {/* Daily Motivational Quote */}
      {dailyQuote && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-amber-500/10 rounded-xl blur-sm" />
          <Card variant="default" padding="md" className="relative border-gold-500/20 bg-obsidian-900/80">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 text-gold-400 flex-shrink-0 mt-0.5 transform rotate-180" />
              <div className="flex-1 min-w-0">
                <p className="text-obsidian-200 text-sm sm:text-base italic leading-relaxed">
                  "{dailyQuote.text}"
                </p>
                <p className="text-gold-400 text-xs sm:text-sm mt-2 font-medium">
                  — {dailyQuote.author}
                </p>
              </div>
              <button
                onClick={handleRefreshQuote}
                disabled={isLoadingQuote}
                className="p-1.5 text-obsidian-400 hover:text-gold-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Get new quote"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingQuote ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Journey Path Visualization */}
      <Card variant="default" padding="md" className="sm:p-6 lg:p-8">
        <div className="flex justify-center py-2 sm:py-4 overflow-x-auto">
          <JourneyPath
            milestones={milestones}
            showGoal={true}
            onMilestoneClick={(m) => {
              if (m.status === 'locked') setShowCompleteModal(true);
            }}
          />
        </div>
      </Card>

      {/* Progress to Next Tier */}
      {(() => {
        const tier = getIntegrityTier(user.integrityScore);
        const nextTier = getNextTier(user.integrityScore);
        const progress = getTierProgress(user.integrityScore);
        const promisesNeeded = getPromisesToNextTier(user.integrityScore);

        return nextTier ? (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${tier.color.bg} border ${tier.color.border}`}>
            <Shield className={`w-5 h-5 flex-shrink-0 ${tier.color.text}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-medium ${tier.color.text}`}>{tier.name}</span>
                <span className="text-obsidian-400 text-xs">{promisesNeeded} kept promises to {nextTier.name}</span>
              </div>
              <div className="h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(to right, ${tier.color.secondary}, ${tier.color.primary})`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400">
            <Shield className="w-5 h-5 flex-shrink-0 text-amber-300" />
            <span className="text-amber-300 text-sm font-medium">Reliable &mdash; Your word is your bond</span>
          </div>
        );
      })()}

      {/* Goal Ready to Finish Banner */}
      {canFinishGoal && (
        <Card variant="highlighted" padding="md" className="sm:p-6 border-gold-500/30 bg-gradient-to-br from-gold-500/10 to-obsidian-900">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gold-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gold-400 mb-2">
              All Milestones Complete!
            </h2>
            <p className="text-obsidian-300 text-sm sm:text-base mb-4 sm:mb-6">
              You've resolved all milestones for "{currentGoal?.title}". Finish your goal to reflect on this journey and start your next one.
            </p>
            <Button
              variant="gold"
              onClick={() => navigate('/goal-accomplished')}
              icon={ChevronRight}
            >
              Finish Goal
            </Button>
          </div>
        </Card>
      )}

      {/* Current Locked Milestone */}
      {currentLockedMilestone && (
        <Card variant="highlighted" padding="md" className="sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-obsidian-400 text-xs sm:text-sm">Milestone {currentLockedMilestone.number}</span>
                <CountdownTimer
                  deadline={currentLockedMilestone.promise.deadline}
                  size="sm"
                  showLabels={false}
                  className="text-xs sm:text-sm"
                />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-obsidian-100">
                {currentLockedMilestone.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="locked" icon={Lock}>LOCKED</Badge>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-lg bg-obsidian-800/50 border border-obsidian-600 hover:border-obsidian-500 transition-colors"
                title="Share commitment"
              >
                <Share2 className="w-4 h-4 text-obsidian-400" />
              </button>
            </div>
          </div>

          <p className="text-obsidian-300 text-sm sm:text-base mb-3 sm:mb-4">
            {currentLockedMilestone.promise.text}
          </p>

          {/* Consequence - Prominent Display */}
          {currentLockedMilestone.promise?.consequence &&
           currentLockedMilestone.promise.consequence !== 'I accept the consequence.' && (
            <div className="p-4 sm:p-5 bg-red-950/30 border-2 border-red-800/50 rounded-xl mb-4 sm:mb-6">
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <span className="text-base sm:text-lg">⚠️</span>
                <p className="text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  If I Fail
                </p>
                <span className="text-base sm:text-lg">⚠️</span>
              </div>
              <p className="text-red-300 text-sm sm:text-base md:text-lg font-medium text-center leading-relaxed">
                "{currentLockedMilestone.promise.consequence}"
              </p>
            </div>
          )}

          <p className="text-obsidian-400 text-xs sm:text-sm mb-4 sm:mb-6">
            Due: {new Date(currentLockedMilestone.promise.deadline).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </p>

          {/* Countdown with Witness Count */}
          <div className="mb-4 sm:mb-6 py-4 sm:py-6 border-t border-b border-obsidian-700">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <p className="text-obsidian-400 text-xs sm:text-sm">Time Remaining:</p>
              {/* Witness Count - show eye emoji with count */}
              {(currentLockedMilestone.promise?.witnessCount > 0) && (
                <div className="flex items-center gap-1.5 text-obsidian-400 text-xs sm:text-sm">
                  <span className="text-sm sm:text-base">👁️</span>
                  <span>{currentLockedMilestone.promise.witnessCount} watching</span>
                </div>
              )}
            </div>
            <CountdownTimer
              deadline={currentLockedMilestone.promise.deadline}
              size="lg"
              showLabels={true}
            />
          </div>

          {/* Expired Warning */}
          {isPromiseExpired && (
            <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg mb-4">
              <p className="text-red-400 text-sm text-center font-medium">
                Deadline has passed. You must complete the failure reflection.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {!isPromiseExpired && (
              <Button
                variant="gold"
                className="flex-1"
                icon={Check}
                onClick={() => setShowCompleteModal(true)}
              >
                Mark Complete
              </Button>
            )}
            <Button
              variant="danger"
              className="flex-1"
              icon={AlertTriangle}
              onClick={() => {
                setActionError(null);
                setShowBreakModal(true);
              }}
            >
              {isPromiseExpired ? 'Reflect & Break Promise' : 'Promise Broken'}
            </Button>
          </div>
        </Card>
      )}

      {/* No Locked Milestone */}
      {!currentLockedMilestone && nextPendingMilestone && (
        <Card variant="default" padding="md" className="sm:p-6 text-center">
          <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-obsidian-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-obsidian-200 text-base sm:text-lg font-medium mb-2">
            No Active Promise
          </h3>
          <p className="text-obsidian-400 text-sm sm:text-base mb-4 sm:mb-6">
            You still have time to finish & Milestone {nextPendingMilestone.number}.
          </p>
          <Button
            variant="gold"
            onClick={() => navigate(`/lock-promise/${nextPendingMilestone.id}`)}
            icon={Lock}
          >
            Lock Next Promise
          </Button>
        </Card>
      )}

      {/* Upcoming Promise Section */}
      {nextPendingMilestone && currentLockedMilestone && (
        <div>
          <h3 className="text-obsidian-300 text-sm font-medium mb-3">Upcoming Promise</h3>
          <p className="text-obsidian-400 text-sm">
            You still have time left to finish & Milestone {nextPendingMilestone.number}.
          </p>
        </div>
      )}

      {/* Recent Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-obsidian-200 font-medium text-sm sm:text-base">Recent Milestones</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
            View All
          </Button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {recentMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`
                flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border
                ${milestone.status === 'completed'
                  ? 'bg-obsidian-800/50 border-obsidian-600/50'
                  : 'bg-obsidian-800/50 border-red-900/30'
                }
              `}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {milestone.status === 'completed' ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-obsidian-400 text-xs sm:text-sm">Milestone {milestone.number}. </span>
                  <span className="text-obsidian-200 text-sm sm:text-base">{milestone.title}</span>
                </div>
              </div>

              <Badge
                variant={milestone.status === 'completed' ? 'completed' : 'broken'}
                size="sm"
                className="self-start sm:self-auto"
              >
                {milestone.status === 'completed' ? 'COMPLETED' : 'BROKEN'}
              </Badge>
            </div>
          ))}

          {recentMilestones.length === 0 && (
            <p className="text-obsidian-500 text-center py-6 sm:py-8 text-sm">
              No completed or broken milestones yet.
            </p>
          )}
        </div>
      </div>

      {/* Past Milestones Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-obsidian-200 font-medium text-sm sm:text-base">Past Milestones</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Newest</Button>
            <Button variant="ghost" size="sm">Oldest</Button>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {milestones
            .filter(m => ['completed', 'broken'].includes(m.status))
            .map((milestone) => (
              <div
                key={milestone.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 rounded-lg bg-obsidian-800/50 border border-obsidian-600/50"
              >
                <div className="min-w-0">
                  <span className="text-obsidian-400 text-xs sm:text-sm">Milestone {milestone.number}: </span>
                  <span className="text-obsidian-200 text-sm sm:text-base">{milestone.title}</span>
                  {milestone.reason && (
                    <p className="text-obsidian-500 text-xs sm:text-sm mt-1 truncate">
                      Reason: {milestone.reason}
                    </p>
                  )}
                </div>
                <Badge
                  variant={milestone.status === 'completed' ? 'completed' : 'broken'}
                  size="sm"
                  className="self-start sm:self-auto flex-shrink-0"
                >
                  {milestone.status === 'completed' ? 'COMPLETED' : 'BROKEN'}
                </Badge>
              </div>
            ))}
        </div>
      </div>

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Mark Promise Complete"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/30 border border-green-700/50 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-obsidian-200 mb-6">
            Are you sure you've completed "{currentLockedMilestone?.title}"?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCompleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              onClick={handleComplete}
            >
              Yes, Complete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Break Promise Modal - Structured Failure Reflection */}
      <Modal
        isOpen={showBreakModal}
        onClose={() => setShowBreakModal(false)}
        title={isPromiseExpired ? 'Deadline Passed - Failure Reflection' : 'Failure Reflection'}
        size="lg"
        showClose={true}
      >
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          {isPromiseExpired && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg mb-4">
              <p className="text-red-400 text-sm text-center font-medium">
                Your deadline has passed.
              </p>
              <p className="text-obsidian-400 text-xs text-center mt-2">
                Did you actually complete the task but forgot to mark it?
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-3"
                icon={Check}
                onClick={() => {
                  setShowBreakModal(false);
                  setShowCompleteModal(true);
                }}
              >
                Mark as Complete Instead
              </Button>
            </div>
          )}

          <p className="text-obsidian-200 text-center mb-2">
            {isPromiseExpired
              ? 'This broken promise will be recorded permanently.'
              : 'Breaking this promise will be recorded permanently.'
            }
          </p>
          <p className="text-obsidian-500 text-sm text-center mb-6">
            Complete this reflection honestly. It will be stored in your failure history.
          </p>

          {/* Question 1: Why did you fail? */}
          <div className="mb-5">
            <label className="block text-obsidian-200 text-sm font-medium mb-2">
              1. Why did you fail? <span className="text-red-400">*</span>
            </label>
            <p className="text-obsidian-500 text-xs mb-2">
              Be honest about the direct reason you didn't complete this promise.
            </p>
            <Textarea
              placeholder="I procrastinated and kept pushing the task to tomorrow..."
              value={reflection.whyFailed}
              onChange={(e) => handleReflectionChange('whyFailed', e.target.value)}
              rows={2}
            />
          </div>

          {/* Question 2: What was in your control? */}
          <div className="mb-5">
            <label className="block text-obsidian-200 text-sm font-medium mb-2">
              2. What was in your control? <span className="text-red-400">*</span>
            </label>
            <p className="text-obsidian-500 text-xs mb-2">
              Identify the decisions and actions you could have taken differently.
            </p>
            <Textarea
              placeholder="I could have started earlier, blocked distractions, asked for help..."
              value={reflection.whatWasInControl}
              onChange={(e) => handleReflectionChange('whatWasInControl', e.target.value)}
              rows={2}
            />
          </div>

          {/* Question 3: What will you change? */}
          <div className="mb-5">
            <label className="block text-obsidian-200 text-sm font-medium mb-2">
              3. What will you change next time? <span className="text-red-400">*</span>
            </label>
            <p className="text-obsidian-500 text-xs mb-2">
              Commit to a specific change in behavior for your next promise.
            </p>
            <Textarea
              placeholder="Next time I will start on day 1, set daily check-ins, and..."
              value={reflection.whatWillChange}
              onChange={(e) => handleReflectionChange('whatWillChange', e.target.value)}
              rows={2}
            />
          </div>

          {/* Consequence Proof Section - Only show if custom consequence was set */}
          {hasCustomConsequence && (
            <div className="mb-5 p-4 bg-obsidian-800/50 border border-obsidian-600 rounded-lg">
              <label className="block text-obsidian-200 text-sm font-medium mb-2">
                4. Your Consequence <span className="text-red-400">*</span>
              </label>
              <div className="p-3 bg-obsidian-900/50 border border-obsidian-700 rounded-lg mb-3">
                <p className="text-obsidian-300 text-sm italic">
                  "{currentLockedMilestone?.promise?.consequence}"
                </p>
              </div>
              <p className="text-obsidian-500 text-xs mb-3">
                You committed to this consequence. Describe how you completed it.
              </p>
              <Textarea
                placeholder="I completed my consequence by..."
                value={reflection.consequenceProof}
                onChange={(e) => handleReflectionChange('consequenceProof', e.target.value)}
                rows={2}
              />

              {/* Optional: Image Upload */}
              <div className="mt-3">
                <label className="block text-obsidian-400 text-xs mb-2">
                  Upload proof (optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-obsidian-700 hover:bg-obsidian-600 border border-obsidian-600 rounded-lg cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-obsidian-400" />
                    <span className="text-obsidian-300 text-xs">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleConsequenceImageUpload}
                      className="hidden"
                    />
                  </label>
                  {consequenceProofPreview && (
                    <div className="relative">
                      <img
                        src={consequenceProofPreview}
                        alt="Proof"
                        className="w-12 h-12 object-cover rounded-lg border border-obsidian-600"
                      />
                      <button
                        onClick={() => {
                          setConsequenceProofImage(null);
                          setConsequenceProofPreview(null);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {actionError && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg mb-4">
              <p className="text-red-400 text-sm text-center">{actionError}</p>
            </div>
          )}

          {/* Warning */}
          <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg mb-6">
            <p className="text-red-400 text-xs text-center">
              Your integrity score will decrease by 15 points. This reflection cannot be edited later.
            </p>
          </div>

          <div className="flex gap-3">
            {!isPromiseExpired && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setReflection({ whyFailed: '', whatWasInControl: '', whatWillChange: '', consequenceProof: '' });
                  setConsequenceProofImage(null);
                  setConsequenceProofPreview(null);
                  setShowBreakModal(false);
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleBreak}
              disabled={!isReflectionComplete || isProcessing}
            >
              {isProcessing ? 'Submitting...' : 'Submit & Break Promise'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Commitment Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Commitment"
        size="md"
      >
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
            <Share2 className="w-8 h-8 text-gold-500" />
          </div>

          <p className="text-obsidian-300 text-center mb-2">
            Share this link with witnesses to hold yourself accountable.
          </p>
          <p className="text-obsidian-500 text-xs text-center mb-6">
            They can view your progress and send silent encouragement.
          </p>

          {/* Link Display */}
          <div className="flex items-center gap-2 p-3 bg-obsidian-900 rounded-lg border border-obsidian-700 mb-4">
            <input
              type="text"
              readOnly
              value={getShareableLink()}
              className="flex-1 bg-transparent text-obsidian-300 text-sm focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`
                p-2 rounded-lg transition-colors
                ${linkCopied
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-obsidian-800 text-obsidian-400 hover:text-obsidian-200'
                }
              `}
            >
              {linkCopied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {linkCopied && (
            <p className="text-green-400 text-sm text-center mb-4">
              Link copied to clipboard!
            </p>
          )}

          {/* What witnesses can do */}
          <div className="p-4 bg-obsidian-900/50 rounded-lg border border-obsidian-700">
            <h4 className="text-obsidian-200 text-sm font-medium mb-2">What witnesses can see:</h4>
            <ul className="text-obsidian-400 text-xs space-y-1">
              <li>• Your milestone title and deadline</li>
              <li>• Live countdown timer</li>
              <li>• Your consequence (if set)</li>
              <li>• Your integrity score</li>
              <li>• Promise status (Locked/Kept/Broken)</li>
            </ul>
            <h4 className="text-obsidian-200 text-sm font-medium mt-3 mb-2">What witnesses can do:</h4>
            <ul className="text-obsidian-400 text-xs space-y-1">
              <li>• Send silent emoji encouragement</li>
              <li>• No comments, no chat, no notifications</li>
            </ul>
          </div>

          <div className="mt-6">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowShareModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tier Change Notification Modal */}
      <Modal
        isOpen={!!tierChangeNotification}
        onClose={dismissTierChange}
        title=""
        size="sm"
      >
        {tierChangeNotification && (
          <div className="text-center py-4">
            {tierChangeNotification.direction === 'up' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/30 border-2 border-green-500/50 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-obsidian-100 mb-2">
                  Tier Up!
                </h2>
                <p className="text-obsidian-400 mb-3">
                  You've risen from{' '}
                  <span className="font-semibold" style={{ color: tierChangeNotification.oldTier.color.primary }}>
                    {tierChangeNotification.oldTier.name}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold" style={{ color: tierChangeNotification.newTier.color.primary }}>
                    {tierChangeNotification.newTier.name}
                  </span>
                </p>
                <p className="text-obsidian-500 text-sm italic mb-6">
                  "{tierChangeNotification.newTier.tagline}"
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 border-2 border-red-500/50 flex items-center justify-center">
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-obsidian-100 mb-2">
                  Tier Down
                </h2>
                <p className="text-obsidian-400 mb-3">
                  You've dropped from{' '}
                  <span className="font-semibold" style={{ color: tierChangeNotification.oldTier.color.primary }}>
                    {tierChangeNotification.oldTier.name}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold" style={{ color: tierChangeNotification.newTier.color.primary }}>
                    {tierChangeNotification.newTier.name}
                  </span>
                </p>
                <p className="text-obsidian-500 text-sm italic mb-6">
                  Keep your promises to climb back up.
                </p>
              </>
            )}
            <Button variant="gold" onClick={dismissTierChange} className="w-full">
              Got it
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
