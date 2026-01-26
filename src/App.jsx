import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout';
import {
  LandingPage,
  LoginPage,
  AuthCallbackPage,
  GoalCreationPage,
  MilestonesPage,
  LockPromisePage,
  DashboardPage,
  HistoryPage,
  ProfilePage,
  SettingsPage,
  HelpPage,
  ShareablePage,
  GoalAccomplishedPage,
  PricingPage,
  AdminPage,
  MilestoneSystemPage,
  PublicProfilePage,
  CalendarPage,
} from './pages';

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-obsidian-400">Loading your journey...</p>
      </div>
    </div>
  );
}

// Error screen component
function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
          <span className="text-3xl">!</span>
        </div>
        <h1 className="text-xl font-bold text-obsidian-100 mb-2">Something went wrong</h1>
        <p className="text-obsidian-400 mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gold-500 text-obsidian-950 rounded-lg font-medium hover:bg-gold-400 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// App entry handler - redirects signed-in users to dashboard, others see app
function AppEntryHandler() {
  const { currentGoal, isLoading, needsGoalSetup } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If no goal exists, redirect to goal creation
  if (needsGoalSetup) {
    return <Navigate to="/goal/create" replace />;
  }

  // If goal exists, go to dashboard
  return <Navigate to="/dashboard" replace />;
}

// Protected app routes wrapper
function AppRouteWrapper({ children }) {
  const { isLoading, error } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page - First thing users see */}
      <Route path="/" element={<LandingPage />} />

      {/* App entry - redirects to dashboard or goal creation */}
      <Route path="/app" element={<AppEntryHandler />} />

      {/* Public Shareable Commitment Page - No login required */}
      <Route path="/c/:commitmentId" element={<ShareablePage />} />

      {/* Public Profile Badge Page - Shareable badges */}
      <Route path="/p/:userId" element={<PublicProfilePage />} />

      {/* Pricing Page - Public */}
      <Route path="/pricing" element={<PricingPage />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Auth Pages - Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* App Routes with Layout */}
      <Route
        element={
          <AppRouteWrapper>
            <AppLayout />
          </AppRouteWrapper>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/goal/create" element={<GoalCreationPage />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/lock-promise/:milestoneId" element={<LockPromisePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/goal-accomplished" element={<GoalAccomplishedPage />} />
        <Route path="/milestone-system" element={<MilestoneSystemPage />} />
      </Route>

      {/* Catch all - redirect to main */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
