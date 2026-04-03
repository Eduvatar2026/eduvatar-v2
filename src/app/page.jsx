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
import CurriculumBrowser from '@/components/CurriculumBrowser';
import Notification from '@/components/Notification';
import LoginPage from '@/components/auth/LoginPage';
import SignupPage from '@/components/auth/SignupPage';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';
import AdminPanel from '@/components/admin/AdminPanel';

// ─── Student App Shell ──────────────────────────────────────────────────────
function StudentApp() {
  const { currentView } = useApp();

  const viewComponents = {
    dashboard:    Dashboard,
    curriculum:   CurriculumBrowser,
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

// ─── Auth Gate: routes by role ──────────────────────────────────────────────
function AuthGate() {
  const { user, role, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');

  // Loading spinner
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

  // Not logged in → show auth screens
  if (!user) {
    if (authMode === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />;
  }

  // ── Role-based routing ────────────────────────────────────────────────────
  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (role === 'admin') {
    return <AdminPanel />;
  }

  // Default: student
  return (
    <AppProvider userId={user.id}>
      <StudentApp />
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
