'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, createStudentProfile, createTeacherProfile, getUserRole } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [role, setRole]     = useState(null);  // 'student' | 'teacher' | 'admin'
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // ── Initial session (already logged in) ──────────────────────────────────
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const r = await getUserRole(u.id);
        setRole(r);
      }
      setLoading(false);
    });

    // ── Subsequent auth changes ───────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const u = session.user;
          setUser(u);

          const meta = u.user_metadata || {};
          const metaRole = meta.role || 'student';

          // Ensure DB profile exists (handles email-confirmation flow)
          const { data: existing } = await supabase
            .from('students')
            .select('id, role')
            .eq('id', u.id)
            .maybeSingle();

          if (!existing) {
            if (metaRole === 'teacher') {
              await createTeacherProfile(u.id, meta.name || 'Teacher', meta.subjects || [], meta.grades || []);
            } else {
              await createStudentProfile(u.id, meta.name || 'Student', meta.grade || '');
            }
            setRole(metaRole);
          } else {
            setRole(existing.role || 'student');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
