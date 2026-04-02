'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/translations';
import {
  ClipboardCheck, Loader2, CheckCircle2, XCircle, ChevronRight,
  RotateCcw, Trophy, Sparkles, BookOpen
} from 'lucide-react';

/**
 * Shuffle an array (Fisher-Yates)
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizSystem() {
  const { textbookChunks, addXP, earnBadge, student, saveQuizScore, language } = useApp();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [...new Set(textbookChunks.map(c => c.chapter))];

  const generateQuiz = async () => {
    if (textbookChunks.length === 0) return;

    setLoading(true);
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setQuizComplete(false);
    setSelected(null);
    setShowResult(false);

    // ─── FIX: Shuffle chunks and pick random subset for variety ───
    const relevantChunks = selectedTopic
      ? textbookChunks.filter(c => c.chapter === selectedTopic)
      : textbookChunks;

    // Shuffle and pick up to 5 random chunks so quizzes vary each time
    const shuffled = shuffle(relevantChunks);
    const picked = shuffled.slice(0, Math.min(5, shuffled.length));
    const content = picked.map(c => `[${c.title} - Page ${c.page}]\n${c.content}`).join('\n\n');

    // Add a randomization seed to the API call so the AI generates different questions
    const seed = Math.random().toString(36).substring(2, 8);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          numQuestions: 5,
          difficulty,
          seed,           // Tells the API to vary its output
          language,       // Generate in current language
        }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);

    const correct = questions[currentQ].correct === index;
    if (correct) {
      setScore(prev => prev + 1);
      addXP(10);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setQuizComplete(true);

      // ─── FIX: Calculate final score correctly including the last question ───
      const lastCorrect = questions[currentQ]?.correct === selected ? 1 : 0;
      const finalScore = score; // score already includes the last correct answer via handleAnswer
      const finalPercent = Math.round(finalScore / questions.length * 100);

      earnBadge('first_quiz');
      if (finalPercent === 100) earnBadge('perfect_quiz');
      addXP(20);

      saveQuizScore({
        topic:          selectedTopic || 'General',
        difficulty,
        score:          finalScore,
        totalQuestions: questions.length,
        percent:        finalPercent,
      });
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  // No textbooks loaded
  if (textbookChunks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <ClipboardCheck size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="font-display text-2xl mb-2">{t('needsTextbooks', language)}</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          {t('needsTextbooksDesc', language)}
        </p>
      </div>
    );
  }

  // Topic selection / quiz setup
  if (questions.length === 0 && !loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl mb-2">{t('quizGenerator', language)}</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          {t('quizDesc', language)}
        </p>

        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">{t('chooseTopic', language)}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                className={`px-4 py-3 rounded-xl border text-sm text-left flex items-center gap-3 transition-all
                  ${selectedTopic === topic
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-[var(--color-border)] bg-white hover:border-brand-200'}`}
                dir="auto"
              >
                <BookOpen size={16} />
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="text-sm font-medium mb-3 block">{t('difficulty', language)}</label>
          <div className="flex gap-3">
            {['easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-5 py-2.5 rounded-xl border text-sm capitalize transition-all
                  ${difficulty === d
                    ? 'border-brand-400 bg-brand-50 text-brand-700 font-medium'
                    : 'border-[var(--color-border)] bg-white hover:border-brand-200'}`}
              >
                {t(d, language)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateQuiz}
          className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-medium
            hover:bg-brand-700 flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles size={16} /> {t('generate', language)}
        </button>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Loader2 size={40} className="mx-auto mb-4 text-brand-500 animate-spin" />
        <h3 className="font-display text-xl mb-2">{t('generatingQuiz', language)}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">{t('aiCreating', language)}</p>
      </div>
    );
  }

  // Quiz complete
  if (quizComplete) {
    const percent = Math.round(score / questions.length * 100);
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center
          ${percent >= 80 ? 'bg-sage-100' : percent >= 60 ? 'bg-sand-100' : 'bg-red-100'}`}>
          <Trophy size={36} className={percent >= 80 ? 'text-sage-600' : percent >= 60 ? 'text-sand-600' : 'text-red-500'} />
        </div>
        <h2 className="font-display text-3xl mb-2">{t('quizComplete', language)}</h2>
        <p className={`text-4xl font-display font-bold mb-2 ${percent >= 80 ? 'text-sage-600' : percent >= 60 ? 'text-sand-600' : 'text-red-500'}`}>
          {percent}%
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          {t('youGot', language)} {score} {t('outOf', language)} {questions.length} {t('correct', language)}
        </p>

        <div className="text-left bg-white rounded-xl border border-[var(--color-border)] divide-y mb-6">
          {questions.map((q, i) => (
            <div key={i} className="px-5 py-4" dir="auto">
              <p className="text-sm font-medium mb-2">{i + 1}. {q.question}</p>
              <p className="text-xs text-sage-600">✓ {q.options[q.correct]}</p>
              {q.explanation && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('explanation', language)}: {q.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => { setQuestions([]); setQuizComplete(false); }}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium
            hover:bg-brand-700 flex items-center justify-center gap-2 mx-auto transition-colors"
        >
          <RotateCcw size={14} /> {t('takeAnother', language)}
        </button>
      </div>
    );
  }

  // Active quiz
  const question = questions[currentQ];
  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-[var(--color-text-muted)]">
          {t('question', language)} {currentQ + 1} {t('of', language)} {questions.length}
        </span>
        <span className="text-sm font-medium text-sage-600">{score} {t('correct', language)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
        <h3 className="font-display text-xl mb-6" dir="auto">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, i) => {
            const isCorrect = question.correct === i;
            const isSelected = selected === i;
            let optionStyle = 'border-[var(--color-border)] hover:border-brand-300 hover:bg-brand-50';

            if (showResult) {
              if (isCorrect) optionStyle = 'border-sage-400 bg-sage-50 text-sage-700';
              else if (isSelected && !isCorrect) optionStyle = 'border-red-400 bg-red-50 text-red-700';
              else optionStyle = 'border-gray-200 opacity-50';
            } else if (isSelected) {
              optionStyle = 'border-brand-400 bg-brand-50 text-brand-700';
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showResult}
                dir="auto"
                className={`quiz-option w-full text-left px-5 py-4 rounded-xl border text-sm
                  flex items-center justify-between transition-all ${optionStyle}`}
              >
                <span>{option}</span>
                {showResult && isCorrect && <CheckCircle2 size={18} className="text-sage-600" />}
                {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        {showResult && question.explanation && (
          <div className="mt-4 p-4 bg-[var(--color-surface-raised)] rounded-lg" dir="auto">
            <p className="text-sm text-[var(--color-text-muted)]">
              <strong>{t('explanation', language)}:</strong> {question.explanation}
            </p>
          </div>
        )}
      </div>

      {showResult && (
        <button
          onClick={nextQuestion}
          className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-medium
            hover:bg-brand-700 flex items-center justify-center gap-2 transition-colors"
        >
          {currentQ + 1 >= questions.length ? t('seeResults', language) : t('nextQuestion', language)}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
