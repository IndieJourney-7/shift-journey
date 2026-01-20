import React, { useState, useEffect, useCallback } from 'react';

// Party-focused emojis for goal completion celebration
const CELEBRATION_EMOJIS = ['🎉', '🎉', '🎉', '🎊', '✨', '🎉', '🎉', '⭐', '🎉'];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

// Individual confetti piece that bursts from center
function ConfettiPiece({ emoji, style, onComplete }) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, style.duration - 500);

    const removeTimer = setTimeout(() => {
      onComplete();
    }, style.duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [style.duration, onComplete]);

  return (
    <div
      className="fixed pointer-events-none select-none z-[100]"
      style={{
        left: style.startX,
        top: style.startY,
        fontSize: style.size,
        opacity,
        animation: `confetti-fall ${style.duration}ms ease-out forwards`,
        '--end-x': `${style.endX}px`,
        '--end-y': `${style.endY}px`,
        '--rotation': `${style.rotation}deg`,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {emoji}
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
          opacity: 0.6,
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
  const [pieces, setPieces] = useState([]);
  const [threads, setThreads] = useState([]);

  // Generate burst confetti pieces (emojis bursting from center)
  const generatePieces = useCallback(() => {
    const newPieces = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const emoji = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)];
      const angle = randomBetween(0, Math.PI * 2);
      const velocity = randomBetween(200, 500);
      const endX = Math.cos(angle) * velocity;
      const endY = Math.sin(angle) * velocity - randomBetween(100, 300);

      newPieces.push({
        id: `piece-${Date.now()}-${i}`,
        emoji,
        style: {
          startX: centerX,
          startY: centerY,
          endX,
          endY,
          size: `${randomBetween(1.5, 3)}rem`,
          duration: randomBetween(duration * 0.7, duration),
          rotation: randomBetween(-720, 720),
        },
      });
    }

    return newPieces;
  }, [count, duration]);

  // Generate falling threads/streamers
  const generateThreads = useCallback(() => {
    const newThreads = [];
    const threadColors = [
      '#c9a962', // gold
      '#a0a0a0', // silver
      '#d4b978', // light gold
      '#808080', // gray
      '#b8860b', // dark gold
    ];

    for (let i = 0; i < 30; i++) {
      newThreads.push({
        id: `thread-${Date.now()}-${i}`,
        style: {
          startX: randomBetween(0, window.innerWidth),
          length: randomBetween(40, 120),
          color: threadColors[Math.floor(Math.random() * threadColors.length)],
          duration: randomBetween(2000, 4000),
          sway: randomBetween(-50, 50),
          delay: randomBetween(0, 1500),
        },
      });
    }

    return newThreads;
  }, []);

  useEffect(() => {
    if (isActive) {
      // Initial burst of party emojis
      setPieces(generatePieces());

      // Generate falling threads
      if (showThreads) {
        setThreads(generateThreads());
      }

      // Second burst after a short delay
      const secondBurst = setTimeout(() => {
        setPieces(prev => [...prev, ...generatePieces()]);
      }, 300);

      // Third burst for extra celebration
      const thirdBurst = setTimeout(() => {
        setPieces(prev => [...prev, ...generatePieces()]);
      }, 800);

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
        clearTimeout(moreThreads);
        clearTimeout(completeTimer);
      };
    }
  }, [isActive, generatePieces, generateThreads, duration, onComplete, showThreads]);

  const removePiece = useCallback((id) => {
    setPieces(prev => prev.filter(p => p.id !== id));
  }, []);

  const removeThread = useCallback((id) => {
    setThreads(prev => prev.filter(t => t.id !== id));
  }, []);

  if (!isActive && pieces.length === 0 && threads.length === 0) return null;

  return (
    <>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              transform: translate(0, 0) rotate(0deg) scale(0);
              opacity: 1;
            }
            10% {
              transform: translate(calc(var(--end-x) * 0.1), calc(var(--end-y) * 0.1)) rotate(calc(var(--rotation) * 0.1)) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(var(--end-x), calc(var(--end-y) + 200px)) rotate(var(--rotation)) scale(0.5);
              opacity: 0;
            }
          }

          @keyframes thread-fall {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
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

      {/* Confetti emoji pieces */}
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          emoji={piece.emoji}
          style={piece.style}
          onComplete={() => removePiece(piece.id)}
        />
      ))}
    </>
  );
}
