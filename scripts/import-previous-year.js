#!/usr/bin/env node

/**
 * Complete import script for previous year questions
 * - Uploads diagrams to Supabase Storage
 * - Generates SQL with correct Supabase URLs
 * - Single command to do everything
 * 
 * Usage: node scripts/import-previous-year.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('\nPlease add to .env.local:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
  console.error('Get these from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

const QUESTIONS_DIR = path.join(__dirname, '..', 'data', 'previous-year', 'jee', 'extracted_questions');
const DIAGRAMS_DIR = path.join(__dirname, '..', 'data', 'previous-year', 'jee', 'extracted_diagrams');
const OUTPUT_SQL = path.join(__dirname, '..', 'supabase', 'migrations', 'load_previous_year_data.sql');

// Topic standardization
const TOPIC_MAPPING = {
  'Electricity & Magnetism': 'Electromagnetism',
  'Electricity and Magnetism': 'Electromagnetism',
  'Heat & Thermodynamics': 'Thermodynamics',
  'Heat and Thermodynamics': 'Thermodynamics',
  'Thermal Physics': 'Thermodynamics',
  'Ray Optics': 'Optics',
  'Wave Optics': 'Optics',
};

function escapeSql(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function jsonToSql(obj) {
  if (!obj || (Array.isArray(obj) && obj.length === 0)) return 'NULL';
  return escapeSql(JSON.stringify(obj));
}

/**
 * Ensure storage bucket exists
 */
async function ensureStorageBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'question-diagrams');
    
    if (!bucketExists) {
      console.log('📦 Creating storage bucket...');
      const { error } = await supabase.storage.createBucket('question-diagrams', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });
      
      if (error) throw error;
      console.log('✅ Storage bucket created');
    } else {
      console.log('✅ Storage bucket exists');
    }
    return true;
  } catch (error) {
    console.error('❌ Storage bucket error:', error);
    return false;
  }
}

/**
 * Upload all diagrams and return URL map
 */
async function uploadDiagrams() {
  console.log('\n📸 Uploading Diagrams to Supabase Storage...\n');
  
  const diagramMap = {};
  
  if (!fs.existsSync(DIAGRAMS_DIR)) {
    console.log('⚠️  No diagrams directory found');
    return diagramMap;
  }
  
  const files = fs.readdirSync(DIAGRAMS_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} diagram files\n`);
  
  for (const file of files) {
    try {
      // Parse filename: 2007_JEE_Main_1A_Physics_q3_p1.png
      const match = file.match(/(\d{4})_JEE_Main_([^_]+)_Physics_q(\d+)_p(\d+)\.png/);
      if (!match) {
        console.log(`⚠️  Skipping invalid filename: ${file}`);
        continue;
      }
      
      const key = `${match[1]}_${match[2]}_${match[3]}`; // year_session_questionNum
      const storagePath = `previous-year/${file}`;
      
      // Upload to Supabase Storage
      console.log(`📤 Uploading: ${file}`);
      const fileBuffer = fs.readFileSync(path.join(DIAGRAMS_DIR, file));
      
      const { data, error } = await supabase.storage
        .from('question-diagrams')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        continue;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('question-diagrams')
        .getPublicUrl(storagePath);
      
      diagramMap[key] = {
        path: storagePath,
        url: urlData.publicUrl
      };
      
      console.log(`   ✅ Uploaded successfully`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Uploaded ${Object.keys(diagramMap).length} diagrams\n`);
  return diagramMap;
}

/**
 * Generate SQL with actual diagram URLs
 */
function generateSQL(diagramMap) {
  console.log('📝 Generating SQL file...\n');
  
  let sql = `-- =====================================================
-- PREVIOUS YEAR QUESTIONS - COMPLETE DATA IMPORT
-- Generated: ${new Date().toISOString()}
-- Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
-- =====================================================

-- This SQL contains all exam data with actual Supabase Storage URLs
-- Diagrams have already been uploaded to Supabase Storage

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM previous_year_questions;
-- DELETE FROM previous_year_exams;
`;

  // Process all JSON files
  const files = fs.readdirSync(QUESTIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, file), 'utf-8'));
    const { metadata, questions } = data;
    
    const examKey = `${metadata.exam}-${metadata.year}-${metadata.session || 'main'}`;
    const examId = `uuid_generate_v5(uuid_ns_url(), '${examKey}')`;
    
    sql += `
-- =====================================================
-- ${metadata.exam} ${metadata.year} Session ${metadata.session || 'Main'}
-- =====================================================

INSERT INTO previous_year_exams (
    id, exam_name, year, session, total_questions, 
    pdf_file_name, processing_status, extracted_at
) VALUES (
    ${examId},
    ${escapeSql(metadata.exam)},
    ${metadata.year},
    ${metadata.session ? escapeSql(metadata.session) : 'NULL'},
    ${metadata.totalQuestions},
    ${escapeSql(metadata.fileName)},
    'completed',
    NOW()
) ON CONFLICT (exam_name, year, session) DO UPDATE SET 
    total_questions = EXCLUDED.total_questions,
    processing_status = EXCLUDED.processing_status;
`;

    // Insert questions with actual diagram URLs
    questions.forEach(q => {
      const topic = TOPIC_MAPPING[q.topic] || q.topic;
      
      // Get diagram URL if exists
      const diagramKey = `${metadata.year}_${metadata.session}_${q.number}`;
      const diagram = diagramMap[diagramKey];
      
      sql += `
INSERT INTO previous_year_questions (
    exam_id, question_number, question_text, question_type,
    subject, topic, options, column_ii_options,
    correct_answer, explanation, difficulty,
    marks, negative_marks, has_diagram, diagram_description,
    diagram_path, diagram_url, page_number
) VALUES (
    ${examId},
    ${q.number},
    ${escapeSql(q.text)},
    ${escapeSql(q.question_type)},
    'Physics',
    ${escapeSql(topic)},
    ${jsonToSql(q.options)},
    ${jsonToSql(q.column_ii_options)},
    ${q.correct_answer ? escapeSql(q.correct_answer) : 'NULL'},
    ${q.explanation ? escapeSql(q.explanation) : 'NULL'},
    ${escapeSql(q.difficulty || 'medium')},
    ${q.marks || 4},
    ${q.negative_marks || 1},
    ${q.has_diagram ? 'TRUE' : 'FALSE'},
    ${q.diagram_description ? escapeSql(q.diagram_description) : 'NULL'},
    ${diagram ? escapeSql(diagram.path) : 'NULL'},
    ${diagram ? escapeSql(diagram.url) : 'NULL'},
    ${q.page_number || 'NULL'}
) ON CONFLICT (exam_id, question_number) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    has_diagram = EXCLUDED.has_diagram,
    diagram_path = EXCLUDED.diagram_path,
    diagram_url = EXCLUDED.diagram_url;`;
    });
  });

  sql += `

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
`;

  // Write SQL file
  fs.writeFileSync(OUTPUT_SQL, sql);
  console.log(`✅ SQL file generated: ${OUTPUT_SQL}\n`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Previous Year Questions Import\n');
  console.log('═'.repeat(50));
  
  try {
    // Step 1: Ensure storage bucket exists
    const bucketReady = await ensureStorageBucket();
    if (!bucketReady) {
      throw new Error('Could not create storage bucket');
    }
    
    // Step 2: Upload all diagrams
    const diagramMap = await uploadDiagrams();
    
    // Step 3: Generate SQL with actual URLs
    generateSQL(diagramMap);
    
    // Summary
    console.log('═'.repeat(50));
    console.log('\n✨ IMPORT COMPLETE!\n');
    console.log('Next steps:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Copy contents of: supabase/migrations/load_previous_year_data.sql');
    console.log('3. Paste and Run in SQL Editor');
    console.log('\nAll diagrams have been uploaded and URLs are in the SQL file.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };