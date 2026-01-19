import React from 'react';

const variants = {
  default: 'bg-obsidian-800/80 border-obsidian-600/50',
  elevated: 'bg-obsidian-800/90 border-obsidian-500/50 shadow-lg',
  highlighted: 'bg-obsidian-800/80 border-gold-500/30 shadow-glow-sm',
  broken: 'bg-obsidian-800/60 border-broken-500/50 cracked',
  locked: 'bg-obsidian-800/80 border-obsidian-500/50',
};

export default function Card({
  children,
  variant = 'default',
  className = '',
  padding = 'md',
  ...props
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        relative rounded-lg border backdrop-blur-sm
        ${variants[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-obsidian-100 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-obsidian-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-obsidian-700 ${className}`}>
      {children}
    </div>
  );
}
