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
 * Sign up a new user (student or teacher).
 * options.role: 'student' | 'teacher'  (default: 'student')
 * options.grade: string — for students
 * options.subjects: string[] — for teachers
 * options.grades: string[]  — grades a teacher teaches
 */
export async function signUp(email, password, name, options = {}) {
  if (!supabase) return { error: { message: 'Supabase is not configured.' } };

  const { role = 'student', grade = '', subjects = [], grades = [] } = options;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role, grade, subjects, grades } },
  });

  if (error) return { data, error };

  // If email confirmation is disabled, session is available immediately
  if (data.user && data.session) {
    if (role === 'teacher') {
      await createTeacherProfile(data.user.id, name, subjects, grades);
    } else {
      await createStudentProfile(data.user.id, name, grade);
    }
  }

  return { data, error: null };
}

/**
 * Get the role of a user from the students table.
 */
export async function getUserRole(userId) {
  if (!supabase) return 'student';
  try {
    const { data } = await supabase
      .from('students')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    return data?.role || 'student';
  } catch {
    return 'student';
  }
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
 */
export async function createStudentProfile(userId, name, grade) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('students')
      .upsert({ id: userId, name, grade, role: 'student' });
    if (error) {
      console.warn('Create student profile error:', error);
      return false;
    }

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

/**
 * Create or update teacher profile.
 * Inserts into both `students` (role='teacher') and `teachers` tables.
 */
export async function createTeacherProfile(userId, name, subjects = [], grades = []) {
  if (!supabase) return false;
  try {
    const { error: profileError } = await supabase
      .from('students')
      .upsert({ id: userId, name, role: 'teacher' });
    if (profileError) {
      console.warn('Create teacher profile (students) error:', profileError);
      return false;
    }

    const { error: teacherError } = await supabase
      .from('teachers')
      .upsert({ id: userId, name, subjects, grades });
    if (teacherError) {
      console.warn('Create teacher profile (teachers) error:', teacherError);
      return false;
    }

    return true;
  } catch (e) {
    console.warn('Create teacher profile failed:', e);
    return false;
  }
}

/**
 * Get teacher profile (subjects, grades).
 */
export async function getTeacherProfile(userId) {
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('teachers')
      .select('name, subjects, grades')
      .eq('id', userId)
      .single();
    return data || null;
  } catch {
    return null;
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

// ─── Teacher Dashboard ────────────���─────────────────────────────────────────

/**
 * Load all students in specified grades, with their progress.
 */
export async function loadStudentsForGrades(grades) {
  if (!supabase || !grades?.length) return [];
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id, name, grade, created_at,
        student_progress ( xp, level, streak, badges, last_active, updated_at )
      `)
      .eq('role', 'student')
      .in('grade', grades)
      .order('name');
    if (error) { console.warn('loadStudentsForGrades:', error.message); return []; }
    return (data || []).map(s => {
      const p = Array.isArray(s.student_progress) ? s.student_progress[0] : s.student_progress;
      return { ...s, progress: p || null };
    });
  } catch { return []; }
}

/**
 * Load all quiz results for a set of student IDs.
 */
export async function loadQuizResultsForStudents(studentIds) {
  if (!supabase || !studentIds?.length) return [];
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('id, student_id, topic, difficulty, score, total_questions, percent, created_at')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch { return []; }
}

/**
 * Count chat messages per student.
 */
export async function loadChatCountsForStudents(studentIds) {
  if (!supabase || !studentIds?.length) return {};
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('student_id')
      .in('student_id', studentIds)
      .eq('role', 'user');
    if (error) return {};
    const counts = {};
    for (const row of (data || [])) {
      counts[row.student_id] = (counts[row.student_id] || 0) + 1;
    }
    return counts;
  } catch { return {}; }
}

/**
 * Load teacher notes for a student.
 */
export async function loadTeacherNotes(teacherId, studentId) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('teacher_notes')
      .select('id, content, created_at, updated_at')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch { return []; }
}

/**
 * Add a teacher note for a student.
 */
export async function addTeacherNote(teacherId, studentId, content) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('teacher_notes')
      .insert({ teacher_id: teacherId, student_id: studentId, content })
      .select('id, content, created_at')
      .single();
    if (error) { console.warn('addTeacherNote:', error.message); return null; }
    return data;
  } catch { return null; }
}

/**
 * Delete a teacher note.
 */
export async function deleteTeacherNote(noteId) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('teacher_notes').delete().eq('id', noteId);
    return !error;
  } catch { return false; }
}

// ─── Curriculum ──────���───────────────────────────────────────────────────────

/**
 * Load subjects for a specific grade level.
 */
export async function loadSubjectsForGrade(grade) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, grade_level, programme')
      .eq('grade_level', grade)
      .order('name');
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Load topics for a subject, with nested learning objectives.
 */
export async function loadTopicsWithObjectives(subjectId) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        id, name, description, order_number,
        learning_objectives ( id, code, description, grade )
      `)
      .eq('subject_id', subjectId)
      .order('order_number');
    if (error) return [];
    return data || [];
  } catch {
    return [];
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
