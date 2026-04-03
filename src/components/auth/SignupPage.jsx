'use client';
import { useState } from 'react';
import { signUp } from '@/lib/supabase';
import { GraduationCap, BookOpen, ChevronLeft } from 'lucide-react';

const GRADE_OPTIONS = ['1','2','3','4','5','6','7','8','9'];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Science', 'English Language', 'Arabic Language',
  'Islamic Studies', 'Social Studies', 'ICT / Computing',
  'Art & Design', 'Physical Education', 'French', 'History', 'Geography',
];

// ─── Shared input class ───────────────────────────────────────────────────────
const INPUT = `w-full px-3.5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm
  bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow`;

// ─── Logo header shared across all steps ─────────────────────────────────────
function PageHeader({ subtitle }) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-xl mb-4">
        V
      </div>
      <h1 className="font-display text-3xl text-[var(--color-text)] mb-1">
        Victory Learning Hub
      </h1>
      <p className="text-[var(--color-text-muted)] text-sm">{subtitle}</p>
    </div>
  );
}

// ─── Step 1: Role Selection ───────────────────────────────────────────────────
function RoleStep({ onSelect }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        <PageHeader subtitle="Create your account" />
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            I am joining as…
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Choose the role that describes you.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Student card */}
            <button
              onClick={() => onSelect('student')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-[var(--color-border)]
                hover:border-brand-500 hover:bg-brand-50 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center
                group-hover:bg-brand-200 transition-colors">
                <GraduationCap size={24} className="text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">Student</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Grades 1–9</p>
              </div>
            </button>

            {/* Teacher card */}
            <button
              onClick={() => onSelect('teacher')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-[var(--color-border)]
                hover:border-brand-500 hover:bg-brand-50 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center
                group-hover:bg-brand-200 transition-colors">
                <BookOpen size={24} className="text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">Teacher</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">School staff</p>
              </div>
            </button>
          </div>
        </div>
        <p className="text-center text-sm text-[var(--color-text-muted)] mt-5">
          Admin accounts are created by your school administrator.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2a: Student Form ────────────────────────────────────────────────────
function StudentForm({ onBack, onSwitchToLogin }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!grade) { setError('Please select your grade level.'); return; }

    setLoading(true);
    const { data, error: authError } = await signUp(
      email.trim(), password, name.trim(),
      { role: 'student', grade }
    );

    if (authError) { setError(authError.message); setLoading(false); return; }
    if (data?.session) return; // AuthGate takes over
    setSuccess(true);
    setLoading(false);
  };

  if (success) return <SuccessScreen email={email} onSwitchToLogin={onSwitchToLogin} />;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <PageHeader subtitle="Create your student account" />
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={onBack} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Student Sign Up</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                required autoComplete="name" placeholder="Your name" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" placeholder="you@school.com" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="new-password" placeholder="At least 6 characters" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Grade level</label>
              <select value={grade} onChange={e => setGrade(e.target.value)} required
                className={`${INPUT} appearance-none cursor-pointer`}>
                <option value="" disabled>Select your grade…</option>
                {GRADE_OPTIONS.map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60
                text-white text-sm font-medium rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
              {loading ? <Spinner label="Creating account…" /> : 'Create account'}
            </button>
          </form>
        </div>
        <SwitchToLogin onSwitchToLogin={onSwitchToLogin} />
      </div>
    </div>
  );
}

// ─── Step 2b: Teacher Form ────────────────────────────────────────────────────
function TeacherForm({ onBack, onSwitchToLogin }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const toggleSubject = (s) =>
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleGrade = (g) =>
    setGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (subjects.length === 0) { setError('Please select at least one subject.'); return; }
    if (grades.length === 0) { setError('Please select at least one grade.'); return; }

    setLoading(true);
    const { data, error: authError } = await signUp(
      email.trim(), password, name.trim(),
      { role: 'teacher', subjects, grades }
    );

    if (authError) { setError(authError.message); setLoading(false); return; }
    if (data?.session) return;
    setSuccess(true);
    setLoading(false);
  };

  if (success) return <SuccessScreen email={email} onSwitchToLogin={onSwitchToLogin} />;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        <PageHeader subtitle="Create your teacher account" />
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={onBack} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Teacher Sign Up</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                required autoComplete="name" placeholder="Your name" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" placeholder="you@school.com" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="new-password" placeholder="At least 6 characters" className={INPUT} />
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Subjects you teach <span className="text-[var(--color-text-muted)] font-normal">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSubject(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${subjects.includes(s)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-brand-400'
                      }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Grades */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Grades you teach <span className="text-[var(--color-text-muted)] font-normal">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GRADE_OPTIONS.map(g => (
                  <button key={g} type="button" onClick={() => toggleGrade(g)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all
                      ${grades.includes(g)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-brand-400'
                      }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60
                text-white text-sm font-medium rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
              {loading ? <Spinner label="Creating account…" /> : 'Create teacher account'}
            </button>
          </form>
        </div>
        <SwitchToLogin onSwitchToLogin={onSwitchToLogin} />
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function Spinner({ label }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      {label}
    </span>
  );
}

function SwitchToLogin({ onSwitchToLogin }) {
  return (
    <p className="text-center text-sm text-[var(--color-text-muted)] mt-5">
      Already have an account?{' '}
      <button onClick={onSwitchToLogin}
        className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
        Sign in
      </button>
    </p>
  );
}

function SuccessScreen({ email, onSwitchToLogin }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <PageHeader subtitle="Victory Learning Hub" />
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Check your email</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
            account, then come back and sign in.
          </p>
          <button onClick={onSwitchToLogin}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700
              text-white text-sm font-medium rounded-lg transition-colors">
            Go to sign in
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export: orchestrates the three steps ────────────────────────────────
export default function SignupPage({ onSwitchToLogin }) {
  const [role, setRole] = useState(null); // null | 'student' | 'teacher'

  if (!role) return <RoleStep onSelect={setRole} />;
  if (role === 'student') return <StudentForm onBack={() => setRole(null)} onSwitchToLogin={onSwitchToLogin} />;
  return <TeacherForm onBack={() => setRole(null)} onSwitchToLogin={onSwitchToLogin} />;
}
