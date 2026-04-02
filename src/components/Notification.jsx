'use client';
import { useApp } from '@/contexts/AppContext';
import { Trophy, TrendingUp, X } from 'lucide-react';

export default function Notification() {
  const { notification } = useApp();
  
  if (!notification) return null;

  const isBadge = notification.type === 'badge';
  const isLevelUp = notification.type === 'levelup';

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border
        ${isBadge 
          ? 'bg-sand-50 border-sand-200 text-sand-800' 
          : 'bg-brand-50 border-brand-200 text-brand-800'}`}
      >
        {isBadge ? <Trophy size={18} className="text-sand-500" /> : <TrendingUp size={18} className="text-brand-500" />}
        <span className="text-sm font-medium">{notification.message}</span>
      </div>
    </div>
  );
}
