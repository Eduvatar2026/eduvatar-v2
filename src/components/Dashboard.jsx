'use client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';
import { BookOpen, MessageCircle, ClipboardCheck, Trophy, Flame, Star, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { student, setCurrentView, textbookChunks, language } = useApp();

  const stats = [
    { label: t('xpEarned', language), value: student.xp, icon: Star, color: 'text-sand-500', bg: 'bg-sand-50', border: 'border-sand-100' },
    { label: t('level', language), value: student.level, icon: TrendingUp, color: 'text-brand-500', bg: 'bg-brand-50', border: 'border-brand-100' },
    { label: t('badges', language), value: student.badges.length, icon: Trophy, color: 'text-sage-500', bg: 'bg-sage-50', border: 'border-sage-100' },
    { label: t('quizzes', language), value: student.quizScores.length, icon: ClipboardCheck, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const quickActions = [
    { title: t('askAiTutor', language), desc: t('getHelp', language), icon: MessageCircle, view: 'chat', gradient: 'from-brand-500 to-brand-700' },
    { title: t('textbookLibrary', language), desc: textbookChunks.length > 0 ? `${textbookChunks.length} ${t('sectionsLoaded', language)}` : t('uploadTextbooks', language), icon: BookOpen, view: 'library', gradient: 'from-sage-500 to-sage-700' },
    { title: t('takeQuiz', language), desc: t('testKnowledge', language), icon: ClipboardCheck, view: 'quiz', gradient: 'from-sand-500 to-sand-700' },
    { title: t('achievements', language), desc: `${student.badges.length} ${t('badgesEarned', language)}`, icon: Trophy, view: 'achievements', gradient: 'from-purple-500 to-purple-700' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-[var(--color-text)] mb-2">
          {t('welcomeBack', language)}, {student.name} 👋
        </h2>
        <p className="text-[var(--color-text-muted)]">{t('readyToLearn', language)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-4 transition-transform hover:scale-[1.02]`}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={stat.color} />
                <span className="text-2xl font-display font-bold text-[var(--color-text)]">{stat.value}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium text-sm">{t('level', language)} {student.level} {t('progress', language)}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">{student.xp % 100} / 100 {t('xpToNext', language)}</p>
          </div>
          <div className="flex items-center gap-1 text-sand-500">
            <Flame size={16} />
            <span className="text-sm font-medium">{student.streak} {t('dayStreak', language)}</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-gradient-to-r from-brand-400 to-brand-600 h-3 rounded-full transition-all duration-500" style={{ width: `${(student.xp % 100)}%` }} />
        </div>
      </div>

      <h3 className="font-display text-xl mb-4">{t('whatToDo', language)}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <button key={action.view} onClick={() => setCurrentView(action.view)}
              className="group bg-white rounded-xl border border-[var(--color-border)] p-5 text-left hover:shadow-lg hover:border-brand-200 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--color-text)] mb-1">{action.title}</h4>
                  <p className="text-sm text-[var(--color-text-muted)]">{action.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {student.quizScores.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-xl mb-4">{t('recentScores', language)}</h3>
          <div className="bg-white rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {student.quizScores.slice(-5).reverse().map((score, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{score.topic || 'General Quiz'}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{score.date}</p>
                </div>
                <div className={`text-sm font-bold ${score.percent >= 80 ? 'text-sage-600' : score.percent >= 60 ? 'text-sand-600' : 'text-red-500'}`}>
                  {score.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
