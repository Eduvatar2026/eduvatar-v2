'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t, RTL_LANGUAGES } from '@/lib/translations';
import { supabase } from '@/lib/supabase';
import { Upload, BookOpen, Search, FileText, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

// Sample textbook data for demo
const DEMO_TEXTBOOKS = [
  {
    id: 'demo-science',
    name: 'Science — Grade 8',
    chapters: [
      { title: 'Chapter 1: Forces and Motion', page: 1, content: 'Force is a push or pull upon an object resulting from its interaction with another object. Forces result from interactions between objects. Newton\'s First Law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an unbalanced force. This is also known as the law of inertia. Mass is a measure of how much inertia an object has. The greater the mass, the greater the inertia.' },
      { title: 'Chapter 2: Energy and Work', page: 15, content: 'Energy is the ability to do work or cause change. Work is done when a force moves an object through a distance. The formula for work is W = F × d, where W is work in joules, F is force in newtons, and d is distance in meters. There are two main types of energy: kinetic energy (energy of motion) and potential energy (stored energy). Energy can be transformed from one form to another but cannot be created or destroyed. This is the law of conservation of energy.' },
      { title: 'Chapter 3: Electricity', page: 30, content: 'Electric current is the flow of electric charge through a conductor. Voltage is the electrical potential difference that drives current through a circuit. Resistance opposes the flow of current. Ohm\'s Law states that V = I × R, where V is voltage in volts, I is current in amperes, and R is resistance in ohms. A series circuit has only one path for current flow, while a parallel circuit has multiple paths.' },
    ]
  },
  {
    id: 'demo-math',
    name: 'Mathematics — Grade 8',
    chapters: [
      { title: 'Chapter 1: Algebra Basics', page: 1, content: 'Algebra uses variables (letters like x, y, z) to represent unknown values. An algebraic expression combines numbers, variables, and operations. An equation states that two expressions are equal. To solve an equation, isolate the variable on one side. The distributive property states that a(b + c) = ab + ac. Like terms have the same variable raised to the same power and can be combined.' },
      { title: 'Chapter 2: Linear Equations', page: 20, content: 'A linear equation is an equation whose graph is a straight line. The standard form is y = mx + b, where m is the slope and b is the y-intercept. The slope represents the rate of change. To graph a linear equation, find two points that satisfy the equation and draw a line through them. Parallel lines have the same slope. Perpendicular lines have slopes that are negative reciprocals.' },
      { title: 'Chapter 3: Geometry Fundamentals', page: 40, content: 'The area of a rectangle is length × width. The area of a triangle is ½ × base × height. The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse. The circumference of a circle is 2πr and the area is πr². Volume measures three-dimensional space. The volume of a rectangular prism is length × width × height.' },
    ]
  }
];

/**
 * Detect if text contains Arabic/RTL characters
 */
function isRTLText(text) {
  if (!text) return false;
  // Check for Arabic, Hebrew, Urdu character ranges
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/.test(text);
}

/**
 * Save textbook chunks to Supabase (non-blocking)
 */
async function saveChunksToSupabase(chunks) {
  if (!supabase) return;
  try {
    const rows = chunks.map(c => ({
      title: c.title,
      chapter: c.chapter,
      page: c.page,
      content: c.content,
    }));
    await supabase.from('textbook_sections').insert(rows);
  } catch (e) {
    console.warn('Supabase textbook save failed (non-critical):', e);
  }
}

export default function TextbookLibrary() {
  const { textbookChunks, setTextbookChunks, setCurrentView, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const fileInputRef = useRef(null);
  const isRTL = RTL_LANGUAGES.includes(language);

  // Auto-load: try Supabase first, then /textbooks.json, then localStorage (already handled by AppContext)
  useEffect(() => {
    if (textbookChunks.length > 0) return; // Already loaded from AppContext/localStorage

    // Try Supabase
    async function loadFromSupabase() {
      if (!supabase) return false;
      try {
        const { data, error } = await supabase
          .from('textbook_sections')
          .select('*')
          .order('id');
        if (!error && data && data.length > 0) {
          const formatted = data.map((c) => ({
            id: c.id,
            title: c.title || `Section ${c.id}`,
            chapter: c.chapter || 'General',
            page: c.page || 0,
            content: c.content || '',
          }));
          setTextbookChunks(formatted);
          return true;
        }
      } catch (e) { /* silent */ }
      return false;
    }

    // Try /textbooks.json fallback
    async function loadFromJSON() {
      try {
        const r = await fetch('/textbooks.json');
        if (!r.ok) return;
        const data = await r.json();
        if (data && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((c, i) => ({
            id: i,
            title: c.title || `Section ${i + 1}`,
            chapter: c.chapter || 'General',
            page: c.page || 0,
            content: c.content || '',
          }));
          setTextbookChunks(formatted);
          // Also save to Supabase for future loads
          saveChunksToSupabase(formatted);
        }
      } catch (e) { /* silent */ }
    }

    loadFromSupabase().then(loaded => {
      if (!loaded) loadFromJSON();
    });
  }, []);

  const loadDemoContent = () => {
    const allChunks = DEMO_TEXTBOOKS.flatMap(book =>
      book.chapters.map((ch, i) => ({
        id: `${book.id}-${i}`,
        title: ch.title,
        chapter: book.name,
        page: ch.page,
        content: ch.content,
      }))
    );
    setTextbookChunks(allChunks);
    saveChunksToSupabase(allChunks);
    setUploadStatus({ type: 'success', message: 'Demo textbooks loaded successfully!' });
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const chunks = Array.isArray(data) ? data : data.chunks || data.sections || [];
        const formatted = chunks.map((c, i) => ({
          id: `upload-${Date.now()}-${i}`,
          title: c.title || `Section ${i + 1}`,
          chapter: c.chapter || file.name.replace('.json', ''),
          page: c.page || 0,
          content: c.content || c.text || '',
        }));
        setTextbookChunks(prev => [...prev, ...formatted]);
        saveChunksToSupabase(formatted);
        setUploadStatus({ type: 'success', message: `Loaded ${formatted.length} sections from ${file.name}` });
      } catch (err) {
        setUploadStatus({ type: 'error', message: 'Invalid JSON format. See expected format below.' });
      }
    } else if (file.name.endsWith('.pdf')) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          // If the API returns processed chunks, load them directly
          if (data.chunks && data.chunks.length > 0) {
            const formatted = data.chunks.map((c, i) => ({
              id: `pdf-${Date.now()}-${i}`,
              title: c.title || `Page ${c.page || i + 1}`,
              chapter: c.chapter || file.name.replace('.pdf', ''),
              page: c.page || i + 1,
              content: c.content || c.text || '',
            }));
            setTextbookChunks(prev => [...prev, ...formatted]);
            saveChunksToSupabase(formatted);
            setUploadStatus({ type: 'success', message: `Loaded ${formatted.length} sections from ${file.name}` });
          } else {
            setUploadStatus({
              type: 'success',
              message: `${file.name} uploaded. Run 'npm run process-pdfs' to extract text, then reload.`
            });
          }
        } else {
          setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' });
        }
      } catch (err) {
        setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' });
      }
    } else {
      setUploadStatus({ type: 'error', message: 'Please upload a .json or .pdf file' });
    }
    setTimeout(() => setUploadStatus(null), 5000);
    e.target.value = '';
  };

  // Filter chunks by search
  const filteredChunks = searchQuery
    ? textbookChunks.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : textbookChunks;

  // Group by chapter
  const groupedChunks = filteredChunks.reduce((acc, chunk) => {
    const key = chunk.chapter;
    if (!acc[key]) acc[key] = [];
    acc[key].push(chunk);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl mb-1">{t('textbookLibrary', language)}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {textbookChunks.length} {t('sectionsAcross', language)} {Object.keys(groupedChunks).length} {t('textbooks', language)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadDemoContent}
            className="px-4 py-2 text-sm bg-sage-50 text-sage-700 rounded-lg
              hover:bg-sage-100 border border-sage-200 transition-colors"
          >
            {t('loadDemoBooks', language)}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg
              hover:bg-brand-700 flex items-center gap-2 transition-colors"
          >
            <Upload size={14} /> {t('uploadTextbook', language)}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {uploadStatus && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-fade-in
          ${uploadStatus.type === 'success' ? 'bg-sage-50 text-sage-700 border border-sage-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {uploadStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {uploadStatus.message}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchContent', language)}
          dir="auto"
          className={`w-full bg-white border border-[var(--color-border)] rounded-xl ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3
            text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200`}
        />
      </div>

      {/* Empty state */}
      {textbookChunks.length === 0 && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-xl mb-2">{t('noTextbooks', language)}</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
            {t('noTextbooksDesc', language)}
          </p>
          <div className="bg-[var(--color-surface-raised)] rounded-lg p-4 max-w-lg mx-auto text-left" dir="ltr">
            <p className="text-xs font-mono text-[var(--color-text-muted)] mb-2">Expected JSON format:</p>
            <pre className="text-xs font-mono text-[var(--color-text)] overflow-x-auto">
{`[
  {
    "title": "Chapter 1: Forces",
    "chapter": "Science Grade 8",
    "page": 1,
    "content": "Force is a push or pull..."
  }
]`}
            </pre>
          </div>
        </div>
      )}

      {/* Textbook content grouped by chapter */}
      {Object.entries(groupedChunks).map(([chapter, chunks]) => (
        <div key={chapter} className="mb-6">
          <h3 className="font-medium text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-1"
            dir="auto"
          >
            {chapter}
          </h3>
          <div className="bg-white rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {chunks.map(chunk => {
              // Detect text direction per-chunk for mixed content
              const contentIsRTL = isRTLText(chunk.content) || isRTLText(chunk.title);

              return (
                <button
                  key={chunk.id}
                  onClick={() => setSelectedBook(selectedBook === chunk.id ? null : chunk.id)}
                  className="w-full text-left px-5 py-4 hover:bg-[var(--color-surface-raised)] transition-colors"
                  dir="auto"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-brand-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium" dir="auto">{chunk.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{t('page', language)} {chunk.page}</p>
                      </div>
                    </div>
                    <ChevronRight size={14}
                      className={`text-gray-400 transition-transform ${selectedBook === chunk.id ? 'rotate-90' : ''} ${contentIsRTL ? 'rotate-180' : ''}`}
                    />
                  </div>
                  {selectedBook === chunk.id && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed"
                        dir="auto"
                        style={{ textAlign: contentIsRTL ? 'right' : 'left' }}
                      >
                        {chunk.content.slice(0, 300)}
                        {chunk.content.length > 300 && '...'}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentView('chat'); }}
                          className="text-xs px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100"
                        >
                          {t('askAbout', language)}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCurrentView('quiz'); }}
                          className="text-xs px-3 py-1.5 bg-sage-50 text-sage-600 rounded-lg hover:bg-sage-100"
                        >
                          {t('generateQuiz', language)}
                        </button>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
