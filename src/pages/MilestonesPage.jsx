import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Lock, ChevronRight } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { JourneyPath } from '../components/journey';
import { useApp } from '../context/AppContext';

export default function MilestonesPage() {
  const navigate = useNavigate();
  const { currentGoal, milestones, addMilestone, updateMilestone, deleteMilestone, currentLockedMilestone } = useApp();

  const [newMilestone, setNewMilestone] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to goal creation if no goal exists
  useEffect(() => {
    if (!currentGoal) {
      navigate('/goal/create', { replace: true });
    }
  }, [currentGoal, navigate]);

  const handleAddMilestone = async () => {
    if (!newMilestone.trim() || isAdding) return;

    setIsAdding(true);
    setError(null);
    try {
      await addMilestone(newMilestone.trim());
      setNewMilestone('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (milestone) => {
    // Can't edit locked, completed, or broken milestones
    if (['locked', 'completed', 'broken'].includes(milestone.status)) return;
    setEditingId(milestone.id);
    setEditValue(milestone.title);
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) {
      setEditingId(null);
      setEditValue('');
      return;
    }

    try {
      await updateMilestone(id, { title: editValue.trim() });
    } catch (err) {
      setError(err.message);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async (id) => {
    const milestone = milestones.find(m => m.id === id);
    // Can't delete locked, completed, or broken milestones
    if (['locked', 'completed', 'broken'].includes(milestone?.status)) return;

    try {
      await deleteMilestone(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLockNext = () => {
    const nextPending = milestones.find(m => m.status === 'pending');
    if (nextPending) {
      navigate(`/lock-promise/${nextPending.id}`);
    }
  };

  const canLockNext = !currentLockedMilestone && milestones.some(m => m.status === 'pending');

  // Don't render until we confirm goal exists
  if (!currentGoal) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-1 sm:px-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-obsidian-100 mb-1 sm:mb-2">
            {currentGoal?.title || 'My Goal'} - Milestones
          </h1>
          <p className="text-obsidian-400 text-sm sm:text-base">
            Break your goal into small, achievable milestones. Each will become a locked promise.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        {/* Journey Path Preview */}
        {milestones.length > 0 && (
          <Card variant="default" padding="sm" className="sm:p-4 mb-6 sm:mb-8">
            <div className="flex justify-center py-2 sm:py-4 overflow-x-auto">
              <JourneyPath milestones={milestones} showGoal={true} />
            </div>
          </Card>
        )}

        {/* Milestones List */}
        <Card variant="elevated" padding="md" className="sm:p-6 lg:p-8 mb-6">
          <div className="space-y-2 sm:space-y-3">
            {milestones.map((milestone, index) => {
              const isLocked = milestone.status === 'locked';
              const isCompleted = milestone.status === 'completed';
              const isBroken = milestone.status === 'broken';
              const isEditable = !isLocked && !isCompleted && !isBroken;

              return (
                <div
                  key={milestone.id}
                  className={`
                    flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all
                    ${isLocked ? 'bg-obsidian-800/80 border-gold-500/30' : ''}
                    ${isCompleted ? 'bg-obsidian-800/50 border-obsidian-600/50' : ''}
                    ${isBroken ? 'bg-obsidian-800/50 border-red-800/30' : ''}
                    ${!isLocked && !isCompleted && !isBroken ? 'bg-obsidian-800/50 border-obsidian-600/50 hover:border-obsidian-500' : ''}
                  `}
                >
                  {/* Drag Handle - hidden on mobile */}
                  <div className={`hidden sm:block cursor-grab ${!isEditable ? 'opacity-30' : 'text-obsidian-500'}`}>
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Number */}
                  <div className={`
                    w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0
                    ${isLocked ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : ''}
                    ${isCompleted ? 'bg-green-900/30 text-green-400 border border-green-700/30' : ''}
                    ${isBroken ? 'bg-red-900/30 text-red-400 border border-red-700/30' : ''}
                    ${!isLocked && !isCompleted && !isBroken ? 'bg-obsidian-700 text-obsidian-400 border border-obsidian-600' : ''}
                  `}>
                    {milestone.number}
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    {editingId === milestone.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(milestone.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(milestone.id)}
                        className="w-full bg-obsidian-900 border border-obsidian-500 rounded px-2 py-1 text-sm sm:text-base text-obsidian-100 focus:outline-none focus:border-gold-500/50"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`
                          text-sm sm:text-base truncate block
                          ${isEditable ? 'cursor-pointer hover:text-obsidian-100' : ''}
                          ${isCompleted ? 'text-obsidian-500 line-through' : 'text-obsidian-200'}
                          ${isBroken ? 'text-obsidian-500' : ''}
                        `}
                        onClick={() => isEditable && handleEdit(milestone)}
                      >
                        {milestone.title}
                      </span>
                    )}
                  </div>

                  {/* Status / Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {isLocked && (
                      <span className="flex items-center gap-1 text-gold-500 text-xs sm:text-sm">
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">LOCKED</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-green-500 text-xs sm:text-sm">Done</span>
                    )}
                    {isBroken && (
                      <span className="text-red-400 text-xs sm:text-sm">Broken</span>
                    )}
                    {isEditable && (
                      <button
                        onClick={() => handleDelete(milestone.id)}
                        className="p-1 text-obsidian-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add New Milestone */}
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-obsidian-800/30 rounded-lg border border-dashed border-obsidian-600 hover:border-obsidian-500 transition-colors">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-obsidian-700/50 border border-obsidian-600 flex items-center justify-center flex-shrink-0">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-obsidian-500" />
              </div>
              <input
                type="text"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMilestone.trim()) {
                    handleAddMilestone();
                  }
                }}
                placeholder="Add a milestone..."
                className="flex-1 bg-transparent text-sm sm:text-base text-obsidian-200 placeholder-obsidian-500 focus:outline-none min-w-0"
                disabled={isAdding}
              />
              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={handleAddMilestone}
                disabled={!newMilestone.trim() || isAdding}
                className="flex-shrink-0"
              >
                {isAdding ? '...' : 'Add'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>

          {canLockNext && (
            <Button
              variant="gold"
              icon={Lock}
              iconPosition="left"
              onClick={handleLockNext}
              className="w-full sm:w-auto"
            >
              Lock Next Promise
            </Button>
          )}

          {currentLockedMilestone && (
            <div className="text-obsidian-400 text-xs sm:text-sm text-center sm:text-right">
              Complete your current locked promise first
            </div>
          )}
        </div>
    </div>
  );
}
