-- MockTest AI Complete Database Schema
-- Single file to drop and recreate everything with all fixes

-- =====================================================
-- DROP ALL EXISTING TABLES
-- =====================================================
DROP TABLE IF EXISTS public.test_responses CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.user_previous_year_attempts CASCADE;
DROP TABLE IF EXISTS public.exam_analysis CASCADE;
DROP TABLE IF EXISTS public.question_patterns CASCADE;
DROP TABLE IF EXISTS public.previous_year_questions CASCADE;
DROP TABLE IF EXISTS public.previous_year_exams CASCADE;
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
    source TEXT DEFAULT 'manual' CHECK (source IN ('generated', 'manual', 'demo')),
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
    test_type TEXT NOT NULL CHECK (test_type IN ('mock', 'topic_wise', 'custom', 'daily_practice', 'ai_generated')),
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
    test_type VARCHAR(50) DEFAULT 'standard', -- ai_generated, topic, standard
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
-- PREVIOUS YEAR QUESTIONS TABLES
-- =====================================================

-- Previous year exams metadata
CREATE TABLE IF NOT EXISTS public.previous_year_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name TEXT NOT NULL, -- JEE Main, JEE Advanced, AIEEE
    year INTEGER NOT NULL,
    session TEXT, -- 1, 2, 1A, 1B, Morning, Evening
    paper_code TEXT, -- Paper 1, Paper 2
    exam_date DATE,
    total_questions INTEGER,
    total_marks INTEGER,
    duration_minutes INTEGER DEFAULT 180,
    pdf_file_name TEXT,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    extracted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_name, year, session)
);

-- Previous year questions
CREATE TABLE IF NOT EXISTS public.previous_year_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES previous_year_exams(id) ON DELETE CASCADE,
    
    -- Question details
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN (
        'regular_mcq',      -- Standard MCQ with 4 options
        'numerical',        -- Numerical answer type
        'statement',        -- Statement-1 and Statement-2 type
        'matrix_matching',  -- Column I and Column II matching
        'linked_comprehension', -- Passage based questions
        'assertion_reason'  -- Assertion and Reason type
    )),
    
    -- Subject and topic
    subject TEXT NOT NULL CHECK (subject IN ('Physics', 'Chemistry', 'Mathematics')),
    topic TEXT NOT NULL, -- Mechanics, Optics, Thermodynamics, etc.
    subtopic TEXT, -- More specific topic categorization
    
    -- Options (for MCQ types)
    options JSONB, -- Array of {label, text} objects
    column_ii_options JSONB, -- For matrix matching questions
    
    -- Answers
    correct_answer TEXT, -- Can be single option (A) or pattern (A→p,q; B→r,s)
    numerical_answer DECIMAL, -- For numerical type
    numerical_tolerance DECIMAL DEFAULT 0.01,
    
    -- Additional content
    assertion TEXT, -- For assertion-reason type
    reason TEXT, -- For assertion-reason type
    statement_1 TEXT, -- For statement type
    statement_2 TEXT, -- For statement type
    passage TEXT, -- For linked comprehension
    
    -- Explanation and solution
    explanation TEXT,
    detailed_solution TEXT,
    solution_approach TEXT[], -- Array of approach tags
    
    -- Difficulty and scoring
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    marks INTEGER DEFAULT 4,
    negative_marks INTEGER DEFAULT 1,
    
    -- Diagram information
    has_diagram BOOLEAN DEFAULT FALSE,
    diagram_description TEXT,
    diagram_path TEXT, -- Path to diagram image in storage
    diagram_url TEXT, -- Public URL for diagram
    
    -- Metadata
    page_number INTEGER, -- Page number in original PDF
    sequence_in_exam INTEGER, -- Order in the actual exam
    time_allocated_seconds INTEGER, -- Expected time to solve
    common_mistakes TEXT[], -- Array of common mistakes
    
    -- Stats (will be updated based on user attempts)
    attempt_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    avg_time_taken_seconds INTEGER,
    
    -- Search and indexing
    search_vector tsvector,
    tags TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(exam_id, question_number)
);

-- Question patterns table (for AI analysis)
CREATE TABLE IF NOT EXISTS public.question_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,
    subject TEXT CHECK (subject IN ('Physics', 'Chemistry', 'Mathematics')),
    topic TEXT,
    example_question_ids UUID[], -- Array of question IDs that follow this pattern
    pattern_template TEXT, -- Template for generating similar questions
    key_concepts TEXT[], -- Key concepts tested
    difficulty_range TEXT[], -- Array of difficulty levels this pattern appears in
    frequency_in_exams INTEGER DEFAULT 1, -- How often this pattern appears
    years_appeared INTEGER[], -- Years when this pattern appeared
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam analysis table
CREATE TABLE IF NOT EXISTS public.exam_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES previous_year_exams(id) ON DELETE CASCADE,
    subject TEXT CHECK (subject IN ('Physics', 'Chemistry', 'Mathematics')),
    topic_distribution JSONB, -- {topic: question_count} mapping
    difficulty_distribution JSONB, -- {difficulty: count} mapping
    average_difficulty DECIMAL,
    unique_patterns INTEGER,
    new_question_types TEXT[],
    compared_to_previous_year JSONB, -- Analysis comparing to previous year
    ai_insights TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's previous year attempts
CREATE TABLE IF NOT EXISTS public.user_previous_year_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES previous_year_exams(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_taken_seconds INTEGER,
    
    -- Scores
    total_attempted INTEGER,
    correct_answers INTEGER,
    incorrect_answers INTEGER,
    unattempted INTEGER,
    marks_obtained INTEGER,
    negative_marks INTEGER,
    final_score INTEGER,
    
    -- Percentile (calculated based on all attempts)
    percentile DECIMAL,
    
    -- Subject-wise breakdown
    physics_score INTEGER,
    chemistry_score INTEGER,
    mathematics_score INTEGER,
    
    -- Question-wise responses
    responses JSONB, -- Array of {question_id, answer, time_taken, marked_for_review}
    
    -- Analysis
    strong_topics TEXT[],
    weak_topics TEXT[],
    accuracy_percentage DECIMAL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, exam_id, started_at)
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

-- Indexes for previous year questions
CREATE INDEX IF NOT EXISTS idx_pyq_exam_id ON previous_year_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_pyq_subject ON previous_year_questions(subject);
CREATE INDEX IF NOT EXISTS idx_pyq_topic ON previous_year_questions(topic);
CREATE INDEX IF NOT EXISTS idx_pyq_difficulty ON previous_year_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_pyq_year ON previous_year_questions USING btree ((exam_id));
CREATE INDEX IF NOT EXISTS idx_pyq_search ON previous_year_questions USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_pyq_tags ON previous_year_questions USING gin(tags);

-- Indexes for previous year exams
CREATE INDEX IF NOT EXISTS idx_pye_year ON previous_year_exams(year);
CREATE INDEX IF NOT EXISTS idx_pye_exam_name ON previous_year_exams(exam_name);

-- Indexes for user attempts
CREATE INDEX IF NOT EXISTS idx_upa_user_id ON user_previous_year_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_upa_exam_id ON user_previous_year_attempts(exam_id);

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
ALTER TABLE public.previous_year_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.previous_year_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_previous_year_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_analysis ENABLE ROW LEVEL SECURITY;

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

-- Policies for previous_year_exams (everyone can read)
CREATE POLICY "Previous year exams are viewable by everyone"
    ON previous_year_exams FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert exams"
    ON previous_year_exams FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    ));

CREATE POLICY "Only admins can update exams"
    ON previous_year_exams FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    ));

-- Policies for previous_year_questions (everyone can read)
CREATE POLICY "Previous year questions are viewable by everyone"
    ON previous_year_questions FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage questions"
    ON previous_year_questions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    ));

-- Policies for user attempts (users can see their own)
CREATE POLICY "Users can view their own attempts"
    ON user_previous_year_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
    ON user_previous_year_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
    ON user_previous_year_attempts FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for question patterns (everyone can read)
CREATE POLICY "Question patterns are viewable by everyone"
    ON question_patterns FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage patterns"
    ON question_patterns FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    ));

-- Policies for exam analysis (everyone can read)
CREATE POLICY "Exam analysis is viewable by everyone"
    ON exam_analysis FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage analysis"
    ON exam_analysis FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    ));

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

CREATE TRIGGER update_pye_updated_at BEFORE UPDATE ON previous_year_exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pyq_updated_at BEFORE UPDATE ON previous_year_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update search vector when question is inserted or updated
CREATE OR REPLACE FUNCTION update_question_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.question_text, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.topic, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.explanation, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pyq_search_vector
    BEFORE INSERT OR UPDATE ON previous_year_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_question_search_vector();

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