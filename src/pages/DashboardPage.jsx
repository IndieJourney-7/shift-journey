import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, AlertTriangle, Bell, ChevronRight, Target, Share2, Copy, CheckCircle, Upload, Image, X, Trophy } from 'lucide-react';
import { Button, Card, Badge, Modal, Textarea } from '../components/ui';
import { JourneyPath, MilestoneCard, CountdownTimer, IntegrityBadgeInline } from '../components/journey';
import { useApp } from '../context/AppContext';

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
    brokenMilestonesNeedingProof,
    uploadConsequenceProof,
    canFinishGoal,
    user,
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
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedBrokenMilestone, setSelectedBrokenMilestone] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Consequence proof state
  const [proofDescription, setProofDescription] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Structured failure reflection state
  const [reflection, setReflection] = useState({
    whyFailed: '',
    whatWasInControl: '',
    whatWillChange: '',
  });

  // Generate shareable link for current locked milestone
  const getShareableLink = () => {
    if (!currentLockedMilestone) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/c/${currentLockedMilestone.id}`;
  };

  const handleCopyLink = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleComplete = () => {
    if (currentLockedMilestone) {
      completeMilestone(currentLockedMilestone.id);
      setShowCompleteModal(false);
    }
  };

  const handleBreak = () => {
    if (currentLockedMilestone && reflection.whyFailed.trim()) {
      breakPromise(currentLockedMilestone.id, reflection);
      setReflection({ whyFailed: '', whatWasInControl: '', whatWillChange: '' });
      setShowBreakModal(false);
    }
  };

  const handleReflectionChange = (field, value) => {
    setReflection(prev => ({ ...prev, [field]: value }));
  };

  const isReflectionComplete = reflection.whyFailed.trim() && reflection.whatWasInControl.trim() && reflection.whatWillChange.trim();

  // Consequence proof handlers
  const openProofModal = (milestone) => {
    setSelectedBrokenMilestone(milestone);
    setProofDescription('');
    setProofImage(null);
    setProofImagePreview(null);
    setShowProofModal(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
        setProofImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearProofImage = () => {
    setProofImage(null);
    setProofImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitProof = () => {
    if (selectedBrokenMilestone && proofDescription.trim()) {
      uploadConsequenceProof(selectedBrokenMilestone.id, {
        description: proofDescription,
        imageData: proofImage,
      });
      setShowProofModal(false);
      setSelectedBrokenMilestone(null);
      setProofDescription('');
      setProofImage(null);
      setProofImagePreview(null);
    }
  };

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
        </div>
        {/* Small Integrity Indicator */}
        <IntegrityBadgeInline score={user.integrityScore} />
      </div>

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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="gold"
              className="flex-1"
              icon={Check}
              onClick={() => setShowCompleteModal(true)}
            >
              Mark Complete
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              icon={AlertTriangle}
              onClick={() => setShowBreakModal(true)}
            >
              Promise Broken
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

      {/* Consequence Proof Needed Section */}
      {brokenMilestonesNeedingProof.length > 0 && (
        <Card variant="default" padding="md" className="sm:p-6 border-amber-900/30">
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <h3 className="text-obsidian-200 font-medium text-sm sm:text-base">Consequence Proof Needed</h3>
            <Badge variant="warning" size="sm">{brokenMilestonesNeedingProof.length}</Badge>
          </div>

          <p className="text-obsidian-400 text-xs sm:text-sm mb-3 sm:mb-4">
            You have broken promises with unpaid consequences. Upload proof to recover 5 integrity points per consequence.
          </p>

          <div className="space-y-3">
            {brokenMilestonesNeedingProof.map((milestone) => (
              <div
                key={milestone.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg bg-obsidian-900/50 border border-amber-900/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                    <span className="text-obsidian-400 text-xs sm:text-sm">Milestone {milestone.number}</span>
                  </div>
                  <p className="text-obsidian-200 font-medium text-sm sm:text-base mb-1">{milestone.title}</p>
                  <p className="text-obsidian-500 text-xs">
                    Consequence: "{milestone.promise?.consequence || 'No consequence set'}"
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  onClick={() => openProofModal(milestone)}
                  className="w-full sm:w-auto"
                >
                  Upload Proof
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notifications Section */}
      {brokenMilestones.length > 0 && (
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-obsidian-400" />
            <h3 className="text-obsidian-200 font-medium">Notifications</h3>
            <span className="text-obsidian-500 text-sm">From Milestone {brokenMilestones[brokenMilestones.length - 1]?.number} and ago</span>
          </div>

          <div className="flex items-start gap-3 p-3 bg-obsidian-900/50 rounded-lg border border-red-900/30">
            <div className="w-2 h-2 mt-2 rounded-full bg-red-500" />
            <div>
              <p className="text-red-400 font-medium text-sm">Promise Broken</p>
              <p className="text-obsidian-400 text-sm">
                "{brokenMilestones[brokenMilestones.length - 1]?.reason || 'No reason provided'}"
              </p>
            </div>
          </div>
        </Card>
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
        title="Failure Reflection"
        size="lg"
      >
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <p className="text-obsidian-200 text-center mb-2">
            Breaking this promise will be recorded permanently.
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
          <div className="mb-6">
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

          {/* Warning */}
          <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg mb-6">
            <p className="text-red-400 text-xs text-center">
              Your integrity score will decrease by 15 points. This reflection cannot be edited later.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setReflection({ whyFailed: '', whatWasInControl: '', whatWillChange: '' });
                setShowBreakModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleBreak}
              disabled={!isReflectionComplete}
            >
              Submit & Break Promise
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

      {/* Consequence Proof Upload Modal */}
      <Modal
        isOpen={showProofModal}
        onClose={() => {
          setShowProofModal(false);
          setSelectedBrokenMilestone(null);
          setProofDescription('');
          clearProofImage();
        }}
        title="Upload Consequence Proof"
        size="md"
      >
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-900/30 border border-amber-700/50 flex items-center justify-center">
            <Upload className="w-8 h-8 text-amber-500" />
          </div>

          {/* Milestone Info */}
          {selectedBrokenMilestone && (
            <div className="bg-obsidian-900/50 border border-obsidian-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-obsidian-400 text-sm">Milestone {selectedBrokenMilestone.number}</span>
              </div>
              <p className="text-obsidian-200 font-medium mb-2">{selectedBrokenMilestone.title}</p>
              <div className="pt-2 border-t border-obsidian-700">
                <p className="text-obsidian-400 text-xs mb-1">Your consequence:</p>
                <p className="text-amber-400 text-sm">
                  "{selectedBrokenMilestone.promise?.consequence || 'No consequence set'}"
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-5">
            <label className="block text-obsidian-200 text-sm font-medium mb-2">
              How did you fulfill the consequence? <span className="text-red-400">*</span>
            </label>
            <p className="text-obsidian-500 text-xs mb-2">
              Describe what you did to honor your commitment to the consequence.
            </p>
            <Textarea
              placeholder="I deleted my social media accounts for 24 hours as promised..."
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-obsidian-200 text-sm font-medium mb-2">
              Upload proof image (optional)
            </label>
            <p className="text-obsidian-500 text-xs mb-3">
              Add a screenshot, photo, or other visual evidence. Max 5MB.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {!proofImagePreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 rounded-lg border-2 border-dashed border-obsidian-600 hover:border-obsidian-500 transition-colors flex flex-col items-center gap-2"
              >
                <Image className="w-8 h-8 text-obsidian-500" />
                <span className="text-obsidian-400 text-sm">Click to upload image</span>
                <span className="text-obsidian-600 text-xs">PNG, JPG, GIF up to 5MB</span>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={proofImagePreview}
                  alt="Proof preview"
                  className="w-full max-h-48 object-contain rounded-lg border border-obsidian-600"
                />
                <button
                  onClick={clearProofImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-obsidian-900/80 hover:bg-red-900/80 transition-colors"
                >
                  <X className="w-4 h-4 text-obsidian-300" />
                </button>
              </div>
            )}
          </div>

          {/* Recovery Info */}
          <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg mb-6">
            <p className="text-green-400 text-xs text-center">
              Submitting proof will recover 5 integrity points and mark this consequence as fulfilled.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowProofModal(false);
                setSelectedBrokenMilestone(null);
                setProofDescription('');
                clearProofImage();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              onClick={handleSubmitProof}
              disabled={!proofDescription.trim()}
            >
              Submit Proof
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
