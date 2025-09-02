-- MockTest AI Complete Database Schema
-- Single file to drop and recreate everything with all fixes

-- =====================================================
-- DROP ALL EXISTING TABLES
-- =====================================================
DROP TABLE IF EXISTS public.test_responses CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE TABLES WITH CORRECT SCHEMA
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'institute')),
    total_tests_taken INTEGER DEFAULT 0,
    study_streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics for categorization
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER,
    parent_id UUID REFERENCES topics(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions bank
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES topics(id),
    content JSONB NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical', 'assertion_reasoning')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    marks INTEGER DEFAULT 4,
    negative_marks DECIMAL DEFAULT 1,
    solution JSONB,
    source TEXT CHECK (source IN ('generated', 'manual', 'previous_year')),
    year INTEGER,
    tags TEXT[],
    validation_score DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL CHECK (test_type IN ('mock', 'topic_wise', 'custom', 'daily_practice')),
    title TEXT NOT NULL,
    questions JSONB,
    total_marks INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test responses
CREATE TABLE IF NOT EXISTS public.test_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    user_answer JSONB,
    is_correct BOOLEAN,
    marks_obtained DECIMAL,
    time_spent_seconds INTEGER,
    marked_for_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test results (supports both DB tests and Quick Tests)
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id VARCHAR(255), -- Can be UUID or string like 'demo-test-1'
    test_title VARCHAR(255), -- Store title directly for Quick Tests
    test_type VARCHAR(50) DEFAULT 'standard', -- quick, ai_generated, topic, standard
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    attempted_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    wrong_answers INTEGER NOT NULL,
    total_marks_obtained DECIMAL NOT NULL,
    total_marks INTEGER NOT NULL,
    percentage DECIMAL NOT NULL,
    time_taken_minutes INTEGER,
    topic_breakdown JSONB DEFAULT '{}',
    difficulty_breakdown JSONB DEFAULT '{}',
    questions_data JSONB DEFAULT '[]',
    user_answers JSONB DEFAULT '{}',
    rank INTEGER,
    percentile DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_tests_user ON tests(user_id);
CREATE INDEX idx_tests_status ON tests(status);
CREATE INDEX idx_test_responses_test ON test_responses(test_id);
CREATE INDEX idx_test_responses_user ON test_responses(user_id);
CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_test_results_created ON test_results(created_at DESC);
CREATE INDEX idx_test_results_user_created ON test_results(user_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Topics policies (everyone can read)
CREATE POLICY "Anyone can view topics"
ON public.topics FOR SELECT
TO authenticated
USING (true);

-- Questions policies (everyone can read)
CREATE POLICY "Anyone can view questions"
ON public.questions FOR SELECT
TO authenticated
USING (true);

-- Tests policies
CREATE POLICY "Users can create their own tests"
ON public.tests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tests"
ON public.tests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tests"
ON public.tests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Test responses policies
CREATE POLICY "Users can insert their own responses"
ON public.test_responses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses"
ON public.test_responses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Test results policies
CREATE POLICY "Users can insert their own test results"
ON public.test_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own test results"
ON public.test_results FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results"
ON public.test_results FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test results"
ON public.test_results FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update profiles.updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth';
COMMENT ON TABLE public.topics IS 'Topics and subtopics for question categorization';
COMMENT ON TABLE public.questions IS 'Question bank with solutions';
COMMENT ON TABLE public.tests IS 'Test instances created by users';
COMMENT ON TABLE public.test_responses IS 'User responses to test questions';
COMMENT ON TABLE public.test_results IS 'Aggregated test results and analytics';
COMMENT ON COLUMN public.test_results.test_id IS 'Test ID - can be UUID for DB tests or string for Quick Tests';
COMMENT ON COLUMN public.test_results.test_title IS 'Test title - stored directly for Quick Tests';
COMMENT ON COLUMN public.test_results.test_type IS 'Test type: standard, quick, ai_generated, topic';
COMMENT ON COLUMN public.test_results.topic_breakdown IS 'JSON object with topic-wise performance';
COMMENT ON COLUMN public.test_results.difficulty_breakdown IS 'JSON object with difficulty-wise performance';

-- =====================================================
-- DONE
-- =====================================================
SELECT 'Database schema created successfully!' as message;