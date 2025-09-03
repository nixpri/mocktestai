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
    
    const body = await request.json()
    const { type, params } = body
    
    if (type === 'single') {
      // Generate a single question
      const question = await generateQuestion(params)
      
      // Save to questions bank with proper format
      try {
        const questionData = {
          topic: params.topic || 'mechanics',
          subtopic: params.subtopic || null,
          question_type: params.questionType || 'mcq',
          difficulty: params.difficulty || 'medium',
          question: question.question,
          options: question.options ? JSON.stringify(question.options) : null,
          correct_answer: question.correctAnswer || null,
          explanation: question.solution || null,
          marks: 4,
          negative_marks: 1,
          tags: question.concepts || [],
          source: 'generated',
          created_by: user.id
        }
        
        const { data, error } = await supabase
          .from('questions')
          .insert(questionData)
          .select()
          .single()

        if (error) {
          console.error('Error saving question to database:', error)
        }

        return NextResponse.json({
          success: true,
          question: data || question,
          savedToDb: !error
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json({
          success: true,
          question: question,
          savedToDb: false
        })
      }
    } else if (type === 'mock_test') {
      // Generate a full mock test
      const generatedQuestions = await generateMockTest(params)
      
      // Save each question to the questions bank
      const savedQuestionIds = []
      
      for (let i = 0; i < generatedQuestions.length; i++) {
        const q = generatedQuestions[i]
        try {
          // Properly format options for database storage
          let formattedOptions = null
          if (q.options && Array.isArray(q.options)) {
            formattedOptions = q.options.map((opt: any) => {
              if (typeof opt === 'string') {
                return opt
              } else if (opt.text) {
                return opt.text
              } else if (opt.latex) {
                return opt.latex.replace(/\$/g, '').replace(/\\/g, '')
              }
              return opt
            })
          }
          
          const questionData = {
            topic: params.topics?.[i % params.topics.length] || params.topic || 'mechanics',
            subtopic: null,
            question_type: 'mcq',
            difficulty: q.estimatedTime <= 2 ? 'easy' : q.estimatedTime <= 3 ? 'medium' : 'hard',
            question: q.question,
            options: formattedOptions,
            correct_answer: q.correctAnswer?.toUpperCase() || 'A',
            explanation: q.solution || q.explanation || null,
            marks: 4,
            negative_marks: 1,
            tags: q.concepts || [],
            source: 'generated',
            created_by: user.id
          }
          
          const { data, error } = await supabase
            .from('questions')
            .insert(questionData)
            .select()
            .single()
          
          if (data) {
            savedQuestionIds.push(data.id)
          }
        } catch (error) {
          console.error('Error saving question:', error)
        }
      }
      
      // Transform AI-generated questions to match the expected Question interface
      const formattedQuestions = generatedQuestions.map((q, index) => {
        const formattedOptions = q.options?.map((opt: any) => {
          if (!opt.text && opt.latex) {
            opt.text = opt.latex.replace(/\$/g, '').replace(/\\/g, '')
          }
          return {
            id: opt.id || String.fromCharCode(97 + index),
            text: opt.text || opt || `Option ${String.fromCharCode(65 + index)}`,
            latex: opt.latex || opt.text || ''
          }
        }) || []
        
        return {
          id: savedQuestionIds[index] || `q${index + 1}`,
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
            steps: q.solution ? q.solution.split('\n').filter((s: string) => s.trim()) : []
          },
          source: 'generated' as const,
          tags: q.concepts || []
        }
      })
      
      // Create test in database with reference to saved questions
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          user_id: user.id,
          test_type: 'ai_generated',
          title: params.title || 'AI Generated Mock Test',
          questions: savedQuestionIds.length > 0 ? savedQuestionIds : formattedQuestions,
          total_marks: formattedQuestions.length * 4,
          duration_minutes: params.duration || 180,
          status: 'created'
        })
        .select()
        .single()

      if (testError) {
        console.error('Error creating test:', testError)
        const testId = `ai-test-${Date.now()}`
        return NextResponse.json({
          success: true,
          test: {
            id: testId,
            user_id: user.id,
            test_type: 'ai_generated',
            title: params.title || 'AI Generated Mock Test',
            questions: formattedQuestions,
            total_marks: formattedQuestions.length * 4,
            duration_minutes: params.duration || 180,
            status: 'created',
            created_at: new Date().toISOString()
          },
          questions: formattedQuestions,
          questionCount: formattedQuestions.length,
          savedToDb: false,
          savedQuestions: savedQuestionIds.length
        })
      }

      return NextResponse.json({
        success: true,
        test,
        questions: formattedQuestions,
        questionCount: formattedQuestions.length,
        savedToDb: true,
        savedQuestions: savedQuestionIds.length
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

    // Fetch AI-generated questions from the questions bank
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('source', 'generated')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    // Transform to match frontend format
    const transformedQuestions = questions?.map(q => ({
      id: q.id,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      type: q.question_type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      numericalAnswer: q.numerical_answer,
      numericalTolerance: q.numerical_tolerance,
      assertion: q.assertion,
      reason: q.reason,
      explanation: q.explanation,
      marks: q.marks,
      negativeMarks: q.negative_marks,
      tags: q.tags || [],
      createdAt: q.created_at,
      updatedAt: q.updated_at
    })) || []

    return NextResponse.json({
      success: true,
      questions: transformedQuestions,
      count: transformedQuestions.length
    })
  } catch (error) {
    console.error('Error in GET /api/questions/generate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}