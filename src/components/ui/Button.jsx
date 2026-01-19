import React from 'react';

const variants = {
  primary: 'bg-obsidian-700 hover:bg-obsidian-600 border border-obsidian-500 text-obsidian-100',
  secondary: 'bg-transparent hover:bg-obsidian-800 border border-obsidian-500 text-obsidian-200',
  gold: 'bg-gradient-to-r from-gold-500/20 to-gold-400/20 hover:from-gold-500/30 hover:to-gold-400/30 border border-gold-500/50 text-gold-400',
  danger: 'bg-red-900/20 hover:bg-red-900/30 border border-red-800/50 text-red-400',
  ghost: 'bg-transparent hover:bg-obsidian-800 text-obsidian-300 hover:text-obsidian-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 ml-2" />
      )}

      {/* Shine effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
    </button>
  );
}
