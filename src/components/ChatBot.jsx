'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function ChatBot() {
  const { language, addXP, earnBadge, questionsAsked, setQuestionsAsked } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    // Clean up any previous D-ID elements
    document.querySelectorAll('script[src*="agent.d-id.com"]').forEach(s => s.remove());
    document.querySelectorAll('[data-name="did-agent"]').forEach(w => w.remove());

    // Create the D-ID Frame script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://agent.d-id.com/v2/index.js';
    script.setAttribute('data-mode', 'full');
    script.setAttribute('data-client-key', 'ck_ajGCJxS0JVlSm0ORQpK5x');
    script.setAttribute('data-agent-id', 'v2_agt_UDf3NNgv');
    script.setAttribute('data-name', 'did-agent');
    script.setAttribute('data-monitor', 'true');
    script.setAttribute('data-target-id', 'did-avatar-container');
    document.body.appendChild(script);

    // Award XP after a delay (student engaged with avatar)
    const xpTimer = setTimeout(() => {
      const newCount = questionsAsked + 1;
      setQuestionsAsked(newCount);
      addXP(5);
      if (newCount === 1) earnBadge('first_question');
      if (newCount === 5) earnBadge('five_questions');
    }, 15000);

    return () => {
      clearTimeout(xpTimer);
      document.querySelectorAll('script[src*="agent.d-id.com"]').forEach(s => s.remove());
      document.querySelectorAll('[data-name="did-agent"]').forEach(w => w.remove());
      scriptLoadedRef.current = false;
    };
  }, []);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white flex flex-col p-2' : 'mx-auto flex flex-col'}`}
      style={!isFullscreen ? { maxWidth: '900px' } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <h2 className="font-display text-lg text-[var(--color-text)]">
            {t('askAiTutor', language)}
          </h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {t('getHelp', language)}
          </p>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] transition-colors border border-[var(--color-border)]"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {/* D-ID Avatar Frame */}
      <div
        id="did-avatar-container"
        className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-white"
        style={{
          width: '100%',
          height: isFullscreen ? 'calc(100vh - 50px)' : '600px',
        }}
      />
    </div>
  );
}
