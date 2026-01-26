import React, { useState, useEffect, useCallback } from 'react';

const randomBetween = (min, max) => Math.random() * (max - min) + min;

// Firework spark piece
function SparkPiece({ style, onComplete }) {
  useEffect(() => {
    const removeTimer = setTimeout(() => {
      onComplete();
    }, style.duration);

    return () => clearTimeout(removeTimer);
  }, [style.duration, onComplete]);

  return (
    <div
      className="fixed pointer-events-none select-none z-[100]"
      style={{
        left: style.startX,
        top: style.startY,
        animation: `spark-burst ${style.duration}ms ease-out forwards`,
        '--end-x': `${style.endX}px`,
        '--end-y': `${style.endY}px`,
      }}
    >
      <div
        style={{
          width: `${style.size}px`,
          height: `${style.size}px`,
          borderRadius: '50%',
          background: style.color,
          boxShadow: `0 0 ${style.size * 2}px ${style.color}, 0 0 ${style.size * 4}px ${style.color}`,
        }}
      />
    </div>
  );
}

// Thread/streamer piece that falls from top
function ThreadPiece({ style, onComplete }) {
  useEffect(() => {
    const removeTimer = setTimeout(() => {
      onComplete();
    }, style.duration);

    return () => clearTimeout(removeTimer);
  }, [style.duration, onComplete]);

  return (
    <div
      className="fixed pointer-events-none select-none z-[99]"
      style={{
        left: style.startX,
        top: -20,
        animation: `thread-fall ${style.duration}ms linear forwards`,
        '--sway': `${style.sway}px`,
        '--delay': `${style.delay}ms`,
        animationDelay: `${style.delay}ms`,
      }}
    >
      <div
        style={{
          width: '2px',
          height: `${style.length}px`,
          background: `linear-gradient(to bottom, ${style.color}, transparent)`,
          opacity: 0.7,
        }}
      />
    </div>
  );
}

export default function Confetti({
  isActive,
  onComplete,
  duration = 3000,
  count = 50,
  showThreads = true
}) {
  const [sparks, setSparks] = useState([]);
  const [threads, setThreads] = useState([]);

  // Firework colors
  const sparkColors = [
    '#ffd700', // gold
    '#ffec8b', // light gold
    '#ff6b6b', // coral red
    '#4ecdc4', // teal
    '#a855f7', // purple
    '#f59e0b', // amber
    '#ffffff', // white
  ];

  // Generate firework burst sparks
  const generateSparks = useCallback((originX, originY) => {
    const newSparks = [];
    const sparkCount = Math.floor(count / 3);

    for (let i = 0; i < sparkCount; i++) {
      const angle = randomBetween(0, Math.PI * 2);
      const velocity = randomBetween(100, 350);
      const endX = Math.cos(angle) * velocity;
      const endY = Math.sin(angle) * velocity - randomBetween(50, 150);

      newSparks.push({
        id: `spark-${Date.now()}-${Math.random()}`,
        style: {
          startX: originX,
          startY: originY,
          endX,
          endY,
          size: randomBetween(3, 8),
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          duration: randomBetween(800, 1500),
        },
      });
    }

    return newSparks;
  }, [count]);

  // Generate falling threads/streamers
  const generateThreads = useCallback(() => {
    const newThreads = [];
    const threadColors = [
      '#c9a962', // gold
      '#a0a0a0', // silver
      '#d4b978', // light gold
      '#808080', // gray
      '#b8860b', // dark gold
      '#f59e0b', // amber
    ];

    for (let i = 0; i < 40; i++) {
      newThreads.push({
        id: `thread-${Date.now()}-${i}`,
        style: {
          startX: randomBetween(0, window.innerWidth),
          length: randomBetween(50, 150),
          color: threadColors[Math.floor(Math.random() * threadColors.length)],
          duration: randomBetween(2500, 4500),
          sway: randomBetween(-60, 60),
          delay: randomBetween(0, 1500),
        },
      });
    }

    return newThreads;
  }, []);

  useEffect(() => {
    if (isActive) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Initial firework burst from center
      setSparks(generateSparks(centerX, centerY));

      // Generate falling threads
      if (showThreads) {
        setThreads(generateThreads());
      }

      // Second burst slightly offset
      const secondBurst = setTimeout(() => {
        setSparks(prev => [
          ...prev,
          ...generateSparks(centerX - 150, centerY - 50),
          ...generateSparks(centerX + 150, centerY - 50)
        ]);
      }, 400);

      // Third burst for more celebration
      const thirdBurst = setTimeout(() => {
        setSparks(prev => [
          ...prev,
          ...generateSparks(centerX, centerY - 100)
        ]);
      }, 800);

      // Fourth burst
      const fourthBurst = setTimeout(() => {
        setSparks(prev => [
          ...prev,
          ...generateSparks(centerX - 200, centerY),
          ...generateSparks(centerX + 200, centerY)
        ]);
      }, 1200);

      // More threads midway
      const moreThreads = setTimeout(() => {
        if (showThreads) {
          setThreads(prev => [...prev, ...generateThreads()]);
        }
      }, 1000);

      // Cleanup and call onComplete
      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, duration + 500);

      return () => {
        clearTimeout(secondBurst);
        clearTimeout(thirdBurst);
        clearTimeout(fourthBurst);
        clearTimeout(moreThreads);
        clearTimeout(completeTimer);
      };
    }
  }, [isActive, generateSparks, generateThreads, duration, onComplete, showThreads]);

  const removeSpark = useCallback((id) => {
    setSparks(prev => prev.filter(s => s.id !== id));
  }, []);

  const removeThread = useCallback((id) => {
    setThreads(prev => prev.filter(t => t.id !== id));
  }, []);

  if (!isActive && sparks.length === 0 && threads.length === 0) return null;

  return (
    <>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes spark-burst {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            20% {
              opacity: 1;
            }
            100% {
              transform: translate(var(--end-x), calc(var(--end-y) + 100px)) scale(0);
              opacity: 0;
            }
          }

          @keyframes thread-fall {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 0.7;
            }
            50% {
              transform: translateY(50vh) translateX(var(--sway));
            }
            90% {
              opacity: 0.4;
            }
            100% {
              transform: translateY(100vh) translateX(calc(var(--sway) * -1));
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Falling threads/streamers */}
      {threads.map((thread) => (
        <ThreadPiece
          key={thread.id}
          style={thread.style}
          onComplete={() => removeThread(thread.id)}
        />
      ))}

      {/* Firework spark pieces */}
      {sparks.map((spark) => (
        <SparkPiece
          key={spark.id}
          style={spark.style}
          onComplete={() => removeSpark(spark.id)}
        />
      ))}
    </>
  );
}
