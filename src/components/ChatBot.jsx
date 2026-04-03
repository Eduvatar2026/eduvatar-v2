'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';
import { saveChatMessage } from '@/lib/supabase';
import { Maximize2, Minimize2, RefreshCw, Send, AlertCircle } from 'lucide-react';
import Markdown from './Markdown';

const DID_AGENT_ID  = 'v2_agt_UDf3NNgv';
const DID_CLIENT_KEY = 'ck_ajGCJxS0JVlSm0ORQpK5x';
const DID_SCRIPT_SRC = 'https://agent.d-id.com/v2/index.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function cleanupDID() {
  document.querySelectorAll(`script[src*="agent.d-id.com"]`).forEach(s => s.remove());
  document.querySelectorAll('[data-name="did-agent"]').forEach(w => w.remove());
  // Remove any leftover iframes d-id may have injected
  document.querySelectorAll('iframe[src*="d-id.com"]').forEach(f => f.remove());
}

function injectDID(targetId) {
  cleanupDID();
  const script = document.createElement('script');
  script.type = 'module';
  script.src = DID_SCRIPT_SRC;
  script.setAttribute('data-mode', 'full');
  script.setAttribute('data-client-key', DID_CLIENT_KEY);
  script.setAttribute('data-agent-id', DID_AGENT_ID);
  script.setAttribute('data-name', 'did-agent');
  script.setAttribute('data-monitor', 'true');
  script.setAttribute('data-target-id', targetId);
  document.body.appendChild(script);
  return script;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function ChatBot() {
  const {
    language, addXP, earnBadge, questionsAsked, setQuestionsAsked,
    chatMessages, setChatMessages, textbookChunks, userId,
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [didLoaded, setDidLoaded] = useState(false);
  const [didError, setDidError] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef(null);
  const mountedRef = useRef(true);

  // ── Load D-ID on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    setDidError(false);
    setDidLoaded(false);

    const script = injectDID('did-avatar-container');

    // Detect load success / failure
    const checkInterval = setInterval(() => {
      const container = document.getElementById('did-avatar-container');
      if (container && (container.children.length > 0 || container.querySelector('iframe'))) {
        if (mountedRef.current) setDidLoaded(true);
        clearInterval(checkInterval);
      }
    }, 1000);

    const failTimer = setTimeout(() => {
      clearInterval(checkInterval);
      if (mountedRef.current && !didLoaded) {
        // Even if detection fails the avatar may still work — don't mark error
        // Just mark as "loaded" since the script is present
        setDidLoaded(true);
      }
    }, 8000);

    // XP for engagement
    const xpTimer = setTimeout(() => {
      if (!mountedRef.current) return;
      const newCount = questionsAsked + 1;
      setQuestionsAsked(newCount);
      addXP(5);
      if (newCount === 1) earnBadge('first_question');
      if (newCount === 5) earnBadge('five_questions');
    }, 15000);

    return () => {
      mountedRef.current = false;
      clearTimeout(xpTimer);
      clearTimeout(failTimer);
      clearInterval(checkInterval);
      cleanupDID();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reload D-ID ─────────────────────────────────────────────────────────────
  const reloadAvatar = useCallback(() => {
    setDidLoaded(false);
    setDidError(false);
    injectDID('did-avatar-container');
    setTimeout(() => { if (mountedRef.current) setDidLoaded(true); }, 5000);
  }, []);

  // ── Text chat fallback ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // Save to DB
    if (userId) saveChatMessage(userId, { role: 'user', content: text }).catch(() => {});

    // XP + badges
    const newCount = questionsAsked + 1;
    setQuestionsAsked(newCount);
    addXP(10);
    if (newCount === 1) earnBadge('first_question');
    if (newCount === 5) earnBadge('five_questions');

    try {
      // Build context from textbooks
      const context = textbookChunks.slice(0, 5).map(c =>
        `[${c.title || 'Section'} - Chapter ${c.chapter || '?'}, Page ${c.page || '?'}]\n${c.content?.slice(0, 800)}`
      ).join('\n\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          context,
          history: chatMessages.slice(-6),
          language,
        }),
      });
      const data = await res.json();
      const assistantMsg = { role: 'assistant', content: data.answer, timestamp: new Date().toISOString() };
      setChatMessages(prev => [...prev, assistantMsg]);
      if (userId) saveChatMessage(userId, { role: 'assistant', content: data.answer }).catch(() => {});
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    }
    setThinking(false);
  }, [input, thinking, chatMessages, setChatMessages, textbookChunks, language, userId, questionsAsked, setQuestionsAsked, addXP, earnBadge]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, thinking]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white flex flex-col' : 'mx-auto flex flex-col'}`}
      style={!isFullscreen ? { maxWidth: '900px', height: 'calc(100vh - 8rem)' } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1 shrink-0">
        <div>
          <h2 className="font-display text-lg text-[var(--color-text)]">
            {t('askAiTutor', language)}
          </h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {t('getHelp', language)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reloadAvatar}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)]
              hover:bg-[var(--color-surface-raised)] transition-colors border border-[var(--color-border)]"
            title="Reload avatar">
            <RefreshCw size={14} /> {t('reload', language)}
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)]
              hover:bg-[var(--color-surface-raised)] transition-colors border border-[var(--color-border)]">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullscreen ? t('exitFullscreen', language) : t('fullscreen', language)}
          </button>
        </div>
      </div>

      {/* D-ID Avatar Container */}
      <div
        id="did-avatar-container"
        className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-black shrink-0"
        style={{
          width: '100%',
          height: isFullscreen ? '55vh' : '400px',
          minHeight: '200px',
        }}
      />

      {/* D-ID error fallback notice */}
      {didError && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg mt-2 text-xs text-amber-700">
          <AlertCircle size={14} />
          {t('avatarLoadError', language)}
        </div>
      )}

      {/* Text Chat — always available as fallback */}
      <div className="flex-1 flex flex-col mt-2 bg-white border border-[var(--color-border)] rounded-xl overflow-hidden min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm
                ${msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-md'
                  : 'bg-[var(--color-surface-raised)] text-[var(--color-text)] rounded-bl-md'}`}>
                {msg.role === 'assistant' ? <Markdown content={msg.content} /> : msg.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-[var(--color-surface-raised)] px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-[var(--color-text-muted)]">
                <span className="flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  {t('thinking', language)}
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-[var(--color-border)] p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t('askAnything', language)}
              disabled={thinking}
              className="flex-1 px-3.5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm bg-white
                text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || thinking}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white
                rounded-lg transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
