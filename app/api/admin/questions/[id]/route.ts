import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch single question
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch question from database
    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (error) {
      console.error('Error fetching question:', error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    
    // Transform data to match frontend expectations
    const transformedQuestion = {
      id: question.id,
      topic: question.topic,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      type: question.question_type,
      question: question.question,
      options: question.options,
      correctAnswer: question.correct_answer,
      numericalAnswer: question.numerical_answer,
      numericalTolerance: question.numerical_tolerance,
      assertion: question.assertion,
      reason: question.reason,
      explanation: question.explanation,
      marks: question.marks,
      negativeMarks: question.negative_marks,
      tags: question.tags || [],
      createdAt: question.created_at,
      updatedAt: question.updated_at
    }
    
    return NextResponse.json({ 
      success: true, 
      question: transformedQuestion 
    })
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updateData = {
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
      updated_at: new Date().toISOString()
    }
    
    // Update in database
    const { data: updatedQuestion, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', params.id)
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

// DELETE - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Delete from database
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', params.id)
    
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