'use client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';
import { Trophy, Lock, Star, TrendingUp } from 'lucide-react';

export default function Achievements() {
  const { student, BADGES, language } = useApp();

  const earnedBadges = BADGES.filter(b => student.badges.includes(b.id));
  const lockedBadges = BADGES.filter(b => !student.badges.includes(b.id));

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-display text-2xl mb-2">{t('achievements', language)}</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">{t('trackProgress', language)}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 text-center">
          <Star size={24} className="mx-auto mb-2 text-sand-500" />
          <p className="text-2xl font-display font-bold">{student.xp}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{t('totalXP', language)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 text-center">
          <TrendingUp size={24} className="mx-auto mb-2 text-brand-500" />
          <p className="text-2xl font-display font-bold">{student.level}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{t('currentLevel', language)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 text-center">
          <Trophy size={24} className="mx-auto mb-2 text-sage-500" />
          <p className="text-2xl font-display font-bold">{earnedBadges.length}/{BADGES.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{t('badgesEarned', language)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">{t('levelProgress', language)}</h3>
          <span className="text-sm text-brand-600 font-medium">{t('level', language)} {student.level}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
          <div className="bg-gradient-to-r from-brand-400 to-brand-600 h-4 rounded-full transition-all duration-700 relative" style={{ width: `${student.xp % 100}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-brand-500 rounded-full shadow-sm" />
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{100 - (student.xp % 100)} {t('xpToNext', language)} {student.level + 1}</p>
      </div>

      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="font-medium text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
            {t('earned', language)} ({earnedBadges.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {earnedBadges.map(badge => (
              <div key={badge.id} className="bg-white rounded-xl border border-[var(--color-border)] p-5 text-center relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="badge-earned absolute inset-0 pointer-events-none" />
                <span className="text-3xl mb-2 block">{badge.icon}</span>
                <p className="text-sm font-medium mb-1">{badge.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lockedBadges.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
            {t('locked', language)} ({lockedBadges.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {lockedBadges.map(badge => (
              <div key={badge.id} className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center opacity-60">
                <Lock size={28} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium mb-1 text-gray-500">{badge.name}</p>
                <p className="text-xs text-gray-400">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-brand-50 rounded-xl border border-brand-100 p-5">
        <h3 className="font-medium text-brand-800 mb-3">{t('howToEarn', language)}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { action: t('askQuestion', language), xp: '+5 XP', icon: '💬' },
            { action: t('answerCorrectly', language), xp: '+10 XP', icon: '✅' },
            { action: t('completeQuiz', language), xp: '+20 XP', icon: '📝' },
            { action: t('dailyStreak', language), xp: '+15 XP', icon: '🔥' },
          ].map(item => (
            <div key={item.action} className="flex items-center gap-3 text-sm">
              <span>{item.icon}</span>
              <span className="text-brand-700">{item.action}</span>
              <span className="text-brand-500 font-medium ml-auto">{item.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
