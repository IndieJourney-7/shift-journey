import React from 'react';
import { Sparkles, Edit3, ImageIcon } from 'lucide-react';
import { Card } from '../ui';

// Font style class mapping
const fontStyleClasses = {
  'normal': 'font-normal not-italic',
  'italic': 'font-normal italic',
  'bold': 'font-bold not-italic',
  'bold-italic': 'font-bold italic',
};

/**
 * PersonalMotivation - Displays user's personal "why" reminder
 * Either a centered quote OR a vision board image
 */
export default function PersonalMotivation({
  motivation,
  onEdit,
  showEditButton = true,
  className = '',
}) {
  if (!motivation) {
    // Empty state - prompt to add motivation
    return (
      <div className={`relative group ${className}`}>
        <Card
          variant="default"
          padding="md"
          className="border-dashed border-obsidian-600 hover:border-gold-500/30 cursor-pointer transition-all duration-300"
          onClick={onEdit}
        >
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 mb-3 rounded-full bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gold-400" />
            </div>
            <h3 className="text-obsidian-200 font-medium mb-1">Add Your "Why"</h3>
            <p className="text-obsidian-500 text-sm max-w-xs">
              Add a personal quote or vision board image to remind yourself why you started this journey.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const {
    displayType,
    heading,
    quoteText,
    bgColor,
    textColor,
    fontStyle,
    imageUrl,
    imageCaption,
  } = motivation;

  // Vision Board Image Display
  if (displayType === 'image' && imageUrl) {
    return (
      <div className={`relative group ${className}`}>
        <Card variant="default" padding="none" className="relative overflow-hidden">
          {/* Edit button */}
          {showEditButton && onEdit && (
            <button
              onClick={onEdit}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-obsidian-900/70 border border-obsidian-600/50 
                         text-obsidian-400 hover:text-gold-400 hover:border-gold-500/30 
                         opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Edit your motivation"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Vision Board Image */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full">
            <img
              src={imageUrl}
              alt="Vision Board"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* Gradient overlay for caption */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/80 via-transparent to-transparent" />
            
            {/* Caption and label */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-gold-400" />
                <span className="text-gold-400 text-xs font-semibold uppercase tracking-wide">
                  My Vision Board
                </span>
              </div>
              {imageCaption && (
                <p className="text-obsidian-200 text-sm sm:text-base">
                  {imageCaption}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Quote Display (Centered)
  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-xl blur-sm opacity-30"
        style={{ backgroundColor: bgColor || '#1a1a2e' }}
      />

      <Card
        variant="default"
        padding="lg"
        className="relative overflow-hidden"
        style={{ backgroundColor: bgColor || '#1a1a2e' }}
      >
        {/* Edit button */}
        {showEditButton && onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-3 right-3 p-2 rounded-lg bg-obsidian-900/50 border border-obsidian-600/50 
                       text-obsidian-400 hover:text-gold-400 hover:border-gold-500/30 
                       opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            title="Edit your motivation"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        {/* Centered Quote Content */}
        <div className="text-center py-4 sm:py-6">
          {/* Heading */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: textColor || '#fcd34d' }} />
            <h3
              className="text-xs sm:text-sm font-semibold uppercase tracking-widest"
              style={{ color: textColor || '#fcd34d' }}
            >
              {heading || 'My Why'}
            </h3>
            <Sparkles className="w-4 h-4" style={{ color: textColor || '#fcd34d' }} />
          </div>

          {/* Quote text */}
          <p
            className={`text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto ${fontStyleClasses[fontStyle] || 'italic'}`}
            style={{ color: textColor || '#fcd34d' }}
          >
            "{quoteText}"
          </p>
        </div>
      </Card>
    </div>
  );
}

/**
 * PersonalMotivationCompact - Smaller version for sidebars etc.
 */
export function PersonalMotivationCompact({
  motivation,
  onEdit,
  className = '',
}) {
  if (!motivation) {
    return (
      <button
        onClick={onEdit}
        className={`w-full p-3 rounded-lg border border-dashed border-obsidian-600 
                    hover:border-gold-500/30 text-center transition-colors ${className}`}
      >
        <Sparkles className="w-4 h-4 text-gold-400 mx-auto mb-1" />
        <p className="text-obsidian-500 text-xs">Add your "why"</p>
      </button>
    );
  }

  if (motivation.displayType === 'image' && motivation.imageUrl) {
    return (
      <div
        className={`rounded-lg overflow-hidden relative group cursor-pointer ${className}`}
        onClick={onEdit}
      >
        <img
          src={motivation.imageUrl}
          alt="Vision"
          className="w-full h-16 object-cover"
        />
        <Edit3 className="absolute top-1 right-1 w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-lg relative group cursor-pointer ${className}`}
      style={{ backgroundColor: motivation.bgColor || '#1a1a2e' }}
      onClick={onEdit}
    >
      <p
        className={`text-xs leading-relaxed line-clamp-2 text-center ${fontStyleClasses[motivation.fontStyle] || 'italic'}`}
        style={{ color: motivation.textColor || '#fcd34d' }}
      >
        "{motivation.quoteText}"
      </p>
      <Edit3 className="absolute top-2 right-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
             style={{ color: motivation.textColor || '#fcd34d' }} />
    </div>
  );
}
