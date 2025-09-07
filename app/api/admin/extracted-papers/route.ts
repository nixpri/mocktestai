import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TestMetadata {
  exam_name?: string;
  year?: number;
  session?: string;
}

interface Test {
  id: string;
  test_type: string;
  test_metadata: TestMetadata;
  title: string;
  description: string;
  subject: string | null;
  total_questions: number;
  total_marks: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('id');
    
    const supabase = await createClient();
    
    // If no test ID specified, list available previous year tests
    if (!testId) {
      // Get all previous year tests from tests table
      const { data: tests, error } = await supabase
        .from('tests')
        .select('*')
        .eq('test_type', 'previous_year')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tests:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch tests from database'
        }, { status: 500 });
      }
      
      // For each test, count linked questions and diagrams
      const testsWithCounts = await Promise.all((tests || []).map(async (test: Test) => {
        // Get question count through test_questions table
        const { data: linkedQuestions } = await supabase
          .from('test_questions')
          .select('question_id')
          .eq('test_id', test.id);
        
        let diagramCount = 0;
        if (linkedQuestions && linkedQuestions.length > 0) {
          const questionIds = linkedQuestions.map(lq => lq.question_id);
          
          // Count questions with diagrams
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .in('id', questionIds)
            .eq('has_diagram', true);
          
          diagramCount = count || 0;
        }
        
        return {
          id: test.id,
          title: test.title,
          description: test.description,
          year: test.test_metadata?.year,
          exam: test.test_metadata?.exam_name,
          session: test.test_metadata?.session,
          subject: test.subject,
          questionCount: linkedQuestions?.length || 0,
          diagramCount: diagramCount,
          totalQuestions: test.total_questions,
          totalMarks: test.total_marks,
          createdAt: test.created_at
        };
      }));
      
      return NextResponse.json({
        success: true,
        tests: testsWithCounts
      });
    }
    
    // Load specific test's questions
    // First get the test details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();
    
    if (testError || !test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    // Get all questions linked to this test
    const { data: testQuestions } = await supabase
      .from('test_questions')
      .select(`
        sequence_number,
        section,
        marks_override,
        negative_marks_override,
        questions (*)
      `)
      .eq('test_id', testId)
      .order('sequence_number');
    
    // Format the questions
    const questions = testQuestions?.map(tq => {
      const question = tq.questions as any;
      return {
        ...question,
        sequence_number: tq.sequence_number,
        section: tq.section,
        marks: tq.marks_override || question?.marks,
        negative_marks: tq.negative_marks_override || question?.negative_marks
      };
    }) || [];
    
    return NextResponse.json({
      success: true,
      data: {
        test,
        metadata: {
          id: test.id,
          title: test.title,
          year: test.test_metadata?.year,
          exam: test.test_metadata?.exam_name,
          session: test.test_metadata?.session,
          subject: test.subject,
          totalQuestions: questions.length,
          questionsWithDiagrams: questions.filter((q: any) => q.has_diagram).length
        },
        questions
      }
    });
    
  } catch (error) {
    console.error('Error fetching extracted papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extracted papers' },
      { status: 500 }
    );
  }
}