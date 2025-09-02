import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQuestion, generateMockTest } from '@/lib/ai/claude'

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment')
      return NextResponse.json(
        { 
          error: 'AI service not configured',
          details: 'ANTHROPIC_API_KEY is missing. Please add it to your .env.local file and restart the server.'
        },
        { status: 500 }
      )
    }

    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Note: Profile creation is handled by database triggers on auth.users insert
    // We don't need to manually create profiles here

    const body = await request.json()
    const { type, params } = body
    
    console.log('Question generation request:', { type, params })

    if (type === 'single') {
      // Generate a single question
      const question = await generateQuestion(params)
      
      // For MVP, skip database save if it fails
      try {
        const { data, error } = await supabase
          .from('questions')
          .insert({
            topic_id: params.topic,
            content: {
              text: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer
            },
            question_type: params.questionType || 'mcq',
            difficulty: params.difficulty,
            solution: {
              text: question.solution
            },
            source: 'generated',
            tags: question.concepts
          })
          .select()
          .single()

        if (error) {
          console.error('Error saving question to database:', error)
          // Continue without saving to database
        }

        return NextResponse.json({
          success: true,
          question: data || question,
          savedToDb: !error
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Return the generated question even if database save fails
        return NextResponse.json({
          success: true,
          question: question,
          savedToDb: false
        })
      }
    } else if (type === 'mock_test') {
      // Generate a full mock test
      const generatedQuestions = await generateMockTest(params)
      
      // Transform AI-generated questions to match the expected Question interface
      const formattedQuestions = generatedQuestions.map((q, index) => {
        // Ensure options have both text and latex fields properly set
        const formattedOptions = q.options?.map((opt: any) => {
          // If text is missing but latex exists, create a readable text version
          if (!opt.text && opt.latex) {
            opt.text = opt.latex.replace(/\$/g, '').replace(/\\/g, '')
          }
          return {
            id: opt.id,
            text: opt.text || `Option ${opt.id.toUpperCase()}`,
            latex: opt.latex || opt.text || ''
          }
        }) || []
        
        return {
          id: `q${index + 1}`,
          topicId: params.topics?.[index % params.topics.length] || 'physics',
          content: {
            text: q.question,
            options: formattedOptions,
            correctAnswer: q.correctAnswer
          },
          questionType: 'mcq' as const,
          difficulty: q.estimatedTime <= 2 ? 'easy' as const : q.estimatedTime <= 3 ? 'medium' as const : 'hard' as const,
          marks: 4,
          negativeMarks: 1,
          solution: {
            text: q.solution,
            steps: q.solution.split('\n').filter(s => s.trim())
          },
          source: 'generated' as const,
          tags: q.concepts || []
        }
      })
      
      // Create test in database
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          user_id: user.id,
          test_type: 'mock',
          title: params.title || 'AI Generated Mock Test',
          questions: formattedQuestions,
          total_marks: formattedQuestions.length * 4,
          duration_minutes: params.duration || 180,
          status: 'created'
        })
        .select()
        .single()

      if (testError) {
        console.error('Error creating test:', testError)
        // If database save fails, still return the test data for localStorage storage
        const testId = `ai-test-${Date.now()}`
        return NextResponse.json({
          success: true,
          test: {
            id: testId,
            user_id: user.id,
            test_type: 'mock',
            title: params.title || 'AI Generated Mock Test',
            questions: formattedQuestions,
            total_marks: formattedQuestions.length * 4,
            duration_minutes: params.duration || 180,
            status: 'created',
            created_at: new Date().toISOString()
          },
          questions: formattedQuestions,
          questionCount: formattedQuestions.length,
          savedToDb: false
        })
      }

      return NextResponse.json({
        success: true,
        test,
        questions: formattedQuestions,
        questionCount: formattedQuestions.length,
        savedToDb: true
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in question generation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch generated questions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('questions')
      .select('*')
      .eq('source', 'generated')
      .limit(limit)

    if (topic) {
      query = query.eq('topic_id', topic)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      questions: data
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}