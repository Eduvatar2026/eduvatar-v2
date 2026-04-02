import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client-side Supabase instance
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase instance (for API routes)
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

// ─── Auth Functions ───────────────────────────────────────────────────────────

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  if (!supabase) return { error: { message: 'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.' } };
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up a new student
 */
export async function signUp(email, password, name, grade) {
  if (!supabase) return { error: { message: 'Supabase is not configured.' } };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, grade } }, // stored in user_metadata as backup
  });

  if (error) return { data, error };

  // If email confirmation is disabled, session is available immediately
  if (data.user && data.session) {
    await createStudentProfile(data.user.id, name, grade);
  }

  return { data, error: null };
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

// ─── Student Profile ──────────────────────────────────────────────────────────

/**
 * Get student profile (name, grade) from students table
 */
export async function getStudentProfile(userId) {
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('students')
      .select('name, grade')
      .eq('id', userId)
      .single();
    return data || null;
  } catch {
    return null;
  }
}

/**
 * Create or update student profile and initialize progress row.
 * Called on first login after signup.
 */
export async function createStudentProfile(userId, name, grade) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('students')
      .upsert({ id: userId, name, grade });
    if (error) {
      console.warn('Create profile error:', error);
      return false;
    }

    // Initialize progress row (upsert so it's safe to call multiple times)
    await supabase
      .from('student_progress')
      .upsert(
        { student_id: userId, xp: 0, level: 1, streak: 0, badges: [] },
        { onConflict: 'student_id' }
      );

    return true;
  } catch (e) {
    console.warn('Create student profile failed:', e);
    return false;
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/**
 * Save student progress to Supabase
 */
export async function saveProgress(studentId, data) {
  if (!supabase) {
    console.warn('Supabase not configured — progress saved locally only');
    return null;
  }
  try {
    const { error } = await supabase
      .from('student_progress')
      .upsert(
        { student_id: studentId, ...data, updated_at: new Date().toISOString() },
        { onConflict: 'student_id' }
      );
    if (error) console.error('Save progress error:', error);
    return !error;
  } catch (e) {
    console.warn('Supabase save failed (non-critical):', e);
    return null;
  }
}

/**
 * Load student progress from Supabase
 */
export async function loadProgress(studentId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// ─── Quiz Results ─────────────────────────────────────────────────────────────

/**
 * Save a completed quiz result to Supabase
 */
export async function saveQuizResult(studentId, { topic, difficulty, score, totalQuestions, percent }) {
  if (!supabase) return null;
  try {
    const { error } = await supabase.from('quiz_results').insert({
      student_id: studentId,
      topic,
      difficulty: difficulty || 'medium',
      score,
      total_questions: totalQuestions,
      percent,
    });
    if (error) console.warn('Save quiz result error:', error);
    return !error;
  } catch {
    return null;
  }
}

/**
 * Load recent quiz results from Supabase
 */
export async function loadRecentQuizResults(studentId, limit = 10) {
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from('quiz_results')
      .select('topic, percent, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map(r => ({
      topic: r.topic,
      percent: r.percent,
      date: new Date(r.created_at).toLocaleDateString(),
    }));
  } catch {
    return [];
  }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Save chat message to history
 */
export async function saveChatMessage(studentId, message) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('chat_history')
      .insert({ student_id: studentId, ...message });
    return !error;
  } catch {
    return null;
  }
}

// ─── Textbook Sections ────────────────────────────────────────────────────────

/**
 * Load textbook sections from Supabase
 */
export async function loadTextbookSections() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('textbook_sections')
      .select('*')
      .order('id');
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

/**
 * Save textbook sections to Supabase
 */
export async function saveTextbookSections(sections) {
  if (!supabase) return false;
  try {
    const rows = sections.map(s => ({
      title: s.title,
      chapter: s.chapter,
      page: s.page,
      content: s.content,
    }));
    const { error } = await supabase.from('textbook_sections').insert(rows);
    if (error) console.error('Save textbook sections error:', error);
    return !error;
  } catch (e) {
    console.warn('Supabase textbook save failed:', e);
    return false;
  }
}
