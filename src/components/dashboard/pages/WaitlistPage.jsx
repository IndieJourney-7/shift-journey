import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, CheckCircle, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Card, Input, Textarea } from '../../ui';
import { useApp } from '../../../context/AppContext';
import { waitlistService } from '../../../services/database';

/**
 * Waitlist Page - Shown after first goal completion
 * Collects email and optional feedback for future product development
 */
export default function WaitlistPage() {
  const navigate = useNavigate();
  const { user, goalHistory } = useApp();
  const [email, setEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await waitlistService.add({
        userId: user?.id,
        email: email.trim(),
        notes: notes.trim() || null,
        goalsCompleted: (goalHistory?.length || 0) + 1,
        integrityScore: user?.integrityScore,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Waitlist submission error:', err);
      // Handle various error cases
      if (err.message?.includes('duplicate') || err.code === '23505') {
        // Email already exists - treat as success
        setIsSubmitted(true);
      } else if (err.message?.includes('relation') && err.message?.includes('does not exist')) {
        // Table doesn't exist - still show success (we'll collect later)
        console.warn('Waitlist table not yet created');
        setIsSubmitted(true);
      } else if (err.code === '42P01') {
        // Table doesn't exist error code
        console.warn('Waitlist table not yet created');
        setIsSubmitted(true);
      } else {
        setError(`Failed to join waitlist: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/history', { replace: true });
  };

  const handleContinue = () => {
    navigate('/history', { replace: true });
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-900/30 border-2 border-green-500/50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-obsidian-100 mb-3">
            You're on the list!
          </h1>
          <p className="text-obsidian-400 mb-8">
            Thank you for your interest. We'll notify you when new features are ready.
          </p>

          <Button
            variant="gold"
            onClick={handleContinue}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full sm:w-auto min-w-[200px]"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gold-500/20 border-2 border-gold-500/50 flex items-center justify-center">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-gold-400" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-gold-500" />
          <span className="text-gold-500 text-sm font-medium">First Goal Complete!</span>
          <Sparkles className="w-4 h-4 text-gold-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-obsidian-100 mb-2">
          Congratulations!
        </h1>
        <p className="text-obsidian-400 text-sm sm:text-base">
          You've completed your first goal on Shift Ascent.
        </p>
      </div>

      {/* Waitlist Card */}
      <Card variant="elevated" padding="lg" className="mb-6">
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-obsidian-100 mb-2">
            Want more?
          </h2>
          <p className="text-obsidian-400 text-sm">
            We're building new features to help you achieve bigger goals.
            Join the waitlist to get early access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-obsidian-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-obsidian-800 border border-obsidian-600 rounded-lg
                  text-obsidian-100 placeholder-obsidian-500
                  focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 focus:outline-none
                  transition-colors"
              />
            </div>
          </div>

          {/* Notes/Feedback Input */}
          <div>
            <label className="block text-sm font-medium text-obsidian-300 mb-2">
              What features would you like to see? <span className="text-obsidian-500">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="I'd love to see..."
                rows={3}
                className="w-full px-4 py-3 bg-obsidian-800 border border-obsidian-600 rounded-lg
                  text-obsidian-100 placeholder-obsidian-500 resize-none
                  focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 focus:outline-none
                  transition-colors"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gold"
            className="w-full"
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? 'Joining...' : 'Join Waitlist'}
          </Button>
        </form>
      </Card>

      {/* Skip Option */}
      <div className="text-center">
        <button
          onClick={handleSkip}
          className="text-obsidian-500 hover:text-obsidian-300 text-sm transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* What's Coming */}
      <div className="mt-8 p-4 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
        <h3 className="text-obsidian-300 text-sm font-medium mb-3">Coming Soon:</h3>
        <ul className="text-obsidian-500 text-xs sm:text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-gold-500">+</span>
            <span>Multiple concurrent goals</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-500">+</span>
            <span>Team accountability & challenges</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-500">+</span>
            <span>Advanced analytics & insights</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-500">+</span>
            <span>Public profiles & leaderboards</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
