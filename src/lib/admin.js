/**
 * Admin data functions — queries used exclusively by the Admin Panel.
 * All functions require the caller to be an admin (enforced by RLS).
 */
import { supabase } from './supabase';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function loadAdminStats() {
  if (!supabase) return null;
  try {
    const [studentsRes, teachersRes, progressRes, quizzesRes] = await Promise.all([
      supabase.from('students').select('id, role, grade, is_active', { count: 'exact' }).eq('role', 'student'),
      supabase.from('teachers').select('id', { count: 'exact' }),
      supabase.from('student_progress').select('xp, last_active'),
      supabase.from('quiz_results').select('percent, topic, created_at'),
    ]);

    const students = studentsRes.data || [];
    const teacherCount = teachersRes.count || 0;
    const progress = progressRes.data || [];
    const quizzes = quizzesRes.data || [];

    const today = new Date().toISOString().slice(0, 10);
    const activeToday = progress.filter(p => p.last_active === today).length;
    const avgXP = progress.length > 0 ? Math.round(progress.reduce((s, p) => s + (p.xp || 0), 0) / progress.length) : 0;
    const avgQuiz = quizzes.length > 0 ? Math.round(quizzes.reduce((s, q) => s + q.percent, 0) / quizzes.length) : 0;

    // Topic popularity
    const topicCounts = {};
    for (const q of quizzes) {
      const t = q.topic || 'General';
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
    const popularTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Grade distribution
    const gradeCounts = {};
    for (const s of students) {
      const g = s.grade || '?';
      gradeCounts[g] = (gradeCounts[g] || 0) + 1;
    }

    return {
      studentCount: students.length,
      teacherCount,
      activeToday,
      avgXP,
      avgQuiz,
      popularTopics,
      gradeCounts,
      quizzes,
    };
  } catch { return null; }
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export async function loadAllTeachers() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, name, subjects, grades, created_at')
      .order('name');
    if (error) return [];
    // Also fetch is_active from students table
    const ids = (data || []).map(t => t.id);
    if (ids.length === 0) return [];
    const { data: profiles } = await supabase
      .from('students')
      .select('id, is_active')
      .in('id', ids);
    const activeMap = {};
    for (const p of (profiles || [])) activeMap[p.id] = p.is_active !== false;
    return (data || []).map(t => ({ ...t, is_active: activeMap[t.id] ?? true }));
  } catch { return []; }
}

export async function updateTeacherAssignments(teacherId, subjects, grades) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('teachers').update({ subjects, grades }).eq('id', teacherId);
    return !error;
  } catch { return false; }
}

export async function toggleUserActive(userId, isActive) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('students').update({ is_active: isActive }).eq('id', userId);
    return !error;
  } catch { return false; }
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function loadAllStudents() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id, name, grade, role, is_active, created_at,
        student_progress ( xp, level, last_active )
      `)
      .eq('role', 'student')
      .order('name');
    if (error) return [];
    return (data || []).map(s => {
      const p = Array.isArray(s.student_progress) ? s.student_progress[0] : s.student_progress;
      return { ...s, progress: p || null };
    });
  } catch { return []; }
}

export async function updateStudentGrade(studentId, newGrade) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('students').update({ grade: newGrade }).eq('id', studentId);
    return !error;
  } catch { return false; }
}

// ─── Classes ──────────────────────────────────────────────────────────────────

export async function loadAllClasses() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        id, name, grade_level, teacher_id, is_active, created_at,
        class_enrollments ( student_id )
      `)
      .order('grade_level')
      .order('name');
    if (error) return [];
    return (data || []).map(c => ({
      ...c,
      enrollment_count: c.class_enrollments?.length || 0,
    }));
  } catch { return []; }
}

export async function createClass(name, gradeLevel, teacherId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert({ name, grade_level: gradeLevel, teacher_id: teacherId || null })
      .select('id, name, grade_level, teacher_id, is_active, created_at')
      .single();
    if (error) { console.warn('createClass:', error.message); return null; }
    return { ...data, enrollment_count: 0, class_enrollments: [] };
  } catch { return null; }
}

export async function updateClassTeacher(classId, teacherId) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('classes').update({ teacher_id: teacherId || null }).eq('id', classId);
    return !error;
  } catch { return false; }
}

export async function toggleClassActive(classId, isActive) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('classes').update({ is_active: isActive }).eq('id', classId);
    return !error;
  } catch { return false; }
}

export async function enrollStudent(classId, studentId) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('class_enrollments').upsert(
      { class_id: classId, student_id: studentId },
      { onConflict: 'class_id,student_id' }
    );
    return !error;
  } catch { return false; }
}

export async function unenrollStudent(classId, studentId) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('class_enrollments')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', studentId);
    return !error;
  } catch { return false; }
}

export async function loadClassEnrollments(classId) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select('student_id, students ( id, name, grade )')
      .eq('class_id', classId);
    if (error) return [];
    return (data || []).map(e => e.students).filter(Boolean);
  } catch { return []; }
}

// ─── Reports (CSV) ───────────────────────────────────────────────────────────

export function exportCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? '';
      return typeof v === 'string' && (v.includes(',') || v.includes('"'))
        ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
