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
    is_admin BOOLEAN DEFAULT FALSE,
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
    topic TEXT NOT NULL CHECK (topic IN ('mechanics', 'thermodynamics', 'electromagnetism', 'optics', 'modern_physics', 'waves_oscillations')),
    subtopic TEXT,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical', 'assertion')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question TEXT NOT NULL,
    
    -- MCQ specific fields
    options JSONB, -- Array of options for MCQ
    correct_answer TEXT, -- A, B, C, D for MCQ; A-E for assertion
    
    -- Numerical specific fields
    numerical_answer DECIMAL,
    numerical_tolerance DECIMAL DEFAULT 0.01,
    
    -- Assertion specific fields
    assertion TEXT,
    reason TEXT,
    
    -- Common fields
    explanation TEXT,
    marks INTEGER DEFAULT 4,
    negative_marks INTEGER DEFAULT 1,
    tags TEXT[],
    source TEXT DEFAULT 'manual' CHECK (source IN ('generated', 'manual', 'previous_year', 'demo')),
    year INTEGER,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tests
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL CHECK (test_type IN ('mock', 'topic_wise', 'custom', 'daily_practice', 'quick', 'ai_generated')),
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
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
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

-- Questions policies
CREATE POLICY "Anyone can view questions"
ON public.questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create questions"
ON public.questions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own questions"
ON public.questions FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own questions"
ON public.questions FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

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
-- PHASE 1: DATA FOUNDATION TABLES
-- =====================================================

-- Hierarchical Topic Taxonomy (replacing simple topics)
CREATE TABLE IF NOT EXISTS public.topic_hierarchy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL DEFAULT 'physics' CHECK (subject IN ('physics', 'chemistry', 'mathematics')),
    topic_code TEXT UNIQUE NOT NULL, -- e.g., 'PHY.MECH.KIN.1D'
    topic_name TEXT NOT NULL,
    parent_id UUID REFERENCES topic_hierarchy(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4), -- 1=Subject, 2=Main, 3=Sub, 4=Concept
    jee_weightage DECIMAL(5,2), -- Percentage weightage in JEE
    order_index INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Previous Year Questions
CREATE TABLE IF NOT EXISTS public.previous_year_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name TEXT NOT NULL CHECK (exam_name IN ('JEE Main', 'JEE Advanced', 'AIEEE', 'IIT-JEE')),
    year INTEGER NOT NULL CHECK (year BETWEEN 1980 AND 2030),
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    shift TEXT,
    paper_code TEXT,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    question_latex TEXT,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical', 'assertion', 'matrix_match', 'paragraph')),
    options JSONB,
    correct_answer TEXT,
    numerical_answer DECIMAL,
    numerical_tolerance DECIMAL DEFAULT 0.01,
    unit TEXT,
    assertion TEXT,
    reason TEXT,
    matrix_data JSONB,
    paragraph_id UUID,
    paragraph_text TEXT,
    solution_text TEXT,
    solution_latex TEXT,
    solution_steps JSONB,
    topic_ids UUID[],
    primary_topic_id UUID REFERENCES topic_hierarchy(id),
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    avg_solving_time INTEGER,
    success_rate DECIMAL(5,2),
    source TEXT DEFAULT 'official' CHECK (source IN ('official', 'verified', 'reconstructed')),
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    ocr_confidence DECIMAL(5,2),
    original_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question Patterns
CREATE TABLE IF NOT EXISTS public.question_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,
    pattern_template JSONB NOT NULL,
    example_question_ids UUID[],
    topics UUID[],
    typical_difficulty TEXT,
    typical_time_minutes INTEGER,
    frequency_count INTEGER DEFAULT 0,
    years_appeared INTEGER[],
    exams_appeared TEXT[],
    generation_prompt TEXT,
    constraints JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OCR Processing Queue
CREATE TABLE IF NOT EXISTS public.ocr_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type TEXT CHECK (document_type IN ('question_paper', 'answer_key', 'solution')),
    exam_name TEXT,
    year INTEGER,
    shift TEXT,
    original_file_url TEXT NOT NULL,
    file_size_mb DECIMAL(10,2),
    page_count INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'review')),
    priority INTEGER DEFAULT 5,
    ocr_output JSONB,
    processed_questions JSONB,
    confidence_score DECIMAL(5,2),
    processor_used TEXT,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,
    needs_review BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch OCR Jobs for parallel processing
CREATE TABLE IF NOT EXISTS public.batch_ocr_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    total_files INTEGER NOT NULL,
    processed_files INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'paused')),
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add batch job reference to OCR queue
ALTER TABLE public.ocr_queue 
ADD COLUMN IF NOT EXISTS batch_job_id UUID REFERENCES batch_ocr_jobs(id) ON DELETE SET NULL;

-- Exam Metadata
CREATE TABLE IF NOT EXISTS public.exam_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER,
    date DATE,
    shift TEXT,
    paper_code TEXT,
    total_questions INTEGER,
    total_marks INTEGER,
    duration_minutes INTEGER,
    physics_questions INTEGER,
    chemistry_questions INTEGER,
    mathematics_questions INTEGER,
    marking_scheme JSONB,
    question_paper_url TEXT,
    answer_key_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_name, year, shift, paper_code)
);

-- Indexes for Phase 1 tables
CREATE INDEX IF NOT EXISTS idx_topic_hierarchy_parent ON topic_hierarchy(parent_id);
CREATE INDEX IF NOT EXISTS idx_topic_hierarchy_code ON topic_hierarchy(topic_code);
CREATE INDEX IF NOT EXISTS idx_pyq_exam ON previous_year_questions(exam_name, year);
CREATE INDEX IF NOT EXISTS idx_pyq_topic ON previous_year_questions USING GIN(topic_ids);
CREATE INDEX IF NOT EXISTS idx_pyq_difficulty ON previous_year_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_patterns_topics ON question_patterns USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_ocr_queue_status ON ocr_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_exam_metadata ON exam_metadata(exam_name, year DESC);

-- Enable RLS on Phase 1 tables
ALTER TABLE public.topic_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.previous_year_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_ocr_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Phase 1 tables
CREATE POLICY "Anyone can view topic hierarchy"
ON public.topic_hierarchy FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage topic hierarchy"
ON public.topic_hierarchy FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Anyone can view verified previous year questions"
ON public.previous_year_questions FOR SELECT
TO authenticated
USING (verification_status = 'verified' OR 
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Admin can manage previous year questions"
ON public.previous_year_questions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Admin can manage OCR queue"
ON public.ocr_queue FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Anyone can view exam metadata"
ON public.exam_metadata FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can view batch OCR jobs"
ON public.batch_ocr_jobs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

CREATE POLICY "Admins can manage batch OCR jobs"
ON public.batch_ocr_jobs FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- Triggers for Phase 1 tables
CREATE TRIGGER update_topic_hierarchy_updated_at 
BEFORE UPDATE ON topic_hierarchy
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pyq_updated_at 
BEFORE UPDATE ON previous_year_questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at 
BEFORE UPDATE ON question_patterns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocr_queue_updated_at 
BEFORE UPDATE ON ocr_queue
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - Physics Taxonomy
-- =====================================================

-- Insert Physics subject root
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, level, jee_weightage, order_index) VALUES
('physics', 'PHY', 'Physics', 1, 100.00, 1)
ON CONFLICT (topic_code) DO NOTHING;

-- Insert main physics topics with JEE weightage
WITH physics_root AS (
    SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY'
)
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index, description) 
SELECT 'physics', code, name, physics_root.id, 2, weightage, ord, description
FROM physics_root, (VALUES
    ('PHY.MECH', 'Mechanics', 30.00, 1, 'Kinematics, Dynamics, Work-Energy, Rotational Motion'),
    ('PHY.THERMO', 'Thermodynamics', 15.00, 2, 'Heat, Temperature, Laws of Thermodynamics'),
    ('PHY.ELECTRO', 'Electromagnetism', 25.00, 3, 'Electrostatics, Current, Magnetism, EMI'),
    ('PHY.OPTICS', 'Optics', 10.00, 4, 'Ray Optics, Wave Optics, Instruments'),
    ('PHY.MODERN', 'Modern Physics', 10.00, 5, 'Dual Nature, Atoms, Nuclei, Semiconductors'),
    ('PHY.WAVES', 'Waves & Oscillations', 10.00, 6, 'SHM, Wave Motion, Sound')
) AS t(code, name, weightage, ord, description)
ON CONFLICT (topic_code) DO NOTHING;

-- =====================================================
-- COMPREHENSIVE JEE PHYSICS TAXONOMY
-- =====================================================

-- MECHANICS (30% weightage)
WITH mech_topic AS (
    SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH'
)
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index)
SELECT 'physics', code, name, mech_topic.id, 3, weightage, ord
FROM mech_topic, (VALUES
    ('PHY.MECH.KIN', 'Kinematics', 5.00, 1),
    ('PHY.MECH.LAWS', 'Laws of Motion', 4.00, 2),
    ('PHY.MECH.WEP', 'Work, Energy & Power', 4.00, 3),
    ('PHY.MECH.COM', 'System of Particles & COM', 3.00, 4),
    ('PHY.MECH.ROT', 'Rotational Motion', 5.00, 5),
    ('PHY.MECH.GRAV', 'Gravitation', 3.00, 6),
    ('PHY.MECH.PROP', 'Properties of Matter', 3.00, 7),
    ('PHY.MECH.FLUID', 'Fluid Mechanics', 3.00, 8)
) AS t(code, name, weightage, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Kinematics subtopics
WITH kin_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH.KIN')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, kin_topic.id, 4, ord
FROM kin_topic, (VALUES
    ('PHY.MECH.KIN.1D', 'Motion in One Dimension', 1),
    ('PHY.MECH.KIN.2D', 'Motion in Two Dimensions', 2),
    ('PHY.MECH.KIN.PROJ', 'Projectile Motion', 3),
    ('PHY.MECH.KIN.CIRC', 'Circular Motion', 4),
    ('PHY.MECH.KIN.REL', 'Relative Motion', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Laws of Motion subtopics
WITH laws_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH.LAWS')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, laws_topic.id, 4, ord
FROM laws_topic, (VALUES
    ('PHY.MECH.LAWS.NEWT', 'Newton''s Laws', 1),
    ('PHY.MECH.LAWS.FRIC', 'Friction', 2),
    ('PHY.MECH.LAWS.CIRC', 'Dynamics of Circular Motion', 3),
    ('PHY.MECH.LAWS.CONS', 'Constraint Equations', 4),
    ('PHY.MECH.LAWS.PSEU', 'Pseudo Forces', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Rotational Motion subtopics
WITH rot_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH.ROT')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, rot_topic.id, 4, ord
FROM rot_topic, (VALUES
    ('PHY.MECH.ROT.KIN', 'Rotational Kinematics', 1),
    ('PHY.MECH.ROT.MI', 'Moment of Inertia', 2),
    ('PHY.MECH.ROT.TORQ', 'Torque and Angular Momentum', 3),
    ('PHY.MECH.ROT.ROLL', 'Rolling Motion', 4),
    ('PHY.MECH.ROT.COMB', 'Combined Translation and Rotation', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Work, Energy & Power subtopics
WITH wep_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH.WEP')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, wep_topic.id, 4, ord
FROM wep_topic, (VALUES
    ('PHY.MECH.WEP.WORK', 'Work Done by Forces', 1),
    ('PHY.MECH.WEP.KE', 'Kinetic Energy', 2),
    ('PHY.MECH.WEP.PE', 'Potential Energy', 3),
    ('PHY.MECH.WEP.CONS', 'Conservation of Energy', 4),
    ('PHY.MECH.WEP.POWER', 'Power', 5),
    ('PHY.MECH.WEP.COLL', 'Collisions', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- System of Particles subtopics
WITH com_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH.COM')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, com_topic.id, 4, ord
FROM com_topic, (VALUES
    ('PHY.MECH.COM.CM', 'Center of Mass', 1),
    ('PHY.MECH.COM.MOM', 'Linear Momentum', 2),
    ('PHY.MECH.COM.IMP', 'Impulse', 3),
    ('PHY.MECH.COM.VAR', 'Variable Mass Systems', 4)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Gravitation subtopics
WITH grav_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH.GRAV')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, grav_topic.id, 4, ord
FROM grav_topic, (VALUES
    ('PHY.MECH.GRAV.LAW', 'Universal Law of Gravitation', 1),
    ('PHY.MECH.GRAV.FIELD', 'Gravitational Field and Potential', 2),
    ('PHY.MECH.GRAV.ESC', 'Escape Velocity', 3),
    ('PHY.MECH.GRAV.ORB', 'Orbital Motion', 4),
    ('PHY.MECH.GRAV.KEP', 'Kepler''s Laws', 5),
    ('PHY.MECH.GRAV.SAT', 'Satellites', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Properties of Matter subtopics
WITH prop_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH.PROP')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, prop_topic.id, 4, ord
FROM prop_topic, (VALUES
    ('PHY.MECH.PROP.ELAS', 'Elasticity', 1),
    ('PHY.MECH.PROP.STRESS', 'Stress and Strain', 2),
    ('PHY.MECH.PROP.HOOK', 'Hooke''s Law', 3),
    ('PHY.MECH.PROP.MOD', 'Elastic Moduli', 4),
    ('PHY.MECH.PROP.POIS', 'Poisson''s Ratio', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Fluid Mechanics subtopics
WITH fluid_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MECH.FLUID')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, fluid_topic.id, 4, ord
FROM fluid_topic, (VALUES
    ('PHY.MECH.FLUID.PRES', 'Pressure in Fluids', 1),
    ('PHY.MECH.FLUID.PASC', 'Pascal''s Law', 2),
    ('PHY.MECH.FLUID.ARCH', 'Archimedes Principle', 3),
    ('PHY.MECH.FLUID.BUOY', 'Buoyancy', 4),
    ('PHY.MECH.FLUID.CONT', 'Equation of Continuity', 5),
    ('PHY.MECH.FLUID.BERN', 'Bernoulli''s Theorem', 6),
    ('PHY.MECH.FLUID.VISC', 'Viscosity', 7),
    ('PHY.MECH.FLUID.STOK', 'Stokes Law', 8),
    ('PHY.MECH.FLUID.SURF', 'Surface Tension', 9),
    ('PHY.MECH.FLUID.CAP', 'Capillarity', 10)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- THERMODYNAMICS (15% weightage)
WITH thermo_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.THERMO')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index)
SELECT 'physics', code, name, thermo_topic.id, 3, weightage, ord
FROM thermo_topic, (VALUES
    ('PHY.THERMO.HEAT', 'Thermal Properties', 3.00, 1),
    ('PHY.THERMO.LAWS', 'Laws of Thermodynamics', 4.00, 2),
    ('PHY.THERMO.KTG', 'Kinetic Theory of Gases', 3.00, 3),
    ('PHY.THERMO.TRANS', 'Heat Transfer', 3.00, 4),
    ('PHY.THERMO.CALOR', 'Calorimetry', 2.00, 5)
) AS t(code, name, weightage, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Thermal Properties subtopics
WITH heat_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.THERMO.HEAT')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, heat_topic.id, 4, ord
FROM heat_topic, (VALUES
    ('PHY.THERMO.HEAT.TEMP', 'Temperature and Heat', 1),
    ('PHY.THERMO.HEAT.EXP', 'Thermal Expansion', 2),
    ('PHY.THERMO.HEAT.CAL', 'Specific Heat and Latent Heat', 3),
    ('PHY.THERMO.HEAT.COND', 'Thermal Conductivity', 4)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Laws of Thermodynamics subtopics
WITH laws_thermo_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.THERMO.LAWS')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, laws_thermo_topic.id, 4, ord
FROM laws_thermo_topic, (VALUES
    ('PHY.THERMO.LAWS.ZERO', 'Zeroth Law', 1),
    ('PHY.THERMO.LAWS.FIRST', 'First Law', 2),
    ('PHY.THERMO.LAWS.SECOND', 'Second Law', 3),
    ('PHY.THERMO.LAWS.PROC', 'Thermodynamic Processes', 4),
    ('PHY.THERMO.LAWS.CYCLE', 'Carnot Cycle', 5),
    ('PHY.THERMO.LAWS.EFF', 'Heat Engines and Efficiency', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Kinetic Theory subtopics
WITH ktg_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.THERMO.KTG')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, ktg_topic.id, 4, ord
FROM ktg_topic, (VALUES
    ('PHY.THERMO.KTG.IDEAL', 'Ideal Gas Law', 1),
    ('PHY.THERMO.KTG.MOL', 'Molecular Speeds', 2),
    ('PHY.THERMO.KTG.EQUI', 'Equipartition of Energy', 3),
    ('PHY.THERMO.KTG.MEAN', 'Mean Free Path', 4),
    ('PHY.THERMO.KTG.REAL', 'Real Gases and Van der Waals', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- ELECTROMAGNETISM (25% weightage)
WITH electro_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.ELECTRO')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index)
SELECT 'physics', code, name, electro_topic.id, 3, weightage, ord
FROM electro_topic, (VALUES
    ('PHY.ELECTRO.ESTAT', 'Electrostatics', 5.00, 1),
    ('PHY.ELECTRO.CAP', 'Capacitance', 3.00, 2),
    ('PHY.ELECTRO.CURR', 'Current Electricity', 4.00, 3),
    ('PHY.ELECTRO.MAG', 'Magnetism', 4.00, 4),
    ('PHY.ELECTRO.MI', 'Magnetic Induction', 3.00, 5),
    ('PHY.ELECTRO.EMI', 'Electromagnetic Induction', 3.00, 6),
    ('PHY.ELECTRO.AC', 'Alternating Current', 3.00, 7)
) AS t(code, name, weightage, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Electrostatics subtopics
WITH estat_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.ELECTRO.ESTAT')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, estat_topic.id, 4, ord
FROM estat_topic, (VALUES
    ('PHY.ELECTRO.ESTAT.CHARGE', 'Electric Charge and Coulomb''s Law', 1),
    ('PHY.ELECTRO.ESTAT.FIELD', 'Electric Field', 2),
    ('PHY.ELECTRO.ESTAT.FLUX', 'Gauss''s Law', 3),
    ('PHY.ELECTRO.ESTAT.POT', 'Electric Potential', 4),
    ('PHY.ELECTRO.ESTAT.DIPOLE', 'Electric Dipole', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Current Electricity subtopics
WITH curr_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.ELECTRO.CURR')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, curr_topic.id, 4, ord
FROM curr_topic, (VALUES
    ('PHY.ELECTRO.CURR.OHM', 'Ohm''s Law and Resistance', 1),
    ('PHY.ELECTRO.CURR.CELL', 'Cells and EMF', 2),
    ('PHY.ELECTRO.CURR.KIRCH', 'Kirchhoff''s Laws', 3),
    ('PHY.ELECTRO.CURR.METER', 'Electrical Instruments', 4),
    ('PHY.ELECTRO.CURR.BRIDGE', 'Wheatstone Bridge and Potentiometer', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Capacitance subtopics
WITH cap_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.ELECTRO.CAP')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, cap_topic.id, 4, ord
FROM cap_topic, (VALUES
    ('PHY.ELECTRO.CAP.BASIC', 'Capacitor Basics', 1),
    ('PHY.ELECTRO.CAP.COMB', 'Combination of Capacitors', 2),
    ('PHY.ELECTRO.CAP.ENERGY', 'Energy in Capacitors', 3),
    ('PHY.ELECTRO.CAP.DIEL', 'Dielectrics', 4)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Magnetism subtopics
WITH mag_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.ELECTRO.MAG')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, mag_topic.id, 4, ord
FROM mag_topic, (VALUES
    ('PHY.ELECTRO.MAG.FIELD', 'Magnetic Field', 1),
    ('PHY.ELECTRO.MAG.BIOT', 'Biot-Savart Law', 2),
    ('PHY.ELECTRO.MAG.AMP', 'Ampere''s Law', 3),
    ('PHY.ELECTRO.MAG.FORCE', 'Force on Conductors', 4),
    ('PHY.ELECTRO.MAG.TORQ', 'Torque on Current Loop', 5),
    ('PHY.ELECTRO.MAG.GALV', 'Moving Coil Galvanometer', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Magnetic Properties subtopics
WITH mi_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.ELECTRO.MI')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, mi_topic.id, 4, ord
FROM mi_topic, (VALUES
    ('PHY.ELECTRO.MI.MAT', 'Magnetic Materials', 1),
    ('PHY.ELECTRO.MI.DIA', 'Dia, Para and Ferromagnetism', 2),
    ('PHY.ELECTRO.MI.EARTH', 'Earth''s Magnetism', 3),
    ('PHY.ELECTRO.MI.HYST', 'Hysteresis', 4)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Electromagnetic Induction subtopics
WITH emi_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.ELECTRO.EMI')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, emi_topic.id, 4, ord
FROM emi_topic, (VALUES
    ('PHY.ELECTRO.EMI.FARAD', 'Faraday''s Law', 1),
    ('PHY.ELECTRO.EMI.LENZ', 'Lenz''s Law', 2),
    ('PHY.ELECTRO.EMI.MOTION', 'Motional EMF', 3),
    ('PHY.ELECTRO.EMI.SELF', 'Self Inductance', 4),
    ('PHY.ELECTRO.EMI.MUT', 'Mutual Inductance', 5),
    ('PHY.ELECTRO.EMI.EDDY', 'Eddy Currents', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- AC Circuits subtopics
WITH ac_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.ELECTRO.AC')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, ac_topic.id, 4, ord
FROM ac_topic, (VALUES
    ('PHY.ELECTRO.AC.BASIC', 'AC Fundamentals', 1),
    ('PHY.ELECTRO.AC.CIRC', 'LCR Circuits', 2),
    ('PHY.ELECTRO.AC.RES', 'Resonance', 3),
    ('PHY.ELECTRO.AC.POWER', 'Power in AC', 4),
    ('PHY.ELECTRO.AC.TRANS', 'Transformers', 5),
    ('PHY.ELECTRO.AC.GEN', 'AC Generator', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- WAVES & OSCILLATIONS (10% weightage)
WITH waves_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.WAVES')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index)
SELECT 'physics', code, name, waves_topic.id, 3, weightage, ord
FROM waves_topic, (VALUES
    ('PHY.WAVES.SHM', 'Simple Harmonic Motion', 4.00, 1),
    ('PHY.WAVES.WAVE', 'Wave Motion', 3.00, 2),
    ('PHY.WAVES.SOUND', 'Sound Waves', 2.00, 3),
    ('PHY.WAVES.STRING', 'Waves in Strings and Pipes', 1.00, 4)
) AS t(code, name, weightage, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- SHM subtopics
WITH shm_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.WAVES.SHM')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, shm_topic.id, 4, ord
FROM shm_topic, (VALUES
    ('PHY.WAVES.SHM.BASIC', 'SHM Fundamentals', 1),
    ('PHY.WAVES.SHM.SPRING', 'Spring-Mass System', 2),
    ('PHY.WAVES.SHM.PEND', 'Simple and Compound Pendulum', 3),
    ('PHY.WAVES.SHM.DAMP', 'Damped and Forced Oscillations', 4),
    ('PHY.WAVES.SHM.SUPER', 'Superposition of SHM', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Wave Motion subtopics
WITH wave_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.WAVES.WAVE')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, wave_topic.id, 4, ord
FROM wave_topic, (VALUES
    ('PHY.WAVES.WAVE.PROP', 'Wave Propagation', 1),
    ('PHY.WAVES.WAVE.EQ', 'Wave Equation', 2),
    ('PHY.WAVES.WAVE.SUPER', 'Superposition Principle', 3),
    ('PHY.WAVES.WAVE.STAND', 'Standing Waves', 4),
    ('PHY.WAVES.WAVE.BEAT', 'Beats', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Sound Waves subtopics
WITH sound_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.WAVES.SOUND')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, sound_topic.id, 4, ord
FROM sound_topic, (VALUES
    ('PHY.WAVES.SOUND.PROP', 'Properties of Sound', 1),
    ('PHY.WAVES.SOUND.DOPP', 'Doppler Effect', 2),
    ('PHY.WAVES.SOUND.INT', 'Sound Intensity', 3),
    ('PHY.WAVES.SOUND.ECHO', 'Echo and Reverberation', 4)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- OPTICS (10% weightage)
WITH optics_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.OPTICS')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index)
SELECT 'physics', code, name, optics_topic.id, 3, weightage, ord
FROM optics_topic, (VALUES
    ('PHY.OPTICS.RAY', 'Ray Optics', 5.00, 1),
    ('PHY.OPTICS.WAVE', 'Wave Optics', 5.00, 2)
) AS t(code, name, weightage, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Ray Optics subtopics
WITH ray_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.OPTICS.RAY')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, ray_topic.id, 4, ord
FROM ray_topic, (VALUES
    ('PHY.OPTICS.RAY.REFL', 'Reflection', 1),
    ('PHY.OPTICS.RAY.REFR', 'Refraction', 2),
    ('PHY.OPTICS.RAY.LENS', 'Lenses', 3),
    ('PHY.OPTICS.RAY.MIRR', 'Mirrors', 4),
    ('PHY.OPTICS.RAY.PRISM', 'Prism and Dispersion', 5),
    ('PHY.OPTICS.RAY.INST', 'Optical Instruments', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Wave Optics subtopics
WITH wave_opt_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.OPTICS.WAVE')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, wave_opt_topic.id, 4, ord
FROM wave_opt_topic, (VALUES
    ('PHY.OPTICS.WAVE.HUY', 'Huygens Principle', 1),
    ('PHY.OPTICS.WAVE.INTER', 'Interference', 2),
    ('PHY.OPTICS.WAVE.YDSE', 'Young''s Double Slit', 3),
    ('PHY.OPTICS.WAVE.DIFF', 'Diffraction', 4),
    ('PHY.OPTICS.WAVE.POL', 'Polarization', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- MODERN PHYSICS (10% weightage)
WITH modern_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MODERN')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index)
SELECT 'physics', code, name, modern_topic.id, 3, weightage, ord
FROM modern_topic, (VALUES
    ('PHY.MODERN.DUAL', 'Dual Nature of Matter', 2.00, 1),
    ('PHY.MODERN.PHOTO', 'Photoelectric Effect', 2.00, 2),
    ('PHY.MODERN.ATOM', 'Atoms and Nuclei', 3.00, 3),
    ('PHY.MODERN.RADIO', 'Radioactivity', 2.00, 4),
    ('PHY.MODERN.SEMI', 'Semiconductors', 1.00, 5)
) AS t(code, name, weightage, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Atoms and Nuclei subtopics
WITH atom_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MODERN.ATOM')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, atom_topic.id, 4, ord
FROM atom_topic, (VALUES
    ('PHY.MODERN.ATOM.RUTH', 'Rutherford Model', 1),
    ('PHY.MODERN.ATOM.BOHR', 'Bohr Model', 2),
    ('PHY.MODERN.ATOM.SPEC', 'Atomic Spectra', 3),
    ('PHY.MODERN.ATOM.XRAY', 'X-rays', 4),
    ('PHY.MODERN.ATOM.NUC', 'Nuclear Structure', 5),
    ('PHY.MODERN.ATOM.BIND', 'Binding Energy', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Dual Nature subtopics
WITH dual_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MODERN.DUAL')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, dual_topic.id, 4, ord
FROM dual_topic, (VALUES
    ('PHY.MODERN.DUAL.WAVE', 'Wave Nature of Light', 1),
    ('PHY.MODERN.DUAL.PART', 'Particle Nature of Light', 2),
    ('PHY.MODERN.DUAL.DEBROG', 'De Broglie Waves', 3),
    ('PHY.MODERN.DUAL.DAVISS', 'Davisson-Germer Experiment', 4)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Photoelectric Effect subtopics
WITH photo_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MODERN.PHOTO')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, photo_topic.id, 4, ord
FROM photo_topic, (VALUES
    ('PHY.MODERN.PHOTO.LAWS', 'Laws of Photoelectric Effect', 1),
    ('PHY.MODERN.PHOTO.EIN', 'Einstein''s Equation', 2),
    ('PHY.MODERN.PHOTO.STOP', 'Stopping Potential', 3),
    ('PHY.MODERN.PHOTO.WORK', 'Work Function', 4)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Radioactivity subtopics
WITH radio_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MODERN.RADIO')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, radio_topic.id, 4, ord
FROM radio_topic, (VALUES
    ('PHY.MODERN.RADIO.TYPES', 'Alpha, Beta, Gamma Decay', 1),
    ('PHY.MODERN.RADIO.LAW', 'Radioactive Decay Law', 2),
    ('PHY.MODERN.RADIO.HALF', 'Half Life and Mean Life', 3),
    ('PHY.MODERN.RADIO.FISS', 'Nuclear Fission', 4),
    ('PHY.MODERN.RADIO.FUS', 'Nuclear Fusion', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Semiconductors subtopics
WITH semi_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MODERN.SEMI')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, semi_topic.id, 4, ord
FROM semi_topic, (VALUES
    ('PHY.MODERN.SEMI.BASIC', 'Intrinsic and Extrinsic Semiconductors', 1),
    ('PHY.MODERN.SEMI.PN', 'P-N Junction', 2),
    ('PHY.MODERN.SEMI.DIODE', 'Diode and Rectification', 3),
    ('PHY.MODERN.SEMI.ZENER', 'Zener Diode', 4),
    ('PHY.MODERN.SEMI.LED', 'LED and Photodiode', 5),
    ('PHY.MODERN.SEMI.TRANS', 'Transistors', 6),
    ('PHY.MODERN.SEMI.LOGIC', 'Logic Gates', 7)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Communication Systems (Additional JEE topic)
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index, description)
SELECT 'physics', 'PHY.COMM', 'Communication Systems', 
       (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY'), 
       2, 2.00, 7, 'Electronic Communication Systems'
ON CONFLICT (topic_code) DO NOTHING;

WITH comm_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.COMM')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, comm_topic.id, 3, ord
FROM comm_topic, (VALUES
    ('PHY.COMM.BASIC', 'Basic Communication', 1),
    ('PHY.COMM.MOD', 'Modulation and Demodulation', 2),
    ('PHY.COMM.PROP', 'Propagation of EM Waves', 3),
    ('PHY.COMM.BAND', 'Bandwidth', 4)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Physics and Measurement (Unit 1 - Important foundation topic)
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index, description)
SELECT 'physics', 'PHY.MEAS', 'Physics and Measurement', 
       (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY'), 
       2, 3.00, 8, 'Units, Dimensions, Measurements, and Errors'
ON CONFLICT (topic_code) DO NOTHING;

WITH meas_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.MEAS')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, meas_topic.id, 3, ord
FROM meas_topic, (VALUES
    ('PHY.MEAS.UNITS', 'Units and Systems of Units', 1),
    ('PHY.MEAS.DIM', 'Dimensional Analysis', 2),
    ('PHY.MEAS.ERR', 'Errors and Significant Figures', 3),
    ('PHY.MEAS.LEAST', 'Least Count', 4),
    ('PHY.MEAS.VERN', 'Vernier Caliper and Screw Gauge', 5),
    ('PHY.MEAS.GRAPH', 'Graphical Analysis', 6)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Electromagnetic Waves (Unit 15 - Important separate topic)
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index, description)
SELECT 'physics', 'PHY.EMWAVES', 'Electromagnetic Waves', 
       (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY'), 
       2, 2.00, 9, 'EM Waves and Spectrum'
ON CONFLICT (topic_code) DO NOTHING;

WITH emwaves_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.EMWAVES')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, emwaves_topic.id, 3, ord
FROM emwaves_topic, (VALUES
    ('PHY.EMWAVES.DISP', 'Displacement Current', 1),
    ('PHY.EMWAVES.CHAR', 'Characteristics of EM Waves', 2),
    ('PHY.EMWAVES.TRANS', 'Transverse Nature', 3),
    ('PHY.EMWAVES.SPEC', 'Electromagnetic Spectrum', 4),
    ('PHY.EMWAVES.APP', 'Applications of EM Waves', 5)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- Experimental Skills (Unit 20 - Practical experiments)
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, jee_weightage, order_index, description)
SELECT 'physics', 'PHY.EXP', 'Experimental Skills', 
       (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY'), 
       2, 3.00, 10, 'Practical Experiments and Observations'
ON CONFLICT (topic_code) DO NOTHING;

WITH exp_topic AS (SELECT id FROM topic_hierarchy WHERE topic_code = 'PHY.EXP')
INSERT INTO topic_hierarchy (subject, topic_code, topic_name, parent_id, level, order_index)
SELECT 'physics', code, name, exp_topic.id, 3, ord
FROM exp_topic, (VALUES
    ('PHY.EXP.PEND', 'Simple Pendulum Experiments', 1),
    ('PHY.EXP.YOUNG', 'Young''s Modulus Determination', 2),
    ('PHY.EXP.SURF', 'Surface Tension Experiments', 3),
    ('PHY.EXP.VISC', 'Viscosity Experiments', 4),
    ('PHY.EXP.SOUND', 'Speed of Sound Experiments', 5),
    ('PHY.EXP.HEAT', 'Specific Heat Experiments', 6),
    ('PHY.EXP.METER', 'Meter Bridge Experiments', 7),
    ('PHY.EXP.FOCAL', 'Focal Length Determination', 8)
) AS t(code, name, ord)
ON CONFLICT (topic_code) DO NOTHING;

-- =====================================================
-- SEED DATA - Demo Questions
-- =====================================================

-- Delete existing demo questions first to avoid conflicts
DELETE FROM questions WHERE source = 'demo';

-- Insert demo questions for Quick Test
INSERT INTO questions (
  topic, subtopic, question_type, difficulty, question, 
  options, correct_answer, explanation, marks, negative_marks, 
  tags, source
) VALUES
-- Question 1: Kinematics (Medium, MCQ)
(
  'mechanics',
  'Kinematics',
  'mcq',
  'medium',
  'A particle moves along a straight line with velocity $v = 3t^2 - 6t + 4$ m/s. Find the acceleration at $t = 2$ seconds.',
  '["6 m/s²", "12 m/s²", "18 m/s²", "24 m/s²"]'::jsonb,
  'A',
  'Acceleration is the derivative of velocity: $a = \frac{dv}{dt} = 6t - 6$. At $t = 2$, $a = 6(2) - 6 = 6$ m/s²',
  4,
  1,
  ARRAY['JEE Main', 'Kinematics', 'Differentiation'],
  'demo'
),
-- Question 2: Projectile Motion (Hard, MCQ)
(
  'mechanics',
    'Projectile Motion',
    'mcq',
    'hard',
    'A projectile is fired at an angle of 45° with initial velocity 40 m/s. Find the maximum height reached. (Take g = 10 m/s²)',
    '["40 m", "60 m", "80 m", "100 m"]'::jsonb,
    'A',
    'Maximum height $H = \frac{u^2 \sin^2\theta}{2g} = \frac{40^2 \times \sin^2(45°)}{2 \times 10} = \frac{1600 \times 0.5}{20} = 40$ m',
    4,
    1,
    ARRAY['JEE Advanced', 'Projectile Motion'],
    'demo'
),
-- Question 3: Heat Transfer (Hard, Numerical)  
(
  'thermodynamics',
    'Heat Transfer',
    'numerical',
    'hard',
    'A metal rod of length 50 cm and cross-sectional area 2 cm² has one end at 100°C and the other at 0°C. If the thermal conductivity is 400 W/m·K, calculate the rate of heat transfer in watts.',
    NULL,
    NULL,
    'Using Fourier''s law: $Q = kA\frac{\Delta T}{L} = 400 \times 2 \times 10^{-4} \times \frac{100}{0.5} = 16$ W',
    4,
    1,
    ARRAY['JEE Advanced', 'Heat Transfer', 'Conduction'],
    'demo'
),
-- Question 4: Electric Field (Easy, MCQ)
(
  'electromagnetism',
    'Electric Field',
    'mcq',
    'easy',
    'The electric field due to a point charge at a distance r is E. What will be the electric field at distance 2r?',
    '["E/2", "E/4", "2E", "4E"]'::jsonb,
    'B',
    'Electric field varies inversely with square of distance: $E \propto \frac{1}{r^2}$. So at 2r, field becomes E/4.',
    4,
    1,
    ARRAY['JEE Main', 'Electric Field', 'Coulomb''s Law'],
    'demo'
),
-- Question 5: Photoelectric Effect (Medium, Numerical)
(
  'modern_physics',
    'Photoelectric Effect',
    'numerical',
    'medium',
    'Light of wavelength 400 nm is incident on a metal surface with work function 2.0 eV. Calculate the maximum kinetic energy of photoelectrons in eV. (Use hc = 1240 eV·nm)',
    NULL,
    NULL,
    'Energy of photon: $E = \frac{hc}{\lambda} = \frac{1240}{400} = 3.1$ eV. Maximum KE = E - W = 3.1 - 2.0 = 1.1 eV',
    4,
    1,
    ARRAY['JEE Main', 'Modern Physics', 'Photoelectric Effect'],
    'demo'
),
-- Question 6: Simple Harmonic Motion (Medium, MCQ)
(
  'waves_oscillations',
    'SHM',
    'mcq',
    'medium',
    'A particle executing SHM has amplitude 10 cm and time period 2 seconds. Find its maximum velocity.',
    '["10π cm/s", "20π cm/s", "5π cm/s", "15π cm/s"]'::jsonb,
    'A',
    'Maximum velocity $v_{max} = A\omega = A \times \frac{2\pi}{T} = 10 \times \frac{2\pi}{2} = 10\pi$ cm/s',
    4,
    1,
    ARRAY['JEE Main', 'SHM', 'Oscillations'],
    'demo'
),
-- Question 7: Thermodynamic Process (Hard, MCQ)
(
  'thermodynamics',
    'Thermodynamic Processes',
    'mcq',
    'hard',
    'In an adiabatic process, if the volume of an ideal gas is halved, by what factor does the pressure increase? (γ = 1.4)',
    '["2.0", "2.6", "2.8", "3.0"]'::jsonb,
    'B',
    'For adiabatic process: $PV^{\gamma} = constant$. If $V_2 = V_1/2$, then $P_2/P_1 = (V_1/V_2)^{\gamma} = 2^{1.4} = 2.64 ≈ 2.6$',
    4,
    1,
    ARRAY['JEE Advanced', 'Thermodynamics', 'Adiabatic Process'],
    'demo'
),
-- Question 8: Electromagnetic Induction (Medium, Numerical)
(
  'electromagnetism',
    'Electromagnetic Induction',
    'numerical',
    'medium',
    'A coil of 100 turns and area 0.1 m² is placed perpendicular to a magnetic field that changes from 0.5 T to 0.1 T in 0.2 seconds. Calculate the induced EMF in volts.',
    NULL,
    NULL,
    'Induced EMF: $E = -N\frac{d\Phi}{dt} = -N \times A \times \frac{dB}{dt} = 100 \times 0.1 \times \frac{0.5-0.1}{0.2} = 20$ V',
    4,
    1,
    ARRAY['JEE Main', 'EMI', 'Faraday''s Law'],
    'demo'
),
-- Question 9: Optics (Easy, MCQ)
(
  'optics',
    'Ray Optics',
    'mcq',
    'easy',
    'A convex lens has a focal length of 20 cm. An object is placed at 30 cm from the lens. Where is the image formed?',
    '["60 cm on opposite side", "40 cm on opposite side", "50 cm on opposite side", "30 cm on opposite side"]'::jsonb,
    'A',
    'Using lens formula: $\frac{1}{f} = \frac{1}{v} - \frac{1}{u}$. Here, $\frac{1}{20} = \frac{1}{v} - \frac{1}{-30}$. Solving: $v = 60$ cm',
    4,
    1,
    ARRAY['JEE Main', 'Optics', 'Lens Formula'],
    'demo'
),
-- Question 10: Rotational Motion (Hard, Numerical)
(
  'mechanics',
    'Rotational Motion',
    'numerical',
    'hard',
    'A solid sphere of mass 2 kg and radius 0.1 m rolls down an inclined plane of height 1.4 m. Find its velocity at the bottom in m/s. (g = 10 m/s²)',
    NULL,
    NULL,
    'Using energy conservation: $mgh = \frac{1}{2}mv^2 + \frac{1}{2}I\omega^2$. For solid sphere: $I = \frac{2}{5}mr^2$. Solving: $v = \sqrt{\frac{10gh}{7}} = \sqrt{\frac{10 \times 10 \times 1.4}{7}} = 4.47$ m/s',
    4,
    1,
  ARRAY['JEE Advanced', 'Rotational Motion', 'Rolling Motion'],
  'demo'
);

-- Update numerical answers for numerical questions (needed separately due to DECIMAL type)
UPDATE questions 
SET numerical_answer = 16, numerical_tolerance = 0.5
WHERE question LIKE '%metal rod of length 50 cm%' AND question_type = 'numerical' AND source = 'demo';

UPDATE questions 
SET numerical_answer = 1.1, numerical_tolerance = 0.1
WHERE question LIKE '%wavelength 400 nm%' AND question_type = 'numerical' AND source = 'demo';

UPDATE questions 
SET numerical_answer = 20, numerical_tolerance = 0.5
WHERE question LIKE '%coil of 100 turns%' AND question_type = 'numerical' AND source = 'demo';

UPDATE questions 
SET numerical_answer = 4.47, numerical_tolerance = 0.1
WHERE question LIKE '%solid sphere of mass 2 kg%' AND question_type = 'numerical' AND source = 'demo';

-- =====================================================
-- SET DEFAULT ADMIN USER
-- =====================================================
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'nixpri@gmail.com';

-- =====================================================
-- VERIFY SEED DATA
-- =====================================================
DO $$
DECLARE
  demo_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO demo_count FROM questions WHERE source = 'demo';
  IF demo_count = 0 THEN
    RAISE NOTICE 'WARNING: No demo questions were inserted. Check for errors above.';
  ELSE
    RAISE NOTICE 'Success: % demo questions inserted.', demo_count;
  END IF;
END $$;

-- =====================================================
-- DONE
-- =====================================================
SELECT 
  'Database schema created successfully!' as message,
  (SELECT COUNT(*) FROM questions WHERE source = 'demo') as demo_questions_count;