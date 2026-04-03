/**
 * Mastery tracking — reads/writes student_mastery table and computes weak areas.
 */
import { supabase } from './supabase';

// ─── Mastery level logic ──────────────────────────────────────────────────────
// < 50%           → in_progress
// 50-79%          → practiced
// ≥ 80% on 2+    → mastered

function computeLevel(attempts, bestScore) {
  if (attempts === 0) return 'not_started';
  if (bestScore >= 80 && attempts >= 2) return 'mastered';
  if (bestScore >= 50) return 'practiced';
  return 'in_progress';
}

// ─── Update mastery after a quiz ──────────────────────────────────────────────

/**
 * After a quiz completes, update mastery rows for any matching objectives.
 * Matches by quiz topic against learning_objectives where the topic name
 * appears in the objective's parent topic name.
 *
 * @param {string} studentId
 * @param {string} quizTopic – the topic string from the quiz
 * @param {number} percent – the quiz score 0-100
 * @param {string} grade – the student's grade
 */
export async function updateMasteryAfterQuiz(studentId, quizTopic, percent, grade) {
  if (!supabase || !quizTopic || !grade) return;

  try {
    // Find matching objectives: topic name contains the quiz topic (case-insensitive)
    const { data: objectives } = await supabase
      .from('learning_objectives')
      .select('id, topic_id, topics!inner( name, subject_id )')
      .eq('grade', grade)
      .ilike('topics.name', `%${quizTopic}%`);

    if (!objectives?.length) return;

    for (const obj of objectives) {
      // Get existing mastery row
      const { data: existing } = await supabase
        .from('student_mastery')
        .select('attempts, best_score')
        .eq('student_id', studentId)
        .eq('learning_objective_id', obj.id)
        .maybeSingle();

      const attempts = (existing?.attempts || 0) + 1;
      const bestScore = Math.max(existing?.best_score || 0, percent);
      const level = computeLevel(attempts, bestScore);

      await supabase.from('student_mastery').upsert({
        student_id: studentId,
        learning_objective_id: obj.id,
        mastery_level: level,
        attempts,
        last_score: percent,
        best_score: bestScore,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id,learning_objective_id' });
    }
  } catch (e) {
    console.warn('updateMasteryAfterQuiz failed:', e);
  }
}

// ─── Load mastery for a student ───────────────────────────────────────────────

/**
 * Load all mastery rows for a student, grouped by subject.
 * Returns: { subjectName: { total, mastered, practiced, in_progress, not_started } }
 */
export async function loadMasteryBySubject(studentId, grade) {
  if (!supabase || !grade) return {};
  try {
    // Get all objectives for this grade with their subject names
    const { data: objectives } = await supabase
      .from('learning_objectives')
      .select('id, topics!inner( name, subjects!inner( name ) )')
      .eq('grade', grade);

    if (!objectives?.length) return {};

    // Get all mastery rows for this student
    const objIds = objectives.map(o => o.id);
    const { data: mastery } = await supabase
      .from('student_mastery')
      .select('learning_objective_id, mastery_level')
      .eq('student_id', studentId)
      .in('learning_objective_id', objIds);

    const masteryMap = {};
    for (const m of (mastery || [])) {
      masteryMap[m.learning_objective_id] = m.mastery_level;
    }

    // Group by subject
    const result = {};
    for (const obj of objectives) {
      const subjectName = obj.topics?.subjects?.name || 'Unknown';
      if (!result[subjectName]) {
        result[subjectName] = { total: 0, mastered: 0, practiced: 0, in_progress: 0, not_started: 0 };
      }
      const level = masteryMap[obj.id] || 'not_started';
      result[subjectName].total += 1;
      result[subjectName][level] += 1;
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Load mastery data for a specific student (for teacher view).
 * Returns flat array of mastery rows with objective and topic info.
 */
export async function loadMasteryForStudent(studentId) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('student_mastery')
      .select(`
        mastery_level, attempts, best_score, last_score,
        learning_objectives (
          code, description,
          topics ( name, subjects ( name ) )
        )
      `)
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });
    if (error) return [];
    return (data || []).map(m => ({
      level: m.mastery_level,
      attempts: m.attempts,
      bestScore: m.best_score,
      lastScore: m.last_score,
      objectiveCode: m.learning_objectives?.code,
      objectiveDesc: m.learning_objectives?.description,
      topicName: m.learning_objectives?.topics?.name,
      subjectName: m.learning_objectives?.topics?.subjects?.name,
    }));
  } catch { return []; }
}

// ─── Weak Area Detection ──────────────────────────────────────────────────────

/**
 * Identify the N weakest topics for a student based on quiz scores.
 * Returns array of { topic, avgScore, quizCount }.
 */
export async function detectWeakAreas(studentId, limit = 3) {
  if (!supabase) return [];
  try {
    const { data: quizzes } = await supabase
      .from('quiz_results')
      .select('topic, percent')
      .eq('student_id', studentId);

    if (!quizzes?.length) return [];

    const topicStats = {};
    for (const q of quizzes) {
      const t = q.topic || 'General';
      if (!topicStats[t]) topicStats[t] = { total: 0, count: 0 };
      topicStats[t].total += q.percent;
      topicStats[t].count += 1;
    }

    return Object.entries(topicStats)
      .map(([topic, v]) => ({ topic, avgScore: Math.round(v.total / v.count), quizCount: v.count }))
      .filter(t => t.avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, limit);
  } catch { return []; }
}
