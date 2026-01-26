import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Download, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '../ui';

/**
 * Generates a shareable badge image using Canvas
 * Optimized for social media: 1200x630 (X/LinkedIn/Facebook)
 *
 * Draws SVG-style badges with white glow effects
 */

// Get tier info based on score
const getTierInfo = (score) => {
  if (score <= 30) {
    return { name: 'Unreliable', color: '#6b7280', glowColor: 'rgba(255,255,255,0.15)' };
  }
  if (score <= 70) {
    return { name: 'Inconsistent', color: '#9ca3af', glowColor: 'rgba(255,255,255,0.25)' };
  }
  return { name: 'Reliable', color: '#ffd700', glowColor: 'rgba(255,255,255,0.7)' };
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

  // Draw shield on canvas with glow
  const drawShield = (ctx, x, y, size, score) => {
    ctx.save();

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

    if (score <= 30) {
      // UNRELIABLE: Cracked dark shield with subtle white glow
      ctx.shadowColor = 'rgba(255,255,255,0.3)';
      ctx.shadowBlur = 15;

      shieldPath();
      const gradient = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
      gradient.addColorStop(0, '#4a4a4a');
      gradient.addColorStop(0.5, '#3a3a3a');
      gradient.addColorStop(1, '#2a2a2a');
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#5a5a5a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cracks
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y - size / 3);
      ctx.lineTo(x - 15, y + 10);
      ctx.lineTo(x - 40, y + size / 4);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - 15, y + 10);
      ctx.lineTo(x + 25, y + 20);
      ctx.stroke();

    } else if (score <= 70) {
      // INCONSISTENT: Half silver/dark with white glow
      ctx.shadowColor = 'rgba(255,255,255,0.4)';
      ctx.shadowBlur = 20;

      // Save for clipping
      ctx.save();
      shieldPath();
      ctx.clip();

      // Dark left half
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x - size, y - size, size, size * 2);

      // Silver right half
      const silverGrad = ctx.createLinearGradient(x, y - size / 2, x + size / 2, y + size / 2);
      silverGrad.addColorStop(0, '#e0e0e0');
      silverGrad.addColorStop(0.3, '#f5f5f5');
      silverGrad.addColorStop(0.7, '#c0c0c0');
      silverGrad.addColorStop(1, '#a0a0a0');
      ctx.fillStyle = silverGrad;
      ctx.fillRect(x, y - size, size, size * 2);

      ctx.restore();

      ctx.shadowBlur = 0;
      shieldPath();
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Shine on silver
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 30, y - size / 4);
      ctx.lineTo(x + 50, y - size / 6);
      ctx.lineTo(x + 50, y + 20);
      ctx.stroke();

    } else {
      // RELIABLE: Golden with bright white/gold glow
      // Outer white glow
      ctx.shadowColor = 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = 40;

      shieldPath();
      const goldGrad = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
      goldGrad.addColorStop(0, '#ffd700');
      goldGrad.addColorStop(0.2, '#ffec8b');
      goldGrad.addColorStop(0.4, '#fff8dc');
      goldGrad.addColorStop(0.6, '#ffd700');
      goldGrad.addColorStop(1, '#b8860b');
      ctx.fillStyle = goldGrad;
      ctx.fill();

      // Inner gold glow layer
      ctx.shadowColor = 'rgba(255,215,0,0.6)';
      ctx.shadowBlur = 25;
      ctx.fill();

      ctx.shadowBlur = 0;

      // Shine highlight
      ctx.save();
      shieldPath();
      ctx.clip();
      const shineGrad = ctx.createRadialGradient(x - 20, y - 30, 0, x, y, size);
      shineGrad.addColorStop(0, 'rgba(255,255,255,0.8)');
      shineGrad.addColorStop(0.4, 'rgba(255,255,255,0.2)');
      shineGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shineGrad;
      ctx.fill();
      ctx.restore();

      // Gold border
      shieldPath();
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Top highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 40, y - size / 3 + 10);
      ctx.quadraticCurveTo(x, y - size / 2 - 5, x + 40, y - size / 3 + 10);
      ctx.stroke();
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

    // Background - dark gradient with subtle texture
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f0f14');
    bgGradient.addColorStop(0.5, '#1a1a22');
    bgGradient.addColorStop(1, '#0f0f14');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle noise
    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    for (let i = 0; i < 800; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    // Border
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // =====================================================
    // LEFT SIDE: Shield Badge with Glow
    // =====================================================

    const shieldX = 200;
    const shieldY = 280;
    const shieldSize = 200;

    drawShield(ctx, shieldX, shieldY, shieldSize, score);

    // Tier label
    ctx.fillStyle = tier.color;
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tier.name, shieldX, shieldY + shieldSize / 2 + 55);

    // Score
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Integrity: ${score} / 100`, shieldX, shieldY + shieldSize / 2 + 90);

    // =====================================================
    // RIGHT SIDE: User Info
    // =====================================================

    const textX = 450;
    let currentY = 100;

    // Username
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`@${username}`, textX, currentY);
    currentY += 60;

    // Goal
    if (goal?.title) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillText('CURRENT GOAL', textX, currentY);
      currentY += 32;

      ctx.fillStyle = '#ffffff';
      ctx.font = '26px system-ui, -apple-system, sans-serif';
      const goalTitle = goal.title.length > 35 ? goal.title.substring(0, 35) + '...' : goal.title;
      ctx.fillText(goalTitle, textX, currentY);
      currentY += 55;
    }

    // Milestone
    if (milestone?.title) {
      ctx.fillStyle = tier.color;
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('LOCKED PROMISE', textX, currentY);
      currentY += 32;

      ctx.fillStyle = '#ffffff';
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      const promiseTitle = milestone.title.length > 30 ? milestone.title.substring(0, 30) + '...' : milestone.title;
      ctx.fillText(`"${promiseTitle}"`, textX, currentY);
      currentY += 45;

      const timeRemaining = getTimeRemaining();
      if (timeRemaining && !timeRemaining.expired) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        let timeStr = timeRemaining.days > 0
          ? `⏱ ${timeRemaining.days}d ${timeRemaining.hours}h remaining`
          : `⏱ ${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
        ctx.fillText(timeStr, textX, currentY);
      }
    }

    // Stats
    currentY = 420;
    const statsData = [
      { value: totalKept, label: 'Kept', color: '#22c55e' },
      { value: totalBroken, label: 'Broken', color: '#ef4444' },
      { value: currentStreak, label: 'Streak', color: '#f59e0b' },
      { value: goalsCompleted, label: 'Goals', color: '#a855f7' },
    ];

    const statBoxWidth = 110;
    const statBoxHeight = 85;
    const statGap = 15;

    statsData.forEach((stat, i) => {
      const boxX = textX + i * (statBoxWidth + statGap);

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(boxX, currentY, statBoxWidth, statBoxHeight, 12);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = stat.color;
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value.toString(), boxX + statBoxWidth / 2, currentY + 42);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.fillText(stat.label, boxX + statBoxWidth / 2, currentY + 68);
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('shiftascent.com', width - 60, height - 55);

    ctx.fillStyle = tier.color;
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('My word is my identity', width - 60, height - 28);

    return canvas;
  }, [score, username, stats, tier, goal, milestone]);

  // Download
  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = drawBadge();
      if (!canvas) return;

      const link = document.createElement('a');
      const tierName = score <= 30 ? 'unreliable' : score <= 70 ? 'inconsistent' : 'reliable';
      link.download = `shift-ascent-${tierName}-badge.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      onDownload?.();
    } finally {
      setGenerating(false);
    }
  }, [drawBadge, score, onDownload]);

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
      <div className="relative rounded-xl overflow-hidden border border-obsidian-700">
        <canvas ref={canvasRef} className="w-full h-auto" style={{ maxHeight: '315px' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="flex gap-3">
        <Button variant="gold" icon={Download} onClick={handleDownload} loading={generating} className="flex-1">
          Download Badge
        </Button>
        <Button variant="secondary" icon={copied ? Check : Copy} onClick={handleCopyLink}>
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>

      <div className="p-4 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
        <div className="flex items-start gap-3">
          <Share2 className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-obsidian-200 font-medium mb-1">Share your integrity badge</p>
            <p className="text-obsidian-400">
              Download the image and post it on X, LinkedIn, or anywhere you want to show
              that you're someone who keeps their word.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
