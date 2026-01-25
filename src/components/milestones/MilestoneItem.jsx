import React, { useState } from 'react';
import { GripVertical, Trash2, Lock, Check, X, Edit2, Clock } from 'lucide-react';
import { MILESTONE_STATUS } from '../../context/MilestoneContext';

// Status badge component
function StatusBadge({ status }) {
  const config = {
    [MILESTONE_STATUS.PLANNED]: {
      label: 'PLANNED',
      bg: 'bg-obsidian-700',
      text: 'text-obsidian-300',
      border: 'border-obsidian-600',
    },
    [MILESTONE_STATUS.LOCKED]: {
      label: 'LOCKED',
      bg: 'bg-amber-900/30',
      text: 'text-amber-400',
      border: 'border-amber-700/50',
    },
    [MILESTONE_STATUS.KEPT]: {
      label: 'KEPT',
      bg: 'bg-green-900/30',
      text: 'text-green-400',
      border: 'border-green-700/50',
    },
    [MILESTONE_STATUS.BROKEN]: {
      label: 'BROKEN',
      bg: 'bg-red-900/30',
      text: 'text-red-400',
      border: 'border-red-700/50',
    },
  };

  const { label, bg, text, border } = config[status] || config[MILESTONE_STATUS.PLANNED];

  return (
    <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded border ${bg} ${text} ${border}`}>
      {label}
    </span>
  );
}

export default function MilestoneItem({
  milestone,
  index,
  onUpdate,
  onDelete,
  onLock,
  onComplete,
  onBreak,
  onReflect,
  isDragging,
  dragHandleProps,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(milestone.title);

  const isPlanned = milestone.status === MILESTONE_STATUS.PLANNED;
  const isLocked = milestone.status === MILESTONE_STATUS.LOCKED;
  const isKept = milestone.status === MILESTONE_STATUS.KEPT;
  const isBroken = milestone.status === MILESTONE_STATUS.BROKEN;
  const needsReflection = milestone.needsReflection;

  const handleSave = () => {
    if (editValue.trim() && isPlanned) {
      onUpdate(milestone.id, { title: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(milestone.title);
      setIsEditing(false);
    }
  };

  // Container styles based on status
  const containerStyles = {
    [MILESTONE_STATUS.PLANNED]: 'border-obsidian-600 bg-obsidian-800/50 hover:border-obsidian-500',
    [MILESTONE_STATUS.LOCKED]: 'border-amber-700/50 bg-amber-900/10',
    [MILESTONE_STATUS.KEPT]: 'border-green-700/30 bg-green-900/10',
    [MILESTONE_STATUS.BROKEN]: 'border-red-700/30 bg-red-900/10',
  };

  return (
    <div
      className={`
        flex items-stretch rounded-lg border transition-all
        ${containerStyles[milestone.status]}
        ${isDragging ? 'shadow-lg shadow-obsidian-950/50' : ''}
      `}
    >
      {/* Drag Handle - Only for PLANNED */}
      <div
        {...(isPlanned ? dragHandleProps : {})}
        className={`
          flex items-center px-2 rounded-l-lg
          ${isPlanned ? 'cursor-grab hover:bg-obsidian-700/50' : 'cursor-not-allowed opacity-30'}
        `}
      >
        <GripVertical className="w-4 h-4 text-obsidian-500" />
      </div>

      {/* Main Content */}
      <div className="flex-1 py-3 pr-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Number + Title */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-obsidian-500 text-sm font-mono">
                #{index + 1}
              </span>
              <StatusBadge status={milestone.status} />
            </div>

            {isEditing && isPlanned ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full bg-obsidian-900 border border-obsidian-500 rounded px-2 py-1 text-obsidian-100 focus:outline-none focus:border-amber-500/50"
                autoFocus
              />
            ) : (
              <p
                className={`
                  text-obsidian-200 font-medium
                  ${isPlanned ? 'cursor-text' : ''}
                  ${isKept ? 'line-through text-obsidian-500' : ''}
                `}
                onClick={() => isPlanned && setIsEditing(true)}
              >
                {milestone.title}
              </p>
            )}

            {/* Promise info for LOCKED */}
            {isLocked && milestone.promise && (
              <div className="mt-2 text-sm">
                <p className="text-amber-400/80 italic">"{milestone.promise.text}"</p>
                {milestone.promise.consequence && (
                  <p className="text-obsidian-500 mt-1">
                    Consequence: {milestone.promise.consequence}
                  </p>
                )}
              </div>
            )}

            {/* Reflection info for BROKEN (after reflection submitted) */}
            {isBroken && !needsReflection && milestone.reflection && (
              <div className="mt-2 text-sm space-y-1">
                <p className="text-red-400/70">Failed: {milestone.reflection.whyFailed}</p>
              </div>
            )}

            {/* Timestamps */}
            {(isKept || (isBroken && !needsReflection)) && (
              <p className="text-obsidian-600 text-xs mt-2 font-mono">
                {isKept ? `Kept at ${new Date(milestone.keptAt).toLocaleString()}` : ''}
                {isBroken ? `Broken at ${new Date(milestone.brokenAt).toLocaleString()}` : ''}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* PLANNED actions */}
            {isPlanned && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-obsidian-500 hover:text-obsidian-300 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(milestone.id)}
                  className="p-1.5 text-obsidian-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onLock(milestone)}
                  className="px-3 py-1.5 bg-amber-600/20 border border-amber-600/50 rounded text-amber-400 text-sm font-medium hover:bg-amber-600/30 transition-colors flex items-center gap-1.5"
                  title="Lock as Promise"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Lock
                </button>
              </>
            )}

            {/* LOCKED actions */}
            {isLocked && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onComplete(milestone.id)}
                  className="px-3 py-1.5 bg-green-600/20 border border-green-600/50 rounded text-green-400 text-sm font-medium hover:bg-green-600/30 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Kept
                </button>
                <button
                  onClick={() => onBreak(milestone.id)}
                  className="px-3 py-1.5 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-sm font-medium hover:bg-red-600/30 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Mark Broken
                </button>
              </div>
            )}

            {/* BROKEN + needs reflection */}
            {isBroken && needsReflection && (
              <button
                onClick={() => onReflect(milestone)}
                className="px-3 py-1.5 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-sm font-medium hover:bg-red-600/30 transition-colors animate-pulse"
              >
                Submit Reflection
              </button>
            )}

            {/* KEPT indicator */}
            {isKept && (
              <div className="flex items-center gap-1.5 text-green-400">
                <Check className="w-5 h-5" />
              </div>
            )}

            {/* BROKEN indicator (after reflection) */}
            {isBroken && !needsReflection && (
              <div className="flex items-center gap-1.5 text-red-400">
                <X className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
