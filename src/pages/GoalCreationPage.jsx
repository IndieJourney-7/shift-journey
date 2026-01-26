import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Calendar, ChevronRight, AlertTriangle, Trophy, Lock } from 'lucide-react';
import { Button, Card, Input, Textarea } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function GoalCreationPage() {
  const navigate = useNavigate();
  const { createGoal, currentGoal, hasActivePromise, goalHistory } = useApp();

  // Check if user has already completed a goal (one goal limit for now)
  const hasCompletedGoal = goalHistory && goalHistory.length > 0;

  // If user has an active goal with locked promise, redirect to dashboard
  useEffect(() => {
    if (currentGoal && hasActivePromise) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentGoal, hasActivePromise, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createGoal(formData);
      navigate('/milestones');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user has already completed a goal, show the "limit reached" message
  if (hasCompletedGoal && !currentGoal) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-gold-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-obsidian-100 mb-3">
            You've Completed Your Journey!
          </h1>
          <p className="text-obsidian-400 mb-6 max-w-md mx-auto">
            You've successfully completed your first goal on Shift Ascent.
            We're working on adding more features for your next journey.
          </p>

          <Card variant="default" padding="lg" className="mb-6 text-left">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-5 h-5 text-gold-500 mt-0.5" />
              <div>
                <h3 className="text-obsidian-200 font-medium mb-1">Coming Soon</h3>
                <p className="text-obsidian-400 text-sm">
                  Multiple goals, team challenges, and advanced tracking features are in development.
                </p>
              </div>
            </div>
            <p className="text-obsidian-500 text-xs">
              Join our waitlist to be notified when new features launch.
            </p>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => navigate('/history')}
            >
              View Your Journey
            </Button>
            <Button
              variant="gold"
              onClick={() => navigate('/waitlist')}
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-1 sm:px-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-gold-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-obsidian-100 mb-2 sm:mb-3">
            Set Your Goal
          </h1>
          <p className="text-obsidian-400 text-sm sm:text-base">
            Define one clear goal. You can only have one active goal at a time.
          </p>
        </div>

        {/* Warning if replacing existing goal */}
        {currentGoal && !hasActivePromise && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-obsidian-900/50 border border-gold-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-obsidian-200 font-medium mb-1">
                You already have an active goal
              </p>
              <p className="text-obsidian-400 text-sm">
                Creating a new goal will replace "{currentGoal.title}" and reset all milestones.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Goal Title"
              name="title"
              placeholder="e.g., Launch My Startup"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
            />

            <Textarea
              label="Description (Optional)"
              name="description"
              placeholder="What do you want to achieve? Why is this important?"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-obsidian-300 mb-2">
                Target Completion Date
              </label>
              <div className="relative">
                <Input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  error={errors.targetDate}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-obsidian-500 pointer-events-none" />
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
                {errors.submit}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                icon={ChevronRight}
                iconPosition="right"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Goal...' : 'Continue to Milestones'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Box */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
          <h3 className="text-obsidian-200 font-medium mb-2 text-sm sm:text-base">Remember:</h3>
          <ul className="text-obsidian-400 text-xs sm:text-sm space-y-1">
            <li>• One active goal keeps you focused</li>
            <li>• You'll break this goal into milestones next</li>
            <li>• Each milestone becomes a locked promise</li>
          </ul>
        </div>
    </div>
  );
}
