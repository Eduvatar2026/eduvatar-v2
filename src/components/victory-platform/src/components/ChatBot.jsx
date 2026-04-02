'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t, RTL_LANGUAGES } from '@/lib/translations';
import { searchTextbook } from '@/lib/textbookSearch';
import { Send, Bot, User, Loader2, BookOpen, Sparkles, RefreshCw, Mic, MicOff, Volume2, Square } from 'lucide-react';
import Markdown from '@/components/Markdown';
import { AvatarDisplay, AvatarSelector, AVATARS } from '@/components/AvatarDisplay';

export default function ChatBot() {
  const {
    textbookChunks, language, addXP, earnBadge,
    chatMessages, setChatMessages,
    questionsAsked, setQuestionsAsked,
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isRTL = RTL_LANGUAGES.includes(language);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const audioRef = useRef(null);

  // ─── Avatar State ───
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [avatarState, setAvatarState] = useState('idle');
  const [selectedVoice, setSelectedVoice] = useState('onyx');

  // ─── FIX #1: Separate male and female voices, filter by avatar gender ───
  const ALL_VOICES = [
    { id: 'onyx', label: 'Onyx', gender: 'male' },
    { id: 'echo', label: 'Echo', gender: 'male' },
    { id: 'fable', label: 'Fable', gender: 'male' },
    { id: 'nova', label: 'Nova', gender: 'female' },
    { id: 'shimmer', label: 'Shimmer', gender: 'female' },
    { id: 'alloy', label: 'Alloy', gender: 'neutral' },
  ];

  // Only show voices that match the avatar's gender (or neutral)
  const availableVoices = ALL_VOICES.filter(v =>
    v.gender === selectedAvatar.gender || v.gender === 'neutral'
  );

  const SUGGESTED_QUESTIONS = [
    t('suggestedQ1', language),
    t('suggestedQ2', language),
    t('suggestedQ3', language),
  ];

  const SPEECH_LANG_MAP = {
    en: 'en-US', ar: 'ar-SA', ur: 'ur-PK',
    hi: 'hi-IN', fr: 'fr-FR', ru: 'ru-RU', kk: 'kk-KZ',
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        finalTranscriptRef.current = final;
        setInput(final || interim);
      };

      recognition.onerror = () => { setIsListening(false); setAvatarState('idle'); };
      recognition.onend = () => { setIsListening(false); };
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = SPEECH_LANG_MAP[language] || 'en-US';
    }
  }, [language]);

  // ─── Natural TTS via OpenAI API ───
  const speakMessage = useCallback(async (text, msgIndex) => {
    if (speakingMsgIndex === msgIndex && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setSpeakingMsgIndex(null);
      setAvatarState('idle');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setSpeakingMsgIndex(msgIndex);
    setAvatarState('speaking');

    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, voice: selectedVoice }),
      });

      if (!response.ok) {
        console.error('TTS failed, falling back to browser');
        fallbackSpeak(text);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setSpeakingMsgIndex(null);
        setAvatarState('idle');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setSpeakingMsgIndex(null);
        setAvatarState('idle');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audioRef.current = audio;
      await audio.play();

    } catch (error) {
      console.error('TTS error:', error);
      setSpeakingMsgIndex(null);
      setAvatarState('idle');
      fallbackSpeak(text);
    }
  }, [language, speakingMsgIndex, selectedVoice]);

  const fallbackSpeak = (text) => {
    if (!window.speechSynthesis) return;
    const cleanText = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/[#*`\[\]]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = SPEECH_LANG_MAP[language] || 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => { setSpeakingMsgIndex(null); setAvatarState('idle'); };
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMsgIndex(null);
    setAvatarState('idle');
  }, []);

  const sendMessage = useCallback(async (text) => {
    const msgText = text || input;
    if (!msgText.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: msgText.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setAvatarState('thinking');

    const relevantChunks = searchTextbook(msgText, textbookChunks, 3);
    const context = relevantChunks.map(c =>
      `[${c.title} - Page ${c.page}]\n${c.content}`
    ).join('\n\n');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: msgText,
          context,
          history: chatMessages.slice(-6),
          language,
        }),
      });

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.answer || "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date().toISOString(),
        sources: relevantChunks.length > 0 ? relevantChunks.map(c => c.title) : null,
        avatar: selectedAvatar.id,
      };

      setChatMessages(prev => {
        const updated = [...prev, assistantMessage];
        if (autoSpeak) {
          setTimeout(() => speakMessage(assistantMessage.content, updated.length - 1), 300);
        } else {
          setAvatarState('idle');
        }
        return updated;
      });

      const newCount = questionsAsked + 1;
      setQuestionsAsked(newCount);
      addXP(5);
      if (newCount === 1) earnBadge('first_question');
      if (newCount === 5) earnBadge('five_questions');

    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I had trouble connecting. Make sure the server is running and the API key is configured.',
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
      setAvatarState('idle');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, textbookChunks, chatMessages, language, questionsAsked, autoSpeak, speakMessage, selectedAvatar]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    stopSpeaking();
    recognitionRef.current.lang = SPEECH_LANG_MAP[language] || 'en-US';
    setInput('');
    finalTranscriptRef.current = '';
    setAvatarState('listening');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      setAvatarState('idle');
    }
  }, [isListening, language, stopSpeaking]);

  const stopListeningAndSend = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
    setTimeout(() => {
      const text = finalTranscriptRef.current || input;
      if (text.trim()) {
        sendMessage(text.trim());
      } else {
        setAvatarState('idle');
      }
    }, 400);
  }, [isListening, input, sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    stopSpeaking();
    setChatMessages([{
      role: 'assistant',
      content: t(selectedAvatar.greetingKey, language) || selectedAvatar.greetingKey,
      timestamp: new Date().toISOString(),
      avatar: selectedAvatar.id,
    }]);
  };

  const handleAvatarSelect = (av) => {
    setSelectedAvatar(av);
    // ─── FIX #1: Set a gender-appropriate default voice when switching avatars ───
    if (av.gender === 'male') {
      setSelectedVoice('onyx');
    } else if (av.gender === 'female') {
      setSelectedVoice('nova');
    } else {
      setSelectedVoice('alloy');
    }
    setChatMessages([{
      role: 'assistant',
      content: t(av.greetingKey, language) || av.greetingKey,
      timestamp: new Date().toISOString(),
      avatar: av.id,
    }]);
  };

  // ─── FIX #1: If the current voice doesn't match the avatar's gender, auto-correct ───
  useEffect(() => {
    const currentVoice = ALL_VOICES.find(v => v.id === selectedVoice);
    if (currentVoice && currentVoice.gender !== 'neutral' && currentVoice.gender !== selectedAvatar.gender) {
      // Voice doesn't match avatar gender — switch to default
      if (selectedAvatar.gender === 'male') setSelectedVoice('onyx');
      else if (selectedAvatar.gender === 'female') setSelectedVoice('nova');
      else setSelectedVoice('alloy');
    }
  }, [selectedAvatar]);

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* ─── FIX #5: Header now only has voice controls and new chat — avatar selector moved below ─── */}
      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAutoSpeak(!autoSpeak); if (autoSpeak) stopSpeaking(); }}
            className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${autoSpeak ? 'bg-brand-50 text-brand-600' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]'}`}
          >
            {autoSpeak ? <Volume2 size={11} /> : <Square size={11} />}
            {autoSpeak ? 'Voice ON' : 'Voice OFF'}
          </button>
          {autoSpeak && (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="text-[10px] px-1.5 py-1 rounded-md border border-[var(--color-border)] bg-white text-[var(--color-text)] focus:outline-none"
            >
              {/* ─── FIX #1: Only show voices matching avatar gender ─── */}
              {availableVoices.map(v => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          )}
          <button onClick={resetChat} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-surface-raised)] transition-colors">
            <RefreshCw size={11} /> {t('newChat', language)}
          </button>
        </div>
      </div>

      {/* ─── FIX #4 & #5: Avatar Display (bigger) with selector dropdown BELOW it ─── */}
      <div className="flex flex-col items-center mb-3 py-2">
        <AvatarDisplay state={avatarState} avatar={selectedAvatar} language={language} />
        {/* ─── FIX #5: Avatar selector is now directly under the avatar portrait ─── */}
        <div className="mt-2">
          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onSelect={handleAvatarSelect}
            compact={true}
            language={language}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-white border border-[var(--color-border)] p-4 space-y-4">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`chat-message flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-100 text-brand-600' : 'bg-sage-100 text-sage-600'}`}>
              {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-br-md' : msg.isError ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md' : 'bg-[var(--color-surface-raised)] text-[var(--color-text)] rounded-bl-md'}`} dir="auto">
                {msg.role === 'user'
                  ? <p className="whitespace-pre-wrap">{msg.content}</p>
                  : <Markdown content={msg.content} />
                }
              </div>

              {msg.role === 'assistant' && !msg.isError && (
                <button onClick={() => speakMessage(msg.content, i)} className={`mt-1 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full transition-all ${speakingMsgIndex === i ? 'bg-brand-100 text-brand-700 border border-brand-300' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]'}`}>
                  {speakingMsgIndex === i
                    ? <><Square size={10} className="fill-current" /> Stop</>
                    : <><Volume2 size={10} /> Listen</>
                  }
                </button>
              )}

              {/* ─── FIX #2: Source references wrapped in bdi for proper RTL isolation ─── */}
              {msg.sources && (
                <div className="mt-1.5 flex flex-wrap gap-1" dir="ltr">
                  {msg.sources.map((src, j) => (
                    <span key={j} className="inline-flex items-center gap-1 text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      <BookOpen size={10} />
                      <bdi>{src}</bdi>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-600 flex items-center justify-center">
              <Bot size={13} />
            </div>
            <div className="bg-[var(--color-surface-raised)] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Loader2 size={14} className="animate-spin" />
                {t('thinking', language)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {chatMessages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-white hover:border-brand-300 hover:text-brand-600 transition-all flex items-center gap-1" dir="auto">
              <Sparkles size={10} /> {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area with push-to-talk */}
      <div className="mt-2 flex gap-2">
        {speechSupported && (
          <button
            onMouseDown={startListening}
            onMouseUp={stopListeningAndSend}
            onTouchStart={startListening}
            onTouchEnd={stopListeningAndSend}
            onMouseLeave={() => { if (isListening) stopListeningAndSend(); }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all select-none ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200 scale-110' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:bg-gray-200 hover:text-[var(--color-text)]'}`}
            title="Hold to talk, release to send"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? '🎤 Listening...' : t('askAnything', language)}
            rows={1}
            dir="auto"
            className={`w-full resize-none bg-white border rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 transition-colors placeholder:text-gray-400 ${isListening ? 'border-red-300 bg-red-50' : 'border-[var(--color-border)]'}`}
          />
        </div>

        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
