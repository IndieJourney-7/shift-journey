import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-obsidian-300 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full bg-obsidian-900 border border-obsidian-600 rounded-lg
          px-4 py-3 text-obsidian-100 placeholder-obsidian-500
          focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
          transition-all duration-200
          ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-obsidian-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full bg-obsidian-900 border border-obsidian-600 rounded-lg
          px-4 py-3 text-obsidian-100 placeholder-obsidian-500
          focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30
          transition-all duration-200 resize-none
          ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
