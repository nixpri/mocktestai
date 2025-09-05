-- MockTest AI Unified Database Schema
-- Comprehensive schema with complete JEE syllabus topics
-- Version 2.1 - No backward compatibility

-- =====================================================
-- DROP EXISTING TABLES (IF THEY EXIST)
-- =====================================================
DROP TABLE IF EXISTS public.user_analytics CASCADE;
DROP TABLE IF EXISTS public.question_analytics CASCADE;
DROP TABLE IF EXISTS public.test_responses CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.test_questions CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA public;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'institute')),
    total_tests_taken INTEGER DEFAULT 0,
    study_streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced topics table with JEE metadata
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name TEXT NOT NULL,
    subject TEXT NOT NULL CHECK (subject IN ('Physics', 'Chemistry', 'Mathematics')),
    description TEXT,
    
    -- Hierarchy
    parent_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0, -- 0: subject, 1: main topic, 2: subtopic, 3: concept
    
    -- JEE Specific Metadata
    jee_code TEXT, -- Official JEE chapter code (e.g., "P1.1", "C2.3")
    weightage_percentage DECIMAL(5,2), -- Typical weightage in JEE exam
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5), -- 1: Easy to 5: Very Hard
    
    -- Learning Metadata
    prerequisites UUID[], -- Array of topic IDs that should be studied first
    common_concepts JSONB, -- {concepts: ["Newton's Laws", "Conservation"], formulas: ["F=ma"]}
    question_patterns JSONB, -- {types: ["numerical", "conceptual"], patterns: ["direct formula", "multi-concept"]}
    
    -- Statistics
    avg_time_per_question INTEGER, -- Average time in seconds
    common_mistakes JSONB, -- Common errors students make
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_topic_name_parent UNIQUE(name, parent_id, subject)
);

-- Unified Questions Table (replaces old questions table)
CREATE TABLE IF NOT EXISTS questions (
    -- Core fields
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'previous_year', 'ai_generated', 'demo')),
    source_metadata JSONB DEFAULT '{}',
    
    -- Question content
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical', 'assertion', 'matrix', 'paragraph')),
    question_metadata JSONB DEFAULT '{}',
    
    -- Categorization
    subject TEXT DEFAULT 'Physics' CHECK (subject IN ('Physics', 'Chemistry', 'Mathematics')),
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    
    -- Answer Information
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    solution_approach TEXT, -- Step-by-step approach
    hints JSONB,
    
    -- Scoring
    marks INTEGER DEFAULT 4,
    negative_marks INTEGER DEFAULT 1,
    time_estimate INTEGER,
    
    -- Media
    has_diagram BOOLEAN DEFAULT FALSE,
    diagram_url TEXT,
    diagram_description TEXT,
    additional_media JSONB, -- {videos: [], animations: []}
    
    -- Metadata
    tags TEXT[],
    concepts_tested TEXT[], -- ["momentum", "energy conservation"]
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    
    -- Tracking
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Full-text search (will be updated by trigger)
    search_vector tsvector
);

-- UNIFIED TESTS TABLE
CREATE TABLE public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Test Type and Source
    test_type TEXT DEFAULT 'practice' CHECK (test_type IN (
        'practice', 'mock', 'previous_year', 'ai_generated', 
        'custom', 'adaptive', 'topic_wise', 'chapter_test'
    )),
    test_metadata JSONB DEFAULT '{}',
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT,
    instructions JSONB,
    
    -- Categorization
    subject TEXT,
    topic_ids UUID[],
    
    -- Test Configuration
    total_questions INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    sections JSONB, -- For multi-section tests
    
    -- Difficulty and Scoring
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'mixed', 'adaptive')),
    passing_marks INTEGER,
    negative_marking BOOLEAN DEFAULT TRUE,
    partial_marking BOOLEAN DEFAULT FALSE,
    
    -- Question Distribution
    question_distribution JSONB, -- {easy: 10, medium: 15, hard: 5}
    topic_distribution JSONB, -- {mechanics: 10, thermodynamics: 5}
    
    -- Access Control
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    requires_subscription BOOLEAN DEFAULT FALSE,
    allowed_attempts INTEGER DEFAULT NULL, -- NULL = unlimited
    
    -- Analytics
    attempt_count INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    avg_time_taken INTEGER,
    difficulty_rating DECIMAL(3,2), -- User-rated difficulty
    
    -- Tracking
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Links questions to tests
CREATE TABLE public.test_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    section TEXT,
    marks_override INTEGER,
    negative_marks_override INTEGER,
    is_mandatory BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT unique_test_question_sequence UNIQUE(test_id, sequence_number)
);

-- Test attempts by users
CREATE TABLE public.test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Test Information
    test_title TEXT,
    test_type TEXT,
    
    -- Attempt Information
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_taken INTEGER,
    time_taken_minutes INTEGER,
    
    -- Question Counts
    total_questions INTEGER DEFAULT 0,
    attempted_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    
    -- Legacy columns (for backward compatibility)
    total_attempted INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_incorrect INTEGER DEFAULT 0,
    total_skipped INTEGER DEFAULT 0,
    
    -- Scoring
    total_marks INTEGER,
    total_marks_obtained DECIMAL(10,2),
    marks_obtained DECIMAL(10,2),
    percentage DECIMAL(5,2),
    
    -- Detailed Performance
    topic_breakdown JSONB,
    difficulty_breakdown JSONB,
    questions_data JSONB,
    user_answers JSONB,
    
    -- Section-wise Performance
    section_scores JSONB,
    topic_wise_scores JSONB,
    difficulty_wise_scores JSONB,
    
    -- Analysis
    accuracy DECIMAL(5,2),
    speed DECIMAL(10,2),
    rank INTEGER,
    percentile DECIMAL(5,2),
    
    -- Strengths and Weaknesses
    strong_topics UUID[],
    weak_topics UUID[],
    
    -- Metadata
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'expired', 'submitted')),
    device_info JSONB,
    ip_address INET,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_test_attempt UNIQUE(test_id, user_id, attempt_number)
);

-- Individual question responses
CREATE TABLE public.test_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Response Details
    user_answer TEXT,
    is_correct BOOLEAN,
    is_attempted BOOLEAN DEFAULT FALSE,
    is_marked_for_review BOOLEAN DEFAULT FALSE,
    is_answered_later BOOLEAN DEFAULT FALSE,
    
    -- Timing
    time_spent INTEGER,
    first_seen_at TIMESTAMPTZ,
    last_modified_at TIMESTAMPTZ,
    answered_at TIMESTAMPTZ,
    
    -- Analysis
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    marks_awarded DECIMAL(10,2),
    partial_credit DECIMAL(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_result_question UNIQUE(result_id, question_id)
);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- Question performance analytics
CREATE TABLE public.question_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Performance Metrics
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    partially_correct INTEGER DEFAULT 0,
    avg_time_spent INTEGER,
    median_time_spent INTEGER,
    skip_rate DECIMAL(5,2),
    
    -- Difficulty Analysis
    calculated_difficulty DECIMAL(3,2),
    discrimination_index DECIMAL(3,2),
    point_biserial DECIMAL(3,2), -- Correlation with total score
    
    -- Pattern Analysis
    common_wrong_answers JSONB,
    time_distribution JSONB,
    topic_correlation JSONB, -- Performance correlation with other topics
    
    -- By User Segment
    performance_by_level JSONB, -- {beginner: 0.3, intermediate: 0.6, advanced: 0.9}
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_question_analytics UNIQUE(question_id)
);

-- User performance analytics
CREATE TABLE public.user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Overall Performance
    total_questions_attempted INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_time_spent INTEGER, -- in seconds
    overall_accuracy DECIMAL(5,2),
    avg_time_per_question INTEGER,
    
    -- Subject-wise Performance
    subject_performance JSONB,
    
    -- Topic-wise Performance  
    topic_performance JSONB,
    topic_mastery JSONB, -- {topic_id: mastery_level (0-100)}
    
    -- Difficulty Performance
    difficulty_performance JSONB,
    
    -- Question Type Performance
    question_type_performance JSONB,
    
    -- Learning Patterns
    learning_curve JSONB, -- Performance over time
    study_patterns JSONB, -- Time of day, duration patterns
    
    -- Trends
    performance_trend JSONB,
    improvement_rate DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    
    -- Strengths and Weaknesses
    strengths TEXT[],
    weaknesses TEXT[],
    recommended_topics UUID[],
    recommended_difficulty TEXT,
    
    -- Predictions
    predicted_score JSONB, -- {JEE_Main: 180, JEE_Advanced: 120}
    predicted_rank JSONB,
    
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_analytics UNIQUE(user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Questions indexes
CREATE INDEX idx_questions_source ON questions(source_type);
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_questions_search ON questions USING GIN(search_vector);
CREATE INDEX idx_questions_source_metadata ON questions USING GIN(source_metadata);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_questions_concepts ON questions USING GIN(concepts_tested);

-- Tests indexes
CREATE INDEX idx_tests_type ON tests(test_type);
CREATE INDEX idx_tests_subject ON tests(subject);
CREATE INDEX idx_tests_difficulty ON tests(difficulty_level);
CREATE INDEX idx_tests_active ON tests(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tests_public ON tests(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_tests_metadata ON tests USING GIN(test_metadata);
CREATE INDEX idx_tests_topics ON tests USING GIN(topic_ids);

-- Topics indexes
CREATE INDEX idx_topics_subject ON topics(subject);
CREATE INDEX idx_topics_parent ON topics(parent_id);
CREATE INDEX idx_topics_level ON topics(level);
CREATE INDEX idx_topics_active ON topics(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_topics_prerequisites ON topics USING GIN(prerequisites);

-- Test questions indexes
CREATE INDEX idx_test_questions_test ON test_questions(test_id);
CREATE INDEX idx_test_questions_question ON test_questions(question_id);
CREATE INDEX idx_test_questions_section ON test_questions(section);

-- Results indexes
CREATE INDEX idx_results_user ON test_results(user_id);
CREATE INDEX idx_results_test ON test_results(test_id);
CREATE INDEX idx_results_status ON test_results(status);
CREATE INDEX idx_results_submitted ON test_results(submitted_at);
CREATE INDEX idx_results_percentile ON test_results(percentile);

-- Responses indexes
CREATE INDEX idx_responses_result ON test_responses(result_id);
CREATE INDEX idx_responses_question ON test_responses(question_id);
CREATE INDEX idx_responses_correct ON test_responses(is_correct);

-- Analytics indexes
CREATE INDEX idx_question_analytics_question ON question_analytics(question_id);
CREATE INDEX idx_question_analytics_difficulty ON question_analytics(calculated_difficulty);
CREATE INDEX idx_user_analytics_user ON user_analytics(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Questions policies
CREATE POLICY "Active questions viewable by all" ON questions
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Tests policies  
-- View policies
CREATE POLICY "Public tests viewable by all" ON tests
    FOR SELECT USING (is_public = TRUE AND is_active = TRUE);

CREATE POLICY "Users can view their attempted tests" ON tests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM test_results 
            WHERE test_id = tests.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own created tests" ON tests
    FOR SELECT USING (created_by = auth.uid());

-- Modification policies
CREATE POLICY "Users can create own tests" ON tests
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tests" ON tests
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own tests" ON tests
    FOR DELETE USING (auth.uid() = created_by);

-- Topics policies
CREATE POLICY "Topics viewable by all" ON topics
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage topics" ON topics
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Test results policies
CREATE POLICY "Users can view own results" ON test_results
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own results" ON test_results
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own in-progress results" ON test_results
    FOR UPDATE USING (user_id = auth.uid() AND status = 'in_progress');

-- Test responses policies
CREATE POLICY "Users can view own responses" ON test_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM test_results 
            WHERE id = test_responses.result_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own responses" ON test_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM test_results 
            WHERE id = test_responses.result_id AND user_id = auth.uid()
        )
    );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_question_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.question_text, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.explanation, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_questions_search_vector BEFORE INSERT OR UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_question_search_vector();

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate test results
CREATE OR REPLACE FUNCTION calculate_test_result(p_result_id UUID)
RETURNS VOID AS $$
DECLARE
    v_test_id UUID;
    v_total_marks INTEGER;
    v_marks_obtained DECIMAL(10,2) := 0;
    v_total_attempted INTEGER := 0;
    v_total_correct INTEGER := 0;
    v_total_incorrect INTEGER := 0;
    v_total_skipped INTEGER := 0;
BEGIN
    -- Get test details
    SELECT test_id INTO v_test_id FROM test_results WHERE id = p_result_id;
    SELECT total_marks INTO v_total_marks FROM tests WHERE id = v_test_id;
    
    -- Calculate response statistics
    SELECT 
        COUNT(*) FILTER (WHERE is_attempted = TRUE),
        COUNT(*) FILTER (WHERE is_correct = TRUE),
        COUNT(*) FILTER (WHERE is_attempted = TRUE AND is_correct = FALSE),
        COUNT(*) FILTER (WHERE is_attempted = FALSE),
        COALESCE(SUM(marks_awarded), 0)
    INTO 
        v_total_attempted,
        v_total_correct,
        v_total_incorrect,
        v_total_skipped,
        v_marks_obtained
    FROM test_responses
    WHERE result_id = p_result_id;
    
    -- Update test results
    UPDATE test_results
    SET 
        total_attempted = v_total_attempted,
        total_correct = v_total_correct,
        total_incorrect = v_total_incorrect,
        total_skipped = v_total_skipped,
        marks_obtained = v_marks_obtained,
        percentage = CASE 
            WHEN v_total_marks > 0 
            THEN (v_marks_obtained / v_total_marks) * 100
            ELSE 0
        END,
        accuracy = CASE 
            WHEN v_total_attempted > 0 
            THEN (v_total_correct::DECIMAL / v_total_attempted) * 100
            ELSE 0
        END,
        status = 'completed',
        submitted_at = NOW()
    WHERE id = p_result_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update question analytics
CREATE OR REPLACE FUNCTION update_question_analytics(p_question_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO question_analytics (question_id, total_attempts, correct_attempts, avg_time_spent)
    SELECT 
        p_question_id,
        COUNT(*),
        COUNT(*) FILTER (WHERE is_correct = TRUE),
        AVG(time_spent)
    FROM test_responses
    WHERE question_id = p_question_id
    ON CONFLICT (question_id) DO UPDATE
    SET 
        total_attempts = EXCLUDED.total_attempts,
        correct_attempts = EXCLUDED.correct_attempts,
        avg_time_spent = EXCLUDED.avg_time_spent,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPREHENSIVE JEE SYLLABUS TOPICS
-- =====================================================

-- Clear existing topics
TRUNCATE TABLE topics CASCADE;

-- Function to insert topics with hierarchy
CREATE OR REPLACE FUNCTION insert_topic(
    p_name TEXT,
    p_subject TEXT,
    p_parent_name TEXT DEFAULT NULL,
    p_jee_code TEXT DEFAULT NULL,
    p_weightage DECIMAL DEFAULT NULL,
    p_difficulty INTEGER DEFAULT NULL,
    p_concepts JSONB DEFAULT NULL,
    p_patterns JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_parent_id UUID;
    v_topic_id UUID;
    v_level INTEGER;
BEGIN
    -- Get parent ID if provided
    IF p_parent_name IS NOT NULL THEN
        SELECT id INTO v_parent_id FROM topics 
        WHERE name = p_parent_name AND subject = p_subject;
        
        SELECT level + 1 INTO v_level FROM topics WHERE id = v_parent_id;
    ELSE
        v_level := 0;
    END IF;
    
    -- Insert topic
    INSERT INTO topics (
        name, subject, parent_id, level, jee_code, 
        weightage_percentage, difficulty_level,
        common_concepts, question_patterns
    ) VALUES (
        p_name, p_subject, v_parent_id, COALESCE(v_level, 0), p_jee_code,
        p_weightage, p_difficulty,
        p_concepts, p_patterns
    ) RETURNING id INTO v_topic_id;
    
    RETURN v_topic_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSERT PHYSICS TOPICS
-- =====================================================

-- Main Physics Topics
SELECT insert_topic('Physics', 'Physics', NULL, 'P', 100, NULL);

-- 1. MECHANICS (30-35% weightage)
SELECT insert_topic('Mechanics', 'Physics', 'Physics', 'P1', 35, 3, 
    '{"concepts": ["Force", "Motion", "Energy", "Momentum"], "formulas": ["F=ma", "v=u+at", "s=ut+½at²"]}'::jsonb,
    '{"types": ["numerical", "conceptual"], "patterns": ["collision problems", "projectile motion"]}'::jsonb);

-- Mechanics subtopics
SELECT insert_topic('Units and Dimensions', 'Physics', 'Mechanics', 'P1.1', 2, 1);
SELECT insert_topic('Kinematics', 'Physics', 'Mechanics', 'P1.2', 4, 2);
SELECT insert_topic('Laws of Motion', 'Physics', 'Mechanics', 'P1.3', 4, 2);
SELECT insert_topic('Work, Energy and Power', 'Physics', 'Mechanics', 'P1.4', 4, 3);
SELECT insert_topic('Rotational Motion', 'Physics', 'Mechanics', 'P1.5', 5, 4);
SELECT insert_topic('Gravitation', 'Physics', 'Mechanics', 'P1.6', 3, 2);
SELECT insert_topic('Properties of Matter', 'Physics', 'Mechanics', 'P1.7', 3, 2);
SELECT insert_topic('Fluid Mechanics', 'Physics', 'Mechanics', 'P1.8', 3, 3);
SELECT insert_topic('Simple Harmonic Motion', 'Physics', 'Mechanics', 'P1.9', 3, 3);
SELECT insert_topic('Waves', 'Physics', 'Mechanics', 'P1.10', 4, 3);

-- 2. THERMODYNAMICS (8-10% weightage)
SELECT insert_topic('Thermodynamics', 'Physics', 'Physics', 'P2', 10, 3,
    '{"concepts": ["Heat", "Temperature", "Entropy"], "formulas": ["Q=mcΔT", "PV=nRT", "ΔU=Q-W"]}'::jsonb);

SELECT insert_topic('Thermal Properties', 'Physics', 'Thermodynamics', 'P2.1', 2, 2);
SELECT insert_topic('Kinetic Theory of Gases', 'Physics', 'Thermodynamics', 'P2.2', 3, 3);
SELECT insert_topic('Laws of Thermodynamics', 'Physics', 'Thermodynamics', 'P2.3', 4, 3);
SELECT insert_topic('Heat Transfer', 'Physics', 'Thermodynamics', 'P2.4', 1, 2);

-- 3. ELECTROMAGNETISM (25-30% weightage)
SELECT insert_topic('Electromagnetism', 'Physics', 'Physics', 'P3', 30, 4,
    '{"concepts": ["Electric Field", "Magnetic Field", "EMF"], "formulas": ["F=qE", "F=qvB", "ε=-dΦ/dt"]}'::jsonb);

SELECT insert_topic('Electrostatics', 'Physics', 'Electromagnetism', 'P3.1', 6, 3);
SELECT insert_topic('Capacitance', 'Physics', 'Electromagnetism', 'P3.2', 3, 3);
SELECT insert_topic('Current Electricity', 'Physics', 'Electromagnetism', 'P3.3', 5, 2);
SELECT insert_topic('Moving Charges and Magnetism', 'Physics', 'Electromagnetism', 'P3.4', 5, 4);
SELECT insert_topic('Magnetism and Matter', 'Physics', 'Electromagnetism', 'P3.5', 2, 3);
SELECT insert_topic('Electromagnetic Induction', 'Physics', 'Electromagnetism', 'P3.6', 5, 4);
SELECT insert_topic('Alternating Current', 'Physics', 'Electromagnetism', 'P3.7', 4, 4);

-- 4. OPTICS (10-12% weightage)
SELECT insert_topic('Optics', 'Physics', 'Physics', 'P4', 12, 3,
    '{"concepts": ["Reflection", "Refraction", "Interference"], "formulas": ["n₁sinθ₁=n₂sinθ₂", "1/f=1/v-1/u"]}'::jsonb);

SELECT insert_topic('Ray Optics', 'Physics', 'Optics', 'P4.1', 6, 2);
SELECT insert_topic('Wave Optics', 'Physics', 'Optics', 'P4.2', 6, 4);

-- 5. MODERN PHYSICS (10-12% weightage)
SELECT insert_topic('Modern Physics', 'Physics', 'Physics', 'P5', 12, 4,
    '{"concepts": ["Photoelectric Effect", "Atomic Models", "Radioactivity"], "formulas": ["E=hν", "E=mc²"]}'::jsonb);

SELECT insert_topic('Dual Nature of Matter', 'Physics', 'Modern Physics', 'P5.1', 3, 3);
SELECT insert_topic('Atoms', 'Physics', 'Modern Physics', 'P5.2', 3, 3);
SELECT insert_topic('Nuclei', 'Physics', 'Modern Physics', 'P5.3', 3, 3);
SELECT insert_topic('Semiconductor Electronics', 'Physics', 'Modern Physics', 'P5.4', 3, 3);

-- 6. COMMUNICATION SYSTEMS (1-2% weightage)
SELECT insert_topic('Communication Systems', 'Physics', 'Physics', 'P6', 1, 2);

-- Drop the temporary function
DROP FUNCTION IF EXISTS insert_topic;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Allow authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Allow anonymous users limited access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.questions TO anon;
GRANT SELECT ON public.tests TO anon;
GRANT SELECT ON public.topics TO anon;

-- =====================================================
-- FINAL SETUP
-- =====================================================

-- Analyze tables for query optimization
ANALYZE topics;
ANALYZE questions;
ANALYZE tests;
ANALYZE test_questions;
ANALYZE test_results;
ANALYZE test_responses;