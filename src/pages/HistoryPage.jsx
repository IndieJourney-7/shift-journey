import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, AlertTriangle, Lock, Filter, Trophy, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function HistoryPage() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const { milestones, currentGoal, goalHistory } = useApp();
  const [filter, setFilter] = useState(initialFilter);
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedGoals, setExpandedGoals] = useState({});

  const toggleGoalExpand = (goalId) => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };

  const getFilteredMilestones = () => {
    let filtered = milestones.filter(m => ['completed', 'broken'].includes(m.status));

    if (filter === 'completed') {
      filtered = filtered.filter(m => m.status === 'completed');
    } else if (filter === 'broken') {
      filtered = filtered.filter(m => m.status === 'broken');
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.brokenAt || 0);
      const dateB = new Date(b.completedAt || b.brokenAt || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredMilestones = getFilteredMilestones();

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const brokenCount = milestones.filter(m => m.status === 'broken').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-obsidian-100 mb-1">History</h1>
        <p className="text-obsidian-400">
          {currentGoal ? `Current: ${currentGoal.title}` : 'View your journey history'}
        </p>
      </div>

      {/* Completed Goals Section */}
      {goalHistory.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-obsidian-200 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-500" />
            Completed Goals ({goalHistory.length})
          </h2>

          <div className="space-y-4">
            {goalHistory.map((goal) => (
              <Card key={goal.id} variant="default" padding="none" className="overflow-hidden">
                {/* Goal Header - Clickable */}
                <button
                  onClick={() => toggleGoalExpand(goal.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-obsidian-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
                      <Target className="w-5 h-5 text-gold-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-obsidian-200 font-medium">{goal.title}</h3>
                      <p className="text-obsidian-500 text-sm">
                        Completed {new Date(goal.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-400">{goal.stats?.completed || 0} kept</span>
                      <span className="text-obsidian-600">|</span>
                      <span className="text-red-400">{goal.stats?.broken || 0} broken</span>
                      <span className="text-obsidian-600">|</span>
                      <span className="text-gold-400">{goal.stats?.successRate || 0}%</span>
                    </div>

                    {expandedGoals[goal.id] ? (
                      <ChevronUp className="w-5 h-5 text-obsidian-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-obsidian-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedGoals[goal.id] && (
                  <div className="border-t border-obsidian-700 p-4 bg-obsidian-900/50">
                    {/* Reflection */}
                    {goal.reflection && (
                      <div className="mb-4 p-3 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
                        <p className="text-obsidian-400 text-xs mb-1">My Reflection:</p>
                        <p className="text-obsidian-300 text-sm italic">"{goal.reflection}"</p>
                      </div>
                    )}

                    {/* Milestones */}
                    <div className="space-y-2">
                      {goal.milestones?.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center justify-between p-2 rounded bg-obsidian-800/30"
                        >
                          <div className="flex items-center gap-2">
                            {milestone.status === 'completed' ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-obsidian-400 text-sm">
                              {milestone.number}.
                            </span>
                            <span className="text-obsidian-300 text-sm">
                              {milestone.title}
                            </span>
                          </div>
                          <Badge
                            variant={milestone.status === 'completed' ? 'completed' : 'broken'}
                            size="sm"
                          >
                            {milestone.status === 'completed' ? 'KEPT' : 'BROKEN'}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Final Integrity */}
                    <div className="mt-4 pt-3 border-t border-obsidian-700 flex items-center justify-between">
                      <span className="text-obsidian-500 text-sm">Final Integrity Score:</span>
                      <span className={`font-medium ${
                        goal.finalIntegrityScore >= 70 ? 'text-green-400' :
                        goal.finalIntegrityScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {goal.finalIntegrityScore || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Goal Section */}
      {currentGoal && (
        <>
          <div className="border-t border-obsidian-800 pt-8">
            <h2 className="text-lg font-medium text-obsidian-200 mb-4">
              Current Goal: {currentGoal.title}
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card
              variant={filter === 'all' ? 'highlighted' : 'default'}
              padding="md"
              className="cursor-pointer"
              onClick={() => setFilter('all')}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-obsidian-200 mb-1">
                  {completedCount + brokenCount}
                </div>
                <div className="text-obsidian-400 text-sm">Total Recorded</div>
              </div>
            </Card>
            <Card
              variant={filter === 'completed' ? 'highlighted' : 'default'}
              padding="md"
              className="cursor-pointer"
              onClick={() => setFilter('completed')}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {completedCount}
                </div>
                <div className="text-obsidian-400 text-sm">Completed</div>
              </div>
            </Card>
            <Card
              variant={filter === 'broken' ? 'highlighted' : 'default'}
              padding="md"
              className="cursor-pointer"
              onClick={() => setFilter('broken')}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {brokenCount}
                </div>
                <div className="text-obsidian-400 text-sm">Broken</div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-obsidian-500" />
              <span className="text-obsidian-400 text-sm">Showing:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-obsidian-800 border border-obsidian-600 rounded px-3 py-1 text-sm text-obsidian-200 focus:outline-none focus:border-gold-500/50"
              >
                <option value="all">All</option>
                <option value="completed">Completed Only</option>
                <option value="broken">Broken Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={sortOrder === 'newest' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortOrder('newest')}
              >
                Newest
              </Button>
              <Button
                variant={sortOrder === 'oldest' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortOrder('oldest')}
              >
                Oldest
              </Button>
            </div>
          </div>

          {/* Milestones List */}
          <Card variant="elevated" padding="lg">
            {filteredMilestones.length > 0 ? (
              <div className="space-y-4">
                {filteredMilestones.map((milestone) => {
                  const isCompleted = milestone.status === 'completed';
                  const date = new Date(milestone.completedAt || milestone.brokenAt);

                  return (
                    <div
                      key={milestone.id}
                      className={`
                        flex items-start gap-4 p-4 rounded-lg border
                        ${isCompleted
                          ? 'bg-obsidian-800/50 border-obsidian-600/50'
                          : 'bg-obsidian-800/50 border-red-900/30'
                        }
                      `}
                    >
                      {/* Icon */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isCompleted ? 'bg-green-900/30' : 'bg-red-900/30'}
                      `}>
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-obsidian-400 text-sm">
                            Milestone {milestone.number}:
                          </span>
                          <span className="text-obsidian-200 font-medium truncate">
                            {milestone.title}
                          </span>
                        </div>

                        {milestone.reason && (
                          <p className="text-obsidian-500 text-sm mb-2">
                            Reason: "{milestone.reason}"
                          </p>
                        )}

                        <p className="text-obsidian-500 text-xs">
                          {date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Badge */}
                      <Badge
                        variant={isCompleted ? 'completed' : 'broken'}
                        size="sm"
                      >
                        {isCompleted ? 'COMPLETED' : 'PROMISE BROKEN'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 text-obsidian-600 mx-auto mb-4" />
                <p className="text-obsidian-400">No milestones recorded yet.</p>
                <p className="text-obsidian-500 text-sm mt-1">
                  Complete or break promises to see them here.
                </p>
              </div>
            )}
          </Card>
        </>
      )}

      {/* No Content State */}
      {!currentGoal && goalHistory.length === 0 && (
        <Card variant="default" padding="lg" className="text-center">
          <Lock className="w-12 h-12 text-obsidian-600 mx-auto mb-4" />
          <p className="text-obsidian-400">No history yet.</p>
          <p className="text-obsidian-500 text-sm mt-1">
            Create a goal and complete milestones to build your history.
          </p>
        </Card>
      )}
    </div>
  );
}
