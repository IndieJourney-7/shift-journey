import React, { useState, useRef } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import MilestoneItem from './MilestoneItem';
import { Button, Input } from '../ui';
import { MILESTONE_STATUS } from '../../context/MilestoneContext';

export default function MilestoneList({
  milestones,
  onAdd,
  onUpdate,
  onDelete,
  onLock,
  onComplete,
  onBreak,
  onReflect,
  onReorder,
  hasLockedMilestone,
  milestonesNeedingReflection,
}) {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragNode = useRef(null);

  // Handle adding new milestone
  const handleAdd = (e) => {
    e.preventDefault();
    if (newMilestoneTitle.trim()) {
      onAdd(newMilestoneTitle.trim());
      setNewMilestoneTitle('');
    }
  };

  // Drag handlers
  const handleDragStart = (e, index) => {
    const milestone = milestones[index];
    // Only allow dragging PLANNED milestones
    if (milestone.status !== MILESTONE_STATUS.PLANNED) {
      e.preventDefault();
      return;
    }

    dragNode.current = e.target;
    setDraggedIndex(index);

    // Set drag image
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);

    // Add dragging class after a tick
    setTimeout(() => {
      if (dragNode.current) {
        dragNode.current.classList.add('opacity-50');
      }
    }, 0);
  };

  const handleDragEnd = () => {
    if (dragNode.current) {
      dragNode.current.classList.remove('opacity-50');
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragNode.current = null;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const milestone = milestones[index];

    // Only allow dropping on/around PLANNED milestones
    if (milestone.status !== MILESTONE_STATUS.PLANNED) {
      return;
    }

    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const milestone = milestones[index];
    // Only allow dropping on PLANNED milestones
    if (milestone.status !== MILESTONE_STATUS.PLANNED) {
      return;
    }

    onReorder(draggedIndex, index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Separate milestones by status
  const plannedMilestones = milestones.filter(m => m.status === MILESTONE_STATUS.PLANNED);
  const lockedMilestone = milestones.find(m => m.status === MILESTONE_STATUS.LOCKED);
  const completedMilestones = milestones.filter(
    m => m.status === MILESTONE_STATUS.KEPT || m.status === MILESTONE_STATUS.BROKEN
  );

  // Check if there are milestones needing reflection (blocks new locks)
  const hasReflectionPending = milestonesNeedingReflection?.length > 0;

  return (
    <div className="space-y-6">
      {/* Warning: Reflection Required */}
      {hasReflectionPending && (
        <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-medium">Reflection Required</p>
            <p className="text-red-400/80 text-sm mt-1">
              You have {milestonesNeedingReflection.length} broken milestone(s) that need reflection
              before you can lock another promise.
            </p>
          </div>
        </div>
      )}

      {/* Currently Locked Milestone */}
      {lockedMilestone && (
        <div className="space-y-2">
          <h3 className="text-obsidian-400 text-sm font-medium uppercase tracking-wider">
            Active Promise
          </h3>
          <MilestoneItem
            milestone={lockedMilestone}
            index={milestones.findIndex(m => m.id === lockedMilestone.id)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onLock={onLock}
            onComplete={onComplete}
            onBreak={onBreak}
            onReflect={onReflect}
            isDragging={false}
            dragHandleProps={{}}
          />
        </div>
      )}

      {/* Milestones Needing Reflection */}
      {hasReflectionPending && (
        <div className="space-y-2">
          <h3 className="text-red-400 text-sm font-medium uppercase tracking-wider">
            Needs Reflection
          </h3>
          <div className="space-y-2">
            {milestonesNeedingReflection.map(milestone => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                index={milestones.findIndex(m => m.id === milestone.id)}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onLock={onLock}
                onComplete={onComplete}
                onBreak={onBreak}
                onReflect={onReflect}
                isDragging={false}
                dragHandleProps={{}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Planned Milestones (Reorderable) */}
      {plannedMilestones.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-obsidian-400 text-sm font-medium uppercase tracking-wider">
            Planned Milestones
            {hasLockedMilestone && (
              <span className="ml-2 text-obsidian-500 normal-case font-normal">
                (Complete active promise first)
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {plannedMilestones.map((milestone, visualIndex) => {
              const actualIndex = milestones.findIndex(m => m.id === milestone.id);
              const isDragging = draggedIndex === actualIndex;
              const isDragOver = dragOverIndex === actualIndex;

              return (
                <div
                  key={milestone.id}
                  draggable={!hasLockedMilestone}
                  onDragStart={(e) => handleDragStart(e, actualIndex)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, actualIndex)}
                  onDrop={(e) => handleDrop(e, actualIndex)}
                  className={`transition-transform ${isDragOver ? 'transform translate-y-1' : ''}`}
                >
                  <MilestoneItem
                    milestone={milestone}
                    index={actualIndex}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onLock={onLock}
                    onComplete={onComplete}
                    onBreak={onBreak}
                    onReflect={onReflect}
                    isDragging={isDragging}
                    dragHandleProps={{
                      'aria-label': 'Drag to reorder',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Milestone Form */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Add a new milestone..."
            value={newMilestoneTitle}
            onChange={(e) => setNewMilestoneTitle(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          icon={Plus}
          disabled={!newMilestoneTitle.trim()}
        >
          Add
        </Button>
      </form>

      {/* Completed/Broken Milestones History */}
      {completedMilestones.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-obsidian-700">
          <h3 className="text-obsidian-400 text-sm font-medium uppercase tracking-wider">
            Completed
          </h3>
          <div className="space-y-2">
            {completedMilestones.map(milestone => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                index={milestones.findIndex(m => m.id === milestone.id)}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onLock={onLock}
                onComplete={onComplete}
                onBreak={onBreak}
                onReflect={onReflect}
                isDragging={false}
                dragHandleProps={{}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {milestones.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center">
            <Plus className="w-8 h-8 text-obsidian-500" />
          </div>
          <h3 className="text-obsidian-300 font-medium mb-2">No milestones yet</h3>
          <p className="text-obsidian-500 text-sm">
            Add your first milestone to start your journey
          </p>
        </div>
      )}
    </div>
  );
}
