import React from 'react';

const variants = {
  default: 'bg-obsidian-700 text-obsidian-200 border-obsidian-600',
  locked: 'bg-obsidian-700 text-obsidian-200 border-obsidian-500',
  completed: 'bg-green-900/30 text-green-400 border-green-700/50',
  broken: 'bg-red-900/30 text-red-400 border-red-700/50',
  pending: 'bg-obsidian-800 text-obsidian-400 border-obsidian-600',
  gold: 'bg-gold-500/10 text-gold-400 border-gold-500/30',
  untrusted: 'bg-red-900/20 text-red-400 border-red-800/30',
  trusted: 'bg-green-900/20 text-green-400 border-green-800/30',
  building: 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30',
  warning: 'bg-amber-900/20 text-amber-400 border-amber-800/30',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
}
