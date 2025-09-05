-- =====================================================
-- PREVIOUS YEAR QUESTIONS - COMPLETE DATA IMPORT
-- Generated: 2025-09-05T12:25:23.902Z
-- Supabase URL: https://mxdbmkckqpfwobmadbcm.supabase.co
-- =====================================================

-- This SQL contains all exam data with actual Supabase Storage URLs
-- Diagrams have already been uploaded to Supabase Storage

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM previous_year_questions;
-- DELETE FROM previous_year_exams;

-- =====================================================
-- JEE Main 2007 Session 1A
-- =====================================================

INSERT INTO previous_year_exams (
    id, exam_name, year, session, total_questions, 
    pdf_file_name, processing_status, extracted_at
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    'JEE Main',
    2007,
    '1A',
    13,
    '2007_1.pdf',
    'completed',
    NOW()
) ON CONFLICT (exam_name, year, session) DO UPDATE SET 
    total_questions = EXCLUDED.total_questions,
    processing_status = EXCLUDED.processing_status;

INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    1,
    'A resistance of 2 Ω is connected across one gap of a metre-bridge (the length of the wire is 100 cm) and an unknown resistance, greater than 2 Ω, is connected across the other gap. When these resistances are interchanged, the balance point shifts by 20 cm. Neglecting any corrections, the unknown resistance is
(A) 3 Ω
(B) 4 Ω
(C) 5 Ω
(D) 6 Ω',
    'regular_mcq',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"3 Ω"},{"label":"B","text":"4 Ω"},{"label":"C","text":"5 Ω"},{"label":"D","text":"6 Ω"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    2,
    'In an experiment to determine the focal length (f) of a concave mirror by the u-v method, a student places the object pin A on the principal axis at a distance x from the pole. The student looks at the pin and its inverted image from a distance keeping his/her eye in line with PA. When the student shifts his/her eye towards left, the image appears to the right of the object pin. Then,
(A) x < f
(B) f < x < 2f
(C) x = 2f
(D) x > 2f',
    'regular_mcq',
    'Physics',
    'Optics',
    '[{"label":"A","text":"x < f"},{"label":"B","text":"f < x < 2f"},{"label":"C","text":"x = 2f"},{"label":"D","text":"x > 2f"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    3,
    'Two particles of mass m each are tied at the ends of a light string of length 2a. The whole system is kept on a frictionless horizontal surface with the string held tight so that each mass is at a distance ''a'' from the center P (as shown in the figure). Now, the mid-point of the string is pulled vertically upwards with a small but constant force F. As a result, the particles move towards each other on the surface. The magnitude of acceleration, when the separation between them becomes 2x, is
(A) F / (2m√(a²-x²))
(B) Fx / (2m√(a²-x²))
(C) Fx / (2m a)
(D) F / (2m x)',
    'regular_mcq',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"F / (2m√(a²-x²))"},{"label":"B","text":"Fx / (2m√(a²-x²))"},{"label":"C","text":"Fx / (2m a)"},{"label":"D","text":"F / (2m x)"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'Two masses ''m'' connected by a string of length 2a, with a point P at the center. A force F is applied vertically upwards at P. The masses are on a horizontal surface.',
    'previous-year/2007_JEE_Main_1A_Physics_q3_p1.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2007_JEE_Main_1A_Physics_q3_p1.png',
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    4,
    'A long, hollow conducting cylinder is kept coaxially inside another long, hollow conducting cylinder of larger radius. The both the cylinders are initially electrically neutral.
(A) A potential difference appears between the two cylinders when a charge density is given to the inner cylinder
(B) A potential difference appears between the two cylinders when a charge density is given to the outer cylinder
(C) No potential difference appears between the two cylinders when a uniform line charge is kept along the axis of the cylinders
(D) No potential difference appears between the two cylinders when same charge density is given to both the cylinders',
    'regular_mcq',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"A potential difference appears between the two cylinders when a charge density is given to the inner cylinder"},{"label":"B","text":"A potential difference appears between the two cylinders when a charge density is given to the outer cylinder"},{"label":"C","text":"No potential difference appears between the two cylinders when a uniform line charge is kept along the axis of the cylinders"},{"label":"D","text":"No potential difference appears between the two cylinders when same charge density is given to both the cylinders"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    2
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    5,
    'Consider a neutral conducting sphere. A positive point charge is placed outside the sphere. The net charge on the sphere is then,
(A) negative and distributed uniformly over the surface of the sphere
(B) negative and appears only at the point on the sphere closest to the point charge
(C) negative and distributed non-uniformly over the entire surface of the sphere
(D) zero',
    'regular_mcq',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"negative and distributed uniformly over the surface of the sphere"},{"label":"B","text":"negative and appears only at the point on the sphere closest to the point charge"},{"label":"C","text":"negative and distributed non-uniformly over the entire surface of the sphere"},{"label":"D","text":"zero"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    2
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    6,
    'A circuit is connected as shown in the figure with the switch S open. When the switch is closed, the total amount of charge that flows from Y to X is
(A) 0
(B) 54 μC
(C) 27 μC
(D) 81 μC',
    'regular_mcq',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"0"},{"label":"B","text":"54 μC"},{"label":"C","text":"27 μC"},{"label":"D","text":"81 μC"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A circuit diagram with a 9V battery, a switch S, two capacitors (3 μF and 6 μF), and two resistors (3 Ω and 6 Ω) connected in a bridge-like configuration with points X and Y.',
    'previous-year/2007_JEE_Main_1A_Physics_q6_p2.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2007_JEE_Main_1A_Physics_q6_p2.png',
    2
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    7,
    'A ray of light traveling in water is incident on its surface open to air. The angle of incidence is θ, which is less than the critical angle. Then there will be
(A) only a refracted ray and no reflected ray
(B) only a reflected ray and no refracted ray
(C) a reflected ray and a refracted ray and the angle between them would be less than 180°-2θ
(D) a reflected ray and a refracted ray and the angle between them would be greater than 180°-2θ',
    'regular_mcq',
    'Physics',
    'Optics',
    '[{"label":"A","text":"only a refracted ray and no reflected ray"},{"label":"B","text":"only a reflected ray and no refracted ray"},{"label":"C","text":"a reflected ray and a refracted ray and the angle between them would be less than 180°-2θ"},{"label":"D","text":"a reflected ray and a refracted ray and the angle between them would be greater than 180°-2θ"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    3
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    8,
    'In the options given below, let E denote the rest mass energy of a nucleus and n a neutron. The correct option is
(A) E(236/92)U > E(137/53)I + E(97/39)Y + 2E(n)
(B) E(236/92)U < E(137/53)I + E(97/39)Y + 2E(n)
(C) E(236/92)U < E(140/56)Ba + E(94/36)Kr + 2E(n)
(D) E(236/92)U = E(140/56)Ba + E(94/36)Kr + 2E(n)',
    'regular_mcq',
    'Physics',
    'Modern Physics',
    '[{"label":"A","text":"E(236/92)U > E(137/53)I + E(97/39)Y + 2E(n)"},{"label":"B","text":"E(236/92)U < E(137/53)I + E(97/39)Y + 2E(n)"},{"label":"C","text":"E(236/92)U < E(140/56)Ba + E(94/36)Kr + 2E(n)"},{"label":"D","text":"E(236/92)U = E(140/56)Ba + E(94/36)Kr + 2E(n)"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    3
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    9,
    'The largest wavelength in the ultraviolet region of the hydrogen spectrum is 122 nm. The smallest wavelength in the infrared region of the hydrogen spectrum (to the nearest integer) is
(A) 802 nm
(B) 823 nm
(C) 1882 nm
(D) 1648 nm',
    'regular_mcq',
    'Physics',
    'Modern Physics',
    '[{"label":"A","text":"802 nm"},{"label":"B","text":"823 nm"},{"label":"C","text":"1882 nm"},{"label":"D","text":"1648 nm"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    3
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    10,
    'STATEMENT-1: A block of mass m starts moving on a rough horizontal surface with a velocity v. It stops due to friction between the block and the surface after moving through a certain distance. The surface is now tilted to an angle of 30° with the horizontal and the same block is made to go up on the surface with the same initial velocity v. The decrease in the mechanical energy in the second situation is smaller than that in the first situation.
because
STATEMENT-2: The coefficient of friction between the block and the surface decreases with the increase in the angle of inclination.
(A) Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1
(B) Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1
(C) Statement-1 is True, Statement-2 is False
(D) Statement-1 is False, Statement-2 is True',
    'statement',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    4
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    11,
    'STATEMENT-1: In an elastic collision between two bodies, the relative speed of the bodies after collision is equal to the relative speed before the collision.
because
STATEMENT-2: In an elastic collision, the linear momentum of the system is conserved.
(A) Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1
(B) Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1
(C) Statement-1 is True, Statement-2 is False
(D) Statement-1 is False, Statement-2 is True',
    'statement',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    4
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    21,
    'Column I gives certain situations in which a straight metallic wire of resistance R is used and Column II gives some resulting effects. Match the statements in Column I with the statements in Column II and indicate your answer by darkening appropriate bubbles in the 4 × 4 matrix given in the ORS.

Column I
(A) A charged capacitor is connected to the ends of the wire
(B) The wire is moved perpendicular to its length with a constant velocity in a uniform magnetic field perpendicular to the plane of motion
(C) The wire is placed in a constant electric field that has a direction along the length of the wire
(D) A battery of constant emf is connected to the ends of the wire

Column II
(p) A constant current flows through the wire
(q) Thermal energy is generated in the wire
(r) A constant potential difference develops between the ends of the wire
(s) Charges of constant magnitude appear at the ends of the wire',
    'matrix_matching',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"A charged capacitor is connected to the ends of the wire"},{"label":"B","text":"The wire is moved perpendicular to its length with a constant velocity in a uniform magnetic field perpendicular to the plane of motion"},{"label":"C","text":"The wire is placed in a constant electric field that has a direction along the length of the wire"},{"label":"D","text":"A battery of constant emf is connected to the ends of the wire"}]',
    '[{"label":"p","text":"A constant current flows through the wire"},{"label":"q","text":"Thermal energy is generated in the wire"},{"label":"r","text":"A constant potential difference develops between the ends of the wire"},{"label":"s","text":"Charges of constant magnitude appear at the ends of the wire"}]',
    NULL,
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    9
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-1A'),
    22,
    'Some laws / processes are given in Column I. Match these with the physical phenomena given in Column II and indicate your answer by darkening appropriate bubbles in the 4 × 4 matrix given in the ORS.

Column I
(A) Transition between two atomic energy levels
(B) Electron emission from a material
(C) Mosley''s law
(D) Change of photon energy into kinetic energy of electrons

Column II
(p) Characteristic X-rays
(q) Photoelectric effect
(r) Hydrogen spectrum
(s) β-decay',
    'matrix_matching',
    'Physics',
    'Modern Physics',
    '[{"label":"A","text":"Transition between two atomic energy levels"},{"label":"B","text":"Electron emission from a material"},{"label":"C","text":"Mosley''s law"},{"label":"D","text":"Change of photon energy into kinetic energy of electrons"}]',
    '[{"label":"p","text":"Characteristic X-rays"},{"label":"q","text":"Photoelectric effect"},{"label":"r","text":"Hydrogen spectrum"},{"label":"s","text":"β-decay"}]',
    NULL,
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    10
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
-- =====================================================
-- JEE Main 2007 Session 2
-- =====================================================

INSERT INTO previous_year_exams (
    id, exam_name, year, session, total_questions, 
    pdf_file_name, processing_status, extracted_at
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    'JEE Main',
    2007,
    '2',
    24,
    '2007_2.pdf',
    'completed',
    NOW()
) ON CONFLICT (exam_name, year, session) DO UPDATE SET 
    total_questions = EXCLUDED.total_questions,
    processing_status = EXCLUDED.processing_status;

INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    1,
    'In the experiment to determine the speed of sound using a resonance column,
(A) prongs of the tuning fork are kept in a vertical plane
(B) prongs of the tuning fork are kept in a horizontal plane
(C) in one of the two resonances observed, the length of the resonating air column is
close to the wavelength of sound in air
(D) in one of the two resonances observed, the length of the resonating air column is
close to half of the wavelength of sound in air',
    'regular_mcq',
    'Physics',
    'Waves & Sound',
    '[{"label":"A","text":"prongs of the tuning fork are kept in a vertical plane"},{"label":"B","text":"prongs of the tuning fork are kept in a horizontal plane"},{"label":"C","text":"in one of the two resonances observed, the length of the resonating air column is\nclose to the wavelength of sound in air"},{"label":"D","text":"in one of the two resonances observed, the length of the resonating air column is\nclose to half of the wavelength of sound in air"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    2,
    'A student performs an experiment to determine the Young''s modulus of a wire,
exactly 2 m long, by Searle''s method. In a particular reading, the student measures
the extension in the length of the wire to be 0.8 mm with an uncertainty of
±0.05 mm at a load of exactly 1.0 kg. The student also measures the diameter of the
wire to be 0.4 mm with an uncertainty of ±0.01 mm. Take g = 9.8 m/s² (exact). The
Young''s modulus obtained from the reading is
(A) (2.0 ± 0.3) × 10¹¹ N/m²
(B) (2.0 ± 0.2) × 10¹¹ N/m²
(C) (2.0 ± 0.1) × 10¹¹ N/m²
(D) (2.0 ± 0.05) × 10¹¹ N/m²',
    'regular_mcq',
    'Physics',
    'Mechanics (Elasticity, Error Analysis)',
    '[{"label":"A","text":"(2.0 ± 0.3) × 10¹¹ N/m²"},{"label":"B","text":"(2.0 ± 0.2) × 10¹¹ N/m²"},{"label":"C","text":"(2.0 ± 0.1) × 10¹¹ N/m²"},{"label":"D","text":"(2.0 ± 0.05) × 10¹¹ N/m²"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    3,
    'A particle moves in the X-Y plane under the influence of a force such that its linear
momentum is p(t) = A[î cos(kt) - ĵ sin(kt)], where A and k are constants. The
angle between the force and the momentum is
(A) 0°
(B) 30°
(C) 45°
(D) 90°',
    'regular_mcq',
    'Physics',
    'Mechanics (Dynamics, Kinematics)',
    '[{"label":"A","text":"0°"},{"label":"B","text":"30°"},{"label":"C","text":"45°"},{"label":"D","text":"90°"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    4,
    'A small object of uniform density rolls up a curved surface with an initial
velocity v. It reaches up to a maximum height of 3v²/4g with respect to the initial
position. The object is
(A) ring
(B) solid sphere
(C) hollow sphere
(D) disc',
    'regular_mcq',
    'Physics',
    'Mechanics (Rotational Motion, Conservation of Energy)',
    '[{"label":"A","text":"ring"},{"label":"B","text":"solid sphere"},{"label":"C","text":"hollow sphere"},{"label":"D","text":"disc"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A curved surface with an object rolling upwards, showing initial velocity ''v'' and the path.',
    'previous-year/2007_JEE_Main_2_Physics_q4_p2.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2007_JEE_Main_2_Physics_q4_p2.png',
    2
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    5,
    'Water is filled up to a height h in a beaker of radius R as
shown in the figure. The density of water is ρ, the surface
tension of water is T and the atmospheric pressure is P₀.
Consider a vertical section ABCD of the water column
through a diameter of the beaker. The force on water on one
side of this section by water on the other side of this section
has magnitude
(A) |2P₀Rh + πR² ρgh - 2RT|
(B) |2P₀Rh + R ρgh² - 2RT|
(C) |P₀ πR² + R ρgh² - 2RT|
(D) |P₀ πR² + R ρgh² + 2RT|',
    'regular_mcq',
    'Physics',
    'Fluid Mechanics, Surface Tension',
    '[{"label":"A","text":"|2P₀Rh + πR² ρgh - 2RT|"},{"label":"B","text":"|2P₀Rh + R ρgh² - 2RT|"},{"label":"C","text":"|P₀ πR² + R ρgh² - 2RT|"},{"label":"D","text":"|P₀ πR² + R ρgh² + 2RT|"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A cylindrical beaker filled with water to height ''h'' and radius ''R'', with a vertical cross-section ABCD indicated.',
    'previous-year/2007_JEE_Main_2_Physics_q5_p2.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2007_JEE_Main_2_Physics_q5_p2.png',
    2
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    6,
    'A spherical portion has been removed from a solid sphere having a charge distributed
uniformly in its volume as shown in the figure. The electric field inside the emptied
space is
(A) zero everywhere
(B) non-zero and uniform
(C) non-uniform
(D) zero only at its center',
    'regular_mcq',
    'Physics',
    'Electricity & Magnetism (Electrostatics)',
    '[{"label":"A","text":"zero everywhere"},{"label":"B","text":"non-zero and uniform"},{"label":"C","text":"non-uniform"},{"label":"D","text":"zero only at its center"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A large sphere with a smaller spherical cavity removed from its interior, representing a charged solid sphere with a removed portion.',
    'previous-year/2007_JEE_Main_2_Physics_q6_p3.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2007_JEE_Main_2_Physics_q6_p3.png',
    3
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    7,
    'Positive and negative point charges of equal magnitude are kept at (0, 0, a/2) and
(0, 0, -a/2), respectively. The work done by the electric field when another positive
point charge is moved from (-a, 0, 0) to (0, a, 0) is
(A) positive
(B) negative
(C) zero
(D) depends on the path connecting the initial and final positions',
    'regular_mcq',
    'Physics',
    'Electricity & Magnetism (Electrostatics, Electric Potential)',
    '[{"label":"A","text":"positive"},{"label":"B","text":"negative"},{"label":"C","text":"zero"},{"label":"D","text":"depends on the path connecting the initial and final positions"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    3
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    8,
    'A magnetic field B = B₀ĵ exists in the region
0 < x < 2a and B = -B₀ĵ, in the region
2a < x < 3a, where B₀ is a positive constant.
A positive point charge moving with a velocity
v = v₀î, where v₀ is a positive constant,
enters the magnetic field at x = a. The
trajectory of the charge in this region can be
like,
(A) [diagram]
(B) [diagram]
(C) [diagram]
(D) [diagram]',
    'regular_mcq',
    'Physics',
    'Electricity & Magnetism (Magnetism, Lorentz Force)',
    '[{"label":"A","text":"[diagram]"},{"label":"B","text":"[diagram]"},{"label":"C","text":"[diagram]"},{"label":"D","text":"[diagram]"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A graph showing the magnetic field regions along the x-axis and four different possible trajectories of a charged particle entering the field.',
    'previous-year/2007_JEE_Main_2_Physics_q8_p4.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2007_JEE_Main_2_Physics_q8_p4.png',
    4
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    9,
    'Electrons with de-Broglie wavelength λ fall on the target in an X-ray tube. The
cut-off wavelength of the emitted X-rays is
(A) λ₀ = 2mc²/h
(B) λ₀ = 2h/mc
(C) λ₀ = 2m²c²λ²/h²
(D) λ₀ = λ',
    'regular_mcq',
    'Physics',
    'Modern Physics (Dual Nature of Matter, X-rays)',
    '[{"label":"A","text":"λ₀ = 2mc²/h"},{"label":"B","text":"λ₀ = 2h/mc"},{"label":"C","text":"λ₀ = 2m²c²λ²/h²"},{"label":"D","text":"λ₀ = λ"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    4
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    10,
    'STATEMENT-1
If there is no external torque on a body about its center of mass, then the velocity of the center of mass remains constant.
because
STATEMENT-2
The linear momentum of an isolated system remains constant.',
    'statement',
    'Physics',
    'Rotational Dynamics, Conservation of Momentum',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    5
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    11,
    'STATEMENT-1
A cloth covers a table. Some dishes are kept on it. The cloth can be pulled out without dislodging the dishes from the table.
because
STATEMENT-2
For every action there is an equal and opposite reaction.',
    'statement',
    'Physics',
    'Newton''s Laws of Motion, Inertia',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    5
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    12,
    'STATEMENT-1
A vertical iron rod has a coil of wire wound over it at the bottom end. An alternating current flows in the coil. The rod goes through a conducting ring as shown in the figure. The ring can float at a certain height above the coil.
because
STATEMENT-2
In the above situation, a current is induced in the ring which interacts with the horizontal component of the magnetic field to produce an upward direction.',
    'statement',
    'Physics',
    'Electromagnetic Induction, Magnetic Forces',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A vertical iron rod with a coil at the bottom, and a conducting ring floating above it.',
    'previous-year/2007_JEE_Main_2_Physics_q12_p6.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2007_JEE_Main_2_Physics_q12_p6.png',
    6
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    13,
    'STATEMENT-1
The total translational kinetic energy of all the molecules of a given mass of an ideal gas is 1.5 times the product of its pressure and its volume.
because
STATEMENT-2
The molecules of a gas collide with each other and the velocities of the molecules change due to the collision.',
    'statement',
    'Physics',
    'Kinetic Theory of Gases, Thermodynamics',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    6
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    14,
    'The speed of sound of the whistle is
(A) 340 m/s for passengers in A and 310 m/s for passengers in B
(B) 360 m/s for passengers in A and 310 m/s for passengers in B
(C) 310 m/s for passengers in A and 360 m/s for passengers in B
(D) 340 m/s for passengers in both the trains',
    'regular_mcq',
    'Physics',
    'Sound, Doppler Effect',
    '[{"label":"A","text":"340 m/s for passengers in A and 310 m/s for passengers in B"},{"label":"B","text":"360 m/s for passengers in A and 310 m/s for passengers in B"},{"label":"C","text":"310 m/s for passengers in A and 360 m/s for passengers in B"},{"label":"D","text":"340 m/s for passengers in both the trains"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    7
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    15,
    'The distribution of the sound intensity of the whistle as observed by the passengers in train A is best represented by',
    'regular_mcq',
    'Physics',
    'Sound, Doppler Effect, Wave Characteristics',
    '[{"label":"A","text":"Graph A (Intensity vs. Frequency)"},{"label":"B","text":"Graph B (Intensity vs. Frequency)"},{"label":"C","text":"Graph C (Intensity vs. Frequency)"},{"label":"D","text":"Graph D (Intensity vs. Frequency)"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'Four graphs showing Intensity vs. Frequency distributions.',
    'previous-year/2007_JEE_Main_2_Physics_q15_p7.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2007_JEE_Main_2_Physics_q15_p7.png',
    7
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    16,
    'The spread of frequency as observed by the passengers in train B is
(A) 310 Hz
(B) 330 Hz
(C) 350 Hz
(D) 290 Hz',
    'regular_mcq',
    'Physics',
    'Sound, Doppler Effect',
    '[{"label":"A","text":"310 Hz"},{"label":"B","text":"330 Hz"},{"label":"C","text":"350 Hz"},{"label":"D","text":"290 Hz"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    7
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    17,
    'Light travels as a
(A) parallel beam in each medium
(B) convergent beam in each medium
(C) divergent beam in each medium
(D) divergent beam in one medium and convergent beam in the other medium',
    'regular_mcq',
    'Physics',
    'Optics, Nature of Light',
    '[{"label":"A","text":"parallel beam in each medium"},{"label":"B","text":"convergent beam in each medium"},{"label":"C","text":"divergent beam in each medium"},{"label":"D","text":"divergent beam in one medium and convergent beam in the other medium"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    7
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    18,
    'The phases of the light wave at c, d, e and f are φc, φd, φe and φf respectively. It is given that φc ≠ φf.
It is given that φe ≠ φf.
(A) φc cannot be equal to φd
(B) φd can be equal to φe
(C) (φd – φf) is equal to (φe – φc)
(D) (φd – φe) is not equal to (φf – φc)',
    'regular_mcq',
    'Physics',
    'Wave Optics, Phase',
    '[{"label":"A","text":"φc cannot be equal to φd"},{"label":"B","text":"φd can be equal to φe"},{"label":"C","text":"(φd – φf) is equal to (φe – φc)"},{"label":"D","text":"(φd – φe) is not equal to (φf – φc)"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    8
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    19,
    'Speed of light is
(A) the same in medium-1 and medium-2
(B) larger in medium-1 than in medium-2
(C) larger in medium-2 than in medium-1
(D) different at b and d',
    'regular_mcq',
    'Physics',
    'Optics, Refraction',
    '[{"label":"A","text":"the same in medium-1 and medium-2"},{"label":"B","text":"larger in medium-1 than in medium-2"},{"label":"C","text":"larger in medium-2 than in medium-1"},{"label":"D","text":"different at b and d"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    8
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    20,
    'Column I describes some situations in which a small object moves. Column II describes some characteristics of these motions. Match the situations in Column I with the characteristics in Column II and indicate your answer by darkening appropriate bubbles in the 4 × 4 matrix given in the ORS.',
    'matrix_matching',
    'Physics',
    'Mechanics (Kinematics, SHM, Gravitation)',
    '[{"label":"A","text":"The object moves on the x-axis under a conservative force in such a way that its \"speed\" and \"position\" satisfy v = c₁√(c₂ - x²), where c₁ and c₂ are positive constants."},{"label":"B","text":"The object moves on the x-axis in such a way that its velocity and its displacement from the origin satisfy v = -kx, where k is a positive constant."},{"label":"C","text":"The object is attached to one end of a mass-less spring of a given spring constant. The other end of the spring is attached to the ceiling of an elevator. Initially everything is at rest. The elevator starts going upwards with a constant acceleration a. The motion of the object is observed from the elevator during the period it maintains this acceleration."},{"label":"D","text":"The object is projected from the earth''s surface vertically upwards with a speed 2GMₑ/Rₑ where Mₑ is the mass of the earth and Rₑ is the radius of the earth. Neglect forces from objects other than the earth."}]',
    '[{"label":"p","text":"The object executes a simple harmonic motion."},{"label":"q","text":"The object does not change its direction."},{"label":"r","text":"The kinetic energy of the object keeps on decreasing."},{"label":"s","text":"The object can change its direction only once."}]',
    'Match the columns',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    9
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    21,
    'Two wires each carrying a steady current I are shown in four configurations in Column I. Some of the resulting effects are described in Column II. Match the statements in Column I with the statements in Column II and indicate your answer by darkening appropriate bubbles in the 4 × 4 matrix given in the ORS.',
    'matrix_matching',
    'Physics',
    'Electricity & Magnetism (Magnetic Fields)',
    '[{"label":"A","text":"Point P is situated midway between the wires."},{"label":"B","text":"Point P is situated at the mid-point of the line joining the centers of the circular wires, which have same radii."},{"label":"C","text":"Point P is situated at the mid-point of the line joining the centers of the circular wires, which have same radii."},{"label":"D","text":"Point P is situated at the common center of the wires."}]',
    '[{"label":"p","text":"The magnetic fields (B) at P due to the currents in the wires are in the same direction."},{"label":"q","text":"The magnetic fields (B) at P due to the currents in the wires are in opposite directions."},{"label":"r","text":"There is no magnetic field at P."},{"label":"s","text":"The wires repel each other."}]',
    'Match the columns',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'Four configurations of current-carrying wires with a point P indicated.',
    NULL,
    NULL,
    10
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    22,
    'Column I gives some devices and Column II gives some processes on which the functioning of these devices depend. Match the devices in Column I with the processes in Column II and indicate your answer by darkening appropriate bubbles in the 4 × 4 matrix given in the ORS.',
    'matrix_matching',
    'Physics',
    'Thermodynamics, General Physics',
    '[{"label":"A","text":"Bimetallic strip"},{"label":"B","text":"Steam engine"},{"label":"C","text":"Incandescent lamp"},{"label":"D","text":"Electric fuse"}]',
    '[{"label":"p","text":"Radiation from a hot body"},{"label":"q","text":"Energy conversion"},{"label":"r","text":"Melting"},{"label":"s","text":"Thermal expansion of solids"}]',
    'Match the columns',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    10
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    29,
    'A positron is emitted from ²³₁₁Na. The ratio of the atomic mass and atomic number of the resulting nuclide is
(A) 22/10
(B) 22/11
(C) 23/10
(D) 23/12',
    'regular_mcq',
    'Physics',
    'Nuclear Physics',
    '[{"label":"A","text":"22/10"},{"label":"B","text":"22/11"},{"label":"C","text":"23/10"},{"label":"D","text":"23/12"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    13
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2007-2'),
    35,
    'STATEMENT-1: Band gap in germanium is small. because STATEMENT-2: The energy spread of each germanium atomic energy level is infinitesimally small.',
    'statement',
    'Physics',
    'Modern Physics',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    NULL,
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    15
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
-- =====================================================
-- JEE Main 2008 Session 11
-- =====================================================

INSERT INTO previous_year_exams (
    id, exam_name, year, session, total_questions, 
    pdf_file_name, processing_status, extracted_at
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    'JEE Main',
    2008,
    '11',
    23,
    '2007_1.pdf',
    'completed',
    NOW()
) ON CONFLICT (exam_name, year, session) DO UPDATE SET 
    total_questions = EXCLUDED.total_questions,
    processing_status = EXCLUDED.processing_status;

INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    1,
    'A resistance of 2 Ω is connected across one gap of a metre-bridge (the length of the wire is 100 cm) and an unknown resistance, greater than 2 Ω, is connected across the other gap. When these resistances are interchanged, the balance point shifts by 20 cm. Neglecting any corrections, the unknown resistance is
(A) 3 Ω
(B) 4 Ω
(C) 5 Ω
(D) 6 Ω',
    'regular_mcq',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"3 Ω"},{"label":"B","text":"4 Ω"},{"label":"C","text":"5 Ω"},{"label":"D","text":"6 Ω"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    2,
    'In an experiment to determine the focal length (f) of a concave mirror by the u-v method, a student places the object pin A on the principal axis at a distance x from the pole. The student looks at the pin and its inverted image from a distance keeping his/her eye in line with PA. When the student shifts his/her eye towards left, the image appears to the right of the object pin. Then,
(A) x < f
(B) f < x < 2f
(C) x = 2f
(D) x > 2f',
    'regular_mcq',
    'Physics',
    'Optics',
    '[{"label":"A","text":"x < f"},{"label":"B","text":"f < x < 2f"},{"label":"C","text":"x = 2f"},{"label":"D","text":"x > 2f"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    3,
    'Two particles of mass m each are tied at the ends of a light string of length 2a. The whole system is kept on a frictionless horizontal surface with the string held tight so that each mass is at a distance ''a'' from the center P (as shown in the figure). Now, the mid-point of the string is pulled vertically upwards with a small but constant force F. As a result, the particles move towards each other on the surface. The magnitude of acceleration, when the separation between them becomes 2x, is
(A) F / (2m√(a²-x²))
(B) F / (2m * (x/√(a²-x²)))
(C) Fx / (2m√(a²-x²))
(D) F√(a²-x²) / (2mx)',
    'regular_mcq',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"F / (2m√(a²-x²))"},{"label":"B","text":"F / (2m * (x/√(a²-x²)))"},{"label":"C","text":"Fx / (2m√(a²-x²))"},{"label":"D","text":"F√(a²-x²) / (2mx)"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A horizontal line with point P in the middle. Two masses ''m'' are at distance ''a'' from P on either side. A vertical arrow labeled F points upwards from P.',
    'previous-year/2008_JEE_Main_11_Physics_q3_p1.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_11_Physics_q3_p1.png',
    1
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    4,
    'A long, hollow conducting cylinder is kept coaxially inside another long, hollow conducting cylinder of larger radius. Both the cylinders are initially electrically neutral.
(A) A potential difference appears between the two cylinders when a charge density is given to the inner cylinder
(B) A potential difference appears between the two cylinders when a charge density is given to the outer cylinder
(C) No potential difference appears between the two cylinders when a uniform line charge is kept along the axis of the cylinders
(D) No potential difference appears between the two cylinders when same charge density is given to both the cylinders',
    'regular_mcq',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"A potential difference appears between the two cylinders when a charge density is given to the inner cylinder"},{"label":"B","text":"A potential difference appears between the two cylinders when a charge density is given to the outer cylinder"},{"label":"C","text":"No potential difference appears between the two cylinders when a uniform line charge is kept along the axis of the cylinders"},{"label":"D","text":"No potential difference appears between the two cylinders when same charge density is given to both the cylinders"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    2
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    5,
    'Consider a neutral conducting sphere. A positive point charge is placed outside the sphere. The net charge on the sphere is then,
(A) negative and distributed uniformly over the surface of the sphere
(B) negative and appears only at the point on the sphere closest to the point charge
(C) negative and distributed non-uniformly over the entire surface of the sphere
(D) zero',
    'regular_mcq',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"negative and distributed uniformly over the surface of the sphere"},{"label":"B","text":"negative and appears only at the point on the sphere closest to the point charge"},{"label":"C","text":"negative and distributed non-uniformly over the entire surface of the sphere"},{"label":"D","text":"zero"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    2
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    6,
    'A circuit is connected as shown in the figure with the switch S open. When the switch is closed, the total amount of charge that flows from Y to X is
(A) 0
(B) 54 μC
(C) 27 μC
(D) 81 μC',
    'regular_mcq',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"0"},{"label":"B","text":"54 μC"},{"label":"C","text":"27 μC"},{"label":"D","text":"81 μC"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A circuit diagram with a 9V battery, two resistors (3 Ω and 6 Ω), two capacitors (3 μF and 6 μF), and a switch S. Points X and Y are marked.',
    'previous-year/2008_JEE_Main_11_Physics_q6_p2.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_11_Physics_q6_p2.png',
    2
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    7,
    'A ray of light traveling in water is incident on its surface open to air. The angle of incidence is θ, which is less than the critical angle. Then there will be
(A) only a refracted ray and no reflected ray
(B) only a reflected ray and no refracted ray
(C) a reflected ray and a refracted ray and the angle between them would be less than 180°-2θ
(D) a reflected ray and a refracted ray and the angle between them would be greater than 180°-2θ',
    'regular_mcq',
    'Physics',
    'Optics',
    '[{"label":"A","text":"only a refracted ray and no reflected ray"},{"label":"B","text":"only a reflected ray and no refracted ray"},{"label":"C","text":"a reflected ray and a refracted ray and the angle between them would be less than 180°-2θ"},{"label":"D","text":"a reflected ray and a refracted ray and the angle between them would be greater than 180°-2θ"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    3
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    8,
    'In the options given below, let E denote the rest mass energy of a nucleus and n a neutron. The correct option is
(A) E(U-236) > E(Y-137) + E(Y-97) + 2E(n)
(B) E(U-236) < E(Y-137) + E(Y-97) + 2E(n)
(C) E(U-236) < E(Ba-140) + E(Kr-94) + 2E(n)
(D) E(U-236) = E(Ba-140) + E(Kr-94) + 2E(n)',
    'regular_mcq',
    'Physics',
    'Modern Physics',
    '[{"label":"A","text":"E(U-236) > E(Y-137) + E(Y-97) + 2E(n)"},{"label":"B","text":"E(U-236) < E(Y-137) + E(Y-97) + 2E(n)"},{"label":"C","text":"E(U-236) < E(Ba-140) + E(Kr-94) + 2E(n)"},{"label":"D","text":"E(U-236) = E(Ba-140) + E(Kr-94) + 2E(n)"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    3
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    9,
    'The largest wavelength in the ultraviolet region of the hydrogen spectrum is 122 nm. The smallest wavelength in the infrared region of the hydrogen spectrum (to the nearest integer) is
(A) 802 nm
(B) 823 nm
(C) 1882 nm
(D) 1648 nm',
    'regular_mcq',
    'Physics',
    'Modern Physics',
    '[{"label":"A","text":"802 nm"},{"label":"B","text":"823 nm"},{"label":"C","text":"1882 nm"},{"label":"D","text":"1648 nm"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    3
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    10,
    'STATEMENT-1: A block of mass m starts moving on a rough horizontal surface with a velocity v. It stops due to friction between the block and the surface after moving through a certain distance. The surface is now tilted to an angle of 30° with the horizontal and the same block is made to go up on the surface with the same initial velocity v. The decrease in the mechanical energy in the second situation is smaller than that in the first situation.
because
STATEMENT-2: The coefficient of friction between the block and the surface decreases with the increase in the angle of inclination.',
    'statement',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    4
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    11,
    'STATEMENT-1: In an elastic collision between two bodies, the relative speed of the bodies after collision is equal to the relative speed of the bodies before the collision.
because
STATEMENT-2: In an elastic collision, the linear momentum of the system is conserved.',
    'statement',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    4
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    12,
    'STATEMENT-1
The formula connecting u, v and f for a spherical mirror is valid only for mirrors whose sizes are very small compared to their radii of curvature.
because
STATEMENT-2
Laws of reflection are strictly valid for plane surfaces, but not for large spherical surfaces.',
    'statement',
    'Physics',
    'Optics (Reflection, Mirrors)',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    5
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    13,
    'STATEMENT-1
If the accelerating potential in an X-ray tube is increased, the wavelengths of the characteristic X-rays do not change.
because
STATEMENT-2
When an electron beam strikes the target in an X-ray tube, part of the kinetic energy is converted into X-ray energy.',
    'statement',
    'Physics',
    'Modern Physics (X-rays)',
    '[{"label":"A","text":"Statement-1 is True, Statement-2 is True; Statement-2 is a correct explanation for Statement-1"},{"label":"B","text":"Statement-1 is True, Statement-2 is True; Statement-2 is NOT a correct explanation for Statement-1"},{"label":"C","text":"Statement-1 is True, Statement-2 is False"},{"label":"D","text":"Statement-1 is False, Statement-2 is True"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    5
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    14,
    'The ratio x₁/x₂ is',
    'regular_mcq',
    'Physics',
    'Kinematics (Ratio)',
    '[{"label":"A","text":"2"},{"label":"B","text":"1/2"},{"label":"C","text":"√2"},{"label":"D","text":"1/√2"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    6
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    15,
    'When disc B is brought in contact with disc A, they acquire a common angular velocity in time t. The average frictional torque on one disc by the other during this period is',
    'regular_mcq',
    'Physics',
    'Mechanics (Rotational Motion, Torque, Angular Momentum)',
    '[{"label":"A","text":"3Iω/3t"},{"label":"B","text":"9Iω/2t"},{"label":"C","text":"Iω/4t"},{"label":"D","text":"3Iω/2t"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    6
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    16,
    'The loss of kinetic energy during the above process is',
    'regular_mcq',
    'Physics',
    'Mechanics (Rotational Kinetic Energy, Energy Conservation)',
    '[{"label":"A","text":"Iω²/2"},{"label":"B","text":"Iω²/3"},{"label":"C","text":"Iω²/4"},{"label":"D","text":"Iω²/6"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    6
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    17,
    'The piston is now pulled out slowly and held at a distance 2L from the top. The pressure in the cylinder between its top and the piston will then be',
    'regular_mcq',
    'Physics',
    'Fluid Mechanics (Pressure, Equilibrium)',
    '[{"label":"A","text":"P₀"},{"label":"B","text":"P₀/2"},{"label":"C","text":"P₀/2 + Mg/πR²"},{"label":"D","text":"P₀/2 - Mg/πR²"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    6
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    18,
    'While the piston is at a distance 2L from the top, the hole at the top is sealed. The piston is then released, to a position where it can stay in equilibrium. In this condition, the distance of the piston from the top is',
    'regular_mcq',
    'Physics',
    'Fluid Mechanics (Pressure, Equilibrium)',
    '[{"label":"A","text":"(2P₀πR²)/(πR²P₀ + Mg) (2L)"},{"label":"B","text":"(P₀πR² - Mg)/(πR²P₀) (2L)"},{"label":"C","text":"(P₀πR²)/(πR²P₀ + Mg) (2L)"},{"label":"D","text":"(P₀πR²)/(πR²P₀ - Mg) (2L)"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    7
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    19,
    'The piston is taken completely out of the cylinder. The hole at the top is sealed. A water tank is brought below the cylinder and put in a position so that the water surface in the tank is at the same level as the top of the cylinder as shown in the figure. The density of the water is ρ. In equilibrium, the height H of the water column in the cylinder satisfies',
    'regular_mcq',
    'Physics',
    'Fluid Mechanics (Buoyancy, Pressure, Equilibrium)',
    '[{"label":"A","text":"ρg(L₀ - H)² + P₀(L₀ - H) + L₀P₀ = 0"},{"label":"B","text":"ρg(L₀ - H)² - P₀(L₀ - H) - L₀P₀ = 0"},{"label":"C","text":"ρg(L₀ - H)² + P₀(L₀ - H) - L₀P₀ = 0"},{"label":"D","text":"ρg(L₀ - H)² - P₀(L₀ - H) + L₀P₀ = 0"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A vertical cylinder, open at the top, is partially submerged in a water tank. The water level inside the cylinder is L₀, and outside is H. The cylinder has a piston at the top.',
    'previous-year/2008_JEE_Main_11_Physics_q19_p7.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_11_Physics_q19_p7.png',
    7
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    20,
    'Some physical quantities are given in Column I and some possible SI units in which these quantities may be expressed are given in Column II. Match the physical quantities in Column I with the units in Column II and indicate your answer by darkening appropriate bubbles in the 4 × 4 matrix given in the ORS.
Column I
(A) G M_s M_e / R_e
G - universal gravitational constant,
M_s - mass of the Sun,
M_e - mass of the earth
(B) 3RT/M
R - universal gas constant,
T - absolute temperature,
M - molar mass
(C) F²/q²B²
F - force,
q - charge,
B - magnetic field
(D) G M_e / R_e
G - universal gravitational constant,
M_e - mass of the earth,
R_e - radius of the earth',
    'matrix_matching',
    'Physics',
    'Units and Dimensions, Gravitation, Thermodynamics, Electromagnetism',
    '[{"label":"A","text":"G M_s M_e / R_e"},{"label":"B","text":"3RT/M"},{"label":"C","text":"F²/q²B²"},{"label":"D","text":"G M_e / R_e"}]',
    '[{"label":"p","text":"(volt) (coulomb) (metre)"},{"label":"q","text":"(kilogram) (metre)³ (second)⁻²"},{"label":"r","text":"(metre)² (second)⁻²"},{"label":"s","text":"(farad)² (kg)⁻¹"}]',
    'A-q, B-r, C-r, D-r',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    8
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    21,
    'Column I gives certain situations in which a straight metallic wire of resistance R is used and Column II gives some resulting effects. Match the statements in Column I with the statements in Column II and indicate your answer by darkening appropriate bubbles in the 4 x 4 matrix given in the ORS.

Column I
(A) A charged capacitor is connected to the ends of the wire
(B) The wire is moved perpendicular to its length with a constant velocity in a uniform magnetic field perpendicular to the plane of motion
(C) The wire is placed in a constant electric field that has a direction along the length of the wire
(D) A battery of constant emf is connected to the ends of the wire',
    'matrix_matching',
    'Physics',
    'Electromagnetism',
    '[{"label":"A","text":"A charged capacitor is connected to the ends of the wire"},{"label":"B","text":"The wire is moved perpendicular to its length with a constant velocity in a uniform magnetic field perpendicular to the plane of motion"},{"label":"C","text":"The wire is placed in a constant electric field that has a direction along the length of the wire"},{"label":"D","text":"A battery of constant emf is connected to the ends of the wire"}]',
    '[{"label":"p","text":"A constant current flows through the wire"},{"label":"q","text":"Thermal energy is generated in the wire"},{"label":"r","text":"A constant potential difference develops between the ends of the wire"},{"label":"s","text":"Charges of constant magnitude appear at the ends of the wire"}]',
    NULL,
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    9
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    22,
    'Some laws / processes are given in Column I. Match these with the physical phenomena given in Column II and indicate your answer by darkening appropriate bubbles in the 4 x 4 matrix given in the ORS.

Column I
(A) Transition between two atomic energy levels
(B) Electron emission from a material
(C) Mosley''s law
(D) Change of photon energy into kinetic energy of electrons',
    'matrix_matching',
    'Physics',
    'Modern Physics',
    '[{"label":"A","text":"Transition between two atomic energy levels"},{"label":"B","text":"Electron emission from a material"},{"label":"C","text":"Mosley''s law"},{"label":"D","text":"Change of photon energy into kinetic energy of electrons"}]',
    '[{"label":"p","text":"Characteristic X-rays"},{"label":"q","text":"Photoelectric effect"},{"label":"r","text":"Hydrogen spectrum"},{"label":"s","text":"β-decay"}]',
    NULL,
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    10
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-11'),
    52,
    'A man walks a distance of 3 units from the origin towards the north-east (N 45° E) direction. From there, he walks a distance of 4 units towards the north-west (N 45° W) direction to reach a point P. Then the position of P in the Argand plane is',
    'regular_mcq',
    'Physics',
    'Vectors / Kinematics (Displacement)',
    '[{"label":"A","text":"3e^(iπ/4) + 4i"},{"label":"B","text":"(3 - 4i)e^(iπ/4)"},{"label":"C","text":"(4 + 3i)e^(iπ/4)"},{"label":"D","text":"(3 + 4i)e^(iπ/4)"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    24
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
-- =====================================================
-- JEE Main 2008 Session 1
-- =====================================================

INSERT INTO previous_year_exams (
    id, exam_name, year, session, total_questions, 
    pdf_file_name, processing_status, extracted_at
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    'JEE Main',
    2008,
    '1',
    24,
    '2008_1.pdf',
    'completed',
    NOW()
) ON CONFLICT (exam_name, year, session) DO UPDATE SET 
    total_questions = EXCLUDED.total_questions,
    processing_status = EXCLUDED.processing_status;

INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    24,
    'Students I, II and III perform an experiment for measuring the acceleration due to gravity (g) using a simple pendulum. They use different lengths of the pendulum and/or record time for different number of oscillations. The observations are shown in the table. Least count for length = 0.1 cm Least count for time = 0.1 s

Student | Length of the pendulum (cm) | Number of oscillations (n) | Total time for (n) oscillations (s) | Time period (s)
---|---|---|---|---
I | 64.0 | 8 | 128.0 | 16.0
II | 64.0 | 4 | 64.0 | 16.0
III | 20.0 | 4 | 36.0 | 9.0

If E_I, E_II and E_III are the percentage errors in g, i.e., (Δg/g × 100) for students I, II and III, respectively,',
    'regular_mcq',
    'Physics',
    'Experimental Physics / Simple Harmonic Motion / Error Analysis',
    '[{"label":"A","text":"E_I = 0"},{"label":"B","text":"E_I is minimum"},{"label":"C","text":"E_I = E_II"},{"label":"D","text":"E_II is maximum"}]',
    NULL,
    'placeholder',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    8
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    25,
    'Figure shows three resistor configurations R1, R2 and R3 connected to 3 V battery. If the power dissipated by the configuration R1, R2 and R3 is P1, P2 and P3, respectively, then
Figure :
(A) P1 > P2 > P3
(C) P2 > P1 > P3
(B) P1 > P3 > P2
(D) P3 > P2 > P1',
    'regular_mcq',
    'Physics',
    'Current Electricity',
    '[{"label":"A","text":"P1 > P2 > P3"},{"label":"B","text":"P1 > P3 > P2"},{"label":"C","text":"P2 > P1 > P3"},{"label":"D","text":"P3 > P2 > P1"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'Three circuit diagrams (R1, R2, R3) showing different resistor configurations connected to a 3V battery.',
    'previous-year/2008_JEE_Main_1_Physics_q25_p9.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_1_Physics_q25_p9.png',
    9
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    26,
    'Which one of the following statements is WRONG in the context of X-rays generated from a X-ray tube?
(A) Wavelength of characteristic X-rays decreases when the atomic number of the target increases
(B) Cut-off wavelength of the continuous X-rays depends on the atomic number of the target
(C) Intensity of the characteristic X-rays depends on the electrical power given to the X-ray tube
(D) Cut-off wavelength of the continuous X-rays depends on the energy of the electrons in the X-ray tube',
    'regular_mcq',
    'Physics',
    'Modern Physics',
    '[{"label":"A","text":"Wavelength of characteristic X-rays decreases when the atomic number of the target increases"},{"label":"B","text":"Cut-off wavelength of the continuous X-rays depends on the atomic number of the target"},{"label":"C","text":"Intensity of the characteristic X-rays depends on the electrical power given to the X-ray tube"},{"label":"D","text":"Cut-off wavelength of the continuous X-rays depends on the energy of the electrons in the X-ray tube"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    9
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    27,
    'Two beams of red and violet colours are made to pass separately through a prism (angle of the prism is 60°). In the position of minimum deviation, the angle of refraction will be
(A) 30° for both the colours
(B) greater for the violet colour
(C) greater for the red colour
(D) equal but not 30° for both the colours',
    'regular_mcq',
    'Physics',
    'Optics',
    '[{"label":"A","text":"30° for both the colours"},{"label":"B","text":"greater for the violet colour"},{"label":"C","text":"greater for the red colour"},{"label":"D","text":"equal but not 30° for both the colours"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    9
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    28,
    'An ideal gas is expanding such that PT² = constant. The coefficient of volume expansion of the gas is
(A) 1/T
(B) 2/T
(C) 3/T
(D) 4/T',
    'regular_mcq',
    'Physics',
    'Thermodynamics',
    '[{"label":"A","text":"1/T"},{"label":"B","text":"2/T"},{"label":"C","text":"3/T"},{"label":"D","text":"4/T"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    10
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    29,
    'A spherically symmetric gravitational system has a mass density ρ = { ρ₀ for r ≤ R, 0 for r > R } where ρ₀ is a constant. A test mass can undergo circular motion under the influence of the gravitational field of particles. Its speed V as a function of distance r (0 < r < ∞) from the centre of the system is represented by',
    'regular_mcq',
    'Physics',
    'Gravitation',
    '[{"label":"A","text":""},{"label":"B","text":""},{"label":"C","text":""},{"label":"D","text":""}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'Four graphs showing speed V versus distance r.',
    'previous-year/2008_JEE_Main_1_Physics_q29_p10.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_1_Physics_q29_p10.png',
    10
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    30,
    'Two balls, having linear momenta p⃗₁ = pî and p⃗₂ = -pî, undergo a collision in free space. There is no external force acting on the balls. Let p⃗''₁ and p⃗''₂ be their final momenta. The following option(s) is(are) NOT ALLOWED for any non-zero value of p, c₁, c₂, b₁, b₂, c₁ and c₂.
(A) p⃗''₁ = a₁î + b₁ĵ + c₁k̂, p⃗''₂ = a₂î + b₂ĵ
(B) p⃗''₁ = c₁k̂, p⃗''₂ = c₂k̂
(C) p⃗''₁ = a₁î + b₁ĵ + c₁k̂, p⃗''₂ = a₂î + b₂ĵ - c₁k̂
(D) p⃗''₁ = a₁î + b₁ĵ, p⃗''₂ = a₂î + b₂ĵ',
    'regular_mcq',
    'Physics',
    'Collisions and Momentum',
    '[{"label":"A","text":"p⃗''₁ = a₁î + b₁ĵ + c₁k̂, p⃗''₂ = a₂î + b₂ĵ"},{"label":"B","text":"p⃗''₁ = c₁k̂, p⃗''₂ = c₂k̂"},{"label":"C","text":"p⃗''₁ = a₁î + b₁ĵ + c₁k̂, p⃗''₂ = a₂î + b₂ĵ - c₁k̂"},{"label":"D","text":"p⃗''₁ = a₁î + b₁ĵ, p⃗''₂ = a₂î + b₂ĵ"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    10
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    31,
    'Assume that the nuclear binding energy per nucleon (B/A) versus mass number (A) is as shown in the figure. Use this plot to choose the correct choice(s) given below.
Figure :
(A) Fusion of two nuclei with mass numbers lying in the range of 1 < A < 50 will release energy
(B) Fusion of two nuclei with mass numbers lying in the range of 51 < A < 100 will release energy
(C) Fission of a nucleus lying in the mass range of 100 < A < 200 will release energy when broken into two equal fragments
(D) Fission of a nucleus lying in the mass range of 200 < A < 260 will release energy when broken into two equal fragments',
    'regular_mcq',
    'Physics',
    'Nuclear Physics',
    '[{"label":"A","text":"Fusion of two nuclei with mass numbers lying in the range of 1 < A < 50 will release energy"},{"label":"B","text":"Fusion of two nuclei with mass numbers lying in the range of 51 < A < 100 will release energy"},{"label":"C","text":"Fission of a nucleus lying in the mass range of 100 < A < 200 will release energy when broken into two equal fragments"},{"label":"D","text":"Fission of a nucleus lying in the mass range of 200 < A < 260 will release energy when broken into two equal fragments"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A graph showing nuclear binding energy per nucleon (B/A) versus mass number (A).',
    'previous-year/2008_JEE_Main_1_Physics_q31_p11.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_1_Physics_q31_p11.png',
    11
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    32,
    'A particle of mass m and charge q, moving with velocity V enters Region II normal to the boundary as shown in the figure. Region II has a uniform magnetic field B perpendicular to the plane of the paper. The length of the Region II is ℓ. Choose the correct choice(s).
Figure :
(A) The particle enters Region III only if its velocity V > qℓB/m
(B) The particle enters Region III only if its velocity V < qℓB/m
(C) Path length of the particle in Region II is maximum when velocity V = qℓB/m
(D) Time spent in Region II is same for any velocity V as long as the particle returns to Region I',
    'regular_mcq',
    'Physics',
    'Magnetic Effects of Current and Magnetism',
    '[{"label":"A","text":"The particle enters Region III only if its velocity V > qℓB/m"},{"label":"B","text":"The particle enters Region III only if its velocity V < qℓB/m"},{"label":"C","text":"Path length of the particle in Region II is maximum when velocity V = qℓB/m"},{"label":"D","text":"Time spent in Region II is same for any velocity V as long as the particle returns to Region I"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A diagram showing a charged particle entering a region with a uniform magnetic field.',
    'previous-year/2008_JEE_Main_1_Physics_q32_p11.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_1_Physics_q32_p11.png',
    11
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    33,
    'In a Young''s double slit experiment, the separation between the two slits is d and the wavelength of the light is λ. The intensity of light falling on slit 1 is four times the intensity of light falling on slit 2. Choose the correct choice(s).
(A) If d = λ, the screen will contain only one maximum
(B) If λ < d < 2λ, at least one more maximum (besides the central maximum) will be observed on the screen
(C) If the intensity of light falling on slit 1 is reduced so that it becomes equal to that of slit 2, the intensities of the observed dark and bright fringes will increase
(D) If the intensity of light falling on slit 2 is increased so that it becomes equal to that of slit 1, the intensities of the observed dark and bright fringes will increase',
    'regular_mcq',
    'Physics',
    'Optics',
    '[{"label":"A","text":"If d = λ, the screen will contain only one maximum"},{"label":"B","text":"If λ < d < 2λ, at least one more maximum (besides the central maximum) will be observed on the screen"},{"label":"C","text":"If the intensity of light falling on slit 1 is reduced so that it becomes equal to that of slit 2, the intensities of the observed dark and bright fringes will increase"},{"label":"D","text":"If the intensity of light falling on slit 2 is increased so that it becomes equal to that of slit 1, the intensities of the observed dark and bright fringes will increase"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    12
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    34,
    'STATEMENT-1: In a Meter Bridge experiment, null point for an unknown resistance is measured. Now, the unknown resistance is put inside an enclosure maintained at a higher temperature. The null point can be obtained at the same point as before by decreasing the value of the standard resistance. AND STATEMENT-2: Resistance of a metal increases with increase in temperature.',
    'statement',
    'Physics',
    'Current Electricity',
    '[{"label":"A","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is a correct explanation for STATEMENT-1"},{"label":"B","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is NOT a correct explanation for STATEMENT-1"},{"label":"C","text":"STATEMENT-1 is True, STATEMENT-2 is False"},{"label":"D","text":"STATEMENT-1 is False, STATEMENT-2 is True"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    12
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    35,
    'STATEMENT-1: An astronaut in an orbiting space station above the Earth experiences weightlessness. AND STATEMENT-2: An object moving around the Earth under the influence of Earth''s gravitational force is in a state of ''free-fall''.',
    'statement',
    'Physics',
    'Gravitation',
    '[{"label":"A","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is a correct explanation for STATEMENT-1"},{"label":"B","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is NOT a correct explanation for STATEMENT-1"},{"label":"C","text":"STATEMENT-1 is True, STATEMENT-2 is False"},{"label":"D","text":"STATEMENT-1 is False, STATEMENT-2 is True"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    12
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    36,
    'STATEMENT-1
Two cylinders, one hollow (metal) and the other solid (wood) with the same mass and identical dimensions are simultaneously allowed to roll without slipping down an inclined plane from the same height. The hollow cylinder will reach the bottom of the inclined plane first.
and
STATEMENT-2
By the principle of conservation of energy, the total kinetic energies of both the cylinders are identical when they reach the bottom of the incline.',
    'statement',
    'Physics',
    'Rotational Dynamics',
    '[{"label":"A","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is a correct explanation for STATEMENT-1"},{"label":"B","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is NOT a correct explanation for STATEMENT-1"},{"label":"C","text":"STATEMENT-1 is True, STATEMENT-2 is False"},{"label":"D","text":"STATEMENT-1 is False, STATEMENT-2 is True"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    13
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    37,
    'STATEMENT-1
The stream of water flowing at high speed from a garden hose pipe tends to spread like a fountain when held vertically up, but tends to narrow down when held vertically down.
and
STATEMENT-2
In any steady flow of an incompressible fluid, the volume flow rate of the fluid remains constant.',
    'statement',
    'Physics',
    'Fluid Dynamics',
    '[{"label":"A","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is a correct explanation for STATEMENT-1"},{"label":"B","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is NOT a correct explanation for STATEMENT-1"},{"label":"C","text":"STATEMENT-1 is True, STATEMENT-2 is False"},{"label":"D","text":"STATEMENT-1 is False, STATEMENT-2 is True"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    13
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    38,
    'Paragraph for Question Nos. 38 to 40
A small spherical monoatomic ideal gas bubble (γ = 5/3) is trapped inside a liquid of density ρ_l (see figure). Assume that the bubble does not exchange any heat with the liquid. The bubble contains n moles of gas. The temperature of the gas when the bubble is at the bottom is T₀, the height of the liquid is H and the atmospheric pressure is P₀ (Neglect surface tension).
Figure :
As the bubble moves upwards, besides the buoyancy force the following forces are acting on it',
    'linked_comprehension',
    'Physics',
    'Fluid Mechanics',
    '[{"label":"A","text":"Only the force of gravity"},{"label":"B","text":"The force due to gravity and the force due to the pressure of the liquid"},{"label":"C","text":"The force due to gravity, the force due to the pressure of the liquid and the force due to viscosity of the liquid"},{"label":"D","text":"The force due to gravity and the force due to viscosity of the liquid"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A container with liquid of height H, showing a spherical gas bubble at depth y from the surface. Atmospheric pressure P₀ is indicated above the liquid surface.',
    'previous-year/2008_JEE_Main_1_Physics_q38_p14.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_1_Physics_q38_p14.png',
    14
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    39,
    'Paragraph for Question Nos. 38 to 40
A small spherical monoatomic ideal gas bubble (γ = 5/3) is trapped inside a liquid of density ρ_l (see figure). Assume that the bubble does not exchange any heat with the liquid. The bubble contains n moles of gas. The temperature of the gas when the bubble is at the bottom is T₀, the height of the liquid is H and the atmospheric pressure is P₀ (Neglect surface tension).
Figure :
When the gas bubble is at a height y from the bottom, its temperature is',
    'linked_comprehension',
    'Physics',
    'Thermodynamics',
    '[{"label":"A","text":"T₀ ( (P₀ + ρ_l g H) / (P₀ + ρ_l g y) )^(2/5)"},{"label":"B","text":"T₀ ( (P₀ + ρ_l g (H – y)) / (P₀ + ρ_l g H) )^(3/5)"},{"label":"C","text":"T₀ ( (P₀ + ρ_l g H) / (P₀ + ρ_l g y) )^(3/5)"},{"label":"D","text":"T₀ ( (P₀ + ρ_l g (H – y)) / (P₀ + ρ_l g H) )^(2/5)"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A container with liquid of height H, showing a spherical gas bubble at depth y from the surface. Atmospheric pressure P₀ is indicated above the liquid surface.',
    'previous-year/2008_JEE_Main_1_Physics_q39_p14.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_1_Physics_q39_p14.png',
    14
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    40,
    'Paragraph for Question Nos. 38 to 40
A small spherical monoatomic ideal gas bubble (γ = 5/3) is trapped inside a liquid of density ρ_l (see figure). Assume that the bubble does not exchange any heat with the liquid. The bubble contains n moles of gas. The temperature of the gas when the bubble is at the bottom is T₀, the height of the liquid is H and the atmospheric pressure is P₀ (Neglect surface tension).
Figure :
The buoyancy force acting on the gas bubble is (Assume R is the universal gas constant)',
    'linked_comprehension',
    'Physics',
    'Fluid Mechanics',
    '[{"label":"A","text":"ρ_l n R T₀ ( (P₀ + ρ_l g H) / (P₀ + ρ_l g y) )^(2/5)"},{"label":"B","text":"ρ_l n R T₀ ( (P₀ + ρ_l g (H – y)) / (P₀ + ρ_l g H) )^(3/5)"},{"label":"C","text":"ρ_l n R T₀ ( (P₀ + ρ_l g H) / (P₀ + ρ_l g y) )^(3/5)"},{"label":"D","text":"ρ_l n R T₀ ( (P₀ + ρ_l g (H – y)) / (P₀ + ρ_l g H) )^(2/5)"}]',
    NULL,
    'B',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'A container with liquid of height H, showing a spherical gas bubble at depth y from the surface. Atmospheric pressure P₀ is indicated above the liquid surface.',
    'previous-year/2008_JEE_Main_1_Physics_q40_p15.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_1_Physics_q40_p15.png',
    15
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    41,
    'Paragraph for Question Nos. 41 to 43
In a mixture of H – He⁺ gas (He⁺ is simply ionized He atom), H atoms and He⁺ ions are excited to their respective first excited states. Subsequently, H atoms transfer their total excitation energy to He⁺ ions by collisions. Assume that the Bohr model of atom is exactly valid.
The quantum number n of the state finally populated in He⁺ ions is',
    'linked_comprehension',
    'Physics',
    'Atomic Structure',
    '[{"label":"A","text":"2"},{"label":"B","text":"3"},{"label":"C","text":"4"},{"label":"D","text":"5"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    15
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    42,
    'Paragraph for Question Nos. 41 to 43
In a mixture of H – He⁺ gas (He⁺ is simply ionized He atom), H atoms and He⁺ ions are excited to their respective first excited states. Subsequently, H atoms transfer their total excitation energy to He⁺ ions by collisions. Assume that the Bohr model of atom is exactly valid.
The wavelength of light emitted in the visible region by He⁺ ions after collisions with H atoms is',
    'linked_comprehension',
    'Physics',
    'Atomic Spectra',
    '[{"label":"A","text":"6.5 × 10⁻⁷ m"},{"label":"B","text":"5.6 × 10⁻⁷ m"},{"label":"C","text":"4.8 × 10⁻⁷ m"},{"label":"D","text":"4.0 × 10⁻⁷ m"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    15
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    43,
    'Paragraph for Question Nos. 41 to 43
In a mixture of H – He⁺ gas (He⁺ is simply ionized He atom), H atoms and He⁺ ions are excited to their respective first excited states. Subsequently, H atoms transfer their total excitation energy to He⁺ ions by collisions. Assume that the Bohr model of atom is exactly valid.
The ratio of the kinetic energy of the n = 2 electron for the H atom to that of He⁺ ion is',
    'linked_comprehension',
    'Physics',
    'Atomic Structure',
    '[{"label":"A","text":"1/4"},{"label":"B","text":"1/2"},{"label":"C","text":"1"},{"label":"D","text":"2"}]',
    NULL,
    'A',
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    15
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    44,
    'Paragraph for Question Nos. 44 to 46
A small block of mass M moves on a frictionless surface of an inclined plane, as shown in figure. The angle of the incline suddenly changes from 60° to 30° at point B. The block is initially at rest at A. Assume that collisions between the block and the incline are totally inelastic (g = 10 m/s²).
Figure :
The speed of the block at point B immediately after it strikes the second incline is',
    'linked_comprehension',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"√60 m/s"},{"label":"B","text":"√45 m/s"},{"label":"C","text":"√30 m/s"},{"label":"D","text":"√15 m/s"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'An inclined plane with two sections. The first section from A to B has an angle of 60° with the horizontal, and the second section from B to C has an angle of 30° with the horizontal. A block of mass M is shown at point A. Horizontal distances are given as √3 m and 3√3 m for the sections.',
    'previous-year/2008_JEE_Main_1_Physics_q44_p16.png',
    'https://mxdbmkckqpfwobmadbcm.supabase.co/storage/v1/object/public/question-diagrams/previous-year/2008_JEE_Main_1_Physics_q44_p16.png',
    16
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    45,
    'Paragraph for Question Nos. 44 to 46
A small block of mass M moves on a frictionless surface of an inclined plane, as shown in figure. The angle of the incline suddenly changes from 60° to 30° at point B. The block is initially at rest at A. Assume that collisions between the block and the incline are totally inelastic (g = 10 m/s²).
Figure :
The speed of the block at point C, immediately before it leaves the second incline is',
    'linked_comprehension',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"√120 m/s"},{"label":"B","text":"√105 m/s"},{"label":"C","text":"√90 m/s"},{"label":"D","text":"√75 m/s"}]',
    NULL,
    'D',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'An inclined plane with two sections. The first section from A to B has an angle of 60° with the horizontal, and the second section from B to C has an angle of 30° with the horizontal. A block of mass M is shown at point A. Horizontal distances are given as √3 m and 3√3 m for the sections.',
    NULL,
    NULL,
    16
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    46,
    'Paragraph for Question Nos. 44 to 46
A small block of mass M moves on a frictionless surface of an inclined plane, as shown in figure. The angle of the incline suddenly changes from 60° to 30° at point B. The block is initially at rest at A. Assume that collisions between the block and the incline are totally inelastic (g = 10 m/s²).
Figure :
If collision between the block and the incline is completely elastic, then the vertical (upward) component of the velocity of the block at point B, immediately after it strikes the second incline is',
    'linked_comprehension',
    'Physics',
    'Mechanics',
    '[{"label":"A","text":"√30 m/s"},{"label":"B","text":"√15 m/s"},{"label":"C","text":"0"},{"label":"D","text":"–√15 m/s"}]',
    NULL,
    'C',
    NULL,
    'medium',
    4,
    1,
    TRUE,
    'An inclined plane with two sections. The first section from A to B has an angle of 60° with the horizontal, and the second section from B to C has an angle of 30° with the horizontal. A block of mass M is shown at point A. Horizontal distances are given as √3 m and 3√3 m for the sections.',
    NULL,
    NULL,
    16
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    uuid_generate_v5(uuid_ns_url(), 'JEE Main-2008-1'),
    59,
    'STATEMENT-1: The plot of atomic number (y-axis) versus number of neutrons (x-axis) for stable nuclei shows a curvature towards x-axis from the line of 45° slope as the atomic number is increased. and STATEMENT-2: Proton-proton electrostatic repulsions begin to overcome attractive forces involving protons and neutrons in heavier nuclides.',
    'statement',
    'Physics',
    'Modern Physics (Nuclear Stability)',
    '[{"label":"A","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is a correct explanation for STATEMENT-1"},{"label":"B","text":"STATEMENT-1 is True, STATEMENT-2 is True; STATEMENT-2 is NOT a correct explanation for STATEMENT-1"},{"label":"C","text":"STATEMENT-1 is True, STATEMENT-2 is False"},{"label":"D","text":"STATEMENT-1 is False, STATEMENT-2 is True"}]',
    NULL,
    NULL,
    NULL,
    'medium',
    4,
    1,
    FALSE,
    NULL,
    NULL,
    NULL,
    20
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 
    'Exams Imported' as metric,
    COUNT(*) as count
FROM previous_year_exams
UNION ALL
SELECT 
    'Total Questions' as metric,
    COUNT(*) as count
FROM previous_year_questions
UNION ALL
SELECT 
    'Questions with Diagrams' as metric,
    COUNT(*) as count
FROM previous_year_questions
WHERE has_diagram = TRUE AND diagram_url IS NOT NULL;

COMMIT;

-- =====================================================
-- SUCCESS
-- =====================================================
-- Import complete! Diagrams are already uploaded to Supabase Storage.
