import React from 'react';
import { Lock } from 'lucide-react';

export default function LockAnimation({ isLocking = false, className = '' }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`
          relative w-32 h-32 flex items-center justify-center
          ${isLocking ? 'animate-pulse' : ''}
        `}
      >
        {/* Outer glow ring */}
        <div
          className={`
            absolute inset-0 rounded-full
            bg-gradient-to-r from-gold-500/10 to-gold-400/10
            ${isLocking ? 'animate-ping' : ''}
          `}
          style={{ animationDuration: '2s' }}
        />

        {/* Inner glow */}
        <div
          className="absolute inset-4 rounded-full bg-gradient-radial from-gold-500/20 to-transparent"
        />

        {/* Lock icon container */}
        <div
          className={`
            relative z-10 w-20 h-20 rounded-full
            bg-obsidian-800 border-2 border-obsidian-600
            flex items-center justify-center
            shadow-lg
            ${isLocking ? 'border-gold-500/50 shadow-glow' : ''}
          `}
        >
          <Lock
            className={`
              w-10 h-10
              ${isLocking ? 'text-gold-500' : 'text-obsidian-400'}
              transition-colors duration-500
            `}
          />
        </div>

        {/* Rotating ring (when locking) */}
        {isLocking && (
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: '3s' }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#lockGradient)"
              strokeWidth="1"
              strokeDasharray="20 80"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a962" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {isLocking && (
        <p className="mt-4 text-obsidian-400 text-lg animate-pulse">
          Locking Promise...
        </p>
      )}
    </div>
  );
}
