import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, BookOpen, Pencil, Flame } from 'lucide-react';
import { Button, Card, Modal } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function CalendarPage() {
  const { calendarData, saveCalendarDay, currentLockedMilestone } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [modalWorked, setModalWorked] = useState(null);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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

    // Can only interact with past days or today
    if (clickedDate > today) return;

    // Open journal modal with current data
    setSelectedDay(day);
    setJournalText(calendarData[dateKey]?.journal || '');
    setModalWorked(calendarData[dateKey]?.worked ?? null);
    setSaveError(null);
    setShowJournalModal(true);
  };

  const handleToggleWorked = (worked) => {
    // Only update local modal state - DB save happens on "Save Entry"
    setModalWorked(worked);
  };

  const handleSaveEntry = async () => {
    if (!selectedDay) return;
    const dateKey = formatDateKey(selectedDay);
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveCalendarDay(dateKey, modalWorked, journalText);
      setShowJournalModal(false);
    } catch (err) {
      console.error('Failed to save entry:', err);
      setSaveError(err.message || 'Failed to save. Check database settings.');
    } finally {
      setIsSaving(false);
    }
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

  const isFuture = (day) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const checkDate = new Date(year, month, day);
    return checkDate > today;
  };

  // Calculate stats
  const workedDays = Object.values(calendarData).filter(d => d.worked).length;
  const missedDays = Object.values(calendarData).filter(d => d.worked === false).length;
  const totalTrackedDays = workedDays + missedDays;
  const consistencyRate = totalTrackedDays > 0 ? Math.round((workedDays / totalTrackedDays) * 100) : 0;
  const journalEntries = Object.values(calendarData).filter(d => d.journal && d.journal.trim()).length;

  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

      const dayData = calendarData[dateKey];
      if (dayData?.worked === true) {
        streak++;
      } else if (dayData?.worked === false) {
        break;
      } else if (i > 0) {
        // Skip days with no data (except today)
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

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

  // Journal prompts for reflection
  const journalPrompts = [
    "What did you accomplish today?",
    "What challenges did you face?",
    "What will you do differently tomorrow?",
    "How did you feel about your progress?",
    "What are you grateful for today?",
  ];

  const getRandomPrompt = () => {
    return journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
  };

  const selectedDateKey = selectedDay ? formatDateKey(selectedDay) : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-obsidian-100 mb-1">Daily Journal</h1>
        <p className="text-obsidian-400 text-sm sm:text-base">Track your daily progress and reflect on your journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="default" padding="sm" className="sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">{workedDays}</div>
          <div className="text-obsidian-400 text-xs sm:text-sm">Days Worked</div>
        </Card>
        <Card variant="default" padding="sm" className="sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1">{missedDays}</div>
          <div className="text-obsidian-400 text-xs sm:text-sm">Days Missed</div>
        </Card>
        <Card variant="default" padding="sm" className="sm:p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <span className="text-2xl sm:text-3xl font-bold text-amber-400">{currentStreak}</span>
          </div>
          <div className="text-obsidian-400 text-xs sm:text-sm">Day Streak</div>
        </Card>
        <Card variant="default" padding="sm" className="sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gold-400 mb-1">{consistencyRate}%</div>
          <div className="text-obsidian-400 text-xs sm:text-sm">Consistency</div>
        </Card>
      </div>

      {/* Current Milestone Info */}
      {currentLockedMilestone && (
        <Card variant="highlighted" padding="sm" className="sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-obsidian-400 text-xs sm:text-sm">Currently tracking: </span>
              <span className="text-obsidian-200 font-medium text-sm sm:text-base">
                Milestone {currentLockedMilestone.number}: {currentLockedMilestone.title}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card variant="elevated" padding="md" className="sm:p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button variant="ghost" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold text-obsidian-100">
            {monthNames[month]} {year}
          </h2>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-obsidian-500 text-xs sm:text-sm font-medium py-1 sm:py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const status = getDayStatus(day);
            const isTodayDate = isToday(day);
            const isPastDate = isPast(day);
            const isFutureDate = isFuture(day);
            const canClick = isPastDate || isTodayDate;
            const hasJournal = status?.journal && status.journal.trim();

            return (
              <button
                key={day}
                onClick={() => canClick && handleDayClick(day)}
                disabled={!canClick}
                className={`
                  aspect-square rounded-lg border flex flex-col items-center justify-center
                  transition-all relative p-1
                  ${isTodayDate ? 'border-gold-500/50 ring-1 ring-gold-500/30' : 'border-obsidian-700'}
                  ${status?.worked === true ? 'bg-green-900/30 border-green-700/50' : ''}
                  ${status?.worked === false ? 'bg-red-900/30 border-red-700/50' : ''}
                  ${!status?.worked && canClick ? 'bg-obsidian-800/50 hover:bg-obsidian-700/50 cursor-pointer' : ''}
                  ${isFutureDate ? 'bg-obsidian-900/30 cursor-not-allowed opacity-50' : ''}
                `}
              >
                <span className={`
                  text-xs sm:text-sm font-medium
                  ${isTodayDate ? 'text-gold-400' : 'text-obsidian-300'}
                  ${status?.worked === true ? 'text-green-400' : ''}
                  ${status?.worked === false ? 'text-red-400' : ''}
                `}>
                  {day}
                </span>

                {/* Status icons */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {status?.worked === true && (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  )}
                  {status?.worked === false && (
                    <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  )}
                  {hasJournal && (
                    <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-6 pt-4 border-t border-obsidian-700">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-900/50 border border-green-700/50 flex items-center justify-center">
              <Check className="w-2 h-2 sm:w-3 sm:h-3 text-green-500" />
            </div>
            <span className="text-obsidian-400 text-xs sm:text-sm">Worked</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-900/50 border border-red-700/50 flex items-center justify-center">
              <X className="w-2 h-2 sm:w-3 sm:h-3 text-red-500" />
            </div>
            <span className="text-obsidian-400 text-xs sm:text-sm">Missed</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-obsidian-700 flex items-center justify-center">
              <BookOpen className="w-2 h-2 sm:w-3 sm:h-3 text-blue-400" />
            </div>
            <span className="text-obsidian-400 text-xs sm:text-sm">Has Journal</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <div className="text-center text-obsidian-500 text-xs sm:text-sm">
        Tap any day to mark your progress and add a reflection.
      </div>

      {/* Journal Entries Preview */}
      {journalEntries > 0 && (
        <Card variant="default" padding="md" className="sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-obsidian-100 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            Recent Reflections
          </h3>
          <div className="space-y-3">
            {Object.entries(calendarData)
              .filter(([_, data]) => data.journal && data.journal.trim())
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .slice(0, 3)
              .map(([dateKey, data]) => (
                <div key={dateKey} className="p-3 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-obsidian-400 text-xs sm:text-sm">
                      {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {data.worked === true && (
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <Check className="w-3 h-3" /> Worked
                      </span>
                    )}
                    {data.worked === false && (
                      <span className="text-red-400 text-xs flex items-center gap-1">
                        <X className="w-3 h-3" /> Missed
                      </span>
                    )}
                  </div>
                  <p className="text-obsidian-200 text-sm line-clamp-2">{data.journal}</p>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Journal Modal */}
      <Modal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        title={selectedDay ? `${monthNames[month]} ${selectedDay}, ${year}` : 'Journal Entry'}
        size="md"
      >
        <div className="space-y-6">
          {/* Work Status Toggle */}
          <div>
            <label className="text-obsidian-300 text-sm font-medium mb-3 block">
              Did you work towards your goal today?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleToggleWorked(true)}
                className={`
                  flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                  ${modalWorked === true
                    ? 'bg-green-900/30 border-green-500 text-green-400'
                    : 'bg-obsidian-800/50 border-obsidian-700 text-obsidian-400 hover:border-obsidian-600'
                  }
                `}
              >
                <Check className="w-8 h-8" />
                <span className="font-medium">Yes, I worked!</span>
              </button>
              <button
                onClick={() => handleToggleWorked(false)}
                className={`
                  flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                  ${modalWorked === false
                    ? 'bg-red-900/30 border-red-500 text-red-400'
                    : 'bg-obsidian-800/50 border-obsidian-700 text-obsidian-400 hover:border-obsidian-600'
                  }
                `}
              >
                <X className="w-8 h-8" />
                <span className="font-medium">No, I missed it</span>
              </button>
            </div>
          </div>

          {/* Journal Entry */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-obsidian-300 text-sm font-medium flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Daily Reflection
              </label>
              <button
                onClick={() => setJournalText(prev => prev ? prev : getRandomPrompt())}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Get prompt
              </button>
            </div>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write a short reflection about your day..."
              rows={4}
              className="w-full px-4 py-3 bg-obsidian-800 border border-obsidian-700 rounded-xl
                text-obsidian-100 placeholder-obsidian-500 resize-none
                focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 focus:outline-none
                transition-colors"
            />
            <p className="text-obsidian-500 text-xs mt-2">
              {journalText.length} characters
            </p>
          </div>

          {/* Prompts */}
          <div className="p-3 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
            <p className="text-obsidian-400 text-xs mb-2">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {['What went well?', 'What was hard?', 'Tomorrow I will...'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setJournalText(prev => prev ? `${prev}\n\n${prompt} ` : `${prompt} `)}
                  className="text-xs px-2 py-1 bg-obsidian-700 text-obsidian-300 rounded-md
                    hover:bg-obsidian-600 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {saveError && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
              {saveError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowJournalModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              onClick={handleSaveEntry}
              loading={isSaving}
            >
              Save Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
