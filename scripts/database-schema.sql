-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
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

-- Topics and subtopics for Physics
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER,
    parent_id UUID REFERENCES topics(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions bank
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES topics(id),
    content JSONB NOT NULL, -- Stores question text, options, correct answer
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical', 'assertion_reasoning')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    marks INTEGER DEFAULT 4,
    negative_marks DECIMAL(3,2) DEFAULT 1.00,
    solution JSONB, -- Detailed solution with steps
    source TEXT CHECK (source IN ('generated', 'manual', 'previous_year')),
    year INTEGER, -- For previous year questions
    tags TEXT[],
    embedding vector(1536), -- For AI similarity search
    validation_score DECIMAL(3,2), -- Quality score 0-1
    times_attempted INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests/Mock exams
CREATE TABLE public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL CHECK (test_type IN ('mock', 'topic_wise', 'custom', 'daily_practice')),
    title TEXT NOT NULL,
    questions JSONB NOT NULL, -- Array of question IDs with order
    total_marks INTEGER,
    duration_minutes INTEGER DEFAULT 180,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User responses and analytics
CREATE TABLE public.test_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    user_answer JSONB,
    is_correct BOOLEAN,
    marks_obtained DECIMAL(5,2),
    time_spent_seconds INTEGER,
    marked_for_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance analytics
CREATE TABLE public.user_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id),
    total_questions_attempted INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    average_time_per_question INTEGER, -- in seconds
    weak_area_score DECIMAL(3,2), -- 0-1 score, higher means weaker
    last_attempted TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test results summary
CREATE TABLE public.test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_questions INTEGER,
    attempted_questions INTEGER,
    correct_answers INTEGER,
    wrong_answers INTEGER,
    total_marks_obtained DECIMAL(6,2),
    total_marks INTEGER,
    percentage DECIMAL(5,2),
    time_taken_minutes INTEGER,
    rank INTEGER, -- Among all users who took this test
    percentile DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question generation templates
CREATE TABLE public.question_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES topics(id),
    template_type TEXT NOT NULL,
    template_structure JSONB NOT NULL,
    variables JSONB,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_embedding ON questions USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_test_responses_user ON test_responses(user_id);
CREATE INDEX idx_test_responses_test ON test_responses(test_id);
CREATE INDEX idx_user_performance_user ON user_performance(user_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Tests policies
CREATE POLICY "Users can view own tests" ON tests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tests" ON tests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Test responses policies
CREATE POLICY "Users can view own responses" ON test_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own responses" ON test_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();