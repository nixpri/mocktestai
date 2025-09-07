import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client with service role key
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

export async function GET(request: NextRequest) {
  try {
    // Fetch all tests
    const { data: testsData, error: testsError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .order('published_at', { ascending: false });

    if (testsError) {
      console.error('Error fetching tests:', testsError);
      return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
    }

    // Get question counts for each test
    const processedTests = await Promise.all(testsData?.map(async (test) => {
      // Get linked questions
      const { data: questionLinks, error: linkError } = await supabaseAdmin
        .from('test_questions')
        .select('question_id')
        .eq('test_id', test.id);

      if (linkError) {
        console.error(`Error fetching test_questions for ${test.id}:`, linkError);
        return {
          ...test,
          questions_count: 0,
          diagrams_count: 0
        };
      }

      if (questionLinks && questionLinks.length > 0) {
        const questionIds = questionLinks.map(q => q.question_id);
        
        // Get questions to count diagrams
        const { data: questionsData, error: questionsError } = await supabaseAdmin
          .from('questions')
          .select('has_diagram')
          .in('id', questionIds);

        if (questionsError) {
          console.error(`Error fetching questions for ${test.id}:`, questionsError);
        }

        const diagramsCount = questionsData?.filter(q => q.has_diagram)?.length || 0;

        return {
          ...test,
          questions_count: questionLinks.length,
          diagrams_count: diagramsCount
        };
      }

      return {
        ...test,
        questions_count: 0,
        diagrams_count: 0
      };
    }) || []);

    return NextResponse.json({ tests: processedTests });
  } catch (error) {
    console.error('Error in /api/admin/tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get questions for a specific test
export async function POST(request: NextRequest) {
  try {
    const { testId } = await request.json();
    
    if (!testId) {
      return NextResponse.json({ error: 'Test ID required' }, { status: 400 });
    }

    // Get questions linked to this test
    const { data: questionLinks, error: linkError } = await supabaseAdmin
      .from('test_questions')
      .select('question_id, sequence_number')
      .eq('test_id', testId)
      .order('sequence_number');

    if (linkError) {
      console.error('Error fetching test_questions:', linkError);
      return NextResponse.json({ error: 'Failed to fetch test questions' }, { status: 500 });
    }

    if (!questionLinks || questionLinks.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Fetch actual questions
    const questionIds = questionLinks.map(l => l.question_id);
    const { data: questionsData, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('id', questionIds);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    // Map questions with sequence numbers
    const questionsWithSequence = questionsData?.map(q => {
      const link = questionLinks.find(l => l.question_id === q.id);
      return {
        ...q,
        sequence_number: link?.sequence_number || 0
      };
    }) || [];

    // Sort by sequence number
    questionsWithSequence.sort((a, b) => a.sequence_number - b.sequence_number);

    return NextResponse.json({ questions: questionsWithSequence });
  } catch (error) {
    console.error('Error fetching test questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}