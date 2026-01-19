import React, { useEffect, useState } from 'react';

export default function IntegrityGauge({
  score = 0,
  maxScore = 100,
  size = 'lg',
  animated = true,
  showLabel = true,
  className = '',
}) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(score, Math.round(increment * step));
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(interval);
        setDisplayScore(score);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score, animated]);

  const getStatusLabel = () => {
    if (score >= 70) return { text: 'Trusted', color: 'text-green-400' };
    if (score >= 50) return { text: 'Building Trust', color: 'text-yellow-400' };
    return { text: 'Untrusted', color: 'text-red-400' };
  };

  const status = getStatusLabel();

  const sizeConfig = {
    sm: { width: 120, strokeWidth: 8, fontSize: 24 },
    md: { width: 160, strokeWidth: 10, fontSize: 32 },
    lg: { width: 200, strokeWidth: 12, fontSize: 48 },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const progress = (displayScore / maxScore) * circumference;

  // Get gradient colors based on score
  const getGradientColors = () => {
    if (score >= 70) return { start: '#22c55e', end: '#16a34a' };
    if (score >= 50) return { start: '#eab308', end: '#ca8a04' };
    return { start: '#c9a962', end: '#a0522d' };
  };

  const gradientColors = getGradientColors();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: config.width, height: config.width / 2 + 20 }}>
        <svg
          width={config.width}
          height={config.width / 2 + 20}
          viewBox={`0 0 ${config.width} ${config.width / 2 + 20}`}
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors.start} />
              <stop offset="100%" stopColor={gradientColors.end} />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            stroke="#252525"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            filter="url(#gaugeGlow)"
            style={{
              transition: animated ? 'stroke-dashoffset 1.5s ease-out' : 'none',
            }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * Math.PI;
            const innerRadius = radius - config.strokeWidth / 2 - 5;
            const outerRadius = radius - config.strokeWidth / 2 - 15;
            const x1 = config.width / 2 - Math.cos(angle) * innerRadius;
            const y1 = config.width / 2 - Math.sin(angle) * innerRadius;
            const x2 = config.width / 2 - Math.cos(angle) * outerRadius;
            const y2 = config.width / 2 - Math.sin(angle) * outerRadius;

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4a4a4a"
                strokeWidth={1}
              />
            );
          })}
        </svg>

        {/* Score display */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-2"
          style={{ top: '20%' }}
        >
          <span
            className={`font-bold text-obsidian-100 ${status.color}`}
            style={{
              fontSize: config.fontSize,
              textShadow: '0 0 20px rgba(201, 169, 98, 0.3)',
            }}
          >
            {displayScore}
          </span>
          <span className="text-obsidian-500 text-sm">/ {maxScore}</span>
        </div>
      </div>

      {showLabel && (
        <div className={`mt-2 text-lg font-medium ${status.color}`}>
          {status.text}
        </div>
      )}
    </div>
  );
}
