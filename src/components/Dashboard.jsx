'use client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';
import {
  BookOpen, MessageCircle, ClipboardCheck, Trophy, Flame, Star,
  TrendingUp, AlertTriangle, ArrowRight,
} from 'lucide-react';

const MASTERY_KEYS = {
  mastered:    { bg: 'bg-green-500',  labelKey: 'mastered',    text: 'text-green-700' },
  practiced:   { bg: 'bg-blue-500',   labelKey: 'practiced',   text: 'text-blue-700' },
  in_progress: { bg: 'bg-amber-400',  labelKey: 'inProgress',  text: 'text-amber-700' },
  not_started: { bg: 'bg-gray-200',   labelKey: 'notStarted',  text: 'text-gray-500' },
};

export default function Dashboard() {
  const {
    student, setCurrentView, textbookChunks, language,
    masteryBySubject, weakAreas, setChatMessages, chatMessages,
  } = useApp();

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

  const masterySubjects = Object.entries(masteryBySubject);
  const hasMastery = masterySubjects.some(([, v]) => v.total > 0);

  // Handler: open chat with a topic context
  const reviewTopic = (topic) => {
    const msg = {
      role: 'user',
      content: `I need help reviewing the topic "${topic}". I scored low on quizzes about this. Can you explain the key concepts and give me some practice questions?`,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, msg]);
    setCurrentView('chat');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-3xl text-[var(--color-text)] mb-2">
          {t('welcomeBack', language)}, {student.name} 👋
        </h2>
        <p className="text-[var(--color-text-muted)]">{t('readyToLearn', language)}</p>
      </div>

      {/* Stats */}
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

      {/* Level progress */}
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

      {/* ─── Weak Areas Alert ─────────────────────────────────────────────────── */}
      {weakAreas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-800">{t('topicsToReview', language)}</h3>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            {t('basedOnScores', language)}
          </p>
          <div className="space-y-2">
            {weakAreas.map(w => (
              <div key={w.topic}
                className="flex items-center gap-3 bg-white border border-amber-200 rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)]">{w.topic}</p>
                  <p className="text-xs text-amber-600">
                    Avg score: {w.avgScore}% &middot; {w.quizCount} quiz{w.quizCount !== 1 ? 'zes' : ''}
                  </p>
                </div>
                <button onClick={() => reviewTopic(w.topic)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700
                    text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap">
                  {t('reviewThisTopic', language)} <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Mastery Progress ─────────────────────────────────────────────────── */}
      {hasMastery && (
        <div className="mb-8">
          <h3 className="font-display text-xl mb-4">{t('masteryProgress', language)}</h3>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-5">
              {Object.entries(MASTERY_KEYS).map(([key, c]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${c.bg}`} />
                  <span className="text-xs text-[var(--color-text-muted)]">{t(c.labelKey, language)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {masterySubjects.map(([subject, counts]) => {
                if (counts.total === 0) return null;
                const pct = (n) => Math.round((n / counts.total) * 100);
                return (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[var(--color-text)]">{subject}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {counts.mastered}/{counts.total} mastered
                      </span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                      {counts.mastered > 0 && (
                        <div className="bg-green-500 h-full" style={{ width: `${pct(counts.mastered)}%` }} />
                      )}
                      {counts.practiced > 0 && (
                        <div className="bg-blue-500 h-full" style={{ width: `${pct(counts.practiced)}%` }} />
                      )}
                      {counts.in_progress > 0 && (
                        <div className="bg-amber-400 h-full" style={{ width: `${pct(counts.in_progress)}%` }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
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

      {/* Recent Quiz Scores */}
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
