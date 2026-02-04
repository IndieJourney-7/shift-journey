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
 * Shows their custom heading, quote text with styling, and optional image
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
              Create a personal reminder of why you started this journey. It will help keep you motivated!
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const {
    heading,
    quoteText,
    bgColor,
    textColor,
    fontStyle,
    imageUrl,
  } = motivation;

  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-xl blur-sm opacity-50"
        style={{ backgroundColor: bgColor || '#1a1a2e' }}
      />

      <Card
        variant="default"
        padding="md"
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

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image (if provided) */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden border border-obsidian-600/50">
                <img
                  src={imageUrl}
                  alt="Motivation"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Heading */}
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: textColor || '#fcd34d' }} />
              <h3
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: textColor || '#fcd34d' }}
              >
                {heading || 'My Why'}
              </h3>
            </div>

            {/* Quote text */}
            <p
              className={`text-sm sm:text-base leading-relaxed ${fontStyleClasses[fontStyle] || 'italic'}`}
              style={{ color: textColor || '#fcd34d' }}
            >
              "{quoteText}"
            </p>
          </div>
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

  return (
    <div
      className={`p-3 rounded-lg relative group cursor-pointer ${className}`}
      style={{ backgroundColor: motivation.bgColor || '#1a1a2e' }}
      onClick={onEdit}
    >
      <p
        className={`text-xs leading-relaxed line-clamp-2 ${fontStyleClasses[motivation.fontStyle] || 'italic'}`}
        style={{ color: motivation.textColor || '#fcd34d' }}
      >
        "{motivation.quoteText}"
      </p>
      <Edit3 className="absolute top-2 right-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
             style={{ color: motivation.textColor || '#fcd34d' }} />
    </div>
  );
}
