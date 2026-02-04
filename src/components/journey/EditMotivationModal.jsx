import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Palette,
  Type,
  ImagePlus,
  X,
  Check,
  Trash2,
  Quote,
  Image,
} from 'lucide-react';
import { Modal, Button, Input, Textarea } from '../ui';

// Predefined color palettes
const bgColorPalettes = [
  { name: 'Obsidian', color: '#1a1a2e' },
  { name: 'Deep Navy', color: '#0f172a' },
  { name: 'Forest', color: '#14532d' },
  { name: 'Burgundy', color: '#450a0a' },
  { name: 'Royal Purple', color: '#3b0764' },
  { name: 'Midnight Blue', color: '#172554' },
  { name: 'Charcoal', color: '#18181b' },
  { name: 'Deep Teal', color: '#134e4a' },
];

const textColorPalettes = [
  { name: 'Gold', color: '#fcd34d' },
  { name: 'White', color: '#ffffff' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Rose', color: '#fb7185' },
  { name: 'Emerald', color: '#34d399' },
  { name: 'Sky', color: '#38bdf8' },
  { name: 'Lavender', color: '#c4b5fd' },
  { name: 'Cream', color: '#fef3c7' },
];

// Font style options
const fontStyles = [
  { value: 'normal', label: 'Normal', className: '' },
  { value: 'italic', label: 'Italic', className: 'italic' },
  { value: 'bold', label: 'Bold', className: 'font-bold' },
  { value: 'bold-italic', label: 'Bold Italic', className: 'font-bold italic' },
];

// Font style class mapping for preview
const fontStyleClasses = {
  'normal': 'font-normal not-italic',
  'italic': 'font-normal italic',
  'bold': 'font-bold not-italic',
  'bold-italic': 'font-bold italic',
};

export default function EditMotivationModal({
  isOpen,
  onClose,
  motivation,
  onSave,
  onDelete,
}) {
  const fileInputRef = useRef(null);

  // Form state
  const [displayType, setDisplayType] = useState('quote'); // 'quote' or 'image'
  const [formData, setFormData] = useState({
    // Quote fields
    heading: 'My Why',
    quoteText: '',
    bgColor: '#1a1a2e',
    textColor: '#fcd34d',
    fontStyle: 'italic',
    // Image fields
    imageUrl: null,
    imageCaption: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form with existing motivation data
  useEffect(() => {
    if (motivation) {
      setDisplayType(motivation.displayType || 'quote');
      setFormData({
        heading: motivation.heading || 'My Why',
        quoteText: motivation.quoteText || '',
        bgColor: motivation.bgColor || '#1a1a2e',
        textColor: motivation.textColor || '#fcd34d',
        fontStyle: motivation.fontStyle || 'italic',
        imageUrl: motivation.imageUrl || null,
        imageCaption: motivation.imageCaption || '',
      });
    } else {
      // Reset to defaults for new motivation
      setDisplayType('quote');
      setFormData({
        heading: 'My Why',
        quoteText: '',
        bgColor: '#1a1a2e',
        textColor: '#fcd34d',
        fontStyle: 'italic',
        imageUrl: null,
        imageCaption: '',
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [motivation, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        imageUrl: reader.result,
      }));
      setErrors(prev => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (displayType === 'quote') {
      if (!formData.quoteText.trim()) {
        newErrors.quoteText = 'Please enter your motivation quote';
      } else if (formData.quoteText.trim().length < 10) {
        newErrors.quoteText = 'Your motivation should be at least 10 characters';
      }
      if (!formData.heading.trim()) {
        newErrors.heading = 'Please enter a heading';
      }
    } else {
      // Image type
      if (!formData.imageUrl) {
        newErrors.image = 'Please upload a vision board image';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        displayType,
        ...formData,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your Personal Motivation"
      size="lg"
      showClose={true}
    >
      <form onSubmit={handleSubmit}>
        {/* Header description */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-obsidian-900/50 rounded-lg border border-obsidian-700">
          <Sparkles className="w-5 h-5 text-gold-400 flex-shrink-0" />
          <p className="text-obsidian-400 text-sm">
            This is your personal "why" - a reminder of what motivated you to start this journey.
          </p>
        </div>

        {/* Type Selection Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setDisplayType('quote')}
            className={`
              flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200
              ${displayType === 'quote'
                ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                : 'border-obsidian-600 hover:border-obsidian-500 text-obsidian-400'
              }
            `}
          >
            <Quote className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium text-sm">Quote</p>
              <p className="text-xs opacity-70">Centered motivational text</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setDisplayType('image')}
            className={`
              flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200
              ${displayType === 'image'
                ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                : 'border-obsidian-600 hover:border-obsidian-500 text-obsidian-400'
              }
            `}
          >
            <Image className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium text-sm">Vision Board</p>
              <p className="text-xs opacity-70">Inspiring image</p>
            </div>
          </button>
        </div>

        {/* QUOTE TYPE FORM */}
        {displayType === 'quote' && (
          <>
            {/* Live Preview */}
            <div className="mb-6">
              <label className="block text-obsidian-300 text-sm font-medium mb-2">Preview</label>
              <div
                className="p-6 rounded-lg border border-obsidian-600/50 text-center"
                style={{ backgroundColor: formData.bgColor }}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" style={{ color: formData.textColor }} />
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: formData.textColor }}
                  >
                    {formData.heading || 'My Why'}
                  </span>
                  <Sparkles className="w-4 h-4" style={{ color: formData.textColor }} />
                </div>
                <p
                  className={`text-lg leading-relaxed ${fontStyleClasses[formData.fontStyle]}`}
                  style={{ color: formData.textColor }}
                >
                  "{formData.quoteText || 'Your motivation quote will appear here...'}"
                </p>
              </div>
            </div>

            {/* Heading Input */}
            <div className="mb-4">
              <Input
                label="Heading"
                placeholder="e.g., My Why, Remember This, Never Forget"
                value={formData.heading}
                onChange={(e) => handleChange('heading', e.target.value)}
                error={errors.heading}
              />
            </div>

            {/* Quote Text */}
            <div className="mb-4">
              <Textarea
                label="Your Motivation Quote"
                placeholder="Write what inspired you to start this journey... Why is this goal important to you?"
                value={formData.quoteText}
                onChange={(e) => handleChange('quoteText', e.target.value)}
                error={errors.quoteText}
                rows={3}
              />
            </div>

            {/* Styling Section */}
            <div className="mb-6 p-4 bg-obsidian-900/30 rounded-lg border border-obsidian-700">
              <h4 className="text-obsidian-200 text-sm font-medium mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-gold-400" />
                Style Options
              </h4>

              {/* Background Color */}
              <div className="mb-4">
                <label className="block text-obsidian-400 text-xs mb-2">Background Color</label>
                <div className="flex flex-wrap gap-2">
                  {bgColorPalettes.map((palette) => (
                    <button
                      key={palette.color}
                      type="button"
                      onClick={() => handleChange('bgColor', palette.color)}
                      className={`
                        w-8 h-8 rounded-lg border-2 transition-all duration-200
                        ${formData.bgColor === palette.color
                          ? 'border-gold-500 scale-110'
                          : 'border-obsidian-600 hover:border-obsidian-400'
                        }
                      `}
                      style={{ backgroundColor: palette.color }}
                      title={palette.name}
                    />
                  ))}
                  <label className="relative">
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => handleChange('bgColor', e.target.value)}
                      className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded-lg border-2 border-obsidian-600 hover:border-obsidian-400 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 flex items-center justify-center cursor-pointer">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Text Color */}
              <div className="mb-4">
                <label className="block text-obsidian-400 text-xs mb-2">Text Color</label>
                <div className="flex flex-wrap gap-2">
                  {textColorPalettes.map((palette) => (
                    <button
                      key={palette.color}
                      type="button"
                      onClick={() => handleChange('textColor', palette.color)}
                      className={`
                        w-8 h-8 rounded-lg border-2 transition-all duration-200
                        ${formData.textColor === palette.color
                          ? 'border-gold-500 scale-110'
                          : 'border-obsidian-600 hover:border-obsidian-400'
                        }
                      `}
                      style={{ backgroundColor: palette.color }}
                      title={palette.name}
                    />
                  ))}
                  <label className="relative">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => handleChange('textColor', e.target.value)}
                      className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded-lg border-2 border-obsidian-600 hover:border-obsidian-400 bg-gradient-to-br from-yellow-500 via-pink-500 to-cyan-500 flex items-center justify-center cursor-pointer">
                      <span className="text-obsidian-900 text-xs font-bold">+</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Font Style */}
              <div>
                <label className="text-obsidian-400 text-xs mb-2 flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  Font Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {fontStyles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => handleChange('fontStyle', style.value)}
                      className={`
                        px-3 py-2 rounded-lg border-2 transition-all duration-200 text-sm
                        ${formData.fontStyle === style.value
                          ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                          : 'border-obsidian-600 hover:border-obsidian-400 text-obsidian-300'
                        }
                        ${style.className}
                      `}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* IMAGE TYPE FORM */}
        {displayType === 'image' && (
          <>
            {/* Preview */}
            {formData.imageUrl && (
              <div className="mb-6">
                <label className="block text-obsidian-300 text-sm font-medium mb-2">Preview</label>
                <div className="relative rounded-lg overflow-hidden border border-obsidian-600/50">
                  <div className="aspect-[16/9]">
                    <img
                      src={formData.imageUrl}
                      alt="Vision Board Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Image className="w-4 h-4 text-gold-400" />
                        <span className="text-gold-400 text-xs font-semibold uppercase tracking-wide">
                          My Vision Board
                        </span>
                      </div>
                      {formData.imageCaption && (
                        <p className="text-obsidian-200 text-sm">{formData.imageCaption}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="mb-4">
              <label className="text-obsidian-300 text-sm font-medium mb-2 flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-gold-400" />
                Vision Board Image
              </label>
              <p className="text-obsidian-500 text-xs mb-3">
                Upload an image that inspires you - a vision board, a photo that motivates you, or anything meaningful to your goal.
              </p>

              {formData.imageUrl ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="Vision Board"
                      className="w-20 h-20 object-cover rounded-lg border border-obsidian-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-obsidian-400 text-sm">
                    <p>Image uploaded</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gold-400 hover:text-gold-300 text-xs underline"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-obsidian-600 rounded-lg hover:border-gold-500/30 cursor-pointer transition-colors">
                  <ImagePlus className="w-10 h-10 text-obsidian-500" />
                  <div className="text-center">
                    <span className="text-obsidian-300 text-sm font-medium">Click to upload your vision board</span>
                    <p className="text-obsidian-500 text-xs mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
              {errors.image && (
                <p className="mt-2 text-red-400 text-sm">{errors.image}</p>
              )}
            </div>

            {/* Image Caption */}
            <div className="mb-6">
              <Input
                label="Caption (Optional)"
                placeholder="A short description of your vision..."
                value={formData.imageCaption}
                onChange={(e) => handleChange('imageCaption', e.target.value)}
              />
            </div>
          </>
        )}

        {/* Error message */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{errors.submit}</p>
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && motivation && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-400 text-sm text-center mb-3">
              Are you sure you want to delete your motivation?
            </p>
            <div className="flex justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {motivation && !showDeleteConfirm && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              icon={Trash2}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            icon={Check}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
