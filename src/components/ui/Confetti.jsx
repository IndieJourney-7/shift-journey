import React, { useState, useEffect, useCallback } from 'react';

const EMOJIS = ['🎉', '🏆', '⭐', '✨', '🔥', '💪', '🎊', '👏', '🌟', '💫', '🥳', '🙌'];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

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

export default function Confetti({ isActive, onComplete, duration = 3000, count = 50 }) {
  const [pieces, setPieces] = useState([]);

  const generatePieces = useCallback(() => {
    const newPieces = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const angle = randomBetween(0, Math.PI * 2);
      const velocity = randomBetween(200, 500);
      const endX = Math.cos(angle) * velocity;
      const endY = Math.sin(angle) * velocity - randomBetween(100, 300); // Bias upward

      newPieces.push({
        id: `${Date.now()}-${i}`,
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

  useEffect(() => {
    if (isActive) {
      setPieces(generatePieces());

      // Add second burst after a short delay
      const secondBurst = setTimeout(() => {
        setPieces(prev => [...prev, ...generatePieces()]);
      }, 300);

      // Cleanup and call onComplete
      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, duration + 500);

      return () => {
        clearTimeout(secondBurst);
        clearTimeout(completeTimer);
      };
    }
  }, [isActive, generatePieces, duration, onComplete]);

  const removePiece = useCallback((id) => {
    setPieces(prev => prev.filter(p => p.id !== id));
  }, []);

  if (!isActive && pieces.length === 0) return null;

  return (
    <>
      {/* CSS Animation */}
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
        `}
      </style>

      {/* Confetti pieces */}
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
