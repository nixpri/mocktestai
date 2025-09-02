import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Save test result
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { testId, testResult } = body

    // Determine test type and title
    let testType = 'standard'
    let testTitle = testResult.testTitle || 'Test'
    
    if (testId === 'demo-test-1') {
      testType = 'quick'
      testTitle = 'Quick Practice Test'
    } else if (testId.startsWith('ai-test-')) {
      testType = 'ai_generated'
    } else if (testId.startsWith('topic-')) {
      testType = 'topic'
    }

    // Save test result to database
    const { data: result, error: resultError } = await supabase
      .from('test_results')
      .insert({
        test_id: testId,
        test_title: testTitle,
        test_type: testType,
        user_id: user.id,
        total_questions: testResult.totalQuestions,
        attempted_questions: testResult.attempted,
        correct_answers: testResult.correct,
        wrong_answers: testResult.incorrect,
        total_marks_obtained: testResult.score,
        total_marks: testResult.totalMarks,
        percentage: testResult.percentage,
        time_taken_minutes: Math.floor(testResult.timeTaken / 60),
        topic_breakdown: testResult.topicBreakdown || {},
        difficulty_breakdown: testResult.difficultyBreakdown || {},
        questions_data: testResult.questionsData || [],
        user_answers: testResult.userAnswers || {}
      })
      .select()
      .single()

    if (resultError) {
      console.error('Error saving test result:', resultError)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error in POST /api/tests/results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Fetch test results for analytics
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all test results for the user
    const { data: results, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching test results:', error)
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }

    // Transform data for analytics
    const testHistory = results?.map(result => ({
      id: result.id, // Include the result ID for linking
      testId: result.test_id,
      testTitle: result.test_title || 'Test',
      testType: result.test_type || 'standard',
      totalQuestions: result.total_questions,
      attempted: result.attempted_questions,
      correct: result.correct_answers,
      incorrect: result.wrong_answers,
      unattempted: result.total_questions - result.attempted_questions,
      score: result.total_marks_obtained,
      totalMarks: result.total_marks,
      percentage: result.percentage,
      timeTaken: result.time_taken_minutes * 60,
      date: result.created_at,
      // Return actual breakdowns from database
      topicBreakdown: result.topic_breakdown || {},
      difficultyBreakdown: result.difficulty_breakdown || {}
    })) || []

    return NextResponse.json({ success: true, testHistory })
  } catch (error) {
    console.error('Error in GET /api/tests/results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}