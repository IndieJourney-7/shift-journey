import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { Button, Card, Textarea } from '../components/ui';
import { LockAnimation, IntegrityBadgeInline } from '../components/journey';
import { useApp } from '../context/AppContext';

export default function LockPromisePage() {
  const navigate = useNavigate();
  const { milestoneId } = useParams();
  const { milestones, lockPromise, currentLockedMilestone, user } = useApp();

  const [milestone, setMilestone] = useState(null);
  const [formData, setFormData] = useState({
    promiseText: '',
    deadline: '',
    deadlineTime: '',
    consequence: 'I accept the consequence.',
  });
  const [isLocking, setIsLocking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const found = milestones.find(m => m.id === parseInt(milestoneId));
    if (found) {
      setMilestone(found);
      setFormData(prev => ({
        ...prev,
        promiseText: `I promise that I will ${found.title.toLowerCase()}`,
      }));
    }
  }, [milestoneId, milestones]);

  // Redirect if there's already a locked milestone
  useEffect(() => {
    if (currentLockedMilestone && currentLockedMilestone.id !== parseInt(milestoneId)) {
      navigate('/dashboard');
    }
  }, [currentLockedMilestone, milestoneId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.promiseText.trim()) {
      newErrors.promiseText = 'Promise text is required';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline date is required';
    }
    if (!formData.deadlineTime) {
      newErrors.deadlineTime = 'Deadline time is required';
    }
    if (!confirmed) {
      newErrors.confirmed = 'You must confirm to lock the promise';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLocking(true);

    // Simulate locking animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const deadline = new Date(`${formData.deadline}T${formData.deadlineTime}`);

    lockPromise(parseInt(milestoneId), {
      text: formData.promiseText,
      deadline: deadline.toISOString(),
      consequence: formData.consequence,
    });

    setIsLocking(false);
    navigate('/dashboard');
  };

  if (!milestone) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
        <p className="text-obsidian-400">Loading...</p>
      </div>
    );
  }

  // Show locking animation
  if (isLocking) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center">
        <LockAnimation isLocking={true} />
        <div className="mt-8 text-center max-w-md">
          <p className="text-obsidian-200 text-lg mb-2">
            {formData.promiseText}
          </p>
          <p className="text-obsidian-400">
            If I don't, {formData.consequence || 'I accept the consequence.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        {/* Integrity Indicator - Top Right */}
        <div className="flex justify-end mb-4">
          <IntegrityBadgeInline score={user.integrityScore} />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
            <Lock className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="text-3xl font-bold text-obsidian-100 mb-2">
            Lock Your Promise
          </h1>
          <p className="text-obsidian-400">
            Milestone {milestone.number}: {milestone.title}
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 mb-8 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-obsidian-300 text-sm">
              Once locked, you <strong>cannot edit, delete, or skip</strong> this promise.
              If you fail, you must record why.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Promise Text */}
            <Textarea
              label="Your Promise"
              name="promiseText"
              placeholder="I promise that I will..."
              value={formData.promiseText}
              onChange={handleChange}
              error={errors.promiseText}
              rows={3}
            />

            {/* Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Deadline Date
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`
                    w-full bg-obsidian-900 border rounded-lg px-4 py-3 text-obsidian-100
                    focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
                    ${errors.deadline ? 'border-red-500/50' : 'border-obsidian-600'}
                  `}
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-400">{errors.deadline}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-obsidian-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Deadline Time
                </label>
                <input
                  type="time"
                  name="deadlineTime"
                  value={formData.deadlineTime}
                  onChange={handleChange}
                  className={`
                    w-full bg-obsidian-900 border rounded-lg px-4 py-3 text-obsidian-100
                    focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
                    ${errors.deadlineTime ? 'border-red-500/50' : 'border-obsidian-600'}
                  `}
                />
                {errors.deadlineTime && (
                  <p className="mt-1 text-sm text-red-400">{errors.deadlineTime}</p>
                )}
              </div>
            </div>

            {/* Consequence */}
            <div>
              <label className="block text-sm font-medium text-obsidian-300 mb-2">
                Your Consequence (Optional)
              </label>
              <p className="text-obsidian-500 text-xs mb-2">
                What will you commit to if you fail? This creates personal accountability.
              </p>
              <textarea
                name="consequence"
                value={formData.consequence}
                onChange={handleChange}
                placeholder="e.g., I will donate $50 to charity, I will skip my next cheat meal, I will work an extra hour tomorrow..."
                rows={2}
                className="w-full bg-obsidian-900 border border-obsidian-600 rounded-lg px-4 py-3 text-obsidian-100 placeholder-obsidian-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 resize-none"
              />
              <p className="text-obsidian-600 text-xs mt-1">
                Default: "I accept the consequence."
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <div className="pt-4">
              <label className={`flex items-start gap-3 cursor-pointer ${errors.confirmed ? 'text-red-400' : ''}`}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-obsidian-600 bg-obsidian-900 text-gold-500 focus:ring-gold-500/30"
                />
                <span className="text-obsidian-300 text-sm">
                  I understand that this promise is <strong>irreversible</strong>. I commit to completing this milestone by the deadline.
                </span>
              </label>
              {errors.confirmed && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmed}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                className="flex-1"
                icon={Lock}
                iconPosition="left"
              >
                Lock Promise
              </Button>
            </div>
          </form>
        </Card>

        {/* Preview */}
        {formData.deadline && formData.deadlineTime && (
          <div className="mt-8 p-6 bg-obsidian-900/50 border border-obsidian-700 rounded-lg text-center">
            <p className="text-obsidian-500 text-sm mb-2">Preview</p>
            <p className="text-obsidian-200">
              I promise that I will <strong>{milestone.title.toLowerCase()}</strong> before{' '}
              <strong>
                {new Date(`${formData.deadline}T${formData.deadlineTime}`).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </strong>.
            </p>
            <p className="text-obsidian-400 mt-2">
              If I don't, {formData.consequence || 'I accept the consequence.'}
            </p>
          </div>
        )}
    </div>
  );
}
