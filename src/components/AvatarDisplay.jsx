'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { t } from '@/lib/translations';

export const AVATARS = [
  {
    id: 'ibn_sina',
    name: 'Ibn Sina',
    displayName: 'Ibn Sina (Avicenna)',
    subjects: ['Science', 'Biology', 'Medicine'],
    greetingKey: 'greetingIbnSina',
    gender: 'male',
    colors: { primary: '#1B6B4A', secondary: '#D4AF37', glow: '#2E8B57', bg: '#F0F7F4' },
    image: '/avatars/ibn_sina.png',
  },
  {
    id: 'einstein',
    name: 'Einstein',
    displayName: 'Albert Einstein',
    subjects: ['Physics', 'Mathematics', 'Space'],
    greetingKey: 'greetingEinstein',
    gender: 'male',
    colors: { primary: '#37474F', secondary: '#FFC107', glow: '#546E7A', bg: '#F5F5F5' },
    image: '/avatars/einstein.png',
  },
];

/* ─── Ibn Sina SVG Avatar ─── */
function IbnSinaSVG({ state, blinkOpen }) {
  const mouthOpen = state === 'speaking';
  const browLift = state === 'listening' ? -3 : state === 'thinking' ? -5 : 0;
  const eyeLookX = state === 'thinking' ? -3 : 0;
  const eyeLookY = state === 'thinking' ? -4 : state === 'listening' ? -1 : 0;
  const eyeScaleY = blinkOpen ? 1 : 0.1;

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="98" fill="#E8F5E9" />
      <rect x="82" y="145" width="36" height="30" rx="6" fill="#C8956C" />
      <ellipse cx="100" cy="195" rx="70" ry="40" fill="#1B6B4A" />
      <ellipse cx="100" cy="195" rx="55" ry="32" fill="#237D57" />
      <path d="M60 178 Q100 165 140 178" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="100" cy="110" rx="44" ry="50" fill="#D4A574" />
      <ellipse cx="100" cy="142" rx="34" ry="24" fill="#4A3728" />
      <ellipse cx="100" cy="138" rx="30" ry="18" fill="#5C442F" />
      <ellipse cx="100" cy="62" rx="48" ry="30" fill="#FFFFFF" />
      <ellipse cx="100" cy="58" rx="44" ry="26" fill="#F5F5F5" />
      <ellipse cx="100" cy="56" rx="40" ry="22" fill="#FFFFFF" />
      <path d="M60 62 Q80 48 100 52 Q120 48 140 62" fill="none" stroke="#E0E0E0" strokeWidth="1.5" />
      <path d="M65 68 Q85 55 100 58 Q115 55 135 68" fill="none" stroke="#E0E0E0" strokeWidth="1" />
      <circle cx="100" cy="50" r="6" fill="#D4AF37" />
      <circle cx="100" cy="50" r="3.5" fill="#1B6B4A" />

      <ellipse cx="82" cy="102" rx="10" ry="7" fill="white" />
      <g transform={`translate(${eyeLookX}, ${eyeLookY}) scale(1, ${eyeScaleY})`} style={{ transformOrigin: '82px 102px', transition: 'transform 0.15s ease' }}>
        <circle cx="82" cy="102" r="4.5" fill="#2C1810" />
        <circle cx="80.5" cy="100.5" r="1.5" fill="white" />
      </g>
      <ellipse cx="118" cy="102" rx="10" ry="7" fill="white" />
      <g transform={`translate(${eyeLookX}, ${eyeLookY}) scale(1, ${eyeScaleY})`} style={{ transformOrigin: '118px 102px', transition: 'transform 0.15s ease' }}>
        <circle cx="118" cy="102" r="4.5" fill="#2C1810" />
        <circle cx="116.5" cy="100.5" r="1.5" fill="white" />
      </g>

      <g transform={`translate(0, ${browLift})`} style={{ transition: 'transform 0.3s ease' }}>
        <path d="M72 92 Q82 86 92 90" fill="none" stroke="#3A2618" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M108 90 Q118 86 128 92" fill="none" stroke="#3A2618" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <path d="M97 108 Q100 116 103 108" fill="none" stroke="#B8845A" strokeWidth="1.5" strokeLinecap="round" />

      {mouthOpen ? (
        <ellipse cx="100" cy="130" rx="8" ry="5" fill="#8B3A3A" />
      ) : (
        <path d="M90 128 Q100 136 110 128" fill="none" stroke="#8B5E3C" strokeWidth="2" strokeLinecap="round" />
      )}

      {state === 'thinking' && (
        <g>
          <circle cx="145" cy="75" r="3" fill="#D4AF37" opacity="0.6" />
          <circle cx="155" cy="65" r="4" fill="#D4AF37" opacity="0.7" />
          <circle cx="167" cy="52" r="5" fill="#D4AF37" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

/* ─── Einstein SVG Avatar ─── */
function EinsteinSVG({ state, blinkOpen }) {
  const mouthOpen = state === 'speaking';
  const browLift = state === 'listening' ? -3 : state === 'thinking' ? -5 : 0;
  const eyeLookX = state === 'thinking' ? 3 : 0;
  const eyeLookY = state === 'thinking' ? -4 : state === 'listening' ? -1 : 0;
  const eyeScaleY = blinkOpen ? 1 : 0.1;

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="98" fill="#ECEFF1" />
      <rect x="84" y="145" width="32" height="30" rx="6" fill="#E0B088" />
      <ellipse cx="100" cy="195" rx="68" ry="40" fill="#5D4037" />
      <ellipse cx="100" cy="195" rx="54" ry="32" fill="#6D4C41" />
      <path d="M80 172 Q100 180 120 172" fill="none" stroke="#795548" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="100" cy="112" rx="42" ry="48" fill="#ECC9A0" />
      <ellipse cx="100" cy="68" rx="52" ry="32" fill="#E8E8E8" />
      <ellipse cx="56" cy="80" rx="18" ry="22" fill="#E0E0E0" />
      <ellipse cx="144" cy="80" rx="18" ry="22" fill="#E0E0E0" />
      <ellipse cx="100" cy="60" rx="46" ry="28" fill="#F5F5F5" />
      <path d="M55 65 Q40 50 55 40" fill="none" stroke="#D0D0D0" strokeWidth="3" strokeLinecap="round" />
      <path d="M145 65 Q160 50 145 40" fill="none" stroke="#D0D0D0" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 50 Q60 35 72 30" fill="none" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round" />
      <path d="M130 50 Q140 35 128 30" fill="none" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round" />

      <path d="M78 126 Q90 120 100 124 Q110 120 122 126" fill="#B0B0B0" />
      <path d="M80 127 Q90 122 100 125 Q110 122 120 127" fill="#C8C8C8" />

      <ellipse cx="82" cy="102" rx="10" ry="7" fill="white" />
      <g transform={`translate(${eyeLookX}, ${eyeLookY}) scale(1, ${eyeScaleY})`} style={{ transformOrigin: '82px 102px', transition: 'transform 0.15s ease' }}>
        <circle cx="82" cy="102" r="4.5" fill="#2C1810" />
        <circle cx="80.5" cy="100.5" r="1.5" fill="white" />
      </g>
      <ellipse cx="118" cy="102" rx="10" ry="7" fill="white" />
      <g transform={`translate(${eyeLookX}, ${eyeLookY}) scale(1, ${eyeScaleY})`} style={{ transformOrigin: '118px 102px', transition: 'transform 0.15s ease' }}>
        <circle cx="118" cy="102" r="4.5" fill="#2C1810" />
        <circle cx="116.5" cy="100.5" r="1.5" fill="white" />
      </g>

      <g transform={`translate(0, ${browLift})`} style={{ transition: 'transform 0.3s ease' }}>
        <path d="M70 90 Q76 83 88 88 Q92 89 94 92" fill="none" stroke="#A0A0A0" strokeWidth="3" strokeLinecap="round" />
        <path d="M106 92 Q108 89 112 88 Q124 83 130 90" fill="none" stroke="#A0A0A0" strokeWidth="3" strokeLinecap="round" />
      </g>

      <path d="M96 106 Q94 118 90 120 Q96 124 104 120" fill="#D9AA78" stroke="#C49A6C" strokeWidth="0.5" />

      {mouthOpen ? (
        <ellipse cx="100" cy="134" rx="9" ry="6" fill="#8B3A3A" />
      ) : (
        <path d="M88 132 Q100 142 112 132" fill="none" stroke="#8B5E3C" strokeWidth="2" strokeLinecap="round" />
      )}

      <path d="M78 88 Q100 84 122 88" fill="none" stroke="#D9AA78" strokeWidth="0.7" opacity="0.5" />

      {state === 'thinking' && (
        <g>
          <circle cx="148" cy="72" r="3" fill="#FFC107" opacity="0.6" />
          <circle cx="158" cy="62" r="4" fill="#FFC107" opacity="0.7" />
          <circle cx="170" cy="49" r="5" fill="#FFC107" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

/* ─── Avatar Portrait wrapper ─── */
function AvatarPortrait({ avatar, state, size = 'large', blinkOpen = true }) {
  const sizeMap = { large: 'w-40 h-40', medium: 'w-12 h-12', tiny: 'w-6 h-6' };
  const sizeClass = sizeMap[size] || sizeMap.large;

  if (size === 'tiny' || size === 'medium') {
    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold`}
        style={{ backgroundColor: avatar.colors.primary, fontSize: size === 'medium' ? '0.75rem' : '0.4rem' }}>
        {avatar.name.split(' ').map(w => w[0]).join('')}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden`}>
      {avatar.id === 'ibn_sina' && <IbnSinaSVG state={state} blinkOpen={blinkOpen} />}
      {avatar.id === 'einstein' && <EinsteinSVG state={state} blinkOpen={blinkOpen} />}
    </div>
  );
}

/* ─── Main Avatar Display ─── */
export function AvatarDisplay({ state = 'idle', avatar, language = 'en' }) {
  const [blinkOpen, setBlinkOpen] = useState(true);
  const [mouthPhase, setMouthPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkOpen(false);
      setTimeout(() => setBlinkOpen(true), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state !== 'speaking') return;
    const interval = setInterval(() => {
      setMouthPhase(prev => prev + 1);
    }, 220);
    return () => clearInterval(interval);
  }, [state]);

  const effectiveState = state === 'speaking'
    ? (mouthPhase % 3 === 0 ? 'idle' : 'speaking')
    : state;

  if (!avatar) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative transition-all duration-500 ease-out ${state === 'speaking' ? 'scale-105' : ''}`}>
        <div className="relative">
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            state === 'speaking' ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 animate-spin-slow' :
            state === 'listening' ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 animate-pulse' :
            state === 'thinking' ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 animate-pulse' :
            'bg-gray-200'
          }`} style={{ padding: '4px', width: '11rem', height: '11rem' }}>
            <div className="w-full h-full rounded-full bg-white" />
          </div>
          <div className="relative z-10 p-[4px]" style={{ width: '11rem', height: '11rem' }}>
            <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-md">
              <AvatarPortrait avatar={avatar} state={effectiveState} size="large" blinkOpen={blinkOpen} />
            </div>
          </div>
        </div>

        {state !== 'idle' && (
          <div className={`absolute inset-0 rounded-full -z-10 blur-2xl transition-all duration-500 ${
            state === 'speaking' ? 'bg-emerald-400 scale-130 opacity-50' :
            state === 'listening' ? 'bg-blue-400 scale-115 opacity-40' :
            state === 'thinking' ? 'bg-amber-400 scale-115 opacity-40' : ''
          }`} style={{ width: '11rem', height: '11rem' }} />
        )}

        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border-2 border-white text-[10px] font-semibold z-20 flex items-center gap-1 whitespace-nowrap ${
          state === 'speaking' ? 'bg-green-500 text-white' :
          state === 'listening' ? 'bg-blue-500 text-white animate-pulse' :
          state === 'thinking' ? 'bg-amber-500 text-white animate-pulse' :
          'bg-gray-200 text-gray-600'
        }`}>
          {state === 'speaking' && t('stateSpeaking', language)}
          {state === 'listening' && t('stateListening', language)}
          {state === 'thinking' && t('stateThinking', language)}
          {state === 'idle' && t('stateReady', language)}
        </div>
      </div>

      <div className="text-center mt-2">
        <p className="text-sm font-semibold text-[var(--color-text)]">{avatar.displayName}</p>
        <p className="text-[11px] text-[var(--color-text-muted)]">{avatar.subjects.join(' · ')}</p>
      </div>
    </div>
  );
}

/* ─── Avatar Selector ─── */
export function AvatarSelector({ selectedAvatar, onSelect, compact = false, language = 'en' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (compact) {
    return (
      <div ref={ref} className="relative inline-block">
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-[var(--color-surface-raised)] hover:bg-gray-100 transition-colors border border-[var(--color-border)]">
          <AvatarPortrait avatar={selectedAvatar} state="idle" size="tiny" />
          <span className="text-[var(--color-text)] font-medium">{selectedAvatar?.name || t('chooseTutor', language)}</span>
          <ChevronDown size={12} className={`transition-transform text-[var(--color-text-muted)] ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-[var(--color-border)] rounded-xl shadow-xl py-2 min-w-[260px] z-30">
            <p className="px-4 py-1.5 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              {t('chooseTutor', language)}
            </p>
            {AVATARS.map(av => (
              <button key={av.id} onClick={() => { onSelect(av); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-raised)] transition-colors ${selectedAvatar?.id === av.id ? 'bg-brand-50' : ''}`}>
                <AvatarPortrait avatar={av} state="idle" size="medium" />
                <div className="text-left">
                  <p className="text-sm font-medium">{av.displayName}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{av.subjects.join(', ')}</p>
                </div>
                {selectedAvatar?.id === av.id && <Sparkles size={14} className="text-brand-500 ml-auto" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
      {AVATARS.map(av => (
        <button key={av.id} onClick={() => onSelect(av)}
          className={`p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${selectedAvatar?.id === av.id ? 'border-brand-400 bg-brand-50 shadow-md scale-[1.02]' : 'border-[var(--color-border)] bg-white hover:border-brand-200'}`}>
          <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden">
            <AvatarPortrait avatar={av} state="idle" size="large" />
          </div>
          <p className="font-medium text-sm">{av.displayName}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{av.subjects.join(', ')}</p>
        </button>
      ))}
    </div>
  );
}
