import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all questions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch questions from database
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform data to match frontend expectations
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
      questions: transformedQuestions 
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new question
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.question || !body.topic || !body.difficulty || !body.type) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }
    
    // Validate based on question type
    if (body.type === 'mcq') {
      if (!body.options || !body.correctAnswer) {
        return NextResponse.json({ 
          error: 'MCQ questions require options and correct answer' 
        }, { status: 400 })
      }
    } else if (body.type === 'numerical') {
      if (body.numericalAnswer === undefined) {
        return NextResponse.json({ 
          error: 'Numerical questions require a numerical answer' 
        }, { status: 400 })
      }
    } else if (body.type === 'assertion') {
      if (!body.assertion || !body.reason || !body.correctAnswer) {
        return NextResponse.json({ 
          error: 'Assertion questions require assertion, reason, and correct answer' 
        }, { status: 400 })
      }
    }
    
    // Transform data for database
    const questionData = {
      topic: body.topic,
      subtopic: body.subtopic,
      question_type: body.type,
      difficulty: body.difficulty,
      question: body.question,
      options: body.options || null,
      correct_answer: body.correctAnswer || null,
      numerical_answer: body.numericalAnswer || null,
      numerical_tolerance: body.numericalTolerance || 0.01,
      assertion: body.assertion || null,
      reason: body.reason || null,
      explanation: body.explanation || null,
      marks: body.marks || 4,
      negative_marks: body.negativeMarks || 1,
      tags: body.tags || [],
      source: 'manual',
      created_by: user.id
    }
    
    // Insert into database
    const { data: newQuestion, error } = await supabase
      .from('questions')
      .insert(questionData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform response
    const transformedQuestion = {
      id: newQuestion.id,
      topic: newQuestion.topic,
      subtopic: newQuestion.subtopic,
      difficulty: newQuestion.difficulty,
      type: newQuestion.question_type,
      question: newQuestion.question,
      options: newQuestion.options,
      correctAnswer: newQuestion.correct_answer,
      numericalAnswer: newQuestion.numerical_answer,
      numericalTolerance: newQuestion.numerical_tolerance,
      assertion: newQuestion.assertion,
      reason: newQuestion.reason,
      explanation: newQuestion.explanation,
      marks: newQuestion.marks,
      negativeMarks: newQuestion.negative_marks,
      tags: newQuestion.tags,
      createdAt: newQuestion.created_at,
      updatedAt: newQuestion.updated_at
    }
    
    return NextResponse.json({ 
      success: true, 
      question: transformedQuestion 
    })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing question
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json({ 
        error: 'Question ID is required' 
      }, { status: 400 })
    }
    
    // Transform data for database
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    // Only update fields that are provided
    if (body.topic) updateData.topic = body.topic
    if (body.subtopic !== undefined) updateData.subtopic = body.subtopic
    if (body.type) updateData.question_type = body.type
    if (body.difficulty) updateData.difficulty = body.difficulty
    if (body.question) updateData.question = body.question
    if (body.options !== undefined) updateData.options = body.options
    if (body.correctAnswer !== undefined) updateData.correct_answer = body.correctAnswer
    if (body.numericalAnswer !== undefined) updateData.numerical_answer = body.numericalAnswer
    if (body.numericalTolerance !== undefined) updateData.numerical_tolerance = body.numericalTolerance
    if (body.assertion !== undefined) updateData.assertion = body.assertion
    if (body.reason !== undefined) updateData.reason = body.reason
    if (body.explanation !== undefined) updateData.explanation = body.explanation
    if (body.marks !== undefined) updateData.marks = body.marks
    if (body.negativeMarks !== undefined) updateData.negative_marks = body.negativeMarks
    if (body.tags !== undefined) updateData.tags = body.tags
    
    // Update in database
    const { data: updatedQuestion, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform response
    const transformedQuestion = {
      id: updatedQuestion.id,
      topic: updatedQuestion.topic,
      subtopic: updatedQuestion.subtopic,
      difficulty: updatedQuestion.difficulty,
      type: updatedQuestion.question_type,
      question: updatedQuestion.question,
      options: updatedQuestion.options,
      correctAnswer: updatedQuestion.correct_answer,
      numericalAnswer: updatedQuestion.numerical_answer,
      numericalTolerance: updatedQuestion.numerical_tolerance,
      assertion: updatedQuestion.assertion,
      reason: updatedQuestion.reason,
      explanation: updatedQuestion.explanation,
      marks: updatedQuestion.marks,
      negativeMarks: updatedQuestion.negative_marks,
      tags: updatedQuestion.tags,
      createdAt: updatedQuestion.created_at,
      updatedAt: updatedQuestion.updated_at
    }
    
    return NextResponse.json({ 
      success: true, 
      question: transformedQuestion 
    })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a question
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('id')
    
    if (!questionId) {
      return NextResponse.json({ 
        error: 'Question ID is required' 
      }, { status: 400 })
    }
    
    // Delete from database
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)
    
    if (error) {
      console.error('Error deleting question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Question deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}