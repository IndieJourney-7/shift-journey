import React, { useState, useEffect } from 'react';

export default function CountdownTimer({
  deadline,
  onExpire,
  size = 'lg',
  showLabels = true,
  className = '',
}) {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target - now;

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true });
        onExpire?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, expired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  const formatDigit = (num) => String(num).padStart(2, '0');

  if (timeRemaining.expired) {
    return (
      <div className={`text-center ${className}`}>
        <div className={`font-mono font-bold text-red-500 ${sizeClasses[size]}`}>
          EXPIRED
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="text-center">
        <div
          className={`font-mono font-bold text-gold-400 tracking-wider ${sizeClasses[size]}`}
          style={{ textShadow: '0 0 20px rgba(201, 169, 98, 0.5)' }}
        >
          {formatDigit(timeRemaining.hours)}
        </div>
        {showLabels && (
          <div className="text-xs text-obsidian-500 uppercase tracking-wider mt-1">
            Hours
          </div>
        )}
      </div>

      <span className={`text-obsidian-500 ${sizeClasses[size]} font-light`}>:</span>

      <div className="text-center">
        <div
          className={`font-mono font-bold text-gold-400 tracking-wider ${sizeClasses[size]}`}
          style={{ textShadow: '0 0 20px rgba(201, 169, 98, 0.5)' }}
        >
          {formatDigit(timeRemaining.minutes)}
        </div>
        {showLabels && (
          <div className="text-xs text-obsidian-500 uppercase tracking-wider mt-1">
            Min
          </div>
        )}
      </div>

      <span className={`text-obsidian-500 ${sizeClasses[size]} font-light`}>:</span>

      <div className="text-center">
        <div
          className={`font-mono font-bold text-gold-400 tracking-wider ${sizeClasses[size]}`}
          style={{ textShadow: '0 0 20px rgba(201, 169, 98, 0.5)' }}
        >
          {formatDigit(timeRemaining.seconds)}
        </div>
        {showLabels && (
          <div className="text-xs text-obsidian-500 uppercase tracking-wider mt-1">
            Sec
          </div>
        )}
      </div>
    </div>
  );
}

export function CompactTimer({ deadline, className = '' }) {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target - now;

      if (diff <= 0) {
        setTime({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTime({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const format = (n) => String(n).padStart(2, '0');

  return (
    <span className={`font-mono text-gold-400 ${className}`}>
      {format(time.hours)}:{format(time.minutes)}:{format(time.seconds)}
    </span>
  );
}
