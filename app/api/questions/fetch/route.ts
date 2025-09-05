import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Fetch questions by criteria
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { 
      topic, 
      difficulty, 
      questionType,
      count = 5,
      sourceType,
      randomize = true 
    } = body
    
    // First, let's check what sources we have in the database
    const { data: allQuestions } = await supabase
      .from('questions')
      .select('source_type, topic, question_type')
      .limit(20)
    
    console.log('Total questions in DB:', allQuestions?.length || 0)
    console.log('Available sources in DB:', [...new Set(allQuestions?.map(q => q.source_type) || [])])
    console.log('Sample questions:', allQuestions?.slice(0, 3))
    
    // Build query
    let query = supabase
      .from('questions')
      .select('*')
    
    // Apply filters
    if (topic && topic !== 'all') {
      // For now, filter by subject instead of topic
      // TODO: Update to use topic_id once topics are properly mapped
      query = query.eq('subject', 'Physics')
    }
    
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }
    
    if (questionType && questionType !== 'all') {
      query = query.eq('question_type', questionType)
    }
    
    if (sourceType) {
      query = query.eq('source_type', sourceType)
    }
    
    // Execute query
    const { data: questions, error } = await query
    
    console.log('Query filters:', { topic, difficulty, questionType, sourceType, count })
    console.log('Questions found:', questions?.length || 0)
    if (questions && questions.length > 0) {
      console.log('First question source:', questions[0].source_type)
    }
    
    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Randomize and limit if needed
    let selectedQuestions = questions || []
    
    if (randomize && selectedQuestions.length > 0) {
      // Shuffle array
      for (let i = selectedQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]]
      }
    }
    
    // Limit to requested count
    selectedQuestions = selectedQuestions.slice(0, count)
    
    // Transform data to match frontend expectations
    const transformedQuestions = selectedQuestions.map(q => ({
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
      source: q.source,
      createdAt: q.created_at,
      updatedAt: q.updated_at
    }))
    
    return NextResponse.json({ 
      success: true, 
      questions: transformedQuestions,
      totalFound: questions?.length || 0,
      returned: transformedQuestions.length
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get question statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get counts by topic and difficulty
    const { data: stats, error } = await supabase
      .from('questions')
      .select('topic, difficulty, question_type')
    
    if (error) {
      console.error('Error fetching question stats:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Calculate statistics
    const topicCounts: Record<string, number> = {}
    const difficultyCounts: Record<string, number> = {}
    const typeCounts: Record<string, number> = {}
    
    stats?.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1
      difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1
      typeCounts[q.question_type] = (typeCounts[q.question_type] || 0) + 1
    })
    
    return NextResponse.json({ 
      success: true,
      total: stats?.length || 0,
      byTopic: topicCounts,
      byDifficulty: difficultyCounts,
      byType: typeCounts
    })
  } catch (error) {
    console.error('Error fetching question stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}