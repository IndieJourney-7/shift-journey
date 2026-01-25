import React, { useState } from 'react';
import { Target, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { MilestoneProvider, useMilestones } from '../context/MilestoneContext';
import { MilestoneDashboard } from '../components/milestones';
import { Button, Card, Input, Textarea } from '../components/ui';

// Loading screen
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4" />
      <p className="text-obsidian-400">Loading your journey...</p>
    </div>
  );
}

// Error screen
function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-obsidian-100 mb-2">
        Something went wrong
      </h2>
      <p className="text-obsidian-400 mb-6">{message}</p>
      <Button
        variant="secondary"
        icon={RefreshCw}
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
}

// Goal Setup Component (shown when no goal exists)
function GoalSetup() {
  const { setGoal } = useMilestones();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Goal title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await setGoal({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
      });
    } catch (err) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
          <Target className="w-8 h-8 text-gold-500" />
        </div>
        <h1 className="text-3xl font-bold text-obsidian-100 mb-3">
          Set Your Goal
        </h1>
        <p className="text-obsidian-400">
          Define one clear goal. You'll break it into milestones and lock each as a promise.
        </p>
      </div>

      {/* Form */}
      <Card variant="elevated" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Goal Title"
            name="title"
            placeholder="e.g., Launch My Startup, Learn Spanish, Run a Marathon"
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              if (error) setError('');
            }}
            error={error}
            disabled={isSubmitting}
          />

          <Textarea
            label="Description (Optional)"
            name="description"
            placeholder="What do you want to achieve? Why is this important?"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            disabled={isSubmitting}
          />

          <div className="pt-4">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              icon={ChevronRight}
              iconPosition="right"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Continue to Milestones
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
        <h3 className="text-obsidian-200 font-medium mb-2">How it works:</h3>
        <ul className="text-obsidian-400 text-sm space-y-1">
          <li>• Break your goal into small milestones</li>
          <li>• Lock one milestone at a time as a promise</li>
          <li>• Set a deadline and track your progress</li>
          <li>• If you fail, reflect on what happened</li>
          <li>• Complete all milestones to achieve your goal</li>
        </ul>
      </div>
    </div>
  );
}

// Main content - shows loading, error, goal setup, or dashboard
function MilestoneSystemContent() {
  const { goal, isLoading, error } = useMilestones();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!goal) {
    return <GoalSetup />;
  }

  return <MilestoneDashboard />;
}

// Page wrapper with provider
export default function MilestoneSystemPage() {
  return (
    <MilestoneProvider>
      <MilestoneSystemContent />
    </MilestoneProvider>
  );
}
