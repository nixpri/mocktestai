import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQuestion, generateMockTest } from '@/lib/ai/groq'

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error('GROQ_API_KEY not found in environment')
      return NextResponse.json(
        { 
          error: 'AI service not configured',
          details: 'GROQ_API_KEY is missing. Sign up for FREE at https://console.groq.com (no credit card required!) and add the key to your .env.local file.'
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
    
    // Ensure user has a profile (required for RLS policies)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      // Create profile if it doesn't exist using upsert to avoid conflicts
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          is_admin: false
        }, {
          onConflict: 'id'
        })
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Continue anyway - profile might exist but have different RLS rules
      }
    }
    
    const body = await request.json()
    const { type, params } = body
    
    if (type === 'single') {
      // Generate a single question
      const question = await generateQuestion(params)
      
      // Save to questions bank with proper format
      try {
        const questionData = {
          question_text: question.question,
          question_type: params.questionType || 'mcq',
          difficulty: params.difficulty || 'medium',
          subject: 'Physics',
          topic_id: null, // TODO: Map topic to topic_id
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
      const savedQuestionIds: string[] = []
      
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
            question_text: q.question,
            question_type: 'mcq',
            difficulty: q.estimatedTime <= 2 ? 'easy' : q.estimatedTime <= 3 ? 'medium' : 'hard',
            subject: 'Physics',
            topic_id: null, // TODO: Map topic to topic_id
            options: formattedOptions,
            correct_answer: String(q.correctAnswer || 'A').toUpperCase(),
            explanation: q.solution || (q as any).explanation || null,
            marks: 4,
            negative_marks: 1,
            tags: q.concepts || [],
            source_type: 'ai_generated',
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
      
      // Create test in database
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          created_by: user.id,
          test_type: 'ai_generated',
          title: params.title || 'AI Generated Mock Test',
          description: 'AI-generated test based on your preferences',
          subject: 'Physics',
          total_questions: formattedQuestions.length,
          total_marks: formattedQuestions.length * 4,
          duration_minutes: params.duration || 180,
          difficulty_level: 'mixed', // AI-generated tests have mixed difficulty
          is_public: false,
          is_active: true,
          published_at: new Date().toISOString()
        })
        .select()
        .single()

      if (testError) {
        console.error('Error creating test:', testError)
        throw new Error('Failed to create test in database: ' + testError.message)
      }

      // Link questions to the test
      if (savedQuestionIds.length > 0 && test) {
        const testQuestionLinks = savedQuestionIds.map((questionId, index) => ({
          test_id: test.id,
          question_id: questionId,
          sequence_number: index + 1,
          section: 'Physics'
        }))

        const { error: linkError } = await supabase
          .from('test_questions')
          .insert(testQuestionLinks)

        if (linkError) {
          console.error('Error linking questions to test:', linkError)
        }
      }

      return NextResponse.json({
        success: true,
        test: {
          id: test.id,
          userId: user.id,
          testType: 'ai_generated',
          title: params.title || 'AI Generated Mock Test',
          questions: formattedQuestions,
          totalMarks: formattedQuestions.length * 4,
          durationMinutes: params.duration || 180,
          status: 'created',
          createdAt: test.created_at
        },
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