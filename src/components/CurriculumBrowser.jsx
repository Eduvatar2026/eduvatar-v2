'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';
import { loadSubjectsForGrade, loadTopicsWithObjectives } from '@/lib/supabase';
import {
  Calculator, FlaskConical, BookOpen, Languages, Moon, Monitor,
  Dna, Atom, Zap, ChevronRight, ChevronDown, ArrowLeft, Target, Loader2
} from 'lucide-react';

// ── Icon mapping for subjects ─────────────────────────────────────────────────
const SUBJECT_ICONS = {
  'Mathematics': Calculator,
  'Science': FlaskConical,
  'Biology': Dna,
  'Chemistry': Atom,
  'Physics': Zap,
  'English Language': BookOpen,
  'Arabic Language': Languages,
  'Islamic Studies': Moon,
  'ICT': Monitor,
};

const SUBJECT_COLORS = {
  'Mathematics': 'bg-blue-50 text-blue-600 border-blue-200',
  'Science': 'bg-green-50 text-green-600 border-green-200',
  'Biology': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Chemistry': 'bg-purple-50 text-purple-600 border-purple-200',
  'Physics': 'bg-orange-50 text-orange-600 border-orange-200',
  'English Language': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  'Arabic Language': 'bg-amber-50 text-amber-600 border-amber-200',
  'Islamic Studies': 'bg-teal-50 text-teal-600 border-teal-200',
  'ICT': 'bg-cyan-50 text-cyan-600 border-cyan-200',
};

export default function CurriculumBrowser() {
  const { student, language } = useApp();
  const grade = student.grade || '1';

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState(null);

  // Load subjects for student's grade
  useEffect(() => {
    setLoading(true);
    loadSubjectsForGrade(grade).then(data => {
      setSubjects(data);
      setLoading(false);
    });
  }, [grade]);

  // Load topics when a subject is selected
  useEffect(() => {
    if (!selectedSubject) { setTopics([]); return; }
    setTopicsLoading(true);
    setExpandedTopic(null);
    loadTopicsWithObjectives(selectedSubject.id).then(data => {
      setTopics(data);
      setTopicsLoading(false);
    });
  }, [selectedSubject]);

  const programme = Number(grade) <= 6 ? 'Primary' : 'Lower Secondary';

  // ── Subject Grid View ───────────────────────────────────────────────────────
  if (!selectedSubject) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-display text-3xl text-[var(--color-text)] mb-1">{t('curriculum', language)}</h1>
          <p className="text-[var(--color-text-muted)]">
            {t('grade', language)} {grade} &middot; {Number(grade) <= 6 ? t('primaryProgramme', language) : t('lowerSecondaryProgramme', language)}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-600" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={40} className="mx-auto text-[var(--color-text-muted)] mb-3" />
            <p className="text-[var(--color-text-muted)]">
              {t('noCurriculum', language)}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {t('noCurriculumHint', language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subj => {
              const Icon = SUBJECT_ICONS[subj.name] || BookOpen;
              const colors = SUBJECT_COLORS[subj.name] || 'bg-gray-50 text-gray-600 border-gray-200';
              return (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubject(subj)}
                  className="bg-white border border-[var(--color-border)] rounded-xl p-5 text-left
                    hover:shadow-md hover:border-brand-300 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${colors}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-[var(--color-text)] group-hover:text-brand-600 transition-colors">
                    {subj.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {subj.programme} &middot; Grade {subj.grade_level}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Topics & Objectives View ────────────────────────────────────────────────
  const Icon = SUBJECT_ICONS[selectedSubject.name] || BookOpen;
  const colors = SUBJECT_COLORS[selectedSubject.name] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => setSelectedSubject(null)}
          className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 mb-3 transition-colors">
          <ArrowLeft size={16} />
          {t('backToSubjects', language)}
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colors}`}>
            <Icon size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl text-[var(--color-text)]">{selectedSubject.name}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t('grade', language)} {selectedSubject.grade_level} &middot; {topics.length} {t('topics', language)}
            </p>
          </div>
        </div>
      </div>

      {topicsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic, idx) => {
            const isOpen = expandedTopic === topic.id;
            const objectives = topic.learning_objectives || [];
            return (
              <div key={topic.id}
                className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
                {/* Topic header */}
                <button
                  onClick={() => setExpandedTopic(isOpen ? null : topic.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--color-surface-raised)] transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--color-text)] text-sm">{topic.name}</h3>
                    {topic.description && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{topic.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] mr-2">
                    {objectives.length} objective{objectives.length !== 1 ? 's' : ''}
                  </span>
                  {isOpen ? <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
                          : <ChevronRight size={16} className="text-[var(--color-text-muted)]" />}
                </button>

                {/* Objectives list */}
                {isOpen && objectives.length > 0 && (
                  <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 space-y-2">
                    {objectives.map(obj => (
                      <div key={obj.id} className="flex items-start gap-3 py-1.5">
                        <Target size={14} className="text-brand-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text)]">{obj.description}</p>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{obj.code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
