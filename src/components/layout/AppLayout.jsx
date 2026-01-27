import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, currentLockedMilestone, getTimeRemaining, isPromiseExpired } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tab title countdown timer
  useEffect(() => {
    const originalTitle = 'Shift Ascent';

    const updateTabTitle = () => {
      if (!currentLockedMilestone?.promise?.deadline) {
        document.title = originalTitle;
        return;
      }

      if (isPromiseExpired) {
        document.title = '⚠️ EXPIRED | Shift Ascent';
        return;
      }

      const time = getTimeRemaining();
      if (!time || time.expired) {
        document.title = '⚠️ EXPIRED | Shift Ascent';
        return;
      }

      const h = String(time.hours).padStart(2, '0');
      const m = String(time.minutes).padStart(2, '0');
      const s = String(time.seconds).padStart(2, '0');
      document.title = `⏱️ ${h}:${m}:${s} | Shift Ascent`;
    };

    updateTabTitle();
    const interval = setInterval(updateTabTitle, 1000);

    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [currentLockedMilestone, getTimeRemaining, isPromiseExpired]);

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="h-14 sm:h-16 bg-obsidian-900/50 border-b border-obsidian-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-obsidian-400 hover:text-obsidian-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-obsidian-200 text-sm sm:text-base hidden sm:inline">Welcome back, </span>
            <span className="text-obsidian-100 font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{user?.name || 'User'}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="text-obsidian-400 hover:text-obsidian-200 text-xs sm:text-sm transition-colors hidden sm:block">
              ⌘ Remind me Daily
            </button>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-obsidian-700 border border-obsidian-600 flex items-center justify-center">
              <span className="text-obsidian-300 text-xs sm:text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
