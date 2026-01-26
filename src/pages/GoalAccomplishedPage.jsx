import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Target, Clock, CheckCircle, AlertTriangle, ChevronRight, Sparkles, Send } from 'lucide-react';
import { Button, Card, Textarea, Confetti } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function GoalAccomplishedPage() {
  const navigate = useNavigate();
  const {
    currentGoal,
    milestones,
    user,
    canFinishGoal,
    completeGoal,
    goalHistory,
  } = useApp();

  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Store goal data for display during celebration (after goal is cleared)
  const [celebrationData, setCelebrationData] = useState(null);

  // Use celebration data if celebrating, otherwise use current data
  const displayGoal = isCelebrating ? celebrationData?.goal : currentGoal;
  const displayMilestones = isCelebrating ? celebrationData?.milestones : milestones;

  // Calculate stats
  const completedMilestones = (displayMilestones || []).filter(m => m.status === 'completed');
  const brokenMilestones = (displayMilestones || []).filter(m => m.status === 'broken');

  // Check if reflection is valid (mandatory - at least 10 characters)
  const isReflectionValid = reflection.trim().length >= 10;

  // Calculate journey duration
  const getJourneyDuration = () => {
    if (!displayGoal?.createdAt) return 'Unknown';
    const start = new Date(displayGoal.createdAt);
    const end = new Date();
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    return `${Math.floor(diffDays / 30)} months`;
  };

  // Calculate success rate
  const getSuccessRate = () => {
    const finished = completedMilestones.length + brokenMilestones.length;
    if (finished === 0) return 100;
    return Math.round((completedMilestones.length / finished) * 100);
  };

  // Redirect if goal cannot be finished (but not during celebration)
  useEffect(() => {
    if (!canFinishGoal && !isCelebrating) {
      navigate('/dashboard', { replace: true });
    }
  }, [canFinishGoal, isCelebrating, navigate]);

  // Handle finishing the goal with celebration
  const handleFinishGoal = async () => {
    if (!isReflectionValid) return;

    // Store goal data BEFORE completing (so we can show it during celebration)
    setCelebrationData({
      goal: currentGoal,
      milestones: milestones,
    });
    setIsCelebrating(true);
    setIsSubmitting(true);
    setShowConfetti(true);
    setShowSuccessOverlay(true);

    // Check if this is the user's first goal completion (before completing)
    const isFirstGoal = !goalHistory || goalHistory.length === 0;

    // Complete the goal immediately but keep celebration for 3 seconds
    try {
      await completeGoal(reflection);
      // Navigate after 3 second celebration
      // Show waitlist for first goal, otherwise go to goal creation
      setTimeout(() => {
        if (isFirstGoal) {
          navigate('/waitlist', { replace: true });
        } else {
          navigate('/goal/create', { replace: true });
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to complete goal:', error);
      setIsSubmitting(false);
      setShowConfetti(false);
      setShowSuccessOverlay(false);
      setIsCelebrating(false);
      setCelebrationData(null);
    }
  };

  if (!canFinishGoal && !isCelebrating) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      {/* Celebration Confetti - 3 second burst with party emoji and falling threads */}
      <Confetti
        isActive={showConfetti}
        count={80}
        duration={3000}
        showThreads={true}
      />

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-500/40 to-gold-600/30 border-4 border-gold-500 flex items-center justify-center animate-pulse">
              <Trophy className="w-16 h-16 text-gold-400" />
            </div>
            <h2 className="text-4xl font-bold text-gold-400 mb-3">
              Congratulations!
            </h2>
            <p className="text-obsidian-200 text-xl mb-2">
              You've completed your goal!
            </p>
            <p className="text-obsidian-400">
              Preparing your next journey...
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center py-8">
        {/* Trophy Animation */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/20 border-2 border-gold-500/50 flex items-center justify-center animate-pulse">
            <Trophy className="w-12 h-12 text-gold-400" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-gold-400 animate-bounce" />
          <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-gold-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>

        <h1 className="text-3xl font-bold text-obsidian-100 mb-2">
          Finish Your Journey
        </h1>
        <p className="text-obsidian-400 text-lg">
          Reflect on what you've learned before starting your next goal
        </p>
      </div>

      {/* Goal Title Card */}
      <Card variant="highlighted" padding="lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-5 h-5 text-gold-500" />
            <span className="text-obsidian-400 text-sm">Your Goal</span>
          </div>
          <h2 className="text-2xl font-bold text-obsidian-100 mb-2">
            {displayGoal?.title || 'Goal Completed'}
          </h2>
          {displayGoal?.description && (
            <p className="text-obsidian-400">
              {displayGoal.description}
            </p>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="default" padding="md" className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-obsidian-100">{completedMilestones.length}</p>
          <p className="text-obsidian-400 text-xs">Promises Kept</p>
        </Card>

        <Card variant="default" padding="md" className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-obsidian-100">{brokenMilestones.length}</p>
          <p className="text-obsidian-400 text-xs">Promises Broken</p>
        </Card>

        <Card variant="default" padding="md" className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gold-900/30 flex items-center justify-center">
            <Star className="w-5 h-5 text-gold-400" />
          </div>
          <p className="text-2xl font-bold text-obsidian-100">{getSuccessRate()}%</p>
          <p className="text-obsidian-400 text-xs">Success Rate</p>
        </Card>

        <Card variant="default" padding="md" className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-obsidian-700 flex items-center justify-center">
            <Clock className="w-5 h-5 text-obsidian-300" />
          </div>
          <p className="text-2xl font-bold text-obsidian-100">{getJourneyDuration()}</p>
          <p className="text-obsidian-400 text-xs">Journey Time</p>
        </Card>
      </div>

      {/* Integrity Score */}
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-obsidian-200 font-medium">Final Integrity Score</h3>
          <span className={`text-sm font-medium ${
            user.integrityScore >= 70 ? 'text-green-400' :
            user.integrityScore >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {user.status}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-obsidian-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  user.integrityScore >= 70 ? 'bg-green-500' :
                  user.integrityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${user.integrityScore}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-obsidian-100">{user.integrityScore}</span>
        </div>

        <p className="text-obsidian-500 text-sm mt-3">
          {user.integrityScore >= 70
            ? 'Excellent! You maintained strong integrity throughout your journey.'
            : user.integrityScore >= 50
            ? 'Good effort! There\'s room to improve your promise-keeping.'
            : 'This journey tested your integrity. Use these lessons for your next goal.'}
        </p>
      </Card>

      {/* Journey Timeline */}
      <Card variant="default" padding="lg">
        <h3 className="text-obsidian-200 font-medium mb-4">Journey Timeline</h3>

        <div className="space-y-4">
          {(displayMilestones || []).map((milestone, index) => (
            <div key={milestone.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.status === 'completed'
                    ? 'bg-green-900/30 border border-green-700/50'
                    : 'bg-red-900/30 border border-red-700/50'
                }`}>
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                {index < (displayMilestones || []).length - 1 && (
                  <div className={`w-0.5 h-8 mt-1 ${
                    milestone.status === 'completed' ? 'bg-green-800/50' : 'bg-red-800/50'
                  }`} />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-obsidian-400 text-sm">Milestone {milestone.number}</span>
                  <span className={`text-xs ${
                    milestone.status === 'completed' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {milestone.status === 'completed' ? 'KEPT' : 'BROKEN'}
                  </span>
                </div>
                <p className="text-obsidian-200">{milestone.title}</p>
                {milestone.status === 'broken' && milestone.reason && (
                  <p className="text-obsidian-500 text-sm mt-1">
                    Reason: {milestone.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reflection Section - Required */}
      <Card variant="highlighted" padding="lg" className="border-gold-500/20">
        <h3 className="text-obsidian-200 font-medium mb-2">
          Journey Reflection <span className="text-red-400">*</span>
        </h3>
        <p className="text-obsidian-500 text-sm mb-4">
          What did you learn from this journey? What will you carry forward to your next goal?
        </p>
        <Textarea
          placeholder="This journey taught me... (minimum 10 characters)"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={4}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-obsidian-600 text-xs">
            This reflection will be saved with your completed goal.
          </p>
          <p className={`text-xs ${isReflectionValid ? 'text-green-500' : 'text-obsidian-500'}`}>
            {reflection.trim().length}/10 min
          </p>
        </div>
      </Card>

      {/* Submit Action */}
      <div className="flex flex-col gap-4">
        <Button
          variant="gold"
          className="w-full"
          icon={Send}
          onClick={handleFinishGoal}
          disabled={isSubmitting || !isReflectionValid}
        >
          {isSubmitting ? 'Celebrating...' : 'Finish Goal & Start Next Journey'}
        </Button>

        {!isReflectionValid && reflection.length > 0 && (
          <p className="text-amber-400 text-xs text-center">
            Please write at least 10 characters in your reflection to continue.
          </p>
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => navigate('/dashboard')}
          disabled={isSubmitting}
        >
          Go Back to Dashboard
        </Button>
      </div>

      {/* What happens next */}
      <div className="p-4 bg-obsidian-900/50 rounded-lg border border-obsidian-700">
        <h4 className="text-obsidian-300 text-sm font-medium mb-2">What happens when you finish?</h4>
        <ul className="text-obsidian-500 text-xs space-y-1">
          <li>• Your goal and milestones will be archived to your history</li>
          <li>• Your reflection will be saved for future reference</li>
          <li>• You'll be ready to create your next goal</li>
          <li>• Your integrity score carries forward to your new journey</li>
        </ul>
      </div>

      {/* Philosophy Quote */}
      <div className="text-center py-6 border-t border-obsidian-800">
        <p className="text-obsidian-500 text-sm italic">
          "The journey of a thousand miles begins with a single step—and ends with a thousand kept promises."
        </p>
      </div>
    </div>
  );
}
