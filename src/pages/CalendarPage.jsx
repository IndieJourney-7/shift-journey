import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function CalendarPage() {
  const { calendarData, toggleCalendarDay, currentLockedMilestone } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateKey = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDayClick = (day) => {
    const dateKey = formatDateKey(day);
    const today = new Date();
    const clickedDate = new Date(year, month, day);

    // Can only mark past days or today
    if (clickedDate > today) return;

    const currentStatus = calendarData[dateKey]?.worked;
    toggleCalendarDay(dateKey, !currentStatus);
  };

  const getDayStatus = (day) => {
    const dateKey = formatDateKey(day);
    return calendarData[dateKey];
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isPast = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  // Calculate stats
  const workedDays = Object.values(calendarData).filter(d => d.worked).length;
  const missedDays = Object.values(calendarData).filter(d => d.worked === false).length;
  const totalTrackedDays = workedDays + missedDays;
  const consistencyRate = totalTrackedDays > 0 ? Math.round((workedDays / totalTrackedDays) * 100) : 0;

  // Generate calendar grid
  const calendarDays = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-obsidian-100 mb-1">Calendar Evidence</h1>
        <p className="text-obsidian-400">Track your daily progress towards your milestones</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="default" padding="md" className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{workedDays}</div>
          <div className="text-obsidian-400 text-sm">Days Worked</div>
        </Card>
        <Card variant="default" padding="md" className="text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">{missedDays}</div>
          <div className="text-obsidian-400 text-sm">Days Missed</div>
        </Card>
        <Card variant="default" padding="md" className="text-center">
          <div className="text-3xl font-bold text-gold-400 mb-1">{consistencyRate}%</div>
          <div className="text-obsidian-400 text-sm">Consistency</div>
        </Card>
      </div>

      {/* Current Milestone Info */}
      {currentLockedMilestone && (
        <Card variant="highlighted" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-obsidian-400 text-sm">Currently tracking: </span>
              <span className="text-obsidian-200 font-medium">
                Milestone {currentLockedMilestone.number}: {currentLockedMilestone.title}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card variant="elevated" padding="lg">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-obsidian-100">
            {monthNames[month]} {year}
          </h2>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-obsidian-500 text-sm font-medium py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const status = getDayStatus(day);
            const isTodayDate = isToday(day);
            const isPastDate = isPast(day);
            const canClick = isPastDate || isTodayDate;

            return (
              <button
                key={day}
                onClick={() => canClick && handleDayClick(day)}
                disabled={!canClick}
                className={`
                  aspect-square rounded-lg border flex flex-col items-center justify-center
                  transition-all relative
                  ${isTodayDate ? 'border-gold-500/50 ring-1 ring-gold-500/30' : 'border-obsidian-700'}
                  ${status?.worked === true ? 'bg-green-900/30 border-green-700/50' : ''}
                  ${status?.worked === false ? 'bg-red-900/30 border-red-700/50' : ''}
                  ${!status && canClick ? 'bg-obsidian-800/50 hover:bg-obsidian-700/50 cursor-pointer' : ''}
                  ${!canClick ? 'bg-obsidian-900/30 cursor-not-allowed opacity-50' : ''}
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${isTodayDate ? 'text-gold-400' : 'text-obsidian-300'}
                  ${status?.worked === true ? 'text-green-400' : ''}
                  ${status?.worked === false ? 'text-red-400' : ''}
                `}>
                  {day}
                </span>

                {status?.worked === true && (
                  <Check className="w-4 h-4 text-green-500 absolute bottom-1" />
                )}
                {status?.worked === false && (
                  <X className="w-4 h-4 text-red-500 absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-obsidian-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-900/50 border border-green-700/50 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <span className="text-obsidian-400 text-sm">Worked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-900/50 border border-red-700/50 flex items-center justify-center">
              <X className="w-3 h-3 text-red-500" />
            </div>
            <span className="text-obsidian-400 text-sm">Not Worked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-obsidian-800/50 border border-obsidian-700" />
            <span className="text-obsidian-400 text-sm">Not Tracked</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <div className="text-center text-obsidian-500 text-sm">
        Click on past days to mark whether you worked towards your milestone or not.
      </div>
    </div>
  );
}
