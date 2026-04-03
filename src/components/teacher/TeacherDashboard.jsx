'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTeacherProfile, loadStudentsForGrades, loadQuizResultsForStudents,
  loadChatCountsForStudents, loadTeacherNotes, addTeacherNote, deleteTeacherNote,
} from '@/lib/supabase';
import { loadMasteryForStudent } from '@/lib/mastery';
import {
  LayoutDashboard, Users, BarChart3, LogOut, Loader2,
  ArrowLeft, Trophy, MessageCircle, ClipboardCheck, AlertTriangle,
  TrendingDown, StickyNote, Trash2, Send, ChevronRight, Activity, Target,
} from 'lucide-react';

// ─── Views ─────────────────────────────────────────────────────────────────────
const VIEWS = {
  OVERVIEW: 'overview',
  STUDENTS: 'students',
  CLASS: 'class',
  DETAIL: 'detail',
};

const NAV = [
  { id: VIEWS.OVERVIEW, label: 'Overview',       icon: LayoutDashboard },
  { id: VIEWS.STUDENTS, label: 'My Students',    icon: Users },
  { id: VIEWS.CLASS,    label: 'Class Analytics', icon: BarChart3 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function daysAgo(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 0; }

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.name || 'Teacher';

  const [view, setView] = useState(VIEWS.OVERVIEW);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [chatCounts, setChatCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ── Load all data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const profile = await getTeacherProfile(user.id);
      setTeacherProfile(profile);

      const grades = profile?.grades || [];
      if (grades.length === 0) { setLoading(false); return; }

      const studs = await loadStudentsForGrades(grades);
      setStudents(studs);

      const ids = studs.map(s => s.id);
      if (ids.length > 0) {
        const [qr, cc] = await Promise.all([
          loadQuizResultsForStudents(ids),
          loadChatCountsForStudents(ids),
        ]);
        setQuizResults(qr);
        setChatCounts(cc);
      }
      setLoading(false);
    })();
  }, [user]);

  const openDetail = (s) => { setSelectedStudent(s); setView(VIEWS.DETAIL); };
  const backFromDetail = () => { setSelectedStudent(null); setView(VIEWS.STUDENTS); };

  // ── Derived data ────────────────────────────────────────────────────────────
  const quizzesByStudent = {};
  for (const q of quizResults) {
    (quizzesByStudent[q.student_id] ||= []).push(q);
  }

  const inactiveStudents = students.filter(s => daysAgo(s.progress?.last_active) > 5);

  // ── Topic averages for class view ──────────────────────────────────────────
  const topicAverages = {};
  for (const q of quizResults) {
    const t = q.topic || 'Unknown';
    if (!topicAverages[t]) topicAverages[t] = { total: 0, count: 0 };
    topicAverages[t].total += q.percent;
    topicAverages[t].count += 1;
  }
  const topicList = Object.entries(topicAverages)
    .map(([topic, v]) => ({ topic, avg: Math.round(v.total / v.count), count: v.count }))
    .sort((a, b) => a.avg - b.avg);

  // Most / least active by quiz count
  const studentsByActivity = [...students].sort((a, b) =>
    (quizzesByStudent[b.id]?.length || 0) - (quizzesByStudent[a.id]?.length || 0)
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] h-screen bg-white border-r border-[var(--color-border)] flex flex-col shrink-0">
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">V</div>
            <div>
              <h1 className="font-display text-lg leading-tight text-brand-900">Victory</h1>
              <p className="text-[11px] text-[var(--color-text-muted)]">Teacher Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = view === item.id || (view === VIEWS.DETAIL && item.id === VIEWS.STUDENTS);
            return (
              <button key={item.id} onClick={() => { setView(item.id); setSelectedStudent(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${active ? 'bg-brand-50 text-brand-700 font-medium shadow-sm'
                           : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]'}`}>
                <Icon size={18} className="shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--color-border)] space-y-1">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium text-xs">
              {displayName.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {teacherProfile?.subjects?.join(', ') || 'Teacher'}
              </p>
            </div>
          </div>
          <button onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} className="shrink-0" /><span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8 bg-[var(--color-bg)]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={28} className="animate-spin text-brand-600" />
          </div>
        ) : view === VIEWS.OVERVIEW ? (
          <OverviewView
            displayName={displayName} students={students} quizResults={quizResults}
            chatCounts={chatCounts} inactiveStudents={inactiveStudents}
            quizzesByStudent={quizzesByStudent} onViewStudent={openDetail}
            onNavigate={setView} teacherProfile={teacherProfile}
          />
        ) : view === VIEWS.STUDENTS ? (
          <StudentsView students={students} quizzesByStudent={quizzesByStudent}
            chatCounts={chatCounts} onSelect={openDetail} />
        ) : view === VIEWS.CLASS ? (
          <ClassView topicList={topicList} studentsByActivity={studentsByActivity}
            inactiveStudents={inactiveStudents} quizzesByStudent={quizzesByStudent}
            onViewStudent={openDetail} />
        ) : view === VIEWS.DETAIL && selectedStudent ? (
          <StudentDetailView student={selectedStudent} quizzes={quizzesByStudent[selectedStudent.id] || []}
            chatCount={chatCounts[selectedStudent.id] || 0} teacherId={user.id}
            onBack={backFromDetail} />
        ) : null}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: Overview
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewView({ displayName, students, quizResults, chatCounts, inactiveStudents, quizzesByStudent, onViewStudent, onNavigate, teacherProfile }) {
  const totalQuizzes = quizResults.length;
  const avgScore = totalQuizzes > 0 ? Math.round(quizResults.reduce((s, q) => s + q.percent, 0) / totalQuizzes) : 0;
  const totalChats = Object.values(chatCounts).reduce((s, c) => s + c, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-[var(--color-text)] mb-1">Welcome, {displayName}</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Grades {teacherProfile?.grades?.join(', ') || '—'} &middot; {students.length} students
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Quizzes Taken', value: totalQuizzes, icon: ClipboardCheck, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Quiz Score', value: `${avgScore}%`, icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
          { label: 'Questions Asked', value: totalChats, icon: MessageCircle, color: 'text-orange-600 bg-orange-50' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)]">{c.value}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Inactive alerts */}
      {inactiveStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-800">Inactive Students ({inactiveStudents.length})</h3>
          </div>
          <p className="text-sm text-amber-700 mb-3">These students have not logged in for more than 5 days:</p>
          <div className="flex flex-wrap gap-2">
            {inactiveStudents.map(s => (
              <button key={s.id} onClick={() => onViewStudent(s)}
                className="px-3 py-1.5 bg-white border border-amber-300 rounded-full text-sm text-amber-800 hover:bg-amber-100 transition-colors">
                {s.name} <span className="text-amber-500 text-xs">({daysAgo(s.progress?.last_active)}d ago)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => onNavigate(VIEWS.STUDENTS)}
          className="bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:shadow-md hover:border-brand-300 transition-all group">
          <Users size={20} className="text-brand-600 mb-2" />
          <h3 className="font-semibold text-[var(--color-text)] group-hover:text-brand-600">View All Students</h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">See individual student progress and details</p>
        </button>
        <button onClick={() => onNavigate(VIEWS.CLASS)}
          className="bg-white border border-[var(--color-border)] rounded-xl p-5 text-left hover:shadow-md hover:border-brand-300 transition-all group">
          <BarChart3 size={20} className="text-brand-600 mb-2" />
          <h3 className="font-semibold text-[var(--color-text)] group-hover:text-brand-600">Class Analytics</h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Topic averages, activity, and weak areas</p>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: Students List
// ═══════════════════════════════════════════════════════════════════════════════
function StudentsView({ students, quizzesByStudent, chatCounts, onSelect }) {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  const grades = [...new Set(students.map(s => s.grade))].sort((a, b) => Number(a) - Number(b));

  const filtered = students.filter(s => {
    if (gradeFilter !== 'all' && s.grade !== gradeFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-2xl text-[var(--color-text)] mb-6">My Students</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Search by name..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3.5 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-white w-64
            focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
          className="px-3.5 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="all">All Grades</option>
          {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Student</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Grade</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Level</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">XP</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Quizzes</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Last Active</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const qCount = quizzesByStudent[s.id]?.length || 0;
              const lastActive = s.progress?.last_active;
              const days = daysAgo(lastActive);
              return (
                <tr key={s.id} onClick={() => onSelect(s)}
                  className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-raised)] cursor-pointer transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[var(--color-text)]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{s.grade}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[var(--color-text)]">
                      <Trophy size={14} className="text-amber-500" /> {s.progress?.level || 1}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--color-text)]">{s.progress?.xp || 0}</td>
                  <td className="px-5 py-3.5 text-[var(--color-text)]">{qCount}</td>
                  <td className="px-5 py-3.5">
                    <span className={days > 5 ? 'text-red-500 font-medium' : 'text-[var(--color-text-muted)]'}>
                      {lastActive ? (days === 0 ? 'Today' : `${days}d ago`) : 'Never'}
                    </span>
                  </td>
                  <td className="px-3 py-3.5"><ChevronRight size={16} className="text-[var(--color-text-muted)]" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">No students found.</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: Class Analytics
// ═══════════════════════════════════════════════════════════════════════════════
function ClassView({ topicList, studentsByActivity, inactiveStudents, quizzesByStudent, onViewStudent }) {
  const topActive = studentsByActivity.slice(0, 5);
  const leastActive = [...studentsByActivity].reverse().slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-2xl text-[var(--color-text)] mb-6">Class Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic averages */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 lg:col-span-2">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Average Score by Topic</h2>
          {topicList.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No quiz data yet.</p>
          ) : (
            <div className="space-y-3">
              {topicList.map(t => (
                <div key={t.topic} className="flex items-center gap-4">
                  <span className="w-40 text-sm text-[var(--color-text)] truncate" title={t.topic}>{t.topic}</span>
                  <div className="flex-1 h-5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${t.avg < 50 ? 'bg-red-400' : t.avg < 70 ? 'bg-amber-400' : 'bg-green-400'}`}
                      style={{ width: `${t.avg}%` }} />
                  </div>
                  <span className={`text-sm font-medium w-12 text-right ${t.avg < 50 ? 'text-red-600' : t.avg < 70 ? 'text-amber-600' : 'text-green-600'}`}>
                    {t.avg}%
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] w-16 text-right">{t.count} quiz{t.count !== 1 ? 'zes' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most active */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Activity size={16} className="text-green-500" /> Most Active
          </h2>
          <div className="space-y-2">
            {topActive.map((s, i) => (
              <button key={s.id} onClick={() => onViewStudent(s)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-raised)] transition-colors text-left">
                <span className="w-6 text-center text-xs font-bold text-[var(--color-text-muted)]">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-[var(--color-text)]">{s.name}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{quizzesByStudent[s.id]?.length || 0} quizzes</span>
              </button>
            ))}
          </div>
        </div>

        {/* Least active */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <TrendingDown size={16} className="text-red-500" /> Least Active
          </h2>
          <div className="space-y-2">
            {leastActive.map((s, i) => (
              <button key={s.id} onClick={() => onViewStudent(s)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-raised)] transition-colors text-left">
                <span className="w-6 text-center text-xs font-bold text-[var(--color-text-muted)]">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-[var(--color-text)]">{s.name}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{quizzesByStudent[s.id]?.length || 0} quizzes</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inactive alerts */}
        {inactiveStudents.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 lg:col-span-2">
            <h2 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              Inactive for 5+ Days ({inactiveStudents.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {inactiveStudents.map(s => (
                <button key={s.id} onClick={() => onViewStudent(s)}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors text-left">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-medium">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{s.name}</p>
                    <p className="text-xs text-amber-600">Grade {s.grade} &middot; {daysAgo(s.progress?.last_active)}d inactive</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW: Student Detail
// ═══════════════════════════════════════════════════════════════════════════════
function StudentDetailView({ student, quizzes, chatCount, teacherId, onBack }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notesLoading, setNotesLoading] = useState(true);
  const [mastery, setMastery] = useState([]);
  const [masteryLoading, setMasteryLoading] = useState(true);

  // Load notes + mastery
  useEffect(() => {
    setNotesLoading(true);
    setMasteryLoading(true);
    loadTeacherNotes(teacherId, student.id).then(n => { setNotes(n); setNotesLoading(false); });
    loadMasteryForStudent(student.id).then(m => { setMastery(m); setMasteryLoading(false); });
  }, [teacherId, student.id]);

  const handleAddNote = async () => {
    const text = newNote.trim();
    if (!text) return;
    const result = await addTeacherNote(teacherId, student.id, text);
    if (result) { setNotes(prev => [result, ...prev]); setNewNote(''); }
  };

  const handleDelete = async (noteId) => {
    if (await deleteTeacherNote(noteId)) {
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
  };

  const p = student.progress;
  const badges = p?.badges || [];
  const avgQuiz = quizzes.length > 0 ? Math.round(quizzes.reduce((s, q) => s + q.percent, 0) / quizzes.length) : 0;

  // Weak areas: topics with avg < 60%
  const topicScores = {};
  for (const q of quizzes) {
    const t = q.topic || 'Unknown';
    if (!topicScores[t]) topicScores[t] = { total: 0, count: 0 };
    topicScores[t].total += q.percent;
    topicScores[t].count += 1;
  }
  const weakAreas = Object.entries(topicScores)
    .map(([topic, v]) => ({ topic, avg: Math.round(v.total / v.count) }))
    .filter(t => t.avg < 60)
    .sort((a, b) => a.avg - b.avg);

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to students
      </button>

      {/* Header */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl text-[var(--color-text)]">{student.name}</h1>
            <p className="text-[var(--color-text-muted)]">Grade {student.grade}</p>
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
          {[
            { label: 'Level', value: p?.level || 1, icon: Trophy, color: 'text-amber-500' },
            { label: 'XP', value: p?.xp || 0, icon: Activity, color: 'text-blue-500' },
            { label: 'Quizzes', value: quizzes.length, icon: ClipboardCheck, color: 'text-green-500' },
            { label: 'Avg Score', value: `${avgQuiz}%`, icon: BarChart3, color: 'text-purple-500' },
            { label: 'Questions', value: chatCount, icon: MessageCircle, color: 'text-orange-500' },
          ].map(c => (
            <div key={c.label} className="text-center">
              <c.icon size={18} className={`mx-auto mb-1 ${c.color}`} />
              <p className="text-lg font-bold text-[var(--color-text)]">{c.value}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz History */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Quiz History</h2>
          {quizzes.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No quizzes taken yet.</p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {quizzes.slice(0, 20).map(q => (
                <div key={q.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-bg)]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                    ${q.percent >= 80 ? 'bg-green-100 text-green-700' : q.percent >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {q.percent}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{q.topic || 'General'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {q.score}/{q.total_questions} &middot; {new Date(q.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Areas */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <TrendingDown size={16} className="text-red-500" /> Weak Areas
          </h2>
          {weakAreas.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              {quizzes.length === 0 ? 'No quiz data yet.' : 'No weak areas detected — all topics above 60%.'}
            </p>
          ) : (
            <div className="space-y-3">
              {weakAreas.map(w => (
                <div key={w.topic} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-[var(--color-text)] truncate">{w.topic}</span>
                  <div className="w-24 h-3 bg-[var(--color-bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${w.avg}%` }} />
                  </div>
                  <span className="text-sm font-medium text-red-600 w-10 text-right">{w.avg}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Badges */}
          <h3 className="font-semibold text-[var(--color-text)] mt-6 mb-3">Badges ({badges.length})</h3>
          {badges.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No badges earned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.map(b => (
                <span key={b} className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mastery Overview */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 lg:col-span-2">
          <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Target size={16} className="text-green-500" /> Mastery Tracking
          </h2>
          {masteryLoading ? (
            <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-brand-600" /></div>
          ) : mastery.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No mastery data yet.</p>
          ) : (() => {
            // Group by subject
            const bySubject = {};
            for (const m of mastery) {
              const s = m.subjectName || 'Unknown';
              if (!bySubject[s]) bySubject[s] = { mastered: 0, practiced: 0, in_progress: 0, total: 0 };
              bySubject[s].total += 1;
              if (m.level === 'mastered') bySubject[s].mastered += 1;
              else if (m.level === 'practiced') bySubject[s].practiced += 1;
              else bySubject[s].in_progress += 1;
            }
            return (
              <div className="space-y-3">
                {/* Legend */}
                <div className="flex gap-4 mb-2">
                  {[
                    { color: 'bg-green-500', label: 'Mastered' },
                    { color: 'bg-blue-500', label: 'Practiced' },
                    { color: 'bg-amber-400', label: 'In Progress' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                      <span className="text-xs text-[var(--color-text-muted)]">{l.label}</span>
                    </div>
                  ))}
                </div>
                {Object.entries(bySubject).map(([subject, c]) => {
                  const pct = (n) => c.total > 0 ? Math.round((n / c.total) * 100) : 0;
                  return (
                    <div key={subject}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--color-text)]">{subject}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{c.mastered}/{c.total}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                        {c.mastered > 0 && <div className="bg-green-500 h-full" style={{ width: `${pct(c.mastered)}%` }} />}
                        {c.practiced > 0 && <div className="bg-blue-500 h-full" style={{ width: `${pct(c.practiced)}%` }} />}
                        {c.in_progress > 0 && <div className="bg-amber-400 h-full" style={{ width: `${pct(c.in_progress)}%` }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Teacher Notes */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 lg:col-span-2">
          <h2 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <StickyNote size={16} className="text-brand-500" /> Teacher Notes
          </h2>

          {/* Add note */}
          <div className="flex gap-2 mb-4">
            <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)}
              placeholder="Add a note about this student..."
              onKeyDown={e => e.key === 'Enter' && handleAddNote()}
              className="flex-1 px-3.5 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <button onClick={handleAddNote} disabled={!newNote.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg
                transition-colors flex items-center gap-1.5 text-sm">
              <Send size={14} /> Add
            </button>
          </div>

          {/* Notes list */}
          {notesLoading ? (
            <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-brand-600" /></div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No notes yet.</p>
          ) : (
            <div className="space-y-2">
              {notes.map(n => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--color-bg)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text)]">{n.content}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(n.id)}
                    className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
