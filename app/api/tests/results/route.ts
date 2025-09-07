import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Save test result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testId, testResult } = body

    // For practice tests stored in localStorage, just return success without saving to DB
    if (testId.startsWith('practice-') || testId.startsWith('ai_test_')) {
      // Return a mock result ID for practice tests
      return NextResponse.json({ 
        success: true, 
        result: { 
          id: `local-${testId}-${Date.now()}`,
          ...testResult
        } 
      })
    }

    const supabase = await createClient()
    
    // Check authentication for non-practice tests
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine test type and title
    let testType = 'standard'
    let testTitle = testResult.testTitle || 'Test'
    
    if (testId === 'demo-test-1') {
      testType = 'quick'
      testTitle = 'Quick Practice Test'
    } else if (testResult.testType) {
      testType = testResult.testType
    }

    // Get the current attempt number for this user and test
    const { data: previousAttempts, error: countError } = await supabase
      .from('test_results')
      .select('attempt_number')
      .eq('test_id', testId)
      .eq('user_id', user.id)
      .order('attempt_number', { ascending: false })
      .limit(1)

    if (countError && countError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking previous attempts:', countError)
      return NextResponse.json({ error: 'Failed to check previous attempts' }, { status: 500 })
    }

    // Calculate next attempt number
    const attemptNumber = previousAttempts && previousAttempts.length > 0 
      ? (previousAttempts[0].attempt_number || 0) + 1 
      : 1

    // Save test result to database
    const { data: result, error: resultError } = await supabase
      .from('test_results')
      .insert({
        test_id: testId,
        test_title: testTitle,
        test_type: testType,
        user_id: user.id,
        attempt_number: attemptNumber,
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
        user_answers: testResult.userAnswers || {},
        status: 'completed',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (resultError) {
      console.error('Error saving test result:', resultError)
      
      // Handle specific database errors
      if (resultError.code === '23505') {
        return NextResponse.json({ 
          error: 'You have already submitted this test. Each test attempt is saved separately.' 
        }, { status: 409 })
      }
      
      return NextResponse.json({ error: 'Failed to save result. Please try again.' }, { status: 500 })
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