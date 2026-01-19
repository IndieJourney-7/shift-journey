import React from 'react';
import { Lock, Check, Flag } from 'lucide-react';

export default function JourneyPath({
  milestones = [],
  showGoal = true,
  compact = false,
  onMilestoneClick,
  className = '',
}) {
  const width = compact ? 400 : 600;
  const height = compact ? 120 : 160;
  const nodeRadius = compact ? 16 : 20;
  const pathStrokeWidth = compact ? 2 : 3;

  // Calculate node positions along a curved path
  const getNodePositions = () => {
    const nodes = [...milestones];
    if (showGoal) {
      nodes.push({ id: 'goal', status: 'goal' });
    }

    const positions = [];
    const startX = 60;
    const endX = width - 60;
    const centerY = height / 2;
    const amplitude = compact ? 25 : 35;

    nodes.forEach((node, index) => {
      const progress = nodes.length > 1 ? index / (nodes.length - 1) : 0;
      const x = startX + progress * (endX - startX);
      const y = centerY + Math.sin(progress * Math.PI * 1.5) * amplitude;
      positions.push({ x, y, ...node });
    });

    return positions;
  };

  const positions = getNodePositions();

  // Generate curved path
  const generatePath = () => {
    if (positions.length < 2) return '';

    let path = `M ${positions[0].x} ${positions[0].y}`;

    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      const cpX = (current.x + next.x) / 2;

      path += ` Q ${cpX} ${current.y}, ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`;
      path += ` T ${next.x} ${next.y}`;
    }

    return path;
  };

  const getNodeStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          fill: '#1a1a1a',
          stroke: '#4a4a4a',
          icon: Check,
          iconColor: '#888888',
        };
      case 'locked':
        return {
          fill: '#1a1a1a',
          stroke: '#c9a962',
          icon: Lock,
          iconColor: '#c9a962',
          glow: true,
        };
      case 'broken':
        return {
          fill: '#1a1a1a',
          stroke: '#8b4513',
          icon: null,
          cracked: true,
        };
      case 'pending':
        return {
          fill: '#1a1a1a',
          stroke: '#333333',
          icon: Lock,
          iconColor: '#4a4a4a',
        };
      case 'goal':
        return {
          fill: '#1a1a1a',
          stroke: '#4a4a4a',
          icon: Flag,
          iconColor: '#666666',
        };
      default:
        return {
          fill: '#1a1a1a',
          stroke: '#333333',
          icon: null,
        };
    }
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      style={{ maxWidth: width }}
    >
      <defs>
        {/* Glow filter for active node */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient for path */}
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="50%" stopColor="#333333" />
          <stop offset="100%" stopColor="#252525" />
        </linearGradient>

        {/* Gold gradient */}
        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4b978" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c9a962" stopOpacity="0.3" />
        </radialGradient>

        {/* Crack pattern */}
        <pattern id="crackPattern" patternUnits="objectBoundingBox" width="1" height="1">
          <path
            d="M10 0 L8 10 L5 15 L10 18 L8 25 L10 35"
            stroke="#4a4a4a"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M10 18 L15 20 L20 18"
            stroke="#4a4a4a"
            strokeWidth="0.8"
            fill="none"
          />
        </pattern>
      </defs>

      {/* Path line */}
      <path
        d={generatePath()}
        fill="none"
        stroke="url(#pathGradient)"
        strokeWidth={pathStrokeWidth}
        className="journey-path"
      />

      {/* Nodes */}
      {positions.map((pos, index) => {
        const styles = getNodeStyles(pos.status);
        const IconComponent = styles.icon;
        const isActive = pos.status === 'locked';

        return (
          <g
            key={pos.id}
            transform={`translate(${pos.x}, ${pos.y})`}
            className="cursor-pointer"
            onClick={() => onMilestoneClick?.(pos)}
            filter={styles.glow ? 'url(#glow)' : undefined}
            style={{ transformOrigin: 'center' }}
          >
            {/* Outer glow for active */}
            {isActive && (
              <circle
                r={nodeRadius + 8}
                fill="url(#goldGlow)"
                opacity="0.3"
              />
            )}

            {/* Hover highlight circle */}
            <circle
              r={nodeRadius + 4}
              fill="transparent"
              stroke={styles.stroke}
              strokeWidth={1}
              opacity="0"
              className="node-hover-ring"
            />

            {/* Main circle */}
            <circle
              r={nodeRadius}
              fill={styles.fill}
              stroke={styles.stroke}
              strokeWidth={2}
              className={isActive ? 'node-active-circle' : ''}
            />

            {/* Cracked overlay */}
            {styles.cracked && (
              <>
                <line
                  x1="-8"
                  y1="-12"
                  x2="-2"
                  y2="2"
                  stroke="#4a4a4a"
                  strokeWidth="1.5"
                />
                <line
                  x1="-2"
                  y1="2"
                  x2="-10"
                  y2="8"
                  stroke="#4a4a4a"
                  strokeWidth="1"
                />
                <line
                  x1="-2"
                  y1="2"
                  x2="6"
                  y2="10"
                  stroke="#4a4a4a"
                  strokeWidth="1.5"
                />
                <line
                  x1="2"
                  y1="-5"
                  x2="8"
                  y2="3"
                  stroke="#4a4a4a"
                  strokeWidth="1"
                />
              </>
            )}

            {/* Icon */}
            {IconComponent && (
              <IconComponent
                x={-8}
                y={-8}
                width={16}
                height={16}
                color={styles.iconColor}
              />
            )}

            {/* Label for goal */}
            {pos.status === 'goal' && (
              <text
                y={-nodeRadius - 8}
                textAnchor="middle"
                className="text-xs fill-obsidian-400"
                style={{ fontSize: '11px' }}
              >
                Goal
              </text>
            )}
          </g>
        );
      })}

      {/* Start label */}
      {positions.length > 0 && (
        <text
          x={positions[0].x}
          y={positions[0].y - nodeRadius - 10}
          textAnchor="middle"
          className="fill-obsidian-400"
          style={{ fontSize: '10px' }}
        >
          {milestones[0]?.status === 'locked' ? 'Current' : ''}
        </text>
      )}
    </svg>
  );
}
