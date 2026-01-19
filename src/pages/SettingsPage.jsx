import React, { useState } from 'react';
import { User, Bell, Moon, Shield, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card, Button, Input, Modal } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { user, setUser, currentGoal, hasActivePromise, resetAllData, resetToDemo } = useApp();

  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    name: user.fullName,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    deadlineWarning: true,
    promiseBroken: true,
  });

  const [darkMode, setDarkMode] = useState(true);

  // Confirmation modals
  const [showResetGoalModal, setShowResetGoalModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'dark-mode', label: 'Dark Mode', icon: Moon },
    { id: 'danger', label: 'Danger Zone', icon: Shield },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      fullName: formData.name,
      email: formData.email,
    }));
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const handleResetGoal = () => {
    if (hasActivePromise) {
      setError('You cannot reset while you have an active locked promise. Complete or break it first.');
      return;
    }

    if (confirmText !== 'RESET') {
      setError('Please type RESET to confirm.');
      return;
    }

    try {
      resetAllData();
      setShowResetGoalModal(false);
      setConfirmText('');
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteAccount = () => {
    if (hasActivePromise) {
      setError('You cannot delete your account while you have an active locked promise. Complete or break it first.');
      return;
    }

    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm.');
      return;
    }

    // In a real app, this would call an API to delete the account
    // For now, we'll just reset to default state
    try {
      resetAllData();
      setShowDeleteAccountModal(false);
      setConfirmText('');
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-obsidian-500 text-sm mb-2">
          <span>Settings</span>
          <ChevronRight className="w-4 h-4" />
          <span>{currentGoal?.title || 'My Goal'}</span>
          <ChevronRight className="w-4 h-4" />
          <span>Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-obsidian-100">Settings</h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-obsidian-800 text-obsidian-100'
                    : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-800/50'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <Card variant="elevated" padding="lg">
                <h2 className="text-lg font-semibold text-obsidian-100 mb-6">Account</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm text-obsidian-400 mb-1">Name</label>
                    <p className="text-obsidian-200 font-medium">{user.fullName}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-obsidian-400 mb-1">Email</label>
                    <p className="text-obsidian-200">{user.email}</p>
                  </div>
                </form>

                <div className="border-t border-obsidian-700 pt-6">
                  <h3 className="text-md font-medium text-obsidian-200 mb-4">Change Password</h3>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />

                    <Button type="submit" variant="secondary">
                      Update Password
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card variant="elevated" padding="lg">
              <h2 className="text-lg font-semibold text-obsidian-100 mb-6">Notifications</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-obsidian-900/50 rounded-lg">
                  <div>
                    <p className="text-obsidian-200 font-medium">Daily Reminder</p>
                    <p className="text-obsidian-500 text-sm">Get reminded to work on your milestone</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('dailyReminder')}
                    className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${notifications.dailyReminder ? 'bg-gold-500' : 'bg-obsidian-600'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${notifications.dailyReminder ? 'left-7' : 'left-1'}
                      `}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-obsidian-900/50 rounded-lg">
                  <div>
                    <p className="text-obsidian-200 font-medium">Deadline Warning</p>
                    <p className="text-obsidian-500 text-sm">Alert when deadline is approaching</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('deadlineWarning')}
                    className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${notifications.deadlineWarning ? 'bg-gold-500' : 'bg-obsidian-600'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${notifications.deadlineWarning ? 'left-7' : 'left-1'}
                      `}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-obsidian-900/50 rounded-lg">
                  <div>
                    <p className="text-obsidian-200 font-medium">Promise Broken Alert</p>
                    <p className="text-obsidian-500 text-sm">Notify when a promise is marked as broken</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('promiseBroken')}
                    className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${notifications.promiseBroken ? 'bg-gold-500' : 'bg-obsidian-600'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${notifications.promiseBroken ? 'left-7' : 'left-1'}
                      `}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Dark Mode Tab */}
          {activeTab === 'dark-mode' && (
            <Card variant="elevated" padding="lg">
              <h2 className="text-lg font-semibold text-obsidian-100 mb-6">Appearance</h2>

              <div className="flex items-center justify-between p-4 bg-obsidian-900/50 rounded-lg">
                <div>
                  <p className="text-obsidian-200 font-medium">Dark Mode</p>
                  <p className="text-obsidian-500 text-sm">Use dark theme (Obsidian)</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${darkMode ? 'bg-gold-500' : 'bg-obsidian-600'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${darkMode ? 'left-7' : 'left-1'}
                    `}
                  />
                </button>
              </div>

              <p className="text-obsidian-500 text-sm mt-4">
                Note: Light mode is not available in this version. Shift Journey is designed for the Obsidian dark theme experience.
              </p>
            </Card>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <Card variant="default" padding="lg" className="border-red-900/30">
              <h2 className="text-lg font-semibold text-red-400 mb-6">Danger Zone</h2>

              {hasActivePromise && (
                <div className="flex items-start gap-3 p-4 mb-6 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-obsidian-300 text-sm">
                      You have an active locked promise. You must <strong>complete or break</strong> it before performing any destructive actions.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
                  <h3 className="text-obsidian-200 font-medium mb-2">Reset Current Goal</h3>
                  <p className="text-obsidian-500 text-sm mb-4">
                    This will delete your current goal and all milestones. Your failure history will be preserved. This action cannot be undone.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setError('');
                      setConfirmText('');
                      setShowResetGoalModal(true);
                    }}
                    disabled={hasActivePromise}
                  >
                    Reset Goal
                  </Button>
                </div>

                <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
                  <h3 className="text-obsidian-200 font-medium mb-2">Delete Account</h3>
                  <p className="text-obsidian-500 text-sm mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setError('');
                      setConfirmText('');
                      setShowDeleteAccountModal(true);
                    }}
                    disabled={hasActivePromise}
                  >
                    Delete Account
                  </Button>
                </div>

                <div className="p-4 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
                  <h3 className="text-obsidian-200 font-medium mb-2">Reset to Demo Data</h3>
                  <p className="text-obsidian-500 text-sm mb-4">
                    Reset all data to the demo state for testing purposes.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetToDemo}
                  >
                    Reset to Demo
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Reset Goal Confirmation Modal */}
      <Modal
        isOpen={showResetGoalModal}
        onClose={() => {
          setShowResetGoalModal(false);
          setConfirmText('');
          setError('');
        }}
        title="Reset Current Goal"
        size="sm"
      >
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <p className="text-obsidian-300 text-center mb-4">
            This will permanently delete your current goal and all milestones. Your failure history will be preserved.
          </p>

          <p className="text-obsidian-400 text-sm text-center mb-4">
            Type <strong className="text-red-400">RESET</strong> to confirm.
          </p>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type RESET"
            className="mb-4"
          />

          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowResetGoalModal(false);
                setConfirmText('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleResetGoal}
            >
              Reset Goal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteAccountModal}
        onClose={() => {
          setShowDeleteAccountModal(false);
          setConfirmText('');
          setError('');
        }}
        title="Delete Account"
        size="sm"
      >
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <p className="text-obsidian-300 text-center mb-4">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <p className="text-obsidian-400 text-sm text-center mb-4">
            Type <strong className="text-red-400">DELETE</strong> to confirm.
          </p>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="mb-4"
          />

          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeleteAccountModal(false);
                setConfirmText('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
