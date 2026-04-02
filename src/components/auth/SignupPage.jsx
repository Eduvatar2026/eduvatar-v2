'use client';
import { useState } from 'react';
import { signUp } from '@/lib/supabase';

const GRADE_OPTIONS = [
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
];

export default function SignupPage({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!grade) {
      setError('Please select your grade level.');
      return;
    }

    setLoading(true);

    const { data, error: authError } = await signUp(
      email.trim(),
      password,
      name.trim(),
      grade
    );

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If session is immediately available (email confirmation disabled), the
    // AuthContext will pick it up via onAuthStateChange automatically.
    // If email confirmation is required, show success message.
    if (data?.session) {
      // Logged in immediately — AuthGate will show the app
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-xl mb-4">
              V
            </div>
            <h1 className="font-display text-3xl text-[var(--color-text)] mb-1">
              Victory Learning Hub
            </h1>
          </div>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              Check your email
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
              account, then come back and sign in.
            </p>
            <button
              onClick={onSwitchToLogin}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700
                text-white text-sm font-medium rounded-lg transition-colors"
            >
              Go to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-xl mb-4">
            V
          </div>
          <h1 className="font-display text-3xl text-[var(--color-text)] mb-1">
            Victory Learning Hub
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            Create your student account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-6">
            Join Victory Learning
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm
                  bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  transition-shadow"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@school.com"
                className="w-full px-3.5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm
                  bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  transition-shadow"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm
                  bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  transition-shadow"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Grade level
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm
                  bg-white text-[var(--color-text)]
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  transition-shadow appearance-none cursor-pointer"
              >
                <option value="" disabled>Select your grade…</option>
                {GRADE_OPTIONS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60
                text-white text-sm font-medium rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        {/* Switch to login */}
        <p className="text-center text-sm text-[var(--color-text-muted)] mt-5">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
