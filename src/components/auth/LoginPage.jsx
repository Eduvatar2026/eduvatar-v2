'use client';
import { useState } from 'react';
import { signIn } from '@/lib/supabase';

export default function LoginPage({ onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email.trim(), password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // On success, AuthContext's onAuthStateChange fires and updates user,
    // which causes AuthGate to render the app automatically.
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-xl mb-4">
            V
          </div>
          <h1 className="font-display text-3xl text-[var(--color-text)] mb-1">
            Victory Learning Hub
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            Sign in to continue learning
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-6">
            Welcome back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-[var(--color-border)] rounded-lg text-sm
                  bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  transition-shadow"
              />
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
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Switch to signup */}
        <p className="text-center text-sm text-[var(--color-text-muted)] mt-5">
          Don&apos;t have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
