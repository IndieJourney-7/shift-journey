import React from 'react';
import { Shield, Flame, Target, Users, TrendingUp, Trophy, Crown, Sparkles, Award } from 'lucide-react';
import {
  getIntegrityTier,
  getNextTier,
  getPromisesToNextTier,
  getTierProgress,
  getUnlockedAchievements,
  getUserPercentile,
  getStreakFireLevel,
  RARITY_COLORS,
} from '../../lib/badgeDefinitions';

// Shield visual component based on 6-tier system
function TierShield({ tier, score, size = 'lg' }) {
  const sizeClasses = {
    sm: 'w-12 h-14',
    md: 'w-16 h-20',
    lg: 'w-24 h-28',
    xl: 'w-32 h-40',
  };

  // Dynamic styles based on tier
  const glowStyle = {
    boxShadow: `0 0 30px ${tier.color.glow}, 0 0 60px ${tier.color.glow}`,
  };

  const isLegendary = tier.shieldType === 'legendary';
  const isTrusted = tier.shieldType === 'trusted';
  const isShattered = tier.shieldType === 'shattered';
  const isMending = tier.shieldType === 'mending';

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <div
        className={`absolute ${sizeClasses[size]} rounded-full blur-xl opacity-50`}
        style={{ backgroundColor: tier.color.primary }}
      />

      {/* Sparkles for legendary */}
      {isLegendary && (
        <>
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-2 w-4 h-4 text-yellow-300 animate-pulse delay-150" />
        </>
      )}

      {/* Shield container */}
      <div
        className={`
          relative ${sizeClasses[size]} flex items-center justify-center
          ${(isLegendary || isTrusted) ? 'animate-pulse' : ''}
        `}
        style={(isLegendary || isTrusted) ? glowStyle : {}}
      >
        {/* Shield SVG */}
        <svg
          viewBox="0 0 100 120"
          className={`${sizeClasses[size]} drop-shadow-lg`}
          style={{ filter: isShattered ? 'saturate(0.5)' : isMending ? 'saturate(0.7)' : 'none' }}
        >
          <defs>
            <linearGradient id={`shieldGrad-${tier.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={tier.color.primary} />
              <stop offset="100%" stopColor={tier.color.secondary} />
            </linearGradient>
            <filter id="legendaryGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="goldGlow">
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
            stroke={tier.color.accent || tier.color.primary}
            strokeWidth="2"
            filter={isLegendary ? 'url(#legendaryGlow)' : isTrusted ? 'url(#goldGlow)' : 'none'}
          />

          {/* Crown for legendary */}
          {isLegendary && (
            <text x="50" y="45" textAnchor="middle" fontSize="24">👑</text>
          )}

          {/* Trophy for trusted */}
          {isTrusted && (
            <text x="50" y="45" textAnchor="middle" fontSize="20">🏆</text>
          )}

          {/* Checkmark for steady */}
          {tier.shieldType === 'steady' && (
            <g stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M30 55 L45 70 L70 40" />
            </g>
          )}

          {/* Arrow for rising */}
          {tier.shieldType === 'rising' && (
            <g fill="white" opacity="0.8">
              <path d="M50 35 L60 50 L55 50 L55 70 L45 70 L45 50 L40 50 Z" />
            </g>
          )}

          {/* Kintsugi lines for mending */}
          {isMending && (
            <g stroke="#d4af37" strokeWidth="2" fill="none" opacity="0.8">
              <path d="M45 30 L40 55 L35 75" />
              <path d="M40 55 L55 60" />
            </g>
          )}

          {/* Crack pattern for shattered */}
          {isShattered && (
            <g stroke="rgba(0,0,0,0.4)" strokeWidth="2" fill="none">
              <path d="M50 25 L45 50 L55 75 L50 95" />
              <path d="M25 40 L40 50 L30 65" />
              <path d="M75 45 L55 55 L65 70" />
            </g>
          )}

          {/* Score text */}
          <text
            x="50"
            y={isLegendary || isTrusted ? "80" : "70"}
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

// Achievement badge component
function AchievementBadge({ achievement, unlocked = false }) {
  return (
    <div
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        transition-all duration-300
        ${unlocked
          ? 'opacity-100'
          : 'opacity-40 grayscale'
        }
      `}
      style={{
        backgroundColor: unlocked ? achievement.color + '20' : 'rgba(107, 114, 128, 0.1)',
        color: unlocked ? achievement.color : '#6b7280',
        borderWidth: 1,
        borderColor: unlocked ? achievement.color + '40' : 'transparent',
      }}
      title={achievement.description}
    >
      <span>{achievement.icon}</span>
      <span>{achievement.name}</span>
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
  showAchievements = true,
  variant = 'full', // 'full', 'compact', 'minimal'
}) {
  const tier = getIntegrityTier(score);
  const nextTier = getNextTier(score);
  const promisesToNext = getPromisesToNextTier(score);
  const progress = getTierProgress(score);
  const percentile = getUserPercentile(score);
  const achievements = getUnlockedAchievements(stats);
  const streakFire = getStreakFireLevel(stats.currentStreak || 0);

  const {
    totalKept = 0,
    totalBroken = 0,
    currentStreak = 0,
    totalWitnesses = 0,
    goalsCompleted = 0,
  } = stats;

  // Rarity styling
  const rarityColors = RARITY_COLORS[tier.rarity] || RARITY_COLORS.Common;

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${tier.color.bg} ${tier.color.border} border`}>
        <span className="text-lg">{tier.emoji}</span>
        <span className={`font-semibold ${tier.color.text}`}>{tier.name}</span>
        <span className="text-obsidian-400">·</span>
        <span className="text-obsidian-300 font-mono">{score}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${rarityColors.bg} ${rarityColors.text}`}>
          {tier.rarity}
        </span>
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-obsidian-500 text-sm">Integrity Level</p>
              {percentile <= 15 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-medium">
                  Top {percentile}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tier.emoji}</span>
              <h2 className={`text-2xl font-bold ${tier.color.text}`}>
                {tier.name}
              </h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rarityColors.bg} ${rarityColors.text} border ${rarityColors.border}`}>
                {tier.rarity}
              </span>
            </div>
            <p className="text-obsidian-400 text-sm mt-1 italic">
              "{tier.tagline}"
            </p>
          </div>

          <TierShield tier={tier} score={score} size={variant === 'compact' ? 'md' : 'lg'} />
        </div>

        {/* Streak fire indicator */}
        {currentStreak > 0 && streakFire.level > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-lg">{streakFire.emoji}</span>
            <span style={{ color: streakFire.color }} className="font-semibold">
              {currentStreak} day streak
            </span>
            <span className="text-obsidian-500">· {streakFire.name}</span>
          </div>
        )}

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
          <div className="grid grid-cols-2 gap-4 p-4 bg-obsidian-800/50 rounded-xl mb-4">
            <StatItem
              icon={Target}
              value={totalKept}
              label="Kept"
              color="text-green-400"
            />
            <StatItem
              icon={Shield}
              value={totalBroken}
              label="Broken"
              color="text-red-400"
            />
            <StatItem
              icon={Flame}
              value={currentStreak}
              label="Streak"
              color="text-amber-400"
            />
            <StatItem
              icon={Trophy}
              value={goalsCompleted}
              label="Goals"
              color="text-purple-400"
            />
          </div>
        )}

        {/* Achievements section */}
        {showAchievements && achievements.length > 0 && variant === 'full' && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-obsidian-400">Achievements Unlocked ({achievements.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {achievements.slice(0, 6).map((ach) => (
                <AchievementBadge key={ach.id} achievement={ach} unlocked={true} />
              ))}
              {achievements.length > 6 && (
                <span className="text-xs text-obsidian-500 self-center ml-1">
                  +{achievements.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Username footer */}
        <div className="mt-4 pt-4 border-t border-obsidian-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-obsidian-700 flex items-center justify-center text-obsidian-300 font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-obsidian-300">{username}</span>
            {score >= 76 && (
              <span className="text-blue-400 text-sm">✓</span>
            )}
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
      <span className="text-sm">{tier.emoji}</span>
      <span className={`font-mono font-semibold ${tier.color.text}`}>{score}</span>
      <span className="text-obsidian-500 text-xs">{tier.name}</span>
    </div>
  );
}
