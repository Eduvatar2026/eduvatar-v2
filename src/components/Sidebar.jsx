'use client';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { t, RTL_LANGUAGES } from '@/lib/translations';
import {
  LayoutDashboard, MessageCircle, BookOpen, ClipboardCheck,
  Trophy, ChevronLeft, ChevronRight, Globe, LogOut, GraduationCap
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { id: 'curriculum', labelKey: 'curriculum', icon: GraduationCap },
  { id: 'chat', labelKey: 'askAiTutor', icon: MessageCircle },
  { id: 'library', labelKey: 'textbookLibrary', icon: BookOpen },
  { id: 'quiz', labelKey: 'quizzes', icon: ClipboardCheck },
  { id: 'achievements', labelKey: 'achievements', icon: Trophy },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ur', label: 'اردو' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'fr', label: 'Français' },
  { code: 'ru', label: 'Русский' },
  { code: 'kk', label: 'Қазақша' },
  { code: 'zh', label: '中文' },
];

export default function Sidebar() {
  const { currentView, setCurrentView, student, language, setLanguage } = useApp();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const isRTL = RTL_LANGUAGES.includes(language);

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-[260px]'}
      h-screen bg-white border-r border-[var(--color-border)] flex flex-col
      transition-all duration-300 ease-in-out relative shrink-0`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Logo */}
      <div className="p-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            V
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-lg leading-tight text-brand-900">Victory</h1>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                {t('victoryLearningHub', language)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute ${isRTL ? '-left-3' : '-right-3'} top-20 w-6 h-6 bg-white border border-[var(--color-border)]
          rounded-full flex items-center justify-center shadow-sm hover:shadow z-10
          text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors`}
      >
        {collapsed
          ? (isRTL ? <ChevronLeft size={12} /> : <ChevronRight size={12} />)
          : (isRTL ? <ChevronRight size={12} /> : <ChevronLeft size={12} />)
        }
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                transition-all duration-200
                ${active
                  ? 'bg-brand-50 text-brand-700 font-medium shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]'
                }
                ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? t(item.labelKey, language) : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{t(item.labelKey, language)}</span>}
            </button>
          );
        })}
      </nav>

      {/* Language Selector */}
      <div className="px-3 pb-2 relative">
        <button
          onClick={() => setShowLang(!showLang)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
            text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] transition-colors
            ${collapsed ? 'justify-center' : ''}`}
        >
          <Globe size={18} className="shrink-0" />
          {!collapsed && <span>{LANGUAGES.find(l => l.code === language)?.label || 'English'}</span>}
        </button>
        {showLang && (
          <div className="absolute bottom-full left-3 mb-1 bg-white border border-[var(--color-border)]
            rounded-lg shadow-lg py-1 min-w-[160px] z-20 max-h-[280px] overflow-y-auto">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setShowLang(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-surface-raised)]
                  ${language === lang.code ? 'text-brand-600 font-medium' : 'text-[var(--color-text)]'}`}
                dir={RTL_LANGUAGES.includes(lang.code) ? 'rtl' : 'ltr'}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Info + Logout */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-1">
        <div className={`flex items-center gap-3 px-1 py-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-sand-200 flex items-center justify-center text-sand-700 font-medium text-xs shrink-0">
            {student.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{student.name}</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {t('level', language)} {student.level} · {student.xp} XP
              </p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={signOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
            text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors
            ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
