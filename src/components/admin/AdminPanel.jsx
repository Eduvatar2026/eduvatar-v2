'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  loadAdminStats, loadAllTeachers, loadAllStudents, loadAllClasses,
  updateTeacherAssignments, toggleUserActive, updateStudentGrade,
  createClass, updateClassTeacher, toggleClassActive,
  enrollStudent, unenrollStudent, loadClassEnrollments, exportCSV,
} from '@/lib/admin';
import {
  LayoutDashboard, Users, GraduationCap, School, FileBarChart,
  LogOut, ShieldCheck, Loader2, Search, Plus, UserX, UserCheck,
  ChevronDown, ChevronRight, Download, X, Check, Edit2,
} from 'lucide-react';

const VIEWS = { OVERVIEW: 'overview', TEACHERS: 'teachers', STUDENTS: 'students', CLASSES: 'classes', REPORTS: 'reports' };
const NAV = [
  { id: VIEWS.OVERVIEW, label: 'Overview',        icon: LayoutDashboard },
  { id: VIEWS.TEACHERS, label: 'Manage Teachers', icon: GraduationCap },
  { id: VIEWS.STUDENTS, label: 'Manage Students', icon: Users },
  { id: VIEWS.CLASSES,  label: 'Manage Classes',  icon: School },
  { id: VIEWS.REPORTS,  label: 'Reports',         icon: FileBarChart },
];
const GRADES = ['1','2','3','4','5','6','7','8','9'];
const SUBJECTS = ['Mathematics','Science','Biology','Chemistry','Physics','English Language','Arabic Language','Islamic Studies','ICT'];

// ─── Shared ────────────────────────────────────────────────────────────────────
function Pill({ children, color = 'brand' }) {
  const map = { brand: 'bg-brand-50 text-brand-700', green: 'bg-green-50 text-green-700', red: 'bg-red-50 text-red-700', amber: 'bg-amber-50 text-amber-700' };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${map[color] || map.brand}`}>{children}</span>;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
      <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
    </div>
  );
}

const INPUT = 'px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.name || 'Admin';
  const [view, setView] = useState(VIEWS.OVERVIEW);
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [s, t, st, cl] = await Promise.all([
        loadAdminStats(), loadAllTeachers(), loadAllStudents(), loadAllClasses(),
      ]);
      setStats(s); setTeachers(t); setStudents(st); setClasses(cl);
      setLoading(false);
    })();
  }, []);

  const refreshTeachers = useCallback(() => loadAllTeachers().then(setTeachers), []);
  const refreshStudents = useCallback(() => loadAllStudents().then(setStudents), []);
  const refreshClasses  = useCallback(() => loadAllClasses().then(setClasses), []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] h-screen bg-white border-r border-[var(--color-border)] flex flex-col shrink-0">
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">V</div>
            <div>
              <h1 className="font-display text-lg leading-tight text-brand-900">Victory</h1>
              <p className="text-[11px] text-[var(--color-text-muted)]">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(n => {
            const Icon = n.icon; const active = view === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${active ? 'bg-brand-50 text-brand-700 font-medium shadow-sm' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]'}`}>
                <Icon size={18} className="shrink-0" /><span className="flex-1 text-left">{n.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[var(--color-border)] space-y-1">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700"><ShieldCheck size={16} /></div>
            <div className="overflow-hidden flex-1"><p className="text-sm font-medium truncate">{displayName}</p><p className="text-[11px] text-[var(--color-text-muted)]">Administrator</p></div>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-[var(--color-bg)]">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 size={28} className="animate-spin text-brand-600" /></div>
        ) : view === VIEWS.OVERVIEW ? (
          <OverviewView stats={stats} teacherCount={teachers.length} classCount={classes.length} />
        ) : view === VIEWS.TEACHERS ? (
          <TeachersView teachers={teachers} refresh={refreshTeachers} />
        ) : view === VIEWS.STUDENTS ? (
          <StudentsView students={students} refresh={refreshStudents} />
        ) : view === VIEWS.CLASSES ? (
          <ClassesView classes={classes} teachers={teachers} students={students} refresh={refreshClasses} />
        ) : view === VIEWS.REPORTS ? (
          <ReportsView stats={stats} students={students} teachers={teachers} />
        ) : null}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewView({ stats, teacherCount, classCount }) {
  if (!stats) return <p className="text-[var(--color-text-muted)]">No data available.</p>;
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-[var(--color-text)] mb-1">School Overview</h1>
      <p className="text-[var(--color-text-muted)] mb-8">Victory International Schools</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.studentCount} icon={Users} color="text-blue-600 bg-blue-50" />
        <StatCard label="Total Teachers" value={teacherCount} icon={GraduationCap} color="text-green-600 bg-green-50" />
        <StatCard label="Active Today" value={stats.activeToday} icon={LayoutDashboard} color="text-purple-600 bg-purple-50" />
        <StatCard label="Classes" value={classCount} icon={School} color="text-orange-600 bg-orange-50" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Average XP" value={stats.avgXP} icon={LayoutDashboard} color="text-amber-600 bg-amber-50" />
        <StatCard label="Avg Quiz Score" value={`${stats.avgQuiz}%`} icon={FileBarChart} color="text-indigo-600 bg-indigo-50" />
        <StatCard label="Total Quizzes" value={stats.quizzes?.length || 0} icon={FileBarChart} color="text-teal-600 bg-teal-50" />
      </div>

      {/* Grade Distribution */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Students by Grade</h2>
        <div className="flex items-end gap-3 h-40">
          {GRADES.map(g => {
            const count = stats.gradeCounts?.[g] || 0;
            const maxCount = Math.max(...Object.values(stats.gradeCounts || {}), 1);
            const h = Math.max((count / maxCount) * 100, 4);
            return (
              <div key={g} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-[var(--color-text)]">{count}</span>
                <div className="w-full bg-brand-100 rounded-t-md" style={{ height: `${h}%` }}>
                  <div className="w-full h-full bg-brand-500 rounded-t-md" />
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">G{g}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular topics */}
      {stats.popularTopics?.length > 0 && (
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h2 className="font-semibold text-[var(--color-text)] mb-4">Most Popular Quiz Topics</h2>
          <div className="space-y-2">
            {stats.popularTopics.map((t, i) => (
              <div key={t.topic} className="flex items-center gap-3">
                <span className="w-6 text-center text-xs font-bold text-[var(--color-text-muted)]">{i + 1}</span>
                <span className="flex-1 text-sm text-[var(--color-text)]">{t.topic}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{t.count} quizzes</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHERS
// ═══════════════════════════════════════════════════════════════════════════════
function TeachersView({ teachers, refresh }) {
  const [editing, setEditing] = useState(null); // teacher id
  const [editSubjects, setEditSubjects] = useState([]);
  const [editGrades, setEditGrades] = useState([]);

  const startEdit = (t) => {
    setEditing(t.id); setEditSubjects([...t.subjects]); setEditGrades([...t.grades]);
  };
  const cancelEdit = () => setEditing(null);
  const saveEdit = async (tid) => {
    await updateTeacherAssignments(tid, editSubjects, editGrades);
    setEditing(null); refresh();
  };
  const handleToggle = async (t) => {
    await toggleUserActive(t.id, !t.is_active); refresh();
  };
  const toggleItem = (arr, set, val) => set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--color-text)]">Manage Teachers</h1>
        <span className="text-sm text-[var(--color-text-muted)]">{teachers.length} teachers</span>
      </div>
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Name</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Subjects</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Grades</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => {
              const isEditing = editing === t.id;
              return (
                <tr key={t.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-medium">{t.name.charAt(0)}</div>
                      <span className={`font-medium ${t.is_active ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] line-through'}`}>{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-1">
                        {SUBJECTS.map(s => (
                          <button key={s} type="button" onClick={() => toggleItem(editSubjects, setEditSubjects, s)}
                            className={`px-2 py-0.5 rounded text-[10px] border transition-all ${editSubjects.includes(s) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">{(t.subjects || []).map(s => <Pill key={s}>{s}</Pill>)}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-1">
                        {GRADES.map(g => (
                          <button key={g} type="button" onClick={() => toggleItem(editGrades, setEditGrades, g)}
                            className={`w-7 h-7 rounded text-[10px] font-medium border transition-all ${editGrades.includes(g) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">{(t.grades || []).map(g => <Pill key={g} color="green">G{g}</Pill>)}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Pill color={t.is_active ? 'green' : 'red'}>{t.is_active ? 'Active' : 'Inactive'}</Pill>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(t.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600"><Check size={14} /></button>
                          <button onClick={cancelEdit} className="p-1.5 rounded hover:bg-red-50 text-red-500"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(t)} className="p-1.5 rounded hover:bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]" title="Edit assignments"><Edit2 size={14} /></button>
                          <button onClick={() => handleToggle(t)} className="p-1.5 rounded hover:bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]" title={t.is_active ? 'Deactivate' : 'Activate'}>
                            {t.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {teachers.length === 0 && <div className="text-center py-12 text-[var(--color-text-muted)]">No teachers registered yet.</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════════════════════════
function StudentsView({ students, refresh }) {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [editingGrade, setEditingGrade] = useState(null);
  const [newGrade, setNewGrade] = useState('');

  const grades = [...new Set(students.map(s => s.grade).filter(Boolean))].sort((a, b) => +a - +b);

  let filtered = students.filter(s => {
    if (gradeFilter !== 'all' && s.grade !== gradeFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'grade') return (a.grade || '').localeCompare(b.grade || '');
    if (sortBy === 'xp') return (b.progress?.xp || 0) - (a.progress?.xp || 0);
    if (sortBy === 'active') {
      const da = a.progress?.last_active || '0'; const db = b.progress?.last_active || '0';
      return db.localeCompare(da);
    }
    return 0;
  });

  const handleGradeChange = async (sid) => {
    if (newGrade) { await updateStudentGrade(sid, newGrade); refresh(); }
    setEditingGrade(null);
  };
  const handleToggle = async (s) => { await toggleUserActive(s.id, !s.is_active); refresh(); };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--color-text)]">Manage Students</h1>
        <span className="text-sm text-[var(--color-text-muted)]">{students.length} total &middot; {filtered.length} shown</span>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
            className={`${INPUT} pl-9 w-64`} />
        </div>
        <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className={INPUT}>
          <option value="all">All Grades</option>
          {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={INPUT}>
          <option value="name">Sort: Name</option>
          <option value="grade">Sort: Grade</option>
          <option value="xp">Sort: XP</option>
          <option value="active">Sort: Last Active</option>
        </select>
      </div>
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Name</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Grade</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">XP</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Level</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Last Active</th>
              <th className="text-left px-5 py-3 font-medium text-[var(--color-text-muted)]">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-raised)]">
                <td className="px-5 py-3">
                  <span className={s.is_active !== false ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] line-through'}>{s.name}</span>
                </td>
                <td className="px-5 py-3">
                  {editingGrade === s.id ? (
                    <div className="flex items-center gap-1">
                      <select value={newGrade} onChange={e => setNewGrade(e.target.value)} className={`${INPUT} py-1 text-xs w-20`}>
                        {GRADES.map(g => <option key={g} value={g}>G{g}</option>)}
                      </select>
                      <button onClick={() => handleGradeChange(s.id)} className="p-1 text-green-600"><Check size={12} /></button>
                      <button onClick={() => setEditingGrade(null)} className="p-1 text-red-500"><X size={12} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingGrade(s.id); setNewGrade(s.grade || '1'); }}
                      className="text-[var(--color-text)] hover:text-brand-600" title="Change grade">{s.grade || '—'}</button>
                  )}
                </td>
                <td className="px-5 py-3 text-[var(--color-text)]">{s.progress?.xp || 0}</td>
                <td className="px-5 py-3 text-[var(--color-text)]">{s.progress?.level || 1}</td>
                <td className="px-5 py-3 text-[var(--color-text-muted)]">{s.progress?.last_active || 'Never'}</td>
                <td className="px-5 py-3"><Pill color={s.is_active !== false ? 'green' : 'red'}>{s.is_active !== false ? 'Active' : 'Inactive'}</Pill></td>
                <td className="px-3 py-3">
                  <button onClick={() => handleToggle(s)} className="p-1.5 rounded hover:bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]" title={s.is_active !== false ? 'Deactivate' : 'Activate'}>
                    {s.is_active !== false ? <UserX size={14} /> : <UserCheck size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-[var(--color-text-muted)]">No students found.</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSES
// ═══════════════════════════════════════════════════════════════════════════════
function ClassesView({ classes, teachers, students, refresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('1');
  const [newTeacher, setNewTeacher] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const result = await createClass(newName.trim(), newGrade, newTeacher || null);
    if (result) { refresh(); setShowCreate(false); setNewName(''); }
  };

  const handleExpand = async (cls) => {
    if (expanded === cls.id) { setExpanded(null); return; }
    setExpanded(cls.id); setEnrollLoading(true);
    const enrolled = await loadClassEnrollments(cls.id);
    setEnrolledStudents(enrolled); setEnrollLoading(false);
  };

  const handleEnroll = async (classId, studentId) => {
    await enrollStudent(classId, studentId);
    const enrolled = await loadClassEnrollments(classId);
    setEnrolledStudents(enrolled); refresh();
  };

  const handleUnenroll = async (classId, studentId) => {
    await unenrollStudent(classId, studentId);
    const enrolled = await loadClassEnrollments(classId);
    setEnrolledStudents(enrolled); refresh();
  };

  const handleToggle = async (cls) => { await toggleClassActive(cls.id, !cls.is_active); refresh(); };

  const handleTeacherChange = async (classId, teacherId) => {
    await updateClassTeacher(classId, teacherId); refresh();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--color-text)]">Manage Classes</h1>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm transition-colors">
          <Plus size={16} /> Create Class
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-4">New Class</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Class Name</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Grade 4A" className={`${INPUT} w-48`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Grade</label>
              <select value={newGrade} onChange={e => setNewGrade(e.target.value)} className={INPUT}>
                {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Teacher (optional)</label>
              <select value={newTeacher} onChange={e => setNewTeacher(e.target.value)} className={`${INPUT} w-48`}>
                <option value="">No teacher</option>
                {teachers.filter(t => t.is_active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button onClick={handleCreate} disabled={!newName.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg text-sm transition-colors">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Class list */}
      <div className="space-y-3">
        {classes.map(cls => {
          const isOpen = expanded === cls.id;
          const teacher = teachers.find(t => t.id === cls.teacher_id);
          const gradeStudents = students.filter(s => s.grade === cls.grade_level && s.is_active !== false);
          const enrolledIds = new Set(enrolledStudents.map(e => e.id));

          return (
            <div key={cls.id} className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--color-surface-raised)]" onClick={() => handleExpand(cls)}>
                {isOpen ? <ChevronDown size={16} className="text-[var(--color-text-muted)]" /> : <ChevronRight size={16} className="text-[var(--color-text-muted)]" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-text)]">{cls.name}</h3>
                    <Pill color="green">Grade {cls.grade_level}</Pill>
                    <Pill color={cls.is_active ? 'brand' : 'red'}>{cls.is_active ? 'Active' : 'Inactive'}</Pill>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {teacher ? teacher.name : 'No teacher assigned'} &middot; {cls.enrollment_count} student{cls.enrollment_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <button onClick={e => { e.stopPropagation(); handleToggle(cls); }}
                  className="p-1.5 rounded hover:bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]" title={cls.is_active ? 'Deactivate' : 'Activate'}>
                  {cls.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-bg)]">
                  {/* Assign teacher */}
                  <div className="flex items-center gap-3 mb-4">
                    <label className="text-xs font-medium text-[var(--color-text-muted)]">Teacher:</label>
                    <select value={cls.teacher_id || ''} onChange={e => handleTeacherChange(cls.id, e.target.value)}
                      className={`${INPUT} text-xs py-1 w-48`}>
                      <option value="">None</option>
                      {teachers.filter(t => t.is_active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  {enrollLoading ? (
                    <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-brand-600" /></div>
                  ) : (
                    <>
                      {/* Enrolled students */}
                      <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Enrolled ({enrolledStudents.length})</h4>
                      {enrolledStudents.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {enrolledStudents.map(s => (
                            <span key={s.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs">
                              {s.name}
                              <button onClick={() => handleUnenroll(cls.id, s.id)} className="hover:text-red-500"><X size={12} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Available to enroll */}
                      <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2">
                        Available Grade {cls.grade_level} Students ({gradeStudents.filter(s => !enrolledIds.has(s.id)).length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {gradeStudents.filter(s => !enrolledIds.has(s.id)).map(s => (
                          <button key={s.id} onClick={() => handleEnroll(cls.id, s.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[var(--color-border)] rounded-full text-xs hover:border-brand-400 hover:bg-brand-50 transition-colors">
                            <Plus size={10} /> {s.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {classes.length === 0 && (
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-8 text-center text-[var(--color-text-muted)]">
            No classes created yet. Click &quot;Create Class&quot; to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function ReportsView({ stats, students, teachers }) {
  const quizzes = stats?.quizzes || [];

  // Usage by period
  const now = new Date();
  const daysAgo = (d) => Math.floor((now - new Date(d)) / 86400000);

  const daily = students.filter(s => s.progress?.last_active && daysAgo(s.progress.last_active) === 0).length;
  const weekly = students.filter(s => s.progress?.last_active && daysAgo(s.progress.last_active) <= 7).length;
  const monthly = students.filter(s => s.progress?.last_active && daysAgo(s.progress.last_active) <= 30).length;

  // Performance by grade
  const gradePerf = {};
  for (const q of quizzes) {
    const student = students.find(s => s.id === q.student_id);
    const g = student?.grade || '?';
    if (!gradePerf[g]) gradePerf[g] = { total: 0, count: 0 };
    gradePerf[g].total += q.percent;
    gradePerf[g].count += 1;
  }
  const gradeList = Object.entries(gradePerf)
    .map(([grade, v]) => ({ grade, avg: Math.round(v.total / v.count), count: v.count }))
    .sort((a, b) => +a.grade - +b.grade);

  const exportStudentReport = () => {
    const rows = students.map(s => ({
      Name: s.name, Grade: s.grade || '', XP: s.progress?.xp || 0,
      Level: s.progress?.level || 1, Last_Active: s.progress?.last_active || 'Never',
      Status: s.is_active !== false ? 'Active' : 'Inactive',
    }));
    exportCSV(rows, `students_report_${now.toISOString().slice(0,10)}.csv`);
  };

  const exportQuizReport = () => {
    const rows = quizzes.map(q => {
      const student = students.find(s => s.id === q.student_id);
      return { Student: student?.name || 'Unknown', Grade: student?.grade || '', Topic: q.topic || '',
        Score: q.percent + '%', Date: new Date(q.created_at).toLocaleDateString() };
    });
    exportCSV(rows, `quiz_report_${now.toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-2xl text-[var(--color-text)] mb-6">Reports</h1>

      {/* Usage */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Active Users</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Today', value: daily, color: 'text-green-600' },
            { label: 'This Week', value: weekly, color: 'text-blue-600' },
            { label: 'This Month', value: monthly, color: 'text-purple-600' },
          ].map(p => (
            <div key={p.label} className="text-center p-4 rounded-lg bg-[var(--color-bg)]">
              <p className={`text-3xl font-bold ${p.color}`}>{p.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{p.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance by grade */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Average Quiz Score by Grade</h2>
        {gradeList.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No quiz data yet.</p>
        ) : (
          <div className="space-y-3">
            {gradeList.map(g => (
              <div key={g.grade} className="flex items-center gap-4">
                <span className="w-16 text-sm font-medium text-[var(--color-text)]">Grade {g.grade}</span>
                <div className="flex-1 h-5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${g.avg < 50 ? 'bg-red-400' : g.avg < 70 ? 'bg-amber-400' : 'bg-green-400'}`}
                    style={{ width: `${g.avg}%` }} />
                </div>
                <span className="text-sm font-medium w-12 text-right">{g.avg}%</span>
                <span className="text-xs text-[var(--color-text-muted)] w-20 text-right">{g.count} quizzes</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Export Reports</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportStudentReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm transition-colors">
            <Download size={16} /> Student Report (CSV)
          </button>
          <button onClick={exportQuizReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm transition-colors">
            <Download size={16} /> Quiz Report (CSV)
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          Reports include all {students.length} students and {quizzes.length} quiz results.
        </p>
      </div>
    </div>
  );
}
