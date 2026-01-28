import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Send,
  ChevronRight,
  ChevronLeft,
  Camera,
  Upload,
  X,
  CheckCircle,
  Heart
} from 'lucide-react';
import { Modal, Button } from '../ui';

// Step indicator
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`
            h-2 rounded-full transition-all duration-300
            ${i === currentStep ? 'w-8 bg-gold-500' : 'w-2'}
            ${i < currentStep ? 'bg-green-500' : i > currentStep ? 'bg-obsidian-700' : ''}
          `}
        />
      ))}
    </div>
  );
}

// Character counter
function CharCounter({ text, min }) {
  const count = text.trim().length;
  const valid = count >= min;
  return (
    <div className="flex justify-end mt-1">
      <span className={`text-xs ${valid ? 'text-green-500' : 'text-obsidian-500'}`}>
        {count}/{min} min
      </span>
    </div>
  );
}

export default function ReflectionModal({ isOpen, onClose, milestone, onSubmit }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    whyFailed: '',
    whatWasInControl: '',
    whatWillChange: '',
    consequenceProof: null,
    consequenceProofType: null, // 'image' or 'text'
    consequenceProofText: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const hasConsequence = milestone?.promise?.consequence;
  const totalSteps = hasConsequence ? 4 : 3;

  // Reset form when milestone changes
  useEffect(() => {
    if (milestone) {
      setStep(0);
      setFormData({
        whyFailed: '',
        whatWasInControl: '',
        whatWillChange: '',
        consequenceProof: null,
        consequenceProofType: null,
        consequenceProofText: '',
      });
      setErrors({});
    }
  }, [milestone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, consequenceProof: 'Please upload an image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, consequenceProof: 'Image must be less than 5MB' }));
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        consequenceProof: reader.result,
        consequenceProofType: 'image',
      }));
      setErrors(prev => ({ ...prev, consequenceProof: null }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      consequenceProof: null,
      consequenceProofType: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateStep = () => {
    const newErrors = {};
    const minLength = 20; // Require more thoughtful responses

    if (step === 0) {
      if (!formData.whyFailed.trim() || formData.whyFailed.trim().length < minLength) {
        newErrors.whyFailed = `Be more specific - at least ${minLength} characters`;
      }
    } else if (step === 1) {
      if (!formData.whatWasInControl.trim() || formData.whatWasInControl.trim().length < minLength) {
        newErrors.whatWasInControl = `Take ownership - at least ${minLength} characters`;
      }
    } else if (step === 2 && hasConsequence) {
      // Consequence proof step
      if (!formData.consequenceProof && !formData.consequenceProofText.trim()) {
        newErrors.consequenceProof = 'You must provide proof of your consequence';
      }
      if (formData.consequenceProofType === 'text' && formData.consequenceProofText.trim().length < 20) {
        newErrors.consequenceProofText = 'Please describe what you did in detail';
      }
    } else if ((step === 2 && !hasConsequence) || (step === 3 && hasConsequence)) {
      if (!formData.whatWillChange.trim() || formData.whatWillChange.trim().length < minLength) {
        newErrors.whatWillChange = `Be specific about your plan - at least ${minLength} characters`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(milestone.id, {
        whyFailed: formData.whyFailed.trim(),
        whatWasInControl: formData.whatWasInControl.trim(),
        whatWillChange: formData.whatWillChange.trim(),
        consequenceProof: formData.consequenceProof || formData.consequenceProofText.trim() || null,
        consequenceProofType: formData.consequenceProofType || (formData.consequenceProofText.trim() ? 'text' : null),
      });
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === totalSteps - 1;

  if (!milestone) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showClose={true}
      title=""
      size="md"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 border-2 border-red-500/50 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-obsidian-100">
          You Broke Your Promise
        </h2>
        <p className="text-obsidian-400 text-sm mt-2">
          This moment of reflection will make you stronger.
        </p>
      </div>

      <StepIndicator currentStep={step} totalSteps={totalSteps} />

      {/* Milestone Info */}
      <div className="p-3 bg-obsidian-900/50 border border-obsidian-700 rounded-lg mb-6">
        <p className="text-obsidian-500 text-xs mb-1">Broken Promise</p>
        <p className="text-red-400/90 italic">"{milestone.promise?.text || milestone.title}"</p>
        {milestone.autoExpired && (
          <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
            <span>⏰</span> Deadline expired automatically
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 0: Why did you fail? */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-obsidian-200 mb-3">
                Why did you fail?
              </label>
              <p className="text-obsidian-500 text-sm mb-3">
                Be brutally honest. No excuses, no blame. What really happened?
              </p>
              <textarea
                name="whyFailed"
                placeholder="I failed because..."
                value={formData.whyFailed}
                onChange={handleChange}
                rows={5}
                className={`
                  w-full bg-obsidian-900 border rounded-lg px-4 py-3
                  text-obsidian-100 placeholder-obsidian-500
                  focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
                  resize-none
                  ${errors.whyFailed ? 'border-red-500/50' : 'border-obsidian-600'}
                `}
              />
              {errors.whyFailed && (
                <p className="text-red-400 text-sm mt-1">{errors.whyFailed}</p>
              )}
              <CharCounter text={formData.whyFailed} min={20} />
            </div>
          </div>
        )}

        {/* Step 1: What was in your control? */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-obsidian-200 mb-3">
                What was in your control?
              </label>
              <p className="text-obsidian-500 text-sm mb-3">
                Don't blame circumstances. What could YOU have done differently?
              </p>
              <textarea
                name="whatWasInControl"
                placeholder="I could have..."
                value={formData.whatWasInControl}
                onChange={handleChange}
                rows={5}
                className={`
                  w-full bg-obsidian-900 border rounded-lg px-4 py-3
                  text-obsidian-100 placeholder-obsidian-500
                  focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
                  resize-none
                  ${errors.whatWasInControl ? 'border-red-500/50' : 'border-obsidian-600'}
                `}
              />
              {errors.whatWasInControl && (
                <p className="text-red-400 text-sm mt-1">{errors.whatWasInControl}</p>
              )}
              <CharCounter text={formData.whatWasInControl} min={20} />
            </div>
          </div>
        )}

        {/* Step 2 (if consequence): Prove your consequence */}
        {step === 2 && hasConsequence && (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-obsidian-200 mb-3">
                Honor Your Consequence
              </label>
              <div className="p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg mb-4">
                <p className="text-amber-300 text-sm font-medium">You committed to:</p>
                <p className="text-amber-400 mt-1">"{milestone.promise.consequence}"</p>
              </div>
              <p className="text-obsidian-500 text-sm mb-4">
                Upload proof that you followed through on your consequence.
                This builds real integrity.
              </p>

              {/* Proof type selector */}
              {!formData.consequenceProof && !formData.consequenceProofType && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-obsidian-600 rounded-lg hover:border-gold-500/50 transition-colors text-center"
                  >
                    <Camera className="w-8 h-8 text-obsidian-400 mx-auto mb-2" />
                    <p className="text-obsidian-300 text-sm font-medium">Upload Photo</p>
                    <p className="text-obsidian-500 text-xs mt-1">Screenshot or photo proof</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, consequenceProofType: 'text' }))}
                    className="p-4 border-2 border-dashed border-obsidian-600 rounded-lg hover:border-gold-500/50 transition-colors text-center"
                  >
                    <Upload className="w-8 h-8 text-obsidian-400 mx-auto mb-2" />
                    <p className="text-obsidian-300 text-sm font-medium">Describe It</p>
                    <p className="text-obsidian-500 text-xs mt-1">Written description</p>
                  </button>
                </div>
              )}

              {/* Image preview */}
              {formData.consequenceProof && formData.consequenceProofType === 'image' && (
                <div className="relative mb-4">
                  <img
                    src={formData.consequenceProof}
                    alt="Consequence proof"
                    className="w-full max-h-64 object-contain rounded-lg border border-obsidian-600"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-900/80 rounded-full hover:bg-red-800 transition-colors"
                  >
                    <X className="w-4 h-4 text-red-300" />
                  </button>
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Photo uploaded
                  </div>
                </div>
              )}

              {/* Text proof */}
              {formData.consequenceProofType === 'text' && (
                <div>
                  <textarea
                    name="consequenceProofText"
                    placeholder="Describe what you did to honor your consequence..."
                    value={formData.consequenceProofText}
                    onChange={handleChange}
                    rows={4}
                    className={`
                      w-full bg-obsidian-900 border rounded-lg px-4 py-3
                      text-obsidian-100 placeholder-obsidian-500
                      focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
                      resize-none
                      ${errors.consequenceProofText ? 'border-red-500/50' : 'border-obsidian-600'}
                    `}
                  />
                  {errors.consequenceProofText && (
                    <p className="text-red-400 text-sm mt-1">{errors.consequenceProofText}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, consequenceProofType: null, consequenceProofText: '' }))}
                    className="text-obsidian-500 text-sm mt-2 hover:text-obsidian-300"
                  >
                    ← Upload photo instead
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {errors.consequenceProof && (
                <p className="text-red-400 text-sm mt-2">{errors.consequenceProof}</p>
              )}
            </div>
          </div>
        )}

        {/* Last Step: What will you change? */}
        {((step === 2 && !hasConsequence) || (step === 3 && hasConsequence)) && (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-obsidian-200 mb-3">
                What will you do differently?
              </label>
              <p className="text-obsidian-500 text-sm mb-3">
                Commit to a specific change. Make it measurable. Make it real.
              </p>
              <textarea
                name="whatWillChange"
                placeholder="Next time, I will..."
                value={formData.whatWillChange}
                onChange={handleChange}
                rows={5}
                className={`
                  w-full bg-obsidian-900 border rounded-lg px-4 py-3
                  text-obsidian-100 placeholder-obsidian-500
                  focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
                  resize-none
                  ${errors.whatWillChange ? 'border-red-500/50' : 'border-obsidian-600'}
                `}
              />
              {errors.whatWillChange && (
                <p className="text-red-400 text-sm mt-1">{errors.whatWillChange}</p>
              )}
              <CharCounter text={formData.whatWillChange} min={20} />
            </div>

            {/* Encouragement */}
            <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg text-center">
              <Heart className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 text-sm font-medium">
                Failure is not the opposite of success—it's part of it.
              </p>
              <p className="text-green-400/70 text-xs mt-1">
                This reflection makes you stronger than those who never try.
              </p>
            </div>
          </div>
        )}

        {errors.submit && (
          <p className="text-red-400 text-sm text-center mt-4">{errors.submit}</p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-obsidian-700">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              icon={ChevronLeft}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}

          <Button
            type={isLastStep ? 'submit' : 'button'}
            variant={isLastStep ? 'gold' : 'primary'}
            onClick={isLastStep ? undefined : handleNext}
            icon={isLastStep ? Send : ChevronRight}
            iconPosition="right"
            className="flex-1"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isLastStep ? 'Complete Reflection' : 'Continue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
