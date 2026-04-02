-- =============================================
-- Victory Learning Platform — Database Schema
-- =============================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Students table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS students (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT,
  school TEXT DEFAULT 'Victory International Schools',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student progress (XP, level, badges, streaks)
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

-- Chat history
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context_sources TEXT[],
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz results
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

-- Textbook content (optional — for server-side content storage)
CREATE TABLE IF NOT EXISTS textbook_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  chapter TEXT,
  page INTEGER,
  content TEXT NOT NULL,
  book_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_student ON chat_history(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_student ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_textbook_chapter ON textbook_content(chapter);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE textbook_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies (students can only see their own data)
CREATE POLICY "Students see own data" ON students FOR ALL USING (auth.uid() = id);
CREATE POLICY "Progress own data" ON student_progress FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Chat own data" ON chat_history FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Quiz own data" ON quiz_results FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Textbooks public read" ON textbook_content FOR SELECT USING (true);

-- Grant access
GRANT ALL ON students TO authenticated;
GRANT ALL ON student_progress TO authenticated;
GRANT ALL ON chat_history TO authenticated;
GRANT ALL ON quiz_results TO authenticated;
GRANT SELECT ON textbook_content TO authenticated;
