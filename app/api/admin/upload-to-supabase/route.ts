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

// Topic standardization can be added later when mapping to topic_id

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

    // Step 3: Check if test already exists (idempotency check)
    const testTitle = `${metadata.exam} ${metadata.year}${metadata.session ? ' Session ' + metadata.session : ''}`;
    
    // Check for existing test with same metadata
    const { data: existingTest } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('test_type', 'previous_year')
      .eq('title', testTitle)
      .single();
    
    let testData;
    
    if (existingTest) {
      console.log(`Test already exists with ID ${existingTest.id}, using existing test`);
      testData = existingTest;
      
      // Clean up existing questions for re-import
      const { data: existingLinks } = await supabaseAdmin
        .from('test_questions')
        .select('question_id')
        .eq('test_id', existingTest.id);
      
      if (existingLinks && existingLinks.length > 0) {
        const questionIds = existingLinks.map(l => l.question_id);
        
        // Delete test_questions links
        await supabaseAdmin
          .from('test_questions')
          .delete()
          .eq('test_id', existingTest.id);
        
        // Delete questions
        await supabaseAdmin
          .from('questions')
          .delete()
          .in('id', questionIds);
        
        console.log(`Cleaned up ${questionIds.length} existing questions for re-import`);
      }
    } else {
      // Create new test record
      const { data: newTest, error: testError } = await supabaseAdmin
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
          title: testTitle,
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
      
      testData = newTest;
      console.log(`Created new test with ID ${testData.id}`);
    }

    // Step 4: Insert questions and link them to test
    const questionResults = [];
    const testQuestionLinks = [];
    const insertedQuestionIds = [];
    
    console.log(`Starting to insert ${questions.length} questions...`);
    
    for (const question of questions) {
      const diagram = diagramMap[question.number.toString()];
      
      // Map question_type properly
      let mappedQuestionType = 'mcq';
      if (question.question_type === 'statement') {
        mappedQuestionType = 'assertion';
      } else if (question.question_type === 'matrix_matching') {
        mappedQuestionType = 'matrix';
      } else if (question.question_type === 'numerical') {
        mappedQuestionType = 'numerical';
      } else if (question.question_type === 'linked_comprehension') {
        mappedQuestionType = 'paragraph';
      }
      
      // Format options properly as JSONB array
      let formattedOptions = null;
      if (question.options && question.options.length > 0) {
        formattedOptions = question.options.map((opt: any) => {
          if (typeof opt === 'object' && opt.text) {
            return {
              label: opt.label || 'A',
              text: opt.text,
              value: opt.label || 'A'
            };
          }
          return {
            label: String.fromCharCode(65 + question.options.indexOf(opt)),
            text: String(opt),
            value: String.fromCharCode(65 + question.options.indexOf(opt))
          };
        });
      }
      
      // Prepare question data according to schema
      const questionData = {
        // Source tracking
        source_type: 'previous_year',
        source_metadata: {
          exam: metadata.exam,
          year: parseInt(metadata.year),
          session: metadata.session || null,
          question_number: question.number,
          page_number: question.page_number || null,
          original_topic: question.topic || null,
        },
        
        // Question content
        question_text: question.text || question.question || '',
        question_type: mappedQuestionType,
        question_metadata: {
          ...(question.column_ii_options ? { column_ii_options: question.column_ii_options } : {}),
          ...(question.question_type ? { original_type: question.question_type } : {})
        },
        
        // Categorization
        subject: question.subject || metadata.subject || 'Physics',
        topic_id: null, // TODO: Map to actual topic IDs from topics table
        difficulty: question.difficulty || 'medium',
        
        // Answer Information
        options: formattedOptions,
        correct_answer: question.correct_answer || null,
        explanation: question.explanation || null,
        solution_approach: null, // Can be added later
        hints: null, // Can be added later
        
        // Scoring
        marks: question.marks || 4,
        negative_marks: question.negative_marks || 1,
        time_estimate: null, // Can be calculated later
        
        // Media
        has_diagram: !!(question.has_diagram || question.diagram_extracted || diagram),
        diagram_url: diagram?.url || null,
        diagram_description: question.diagram_description || null,
        additional_media: null,
        
        // Metadata
        tags: question.topic ? [question.topic] : [],
        concepts_tested: [], // Can be extracted later
        is_active: true,
        is_verified: false, // Set to false initially for review
        usage_count: 0,
        success_rate: null
      };
      
      // Insert into unified questions table
      const { data: insertedQuestion, error: questionError } = await supabaseAdmin
        .from('questions')
        .insert(questionData)
        .select()
        .single();

      if (questionError) {
        console.error(`Failed to insert question ${question.number}:`, questionError.message);
        questionResults.push({ 
          question: question.number, 
          success: false, 
          error: questionError.message 
        });
      } else if (insertedQuestion && insertedQuestion.id) {
        questionResults.push({ 
          question: question.number, 
          success: true,
          id: insertedQuestion.id
        });
        insertedQuestionIds.push(insertedQuestion.id);

        // Prepare link for test_questions table
        testQuestionLinks.push({
          test_id: testData.id,
          question_id: insertedQuestion.id,
          sequence_number: question.number,
          section: question.subject || 'Physics',
        });
      } else {
        console.error(`No data returned for question ${question.number}`);
        questionResults.push({ 
          question: question.number, 
          success: false, 
          error: 'No data returned from insert'
        });
      }
    }
    
    console.log(`\n=== Question Insertion Summary ===`);
    console.log(`Total questions in JSON: ${questions.length}`);
    console.log(`Questions successfully inserted: ${insertedQuestionIds.length}`);
    console.log(`Questions failed: ${questions.length - insertedQuestionIds.length}`);
    console.log(`Test-question links prepared: ${testQuestionLinks.length}`);
    
    // Verify actual insert count
    if (insertedQuestionIds.length === 0) {
      console.error('CRITICAL: No questions were inserted! Check error logs above.');
      return NextResponse.json({
        error: 'No questions were inserted',
        details: 'All question insertions failed. Check server logs.',
        testId: testData.id,
        failedQuestions: questionResults.filter(r => !r.success)
      }, { status: 500 });
    }

    // Step 4.5: Insert test-question links
    let actualLinkedCount = 0;
    if (testQuestionLinks.length > 0) {
      const { data: linkData, error: linkError } = await supabaseAdmin
        .from('test_questions')
        .insert(testQuestionLinks)
        .select();

      if (linkError) {
        console.error('Error linking questions to test:', linkError);
        return NextResponse.json({ 
          error: 'Failed to link questions to test', 
          details: linkError.message,
          testCreated: true,
          testId: testData.id,
          questionsInserted: questionResults.filter(r => r.success).length
        }, { status: 500 });
      }
      
      actualLinkedCount = linkData?.length || 0;
      console.log(`Successfully linked ${actualLinkedCount} questions to test ${testData.id}`);
      
      // Verify links were created
      if (!linkData || linkData.length !== testQuestionLinks.length) {
        console.warn(`Warning: Expected ${testQuestionLinks.length} links but created ${actualLinkedCount}`);
      }
      
      // Double-check by querying the links
      const { data: verifyLinks, error: verifyError } = await supabaseAdmin
        .from('test_questions')
        .select('*')
        .eq('test_id', testData.id);
      
      if (verifyError) {
        console.error('Error verifying links:', verifyError);
      } else {
        console.log(`Verification: Found ${verifyLinks?.length || 0} test_questions for test ${testData.id}`);
        if (verifyLinks && verifyLinks.length > 0) {
          actualLinkedCount = verifyLinks.length;
        }
      }
    } else {
      console.warn('No test-question links to create - this may cause display issues');
    }

    // Calculate summary first
    const successCount = questionResults.filter(r => r.success).length;
    const failCount = questionResults.filter(r => !r.success).length;
    const actualDiagramsExtracted = questions.filter((q: any) => 
      q.has_diagram || q.diagram_extracted || diagramMap[q.number?.toString()]
    ).length;

    // Step 5: Clean up local files (only if upload was successful)
    const cleanup = async () => {
      // Only clean up if we successfully uploaded questions
      if (successCount === 0) {
        console.log('Skipping cleanup - no questions were uploaded successfully');
        console.log('JSON file preserved at:', questionsFile);
        return false;
      }
      
      try {
        // Delete the questions JSON file
        await fs.unlink(questionsFile);
        console.log(`Deleted JSON file: ${questionsFile}`);
        
        // Delete uploaded diagram files
        for (const diagramFile of relevantDiagrams) {
          await fs.unlink(path.join(diagramsDir, diagramFile)).catch(() => {});
        }
        console.log(`Deleted ${relevantDiagrams.length} diagram files`);
        
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

    console.log('=== Upload Summary ===');
    console.log(`Test ID: ${testData.id}`);
    console.log(`Questions in JSON: ${questions.length}`);
    console.log(`Questions inserted: ${successCount}`);
    console.log(`Questions failed: ${failCount}`);
    console.log(`Test-question links created: ${testQuestionLinks.length}`);
    console.log(`Diagrams uploaded: ${Object.keys(diagramMap).length}`);
    console.log('====================');

    return NextResponse.json({
      success: true,
      exam: `${metadata.exam} ${metadata.year} Session ${metadata.session}`,
      testId: testData.id,
      summary: {
        totalQuestions: questions.length,
        uploaded: successCount,
        failed: failCount,
        linked: testQuestionLinks.length,
        diagramsExtracted: actualDiagramsExtracted,
        diagramsUploaded: Object.keys(diagramMap).length,
        filesCleanedUp: cleanupSuccess
      },
      details: {
        questionResults: failCount > 0 ? questionResults.filter(r => !r.success) : undefined,
        uploadedDiagrams: Object.keys(diagramMap).map(q => `Question ${q}`),
        testUrl: `/admin/questions?test=${testData.id}`
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