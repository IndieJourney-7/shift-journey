import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Calendar, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button, Card, Input, Textarea } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function GoalCreationPage() {
  const navigate = useNavigate();
  const { createGoal, currentGoal, hasActivePromise, canCreateNewGoal } = useApp();

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
        <div className="mt-8 p-4 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
          <h3 className="text-obsidian-200 font-medium mb-2">Remember:</h3>
          <ul className="text-obsidian-400 text-sm space-y-1">
            <li>• One active goal keeps you focused</li>
            <li>• You'll break this goal into milestones next</li>
            <li>• Each milestone becomes a locked promise</li>
          </ul>
        </div>
    </div>
  );
}
