import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';
import { Modal, Button, Textarea } from '../ui';

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, expiredPromise, clearExpiredPromise, currentLockedMilestone, getTimeRemaining } = useApp();
  const [reason, setReason] = useState('');

  // Tab title countdown timer
  useEffect(() => {
    const originalTitle = 'Shift Journey';

    const updateTabTitle = () => {
      if (!currentLockedMilestone?.promise?.deadline) {
        document.title = originalTitle;
        return;
      }

      const time = getTimeRemaining();
      if (!time || time.expired) {
        document.title = '⚠️ EXPIRED | Shift Journey';
        return;
      }

      const h = String(time.hours).padStart(2, '0');
      const m = String(time.minutes).padStart(2, '0');
      const s = String(time.seconds).padStart(2, '0');
      document.title = `⏱️ ${h}:${m}:${s} | Shift Journey`;
    };

    updateTabTitle();
    const interval = setInterval(updateTabTitle, 1000);

    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [currentLockedMilestone, getTimeRemaining]);

  const handleAcknowledge = () => {
    clearExpiredPromise();
    setReason('');
  };

  return (
    <div className="min-h-screen bg-obsidian-950">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="h-16 bg-obsidian-900/50 border-b border-obsidian-800 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="text-obsidian-200">Welcome back, </span>
            <span className="text-obsidian-100 font-medium">{user?.name || 'User'}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-obsidian-400 hover:text-obsidian-200 text-sm transition-colors">
              ⌘ Remind me Daily
            </button>
            <div className="w-8 h-8 rounded-full bg-obsidian-700 border border-obsidian-600 flex items-center justify-center">
              <span className="text-obsidian-300 text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Expired Promise Notification Modal */}
      <Modal
        isOpen={!!expiredPromise}
        onClose={handleAcknowledge}
        title="Promise Expired"
        size="md"
        showClose={false}
      >
        <div>
          {/* Warning Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-900/30 border-2 border-red-700/50 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-obsidian-100 mb-2">
              Your deadline has passed
            </h3>
            <p className="text-obsidian-300 mb-4">
              The promise for <strong>"{expiredPromise?.title}"</strong> has been automatically marked as broken.
            </p>
            <p className="text-obsidian-500 text-sm">
              Your integrity score has decreased by 15 points.
            </p>
          </div>

          {/* Promise Details */}
          <div className="bg-obsidian-900/50 border border-red-900/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0" />
              <div>
                <p className="text-obsidian-400 text-sm mb-1">
                  Milestone {expiredPromise?.number}
                </p>
                <p className="text-obsidian-200 font-medium mb-2">
                  {expiredPromise?.title}
                </p>
                {expiredPromise?.promise?.text && (
                  <p className="text-obsidian-500 text-sm italic">
                    "{expiredPromise.promise.text}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Philosophy Reminder */}
          <div className="bg-obsidian-800/50 border border-obsidian-700 rounded-lg p-4 mb-6">
            <p className="text-obsidian-400 text-sm text-center">
              This failure has been permanently recorded. Consequences are not punishment—they are <strong className="text-obsidian-300">memory and identity pressure</strong>. Use this to grow stronger.
            </p>
          </div>

          {/* Action */}
          <div className="text-center">
            <Button
              variant="secondary"
              onClick={handleAcknowledge}
              className="min-w-[200px]"
            >
              I Acknowledge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
