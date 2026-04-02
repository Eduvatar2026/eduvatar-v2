'use client';
import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider, useApp } from '@/contexts/AppContext';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ChatBot from '@/components/ChatBot';
import TextbookLibrary from '@/components/TextbookLibrary';
import QuizSystem from '@/components/QuizSystem';
import Achievements from '@/components/Achievements';
import Notification from '@/components/Notification';
import LoginPage from '@/components/auth/LoginPage';
import SignupPage from '@/components/auth/SignupPage';

// ─── App Shell (only rendered when authenticated) ────────────────────────────
function AppContent() {
  const { currentView } = useApp();

  const viewComponents = {
    dashboard:    Dashboard,
    chat:         ChatBot,
    library:      TextbookLibrary,
    quiz:         QuizSystem,
    achievements: Achievements,
  };

  const CurrentComponent = viewComponents[currentView] || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <CurrentComponent />
      </main>
      <Notification />
    </div>
  );
}

// ─── Auth Gate: decides what to render based on auth state ───────────────────
function AuthGate() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
            V
          </div>
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />;
  }

  // User is authenticated — mount AppProvider with their userId so all data
  // is scoped to this student. Unmounts on logout, clearing in-memory state.
  return (
    <AppProvider userId={user.id}>
      <AppContent />
    </AppProvider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
