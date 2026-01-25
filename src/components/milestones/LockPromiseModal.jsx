import React, { useState, useEffect } from 'react';
import { Lock, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Modal, Button, Textarea } from '../ui';

export default function LockPromiseModal({ isOpen, onClose, milestone, onLock }) {
  const [formData, setFormData] = useState({
    promiseText: '',
    deadlineDate: '',
    deadlineTime: '',
    consequence: '',
  });
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  // Reset form when milestone changes
  useEffect(() => {
    if (milestone) {
      setFormData({
        promiseText: `I promise that I will ${milestone.title.toLowerCase()}`,
        deadlineDate: '',
        deadlineTime: '',
        consequence: '',
      });
      setErrors({});
      setConfirmed(false);
    }
  }, [milestone]);

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

    if (!formData.deadlineDate) {
      newErrors.deadlineDate = 'Deadline date is required';
    }

    if (!formData.deadlineTime) {
      newErrors.deadlineTime = 'Deadline time is required';
    }

    // Check if deadline is in the future
    if (formData.deadlineDate && formData.deadlineTime) {
      const deadline = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`);
      if (deadline <= new Date()) {
        newErrors.deadlineDate = 'Deadline must be in the future';
      }
    }

    if (!confirmed) {
      newErrors.confirmed = 'You must confirm to lock the promise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const deadline = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`);

    onLock(milestone.id, {
      text: formData.promiseText,
      deadline: deadline.toISOString(),
      consequence: formData.consequence.trim() || null,
    });

    onClose();
  };

  if (!milestone) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Format preview deadline
  const getPreviewDeadline = () => {
    if (!formData.deadlineDate || !formData.deadlineTime) return null;
    const deadline = new Date(`${formData.deadlineDate}T${formData.deadlineTime}`);
    return deadline.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lock Your Promise" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-amber-300 font-medium">This action is irreversible</p>
            <p className="text-amber-400/80 mt-1">
              Once locked, you cannot edit, delete, or skip this milestone.
              You must complete it before the deadline or mark it as broken.
            </p>
          </div>
        </div>

        {/* Milestone Info */}
        <div className="p-3 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
          <p className="text-obsidian-500 text-xs mb-1">Locking Milestone</p>
          <p className="text-obsidian-200 font-medium">{milestone.title}</p>
        </div>

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

        {/* Deadline Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-obsidian-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1.5" />
              Deadline Date
            </label>
            <input
              type="date"
              name="deadlineDate"
              value={formData.deadlineDate}
              onChange={handleChange}
              min={today}
              className={`
                w-full bg-obsidian-900 border rounded-lg px-4 py-3 text-obsidian-100
                focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
                ${errors.deadlineDate ? 'border-red-500/50' : 'border-obsidian-600'}
              `}
            />
            {errors.deadlineDate && (
              <p className="mt-1.5 text-sm text-red-400">{errors.deadlineDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-obsidian-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1.5" />
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
              <p className="mt-1.5 text-sm text-red-400">{errors.deadlineTime}</p>
            )}
          </div>
        </div>

        {/* Consequence (Optional) */}
        <div>
          <label className="block text-sm font-medium text-obsidian-300 mb-2">
            Consequence <span className="text-obsidian-500">(Optional)</span>
          </label>
          <p className="text-obsidian-500 text-xs mb-2">
            What will you commit to if you fail? This creates personal accountability.
          </p>
          <textarea
            name="consequence"
            value={formData.consequence}
            onChange={handleChange}
            placeholder="e.g., I will donate $50 to charity, I will skip my next cheat meal..."
            rows={2}
            className="w-full bg-obsidian-900 border border-obsidian-600 rounded-lg px-4 py-3 text-obsidian-100 placeholder-obsidian-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 resize-none"
          />
        </div>

        {/* Preview */}
        {formData.deadlineDate && formData.deadlineTime && (
          <div className="p-4 bg-obsidian-900/50 border border-obsidian-700 rounded-lg text-center">
            <p className="text-obsidian-500 text-xs mb-2">Preview</p>
            <p className="text-obsidian-200">
              "{formData.promiseText}" by{' '}
              <span className="text-amber-400 font-medium">{getPreviewDeadline()}</span>
            </p>
            {formData.consequence && (
              <p className="text-obsidian-400 text-sm mt-2">
                If I fail: {formData.consequence}
              </p>
            )}
          </div>
        )}

        {/* Confirmation Checkbox */}
        <div className="pt-2">
          <label className={`flex items-start gap-3 cursor-pointer ${errors.confirmed ? 'text-red-400' : ''}`}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                if (errors.confirmed) {
                  setErrors(prev => ({ ...prev, confirmed: null }));
                }
              }}
              className="mt-1 w-4 h-4 rounded border-obsidian-600 bg-obsidian-900 text-gold-500 focus:ring-gold-500/30"
            />
            <span className="text-obsidian-300 text-sm">
              I understand that this promise is <strong className="text-obsidian-100">irreversible</strong>.
              I commit to completing this milestone by the deadline.
            </span>
          </label>
          {errors.confirmed && (
            <p className="mt-1.5 ml-7 text-sm text-red-400">{errors.confirmed}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-obsidian-700">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="gold" icon={Lock} className="flex-1">
            Lock Promise
          </Button>
        </div>
      </form>
    </Modal>
  );
}
