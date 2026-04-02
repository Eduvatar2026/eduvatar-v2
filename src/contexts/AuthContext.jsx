'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, createStudentProfile } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      // On first sign-in, ensure the student profile row exists.
      // Handles the case where email confirmation is enabled:
      // signup creates auth user, but profile is created on first actual login.
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: existing } = await supabase
          .from('students')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!existing) {
          const meta = session.user.user_metadata || {};
          await createStudentProfile(
            session.user.id,
            meta.name || 'Student',
            meta.grade || ''
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
