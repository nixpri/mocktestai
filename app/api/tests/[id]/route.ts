import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const testId = params.id

    // First fetch the test
    const { data: testData, error: testError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()

    if (testError || !testData) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Then fetch questions through test_questions linking table
    const { data: questionLinks, error: linkError } = await supabaseAdmin
      .from('test_questions')
      .select('question_id, sequence_number')
      .eq('test_id', testId)
      .order('sequence_number')

    if (linkError || !questionLinks || questionLinks.length === 0) {
      console.error('No questions found for test:', testId, linkError)
      return NextResponse.json({
        test: testData,
        questions: []
      })
    }

    // Fetch actual questions
    const questionIds = questionLinks.map(l => l.question_id)
    const { data: questionsData, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('id', questionIds)

    if (questionsError || !questionsData) {
      console.error('Error loading questions:', questionsError)
      return NextResponse.json({
        test: testData,
        questions: []
      })
    }

    // Sort questions by sequence number from test_questions
    const sortedQuestions = questionLinks.map(link => {
      const question = questionsData.find(q => q.id === link.question_id)
      return question
    }).filter(q => q !== undefined)

    return NextResponse.json({
      test: testData,
      questions: sortedQuestions
    })
  } catch (error) {
    console.error('Error in test API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}