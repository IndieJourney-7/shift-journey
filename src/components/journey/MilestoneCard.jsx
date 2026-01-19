import React from 'react';
import { Lock, Check, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '../ui';

export default function MilestoneCard({
  milestone,
  isActive = false,
  showTimer = false,
  timeRemaining = null,
  onClick,
  className = '',
}) {
  const getStatusConfig = () => {
    switch (milestone.status) {
      case 'completed':
        return {
          borderClass: 'border-obsidian-600',
          bgClass: 'bg-obsidian-800/60',
          icon: Check,
          iconColor: 'text-obsidian-400',
          badge: { text: 'Completed', variant: 'completed' },
        };
      case 'locked':
        return {
          borderClass: 'border-gold-500/50',
          bgClass: 'bg-obsidian-800/80',
          icon: Lock,
          iconColor: 'text-gold-500',
          badge: { text: 'LOCKED', variant: 'locked' },
          glow: true,
        };
      case 'broken':
        return {
          borderClass: 'border-red-800/50',
          bgClass: 'bg-obsidian-800/60',
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          badge: { text: 'PROMISE BROKEN', variant: 'broken' },
          cracked: true,
        };
      default:
        return {
          borderClass: 'border-obsidian-600/50',
          bgClass: 'bg-obsidian-800/50',
          icon: Lock,
          iconColor: 'text-obsidian-500',
          badge: { text: 'Pending', variant: 'pending' },
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const formatTime = (time) => {
    if (!time) return '--:--:--';
    const { hours, minutes, seconds } = time;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg border p-4 transition-all duration-200
        ${config.borderClass} ${config.bgClass}
        ${config.glow ? 'shadow-glow-sm' : ''}
        ${onClick ? 'cursor-pointer hover:border-obsidian-500' : ''}
        ${config.cracked ? 'cracked' : ''}
        ${className}
      `}
    >
      {/* Crack overlay for broken */}
      {config.cracked && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <svg className="absolute w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path
              d="M100 0 L95 30 L80 50 L100 55 L90 75 L100 100"
              stroke="#4a4a4a"
              strokeWidth="1"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M100 55 L120 60 L140 50"
              stroke="#4a4a4a"
              strokeWidth="0.8"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-obsidian-400 text-sm">
              Milestone {milestone.number}
            </span>
            {showTimer && timeRemaining && (
              <span className="text-gold-500 text-sm font-mono">
                {formatTime(timeRemaining)}
              </span>
            )}
          </div>

          <h4 className="text-obsidian-100 font-medium mb-2">
            {milestone.title}
          </h4>

          {milestone.promise && milestone.status === 'locked' && (
            <p className="text-obsidian-400 text-sm mb-2">
              Due: {new Date(milestone.promise.deadline).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          )}

          {milestone.reason && (
            <p className="text-obsidian-500 text-sm italic">
              Reason: "{milestone.reason}"
            </p>
          )}

          <Badge variant={config.badge.variant} size="sm" className="mt-2">
            {config.badge.text}
          </Badge>
        </div>

        <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
      </div>
    </div>
  );
}
