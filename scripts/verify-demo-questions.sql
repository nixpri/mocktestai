-- Verify Demo Questions Script
-- Run this in Supabase SQL Editor to check if demo questions exist

-- 1. Check total questions
SELECT COUNT(*) as total_questions FROM questions;

-- 2. Check questions by source
SELECT source, COUNT(*) as count 
FROM questions 
GROUP BY source;

-- 3. Check demo questions specifically
SELECT COUNT(*) as demo_questions_count 
FROM questions 
WHERE source = 'demo';

-- 4. If no demo questions, show what sources exist
SELECT DISTINCT source 
FROM questions;

-- 5. Show a sample of questions with their sources
SELECT id, topic, question_type, source, LEFT(question, 50) as question_preview
FROM questions
LIMIT 10;

-- 6. Try to select demo questions
SELECT id, topic, question_type, difficulty, source
FROM questions
WHERE source = 'demo'
LIMIT 5;