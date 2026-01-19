import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout';
import {
  LandingPage,
  LoginPage,
  GoalCreationPage,
  MilestonesPage,
  LockPromisePage,
  DashboardPage,
  CalendarPage,
  ProfilePage,
  SettingsPage,
  HistoryPage,
  HelpPage,
  ShareablePage,
  GoalAccomplishedPage,
} from './pages';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useApp();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Public Shareable Commitment Page - No login required */}
      <Route path="/c/:commitmentId" element={<ShareablePage />} />

      {/* Protected Routes with App Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/goal/create" element={<GoalCreationPage />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/lock-promise/:milestoneId" element={<LockPromisePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/goal-accomplished" element={<GoalAccomplishedPage />} />
      </Route>

      {/* Catch all - redirect to landing */}
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
