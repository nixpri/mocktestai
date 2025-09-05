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
      topicId: q.topic_id,
      subject: q.subject,
      difficulty: q.difficulty,
      type: q.question_type,
      question: q.question_text,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      marks: q.marks,
      negativeMarks: q.negative_marks,
      tags: q.tags || [],
      sourceType: q.source_type,
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
      question_text: body.question,
      question_type: body.type,
      difficulty: body.difficulty,
      subject: body.subject || 'Physics',
      topic_id: body.topicId || null,
      options: body.options || null,
      correct_answer: body.correctAnswer || null,
      explanation: body.explanation || null,
      marks: body.marks || 4,
      negative_marks: body.negativeMarks || 1,
      tags: body.tags || [],
      source_type: 'manual',
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
      topicId: newQuestion.topic_id,
      subject: newQuestion.subject,
      difficulty: newQuestion.difficulty,
      type: newQuestion.question_type,
      question: newQuestion.question_text,
      options: newQuestion.options,
      correctAnswer: newQuestion.correct_answer,
      explanation: newQuestion.explanation,
      marks: newQuestion.marks,
      negativeMarks: newQuestion.negative_marks,
      tags: newQuestion.tags,
      sourceType: newQuestion.source_type,
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
    if (body.topicId !== undefined) updateData.topic_id = body.topicId
    if (body.subject) updateData.subject = body.subject
    if (body.type) updateData.question_type = body.type
    if (body.difficulty) updateData.difficulty = body.difficulty
    if (body.question) updateData.question_text = body.question
    if (body.options !== undefined) updateData.options = body.options
    if (body.correctAnswer !== undefined) updateData.correct_answer = body.correctAnswer
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
      topicId: updatedQuestion.topic_id,
      subject: updatedQuestion.subject,
      difficulty: updatedQuestion.difficulty,
      type: updatedQuestion.question_type,
      question: updatedQuestion.question_text,
      options: updatedQuestion.options,
      correctAnswer: updatedQuestion.correct_answer,
      explanation: updatedQuestion.explanation,
      marks: updatedQuestion.marks,
      negativeMarks: updatedQuestion.negative_marks,
      tags: updatedQuestion.tags,
      sourceType: updatedQuestion.source_type,
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