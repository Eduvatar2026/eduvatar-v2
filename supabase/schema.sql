-- =============================================
-- EduVatar v2 — COMPLETE DATABASE SETUP
-- =============================================
-- Idempotent: safe to run multiple times.
-- Tables in dependency order. All policies dropped before recreating.
-- =============================================


-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. TABLES (dependency order)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS students (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  is_active BOOLEAN DEFAULT true,
  school TEXT DEFAULT 'Victory International Schools',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE students ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  last_active DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context_sources TEXT[],
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  topic TEXT,
  difficulty TEXT DEFAULT 'medium',
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percent INTEGER NOT NULL,
  questions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS textbook_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  chapter TEXT,
  page INTEGER,
  content TEXT NOT NULL,
  book_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teachers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  subjects TEXT[] DEFAULT '{}',
  grades TEXT[] DEFAULT '{}',
  school TEXT DEFAULT 'Victory International Schools',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT DEFAULT 'Victory International Schools',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  programme TEXT NOT NULL CHECK (programme IN ('Primary', 'Lower Secondary')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, grade_level)
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  grade TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE textbook_content ADD COLUMN IF NOT EXISTS learning_objective_id UUID REFERENCES learning_objectives(id);

CREATE TABLE IF NOT EXISTS teacher_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  school TEXT DEFAULT 'Victory International Schools',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS student_mastery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  learning_objective_id UUID REFERENCES learning_objectives(id) ON DELETE CASCADE,
  mastery_level TEXT DEFAULT 'not_started'
    CHECK (mastery_level IN ('not_started', 'in_progress', 'practiced', 'mastered')),
  attempts INTEGER DEFAULT 0,
  last_score INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, learning_objective_id)
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_students_role        ON students(role);
CREATE INDEX IF NOT EXISTS idx_chat_student          ON chat_history(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_created          ON chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_student          ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_textbook_chapter      ON textbook_content(chapter);
CREATE INDEX IF NOT EXISTS idx_subjects_grade        ON subjects(grade_level);
CREATE INDEX IF NOT EXISTS idx_topics_subject        ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_objectives_topic      ON learning_objectives(topic_id);
CREATE INDEX IF NOT EXISTS idx_objectives_grade      ON learning_objectives(grade);
CREATE INDEX IF NOT EXISTS idx_teacher_notes_student ON teacher_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_notes_teacher ON teacher_notes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade          ON classes(grade_level);
CREATE INDEX IF NOT EXISTS idx_classes_teacher        ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class      ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student    ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_mastery_student       ON student_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_mastery_objective     ON student_mastery(learning_objective_id);
CREATE INDEX IF NOT EXISTS idx_mastery_level         ON student_mastery(mastery_level);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. ENABLE ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE students              ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history          ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results          ENABLE ROW LEVEL SECURITY;
ALTER TABLE textbook_content      ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins                ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics                ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_objectives   ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_mastery       ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. RLS POLICIES (drop then create — fully idempotent)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── students ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students see own data"  ON students;
DROP POLICY IF EXISTS "students_own_row"       ON students;
DROP POLICY IF EXISTS "teachers_see_students"  ON students;
DROP POLICY IF EXISTS "admins_see_all_students" ON students;

CREATE POLICY "students_own_row" ON students
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "teachers_see_students" ON students
  FOR SELECT USING (EXISTS (SELECT 1 FROM teachers WHERE teachers.id = auth.uid()));
CREATE POLICY "admins_see_all_students" ON students
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── student_progress ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Progress own data"      ON student_progress;
DROP POLICY IF EXISTS "progress_own"           ON student_progress;
DROP POLICY IF EXISTS "teachers_see_progress"  ON student_progress;
DROP POLICY IF EXISTS "admins_see_progress"    ON student_progress;

CREATE POLICY "progress_own" ON student_progress
  FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "teachers_see_progress" ON student_progress
  FOR SELECT USING (EXISTS (SELECT 1 FROM teachers WHERE teachers.id = auth.uid()));
CREATE POLICY "admins_see_progress" ON student_progress
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── chat_history ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Chat own data"          ON chat_history;
DROP POLICY IF EXISTS "chat_own"               ON chat_history;
DROP POLICY IF EXISTS "teachers_see_chat"      ON chat_history;

CREATE POLICY "chat_own" ON chat_history
  FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "teachers_see_chat" ON chat_history
  FOR SELECT USING (EXISTS (SELECT 1 FROM teachers WHERE teachers.id = auth.uid()));

-- ── quiz_results ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Quiz own data"          ON quiz_results;
DROP POLICY IF EXISTS "quiz_own"               ON quiz_results;
DROP POLICY IF EXISTS "teachers_see_quizzes"   ON quiz_results;
DROP POLICY IF EXISTS "admins_see_quizzes"     ON quiz_results;

CREATE POLICY "quiz_own" ON quiz_results
  FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "teachers_see_quizzes" ON quiz_results
  FOR SELECT USING (EXISTS (SELECT 1 FROM teachers WHERE teachers.id = auth.uid()));
CREATE POLICY "admins_see_quizzes" ON quiz_results
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── textbook_content ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Textbooks public read"  ON textbook_content;
DROP POLICY IF EXISTS "textbooks_public_read"  ON textbook_content;

CREATE POLICY "textbooks_public_read" ON textbook_content
  FOR SELECT USING (true);

-- ── teachers ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "teachers_own"           ON teachers;
DROP POLICY IF EXISTS "admins_manage_teachers" ON teachers;

CREATE POLICY "teachers_own" ON teachers
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "admins_manage_teachers" ON teachers
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── admins ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins_own"             ON admins;

CREATE POLICY "admins_own" ON admins
  FOR ALL USING (auth.uid() = id);

-- ── subjects ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "subjects_read"          ON subjects;
DROP POLICY IF EXISTS "admins_manage_subjects" ON subjects;

CREATE POLICY "subjects_read" ON subjects
  FOR SELECT USING (true);
CREATE POLICY "admins_manage_subjects" ON subjects
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── topics ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "topics_read"            ON topics;
DROP POLICY IF EXISTS "admins_manage_topics"   ON topics;

CREATE POLICY "topics_read" ON topics
  FOR SELECT USING (true);
CREATE POLICY "admins_manage_topics" ON topics
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── learning_objectives ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "objectives_read"            ON learning_objectives;
DROP POLICY IF EXISTS "admins_manage_objectives"   ON learning_objectives;

CREATE POLICY "objectives_read" ON learning_objectives
  FOR SELECT USING (true);
CREATE POLICY "admins_manage_objectives" ON learning_objectives
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── teacher_notes ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "teacher_notes_own"      ON teacher_notes;
DROP POLICY IF EXISTS "admins_see_notes"       ON teacher_notes;

CREATE POLICY "teacher_notes_own" ON teacher_notes
  FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "admins_see_notes" ON teacher_notes
  FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── classes ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "classes_read"           ON classes;
DROP POLICY IF EXISTS "admins_manage_classes"  ON classes;

CREATE POLICY "classes_read" ON classes
  FOR SELECT USING (true);
CREATE POLICY "admins_manage_classes" ON classes
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── class_enrollments ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "enrollments_read"           ON class_enrollments;
DROP POLICY IF EXISTS "admins_manage_enrollments"  ON class_enrollments;

CREATE POLICY "enrollments_read" ON class_enrollments
  FOR SELECT USING (true);
CREATE POLICY "admins_manage_enrollments" ON class_enrollments
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ── student_mastery ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "mastery_own"            ON student_mastery;
DROP POLICY IF EXISTS "teachers_see_mastery"   ON student_mastery;
DROP POLICY IF EXISTS "admins_see_mastery"     ON student_mastery;

CREATE POLICY "mastery_own" ON student_mastery
  FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "teachers_see_mastery" ON student_mastery
  FOR SELECT USING (EXISTS (SELECT 1 FROM teachers WHERE teachers.id = auth.uid()));
CREATE POLICY "admins_see_mastery" ON student_mastery
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT ALL    ON students              TO authenticated;
GRANT ALL    ON student_progress      TO authenticated;
GRANT ALL    ON chat_history          TO authenticated;
GRANT ALL    ON quiz_results          TO authenticated;
GRANT SELECT ON textbook_content      TO authenticated;
GRANT ALL    ON teachers              TO authenticated;
GRANT ALL    ON admins                TO authenticated;
GRANT SELECT ON subjects              TO authenticated;
GRANT SELECT ON topics                TO authenticated;
GRANT SELECT ON learning_objectives   TO authenticated;
GRANT ALL    ON teacher_notes         TO authenticated;
GRANT ALL    ON classes               TO authenticated;
GRANT ALL    ON class_enrollments     TO authenticated;
GRANT ALL    ON student_mastery       TO authenticated;
