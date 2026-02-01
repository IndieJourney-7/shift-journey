import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Download, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { Button } from '../ui';
import {
  getIntegrityTier,
  getUnlockedAchievements,
  getUserPercentile,
  getStreakFireLevel,
} from '../../lib/badgeDefinitions';

/**
 * ENHANCED Shareable Badge Image Generator
 * 
 * Features:
 * - 6-tier visual system with unique shields
 * - Achievement badges display
 * - Rarity labels (Common, Uncommon, Rare, Epic, Legendary)
 * - "Top X%" percentile ranking
 * - Streak fire visualization
 * - Dopamine-triggering glow effects
 * 
 * Optimized for social media: 1200x630 (X/LinkedIn/Facebook)
 */

// Polyfill for ctx.roundRect
function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Get comprehensive tier info
const getTierInfo = (score) => {
  const tier = getIntegrityTier(score);
  return {
    name: tier.name,
    color: tier.color.primary,
    glowColor: tier.color.glow,
    rarity: tier.rarity,
    emoji: tier.emoji,
    tagline: tier.tagline,
    shieldType: tier.shieldType,
  };
};

// Rarity color mapping for canvas
const RARITY_CANVAS_COLORS = {
  Common: { bg: '#374151', text: '#9ca3af', border: '#4b5563' },
  Uncommon: { bg: '#065f46', text: '#34d399', border: '#059669' },
  Rare: { bg: '#1e3a5f', text: '#60a5fa', border: '#3b82f6' },
  Epic: { bg: '#4c1d95', text: '#a78bfa', border: '#8b5cf6' },
  Legendary: { bg: '#78350f', text: '#fbbf24', border: '#f59e0b' },
};

export default function ShareableBadgeImage({
  score = 0,
  username = 'User',
  stats = {},
  goal = null,
  milestone = null,
  onDownload,
  profileUrl = '',
}) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const tier = getTierInfo(score);
  const percentile = getUserPercentile(score);
  const achievements = getUnlockedAchievements(stats);
  const streakFire = getStreakFireLevel(stats.currentStreak || 0);

  const {
    totalKept = 0,
    totalBroken = 0,
    currentStreak = 0,
    goalsCompleted = 0,
  } = stats;

  // Calculate time remaining for milestone
  const getTimeRemaining = () => {
    if (!milestone?.promise?.deadline) return null;
    const deadline = new Date(milestone.promise.deadline);
    const now = new Date();
    const diff = deadline - now;

    if (diff <= 0) return { expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, expired: false };
  };

  // Draw shield on canvas with tier-specific visuals
  const drawShield = (ctx, x, y, size, score) => {
    ctx.save();

    const tier = getIntegrityTier(score);

    // Shield path function
    const shieldPath = () => {
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x + size / 2.2, y - size / 3);
      ctx.lineTo(x + size / 2.2, y + size / 6);
      ctx.quadraticCurveTo(x + size / 2.2, y + size / 2, x, y + size / 1.5);
      ctx.quadraticCurveTo(x - size / 2.2, y + size / 2, x - size / 2.2, y + size / 6);
      ctx.lineTo(x - size / 2.2, y - size / 3);
      ctx.closePath();
    };

    // Draw based on tier
    switch (tier.shieldType) {
      case 'shattered': {
        // SHATTERED: Broken fragments with faint red glow
        ctx.shadowColor = 'rgba(239, 68, 68, 0.3)';
        ctx.shadowBlur = 15;

        shieldPath();
        const gradient = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
        gradient.addColorStop(0, '#374151');
        gradient.addColorStop(0.5, '#1f2937');
        gradient.addColorStop(1, '#111827');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Multiple cracks
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 4;
        // Main crack
        ctx.beginPath();
        ctx.moveTo(x - 10, y - size / 3);
        ctx.lineTo(x - 25, y + 10);
        ctx.lineTo(x - 50, y + size / 4);
        ctx.stroke();
        // Secondary crack
        ctx.beginPath();
        ctx.moveTo(x + 5, y - size / 4);
        ctx.lineTo(x + 20, y + 15);
        ctx.lineTo(x + 10, y + size / 3);
        ctx.stroke();
        // Small crack
        ctx.beginPath();
        ctx.moveTo(x - 25, y + 10);
        ctx.lineTo(x + 15, y + 5);
        ctx.stroke();

        // Broken piece floating
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.moveTo(x + 60, y - 20);
        ctx.lineTo(x + 75, y - 10);
        ctx.lineTo(x + 70, y + 5);
        ctx.lineTo(x + 55, y - 5);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'mending': {
        // MENDING: Shield with visible repair lines (kintsugi style)
        ctx.shadowColor = 'rgba(107, 114, 128, 0.3)';
        ctx.shadowBlur = 18;

        shieldPath();
        const gradient = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
        gradient.addColorStop(0, '#4b5563');
        gradient.addColorStop(0.5, '#374151');
        gradient.addColorStop(1, '#1f2937');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Gold repair lines (kintsugi effect)
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x - 5, y - size / 3);
        ctx.lineTo(x - 20, y + 5);
        ctx.lineTo(x - 35, y + size / 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 20, y + 5);
        ctx.lineTo(x + 10, y + 10);
        ctx.stroke();
        break;
      }

      case 'rising': {
        // RISING: Half-filled shield showing progress
        ctx.shadowColor = 'rgba(148, 163, 184, 0.35)';
        ctx.shadowBlur = 22;

        ctx.save();
        shieldPath();
        ctx.clip();

        // Dark bottom half
        ctx.fillStyle = '#374151';
        ctx.fillRect(x - size, y - size, size * 2, size * 2);

        // Silver top gradient (progress indicator)
        const silverGrad = ctx.createLinearGradient(x, y - size / 2, x, y + size / 3);
        silverGrad.addColorStop(0, '#94a3b8');
        silverGrad.addColorStop(0.3, '#cbd5e1');
        silverGrad.addColorStop(0.7, '#64748b');
        silverGrad.addColorStop(1, '#475569');
        ctx.fillStyle = silverGrad;
        ctx.fillRect(x - size, y - size, size * 2, size);

        ctx.restore();

        ctx.shadowBlur = 0;
        shieldPath();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrow pointing up (progress symbol)
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(x, y - 25);
        ctx.lineTo(x + 15, y + 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.lineTo(x + 5, y + 25);
        ctx.lineTo(x - 5, y + 25);
        ctx.lineTo(x - 5, y + 5);
        ctx.lineTo(x - 15, y + 5);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'steady': {
        // STEADY: Full silver shield with polish
        ctx.shadowColor = 'rgba(192, 192, 192, 0.45)';
        ctx.shadowBlur = 28;

        shieldPath();
        const silverGrad = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
        silverGrad.addColorStop(0, '#e2e8f0');
        silverGrad.addColorStop(0.2, '#f1f5f9');
        silverGrad.addColorStop(0.5, '#e2e8f0');
        silverGrad.addColorStop(0.8, '#cbd5e1');
        silverGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = silverGrad;
        ctx.fill();

        // Second glow layer
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 15;
        ctx.fill();

        ctx.shadowBlur = 0;

        // Shine highlight
        ctx.save();
        shieldPath();
        ctx.clip();
        const shineGrad = ctx.createRadialGradient(x - 30, y - 40, 0, x, y, size);
        shineGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
        shineGrad.addColorStop(0.3, 'rgba(255,255,255,0.3)');
        shineGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = shineGrad;
        ctx.fill();
        ctx.restore();

        shieldPath();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Checkmark symbol
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 20, y);
        ctx.lineTo(x - 5, y + 15);
        ctx.lineTo(x + 25, y - 15);
        ctx.stroke();
        break;
      }

      case 'trusted': {
        // TRUSTED: Golden shield with radiant glow
        ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
        ctx.shadowBlur = 35;

        shieldPath();
        const goldGrad = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
        goldGrad.addColorStop(0, '#fcd34d');
        goldGrad.addColorStop(0.2, '#fbbf24');
        goldGrad.addColorStop(0.4, '#fef3c7');
        goldGrad.addColorStop(0.6, '#f59e0b');
        goldGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = goldGrad;
        ctx.fill();

        // Inner warm glow
        ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        ctx.shadowBlur = 20;
        ctx.fill();

        ctx.shadowBlur = 0;

        // Premium shine
        ctx.save();
        shieldPath();
        ctx.clip();
        const shineGrad = ctx.createRadialGradient(x - 25, y - 35, 0, x, y, size);
        shineGrad.addColorStop(0, 'rgba(255,255,255,0.85)');
        shineGrad.addColorStop(0.35, 'rgba(255,255,255,0.25)');
        shineGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = shineGrad;
        ctx.fill();
        ctx.restore();

        shieldPath();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Trophy symbol
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 50px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏆', x, y);
        break;
      }

      case 'legendary': {
        // LEGENDARY: Radiant golden shield with particle effects
        // Outer intense glow
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 50;

        shieldPath();
        const legendGrad = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
        legendGrad.addColorStop(0, '#fef08a');
        legendGrad.addColorStop(0.15, '#fde047');
        legendGrad.addColorStop(0.3, '#facc15');
        legendGrad.addColorStop(0.5, '#fef9c3');
        legendGrad.addColorStop(0.7, '#fde047');
        legendGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = legendGrad;
        ctx.fill();

        // Multi-layer glow for "legendary" effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
        ctx.shadowBlur = 45;
        ctx.fill();

        ctx.shadowBlur = 0;

        // Brilliant shine
        ctx.save();
        shieldPath();
        ctx.clip();
        const shineGrad = ctx.createRadialGradient(x - 20, y - 30, 0, x, y, size);
        shineGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        shineGrad.addColorStop(0.3, 'rgba(255,255,255,0.4)');
        shineGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = shineGrad;
        ctx.fill();
        ctx.restore();

        // Sparkle particles around shield
        const sparkles = [
          { x: x - 80, y: y - 60, size: 8 },
          { x: x + 85, y: y - 45, size: 10 },
          { x: x - 70, y: y + 50, size: 7 },
          { x: x + 75, y: y + 55, size: 9 },
          { x: x + 5, y: y - 90, size: 11 },
        ];
        sparkles.forEach(s => {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          // 4-point star
          ctx.moveTo(s.x, s.y - s.size);
          ctx.lineTo(s.x + s.size * 0.3, s.y - s.size * 0.3);
          ctx.lineTo(s.x + s.size, s.y);
          ctx.lineTo(s.x + s.size * 0.3, s.y + s.size * 0.3);
          ctx.lineTo(s.x, s.y + s.size);
          ctx.lineTo(s.x - s.size * 0.3, s.y + s.size * 0.3);
          ctx.lineTo(s.x - s.size, s.y);
          ctx.lineTo(s.x - s.size * 0.3, s.y - s.size * 0.3);
          ctx.closePath();
          ctx.fill();
        });
        ctx.shadowBlur = 0;

        shieldPath();
        ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Crown symbol
        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 55px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👑', x, y);
        break;
      }

      default: {
        // Fallback basic shield
        shieldPath();
        ctx.fillStyle = '#6b7280';
        ctx.fill();
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  // Draw the badge on canvas
  const drawBadge = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 630;

    canvas.width = width;
    canvas.height = height;

    // Background - premium dark gradient
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
    bgGradient.addColorStop(0, '#1a1a22');
    bgGradient.addColorStop(0.5, '#0f0f14');
    bgGradient.addColorStop(1, '#08080c');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle noise texture
    ctx.fillStyle = 'rgba(255,255,255,0.012)';
    for (let i = 0; i < 600; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    // Ambient glow behind shield (tier-colored)
    const ambientGlow = ctx.createRadialGradient(200, 280, 0, 200, 280, 200);
    ambientGlow.addColorStop(0, tier.glowColor || 'rgba(255,215,0,0.15)');
    ambientGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 80, 400, 400);

    // Border with tier color gradient
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 15, 15, width - 30, height - 30, 20);
    ctx.stroke();

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    drawRoundRect(ctx, 25, 25, width - 50, height - 50, 15);
    ctx.stroke();

    // =====================================================
    // LEFT SIDE: Shield Badge with Glow
    // =====================================================

    const shieldX = 200;
    const shieldY = 260;
    const shieldSize = 180;

    drawShield(ctx, shieldX, shieldY, shieldSize, score);

    // Tier label with emoji
    ctx.fillStyle = tier.color;
    ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${tier.emoji} ${tier.name}`, shieldX, shieldY + shieldSize / 2 + 55);

    // Rarity badge below tier
    const rarityColors = RARITY_CANVAS_COLORS[tier.rarity] || RARITY_CANVAS_COLORS.Common;
    ctx.fillStyle = rarityColors.bg;
    drawRoundRect(ctx, shieldX - 50, shieldY + shieldSize / 2 + 68, 100, 28, 14);
    ctx.fill();
    ctx.strokeStyle = rarityColors.border;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = rarityColors.text;
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(tier.rarity.toUpperCase(), shieldX, shieldY + shieldSize / 2 + 87);

    // Score and percentile
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Integrity: ${score}/100`, shieldX, shieldY + shieldSize / 2 + 125);
    
    // Top X% indicator (if good ranking)
    if (percentile <= 15) {
      ctx.fillStyle = tier.color;
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Top ${percentile}%`, shieldX, shieldY + shieldSize / 2 + 148);
    }

    // =====================================================
    // RIGHT SIDE: User Info
    // =====================================================

    const textX = 420;
    let currentY = 75;

    // Username with verified-style checkmark for high scores
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    const displayName = `@${username}`;
    ctx.fillText(displayName, textX, currentY);
    
    // Verified checkmark for Trusted/Legendary
    if (score >= 76) {
      const nameWidth = ctx.measureText(displayName).width;
      ctx.fillStyle = '#3b82f6';
      ctx.font = '28px system-ui';
      ctx.fillText('✓', textX + nameWidth + 12, currentY);
    }
    currentY += 35;

    // Tagline
    ctx.fillStyle = tier.color;
    ctx.font = 'italic 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(`"${tier.tagline}"`, textX, currentY);
    currentY += 50;

    // Goal
    if (goal?.title) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.fillText('CURRENT GOAL', textX, currentY);
      currentY += 28;

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      const goalTitle = goal.title.length > 40 ? goal.title.substring(0, 40) + '...' : goal.title;
      ctx.fillText(goalTitle, textX, currentY);
      currentY += 45;
    }

    // Milestone
    if (milestone?.title) {
      ctx.fillStyle = tier.color;
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('🔒 LOCKED PROMISE', textX, currentY);
      currentY += 28;

      ctx.fillStyle = '#ffffff';
      ctx.font = '22px system-ui, -apple-system, sans-serif';
      const promiseTitle = milestone.title.length > 35 ? milestone.title.substring(0, 35) + '...' : milestone.title;
      ctx.fillText(`"${promiseTitle}"`, textX, currentY);
      currentY += 38;

      const timeRemaining = getTimeRemaining();
      if (timeRemaining && !timeRemaining.expired) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        let timeStr = timeRemaining.days > 0
          ? `⏱ ${timeRemaining.days}d ${timeRemaining.hours}h remaining`
          : `⏱ ${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
        ctx.fillText(timeStr, textX, currentY);
        currentY += 35;
      }
    }

    // =====================================================
    // STATS ROW
    // =====================================================
    
    currentY = 390;
    const statsData = [
      { value: totalKept, label: 'Kept', color: '#22c55e', emoji: '✓' },
      { value: totalBroken, label: 'Broken', color: '#ef4444', emoji: '✗' },
      { value: currentStreak, label: 'Streak', color: streakFire.color, emoji: streakFire.emoji || '🔥' },
      { value: goalsCompleted, label: 'Goals', color: '#a855f7', emoji: '🎯' },
    ];

    const statBoxWidth = 105;
    const statBoxHeight = 80;
    const statGap = 12;

    statsData.forEach((stat, i) => {
      const boxX = textX + i * (statBoxWidth + statGap);

      // Box background
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      drawRoundRect(ctx, boxX, currentY, statBoxWidth, statBoxHeight, 10);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Value
      ctx.fillStyle = stat.color;
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value.toString(), boxX + statBoxWidth / 2, currentY + 38);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(stat.label, boxX + statBoxWidth / 2, currentY + 62);
    });

    // =====================================================
    // ACHIEVEMENTS ROW (show up to 5 unlocked)
    // =====================================================
    
    if (achievements.length > 0) {
      const achievementY = 495;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ACHIEVEMENTS', textX, achievementY);

      const displayAchievements = achievements.slice(0, 5);
      const achSize = 40;
      const achGap = 8;

      displayAchievements.forEach((ach, i) => {
        const achX = textX + i * (achSize + achGap);
        const achY = achievementY + 15;

        // Achievement circle
        ctx.fillStyle = ach.color + '30'; // 30 = ~19% opacity
        ctx.beginPath();
        ctx.arc(achX + achSize / 2, achY + achSize / 2, achSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = ach.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Achievement icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ach.icon, achX + achSize / 2, achY + achSize / 2);
      });

      // Show "+X more" if there are more achievements
      if (achievements.length > 5) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${achievements.length - 5} more`, textX + 5 * (achSize + achGap) + 10, achievementY + 15 + achSize / 2);
      }
    }

    // =====================================================
    // FOOTER
    // =====================================================
    
    // Brand
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('shiftascent.com', width - 50, height - 55);

    // Tagline
    ctx.fillStyle = tier.color;
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('My word is my identity', width - 50, height - 30);

    // CTA on left side of footer
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Track your promises • Build your integrity', 50, height - 40);

    return canvas;
  }, [score, username, stats, tier, goal, milestone, achievements, percentile, streakFire]);

  // Download
  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = drawBadge();
      if (!canvas) return;

      const link = document.createElement('a');
      link.download = `shift-ascent-${tier.name.toLowerCase()}-${tier.rarity.toLowerCase()}-badge.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      onDownload?.();
    } finally {
      setGenerating(false);
    }
  }, [drawBadge, score, onDownload, tier]);

  // Copy link
  const handleCopyLink = useCallback(async () => {
    const url = profileUrl || `${window.location.origin}/p/${username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [profileUrl, username]);

  // Render preview
  useEffect(() => {
    drawBadge();
  }, [drawBadge]);

  return (
    <div className="space-y-4">
      {/* Rarity indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tier.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-white">{tier.name} Tier</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              tier.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' :
              tier.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-400' :
              tier.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-400' :
              tier.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {tier.rarity}
            </span>
          </div>
        </div>
        {percentile <= 15 && (
          <div className="text-right">
            <div className="text-sm text-obsidian-400">You're in the</div>
            <div className="text-xl font-bold text-gold-400">Top {percentile}%</div>
          </div>
        )}
      </div>

      {/* Canvas preview */}
      <div className="relative rounded-xl overflow-hidden border-2 border-obsidian-700 shadow-lg shadow-black/50">
        <canvas ref={canvasRef} className="w-full h-auto" style={{ maxHeight: '315px' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent pointer-events-none" />
        
        {/* Sparkle overlay for high tiers */}
        {score >= 76 && (
          <div className="absolute top-3 right-3 animate-pulse">
            <Sparkles className="w-6 h-6 text-gold-400" />
          </div>
        )}
      </div>

      {/* Achievements preview */}
      {achievements.length > 0 && (
        <div className="p-3 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
          <div className="text-xs text-obsidian-400 mb-2">ACHIEVEMENTS UNLOCKED</div>
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 6).map((ach) => (
              <div
                key={ach.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: ach.color + '20', color: ach.color }}
                title={ach.description}
              >
                <span>{ach.icon}</span>
                <span className="font-medium">{ach.name}</span>
              </div>
            ))}
            {achievements.length > 6 && (
              <span className="text-obsidian-500 text-xs self-center">
                +{achievements.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="gold" icon={Download} onClick={handleDownload} loading={generating} className="flex-1">
          Download Badge
        </Button>
        <Button variant="secondary" icon={copied ? Check : Copy} onClick={handleCopyLink}>
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>

      {/* Share prompt */}
      <div className="p-4 bg-gradient-to-r from-gold-500/10 to-amber-500/10 rounded-lg border border-gold-500/20">
        <div className="flex items-start gap-3">
          <Share2 className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-obsidian-200 font-medium mb-1">Share your integrity badge</p>
            <p className="text-obsidian-400">
              Show the world that you keep your word. Download and post on X, LinkedIn, or Instagram. 
              {score >= 76 && ' Your gold badge proves you\'re someone people can count on! ✨'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
