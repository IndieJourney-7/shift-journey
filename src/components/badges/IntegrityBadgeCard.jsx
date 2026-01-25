import React from 'react';
import { Shield, Flame, Target, Users, TrendingUp } from 'lucide-react';
import { getIntegrityTier, getNextTier, getPromisesToNextTier, getTierProgress } from '../../lib/badgeDefinitions';

// Shield visual component based on tier
function TierShield({ tier, score, size = 'lg' }) {
  const sizeClasses = {
    sm: 'w-12 h-14',
    md: 'w-16 h-20',
    lg: 'w-24 h-28',
    xl: 'w-32 h-40',
  };

  const scoreSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  // Dynamic styles based on tier
  const glowStyle = {
    boxShadow: `0 0 30px ${tier.color.glow}, 0 0 60px ${tier.color.glow}`,
  };

  const isUnbreakable = tier.id === 'unbreakable';
  const isCracked = tier.id === 'rebuilding' || tier.id === 'awakening';

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <div
        className={`absolute ${sizeClasses[size]} rounded-full blur-xl opacity-50`}
        style={{ backgroundColor: tier.color.primary }}
      />

      {/* Shield container */}
      <div
        className={`
          relative ${sizeClasses[size]} flex items-center justify-center
          ${isUnbreakable ? 'animate-pulse' : ''}
        `}
        style={isUnbreakable ? glowStyle : {}}
      >
        {/* Shield SVG */}
        <svg
          viewBox="0 0 100 120"
          className={`${sizeClasses[size]} drop-shadow-lg`}
          style={{ filter: isCracked ? 'saturate(0.7)' : 'none' }}
        >
          <defs>
            <linearGradient id={`shieldGrad-${tier.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={tier.color.primary} />
              <stop offset="100%" stopColor={tier.color.secondary} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Shield shape */}
          <path
            d="M50 5 L90 20 L90 60 Q90 100 50 115 Q10 100 10 60 L10 20 Z"
            fill={`url(#shieldGrad-${tier.id})`}
            stroke={tier.color.primary}
            strokeWidth="2"
            filter={isUnbreakable ? 'url(#glow)' : 'none'}
          />

          {/* Diamond for Unbreakable */}
          {isUnbreakable && (
            <polygon
              points="50,25 60,45 50,65 40,45"
              fill="white"
              fillOpacity="0.3"
            />
          )}

          {/* Crack pattern for low tiers */}
          {isCracked && (
            <g stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none">
              <path d="M50 30 L55 50 L45 70 L50 90" />
              <path d="M30 40 L40 45 L35 55" />
              <path d="M70 45 L60 55 L65 65" />
            </g>
          )}

          {/* Score text */}
          <text
            x="50"
            y="70"
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="24"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            {score}
          </text>
        </svg>
      </div>
    </div>
  );
}

// Stats row component
function StatItem({ icon: Icon, value, label, color = 'text-obsidian-300' }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-obsidian-100 font-semibold">{value}</span>
      <span className="text-obsidian-500 text-sm">{label}</span>
    </div>
  );
}

// Main badge card component
export default function IntegrityBadgeCard({
  score = 0,
  stats = {},
  username = 'User',
  showProgress = true,
  showStats = true,
  variant = 'full', // 'full', 'compact', 'minimal'
}) {
  const tier = getIntegrityTier(score);
  const nextTier = getNextTier(score);
  const promisesToNext = getPromisesToNextTier(score);
  const progress = getTierProgress(score);

  const {
    totalKept = 0,
    totalBroken = 0,
    currentStreak = 0,
    totalWitnesses = 0,
  } = stats;

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${tier.color.bg} ${tier.color.border} border`}>
        <Shield className={`w-4 h-4 ${tier.color.text}`} />
        <span className={`font-semibold ${tier.color.text}`}>{tier.name}</span>
        <span className="text-obsidian-400">·</span>
        <span className="text-obsidian-300 font-mono">{score}</span>
      </div>
    );
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-obsidian-900 via-obsidian-850 to-obsidian-900
      border ${tier.color.border}
      p-6
    `}>
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${tier.color.primary}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-obsidian-500 text-sm mb-1">Integrity Level</p>
            <h2 className={`text-2xl font-bold ${tier.color.text}`}>
              {tier.name}
            </h2>
            <p className="text-obsidian-400 text-sm mt-1 italic">
              "{tier.tagline}"
            </p>
          </div>

          <TierShield tier={tier} score={score} size={variant === 'compact' ? 'md' : 'lg'} />
        </div>

        {/* Progress to next tier */}
        {showProgress && nextTier && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-obsidian-400">Progress to {nextTier.name}</span>
              <span className="text-obsidian-300">{promisesToNext} promises needed</span>
            </div>
            <div className="h-2 bg-obsidian-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(to right, ${tier.color.secondary}, ${tier.color.primary})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Stats grid */}
        {showStats && variant === 'full' && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-obsidian-800/50 rounded-xl">
            <StatItem
              icon={Target}
              value={totalKept}
              label="Kept"
              color="text-green-400"
            />
            <StatItem
              icon={Flame}
              value={currentStreak}
              label="Streak"
              color="text-amber-400"
            />
            <StatItem
              icon={Shield}
              value={totalBroken}
              label="Broken"
              color="text-red-400"
            />
            <StatItem
              icon={Users}
              value={totalWitnesses}
              label="Witnesses"
              color="text-blue-400"
            />
          </div>
        )}

        {/* Username footer */}
        <div className="mt-6 pt-4 border-t border-obsidian-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-obsidian-700 flex items-center justify-center text-obsidian-300 font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-obsidian-300">{username}</span>
          </div>
          <div className="flex items-center gap-1 text-obsidian-500 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Shift Ascent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact inline version for headers/cards
export function IntegrityBadgeInline({ score, className = '' }) {
  const tier = getIntegrityTier(score);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Shield className={`w-4 h-4 ${tier.color.text}`} />
      <span className={`font-mono font-semibold ${tier.color.text}`}>{score}</span>
      <span className="text-obsidian-500 text-xs">{tier.name}</span>
    </div>
  );
}
