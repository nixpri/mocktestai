import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

// Topic standardization
const TOPIC_MAPPING: { [key: string]: string } = {
  'Electricity & Magnetism': 'Electromagnetism',
  'Electricity and Magnetism': 'Electromagnetism',
  'Heat & Thermodynamics': 'Thermodynamics',
  'Heat and Thermodynamics': 'Thermodynamics',
  'Thermal Physics': 'Thermodynamics',
  'Ray Optics': 'Optics',
  'Wave Optics': 'Optics',
};

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json({ error: 'No fileName provided' }, { status: 400 });
    }

    // Paths
    const baseDir = path.join(process.cwd(), 'data', 'previous-year', 'jee');
    const questionsFile = path.join(baseDir, 'extracted_questions', fileName);
    const diagramsDir = path.join(baseDir, 'extracted_diagrams');

    // Check if questions file exists
    const fileExists = await fs.access(questionsFile).then(() => true).catch(() => false);
    if (!fileExists) {
      return NextResponse.json({ error: `Questions file not found: ${fileName}` }, { status: 404 });
    }

    // Read questions data
    const questionsData = JSON.parse(await fs.readFile(questionsFile, 'utf-8'));
    const { metadata, questions } = questionsData;

    // Step 1: Ensure storage bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'question-diagrams');
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket('question-diagrams', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });
    }

    // Step 2: Upload diagrams and create URL map
    const diagramMap: { [key: string]: { path: string; url: string } } = {};
    
    // Find and upload diagrams for this paper
    const diagramFiles = await fs.readdir(diagramsDir).catch(() => []);
    const paperPrefix = fileName.replace('_complete.json', '').replace('_Physics', '');
    const relevantDiagrams = diagramFiles.filter(f => 
      f.startsWith(paperPrefix) && f.endsWith('.png')
    );

    for (const diagramFile of relevantDiagrams) {
      try {
        // Parse diagram filename
        const match = diagramFile.match(/_q(\d+)_p(\d+)/);
        if (!match) continue;
        
        const questionNum = match[1];
        const diagramPath = path.join(diagramsDir, diagramFile);
        const fileBuffer = await fs.readFile(diagramPath);
        const storagePath = `previous-year/${diagramFile}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
          .from('question-diagrams')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });
        
        if (!error) {
          // Get public URL
          const { data: urlData } = supabaseAdmin.storage
            .from('question-diagrams')
            .getPublicUrl(storagePath);
          
          diagramMap[questionNum] = {
            path: storagePath,
            url: urlData.publicUrl
          };
        }
      } catch (err) {
        console.error(`Error uploading diagram ${diagramFile}:`, err);
      }
    }

    // Step 3: Insert test record (unified tests table)
    const { data: testData, error: testError } = await supabaseAdmin
      .from('tests')
      .insert({
        test_type: 'previous_year',
        test_metadata: {
          exam_name: metadata.exam,
          year: parseInt(metadata.year),
          session: metadata.session || null,
          pdf_file_name: metadata.fileName,
          extracted_at: metadata.extractedDate || new Date().toISOString(),
        },
        title: `${metadata.exam} ${metadata.year}${metadata.session ? ' Session ' + metadata.session : ''}`,
        description: `Previous year ${metadata.exam} paper`,
        subject: metadata.subject || null,
        total_questions: metadata.totalQuestions,
        total_marks: metadata.totalQuestions * 4, // Assuming 4 marks per question
        duration_minutes: 180, // Standard 3 hours for JEE
        difficulty_level: 'mixed',
        is_public: true,
        is_active: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (testError) {
      return NextResponse.json({ error: 'Failed to create test record', details: testError }, { status: 500 });
    }

    // Step 4: Insert questions and link them to test
    const questionResults = [];
    const testQuestionLinks = [];
    
    for (const question of questions) {
      const standardTopic = TOPIC_MAPPING[question.topic] || question.topic;
      const diagram = diagramMap[question.number.toString()];
      
      // Insert into unified questions table
      const { data: questionData, error: questionError } = await supabaseAdmin
        .from('questions')
        .insert({
          source_type: 'previous_year',
          source_metadata: {
            exam: metadata.exam,
            year: parseInt(metadata.year),
            session: metadata.session || null,
            question_number: question.number,
            page_number: question.page_number || null,
          },
          question_text: question.text,
          question_type: question.question_type || 'mcq',
          question_metadata: question.column_ii_options ? {
            column_ii_options: question.column_ii_options
          } : {},
          subject: question.subject || 'Physics',
          topic_id: null, // Will need to look up topic ID in future
          difficulty: question.difficulty || 'medium',
          options: question.options && question.options.length > 0 ? question.options : null,
          correct_answer: question.correct_answer || null,
          explanation: question.explanation || null,
          marks: question.marks || 4,
          negative_marks: question.negative_marks || 1,
          has_diagram: question.has_diagram || false,
          diagram_url: diagram?.url || null,
          diagram_description: question.diagram_description || null,
          is_active: true,
          is_verified: true,
        })
        .select()
        .single();

      if (questionError) {
        questionResults.push({ 
          question: question.number, 
          success: false, 
          error: questionError.message 
        });
      } else {
        questionResults.push({ 
          question: question.number, 
          success: true 
        });

        // Prepare link for test_questions table
        if (questionData) {
          testQuestionLinks.push({
            test_id: testData.id,
            question_id: questionData.id,
            sequence_number: question.number,
            section: question.subject || 'Physics',
          });
        }
      }
    }

    // Step 4.5: Insert test-question links
    if (testQuestionLinks.length > 0) {
      const { error: linkError } = await supabaseAdmin
        .from('test_questions')
        .insert(testQuestionLinks);

      if (linkError) {
        console.error('Error linking questions to test:', linkError);
      }
    }

    // Step 5: Clean up local files
    const cleanup = async () => {
      try {
        // Delete the questions JSON file
        await fs.unlink(questionsFile);
        
        // Delete uploaded diagram files
        for (const diagramFile of relevantDiagrams) {
          await fs.unlink(path.join(diagramsDir, diagramFile)).catch(() => {});
        }
        
        // Clean up any temporary directories
        const tempDir = path.join(process.cwd(), 'temp_extraction');
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        
        return true;
      } catch (err) {
        console.error('Cleanup error:', err);
        return false;
      }
    };

    const cleanupSuccess = await cleanup();

    // Summary
    const successCount = questionResults.filter(r => r.success).length;
    const failCount = questionResults.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      exam: `${metadata.exam} ${metadata.year} Session ${metadata.session}`,
      testId: testData.id,
      summary: {
        totalQuestions: questions.length,
        uploaded: successCount,
        failed: failCount,
        diagramsUploaded: Object.keys(diagramMap).length,
        filesCleanedUp: cleanupSuccess
      },
      details: {
        questionResults: failCount > 0 ? questionResults : undefined,
        uploadedDiagrams: Object.keys(diagramMap).map(q => `Question ${q}`)
      }
    });

  } catch (error) {
    console.error('Upload to Supabase error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload to Supabase',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}