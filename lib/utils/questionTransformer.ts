// Unified Question Transformer
// This utility ensures consistent question structure across all test types

export interface UnifiedQuestion {
  id: string
  topicId: string
  questionType: 'mcq' | 'numerical' | 'assertion_reasoning' | 'matching' | 'statement' | 'matrix_match'
  content: {
    text: string
    latex?: string
    images?: string[]
    options?: Array<{
      id: string
      text: string
      latex?: string
    }>
    assertion?: string
    reason?: string
    columnA?: any[]
    columnB?: any[]
    correctMatches?: Record<string, string>
    correctAnswer?: string | number | string[]
  }
  marks: number
  negativeMarks: number
  difficulty: 'easy' | 'medium' | 'hard'
  solution?: {
    text: string
    latex?: string
    steps?: string[]
    images?: string[]
  }
  source: 'generated' | 'manual'
  tags: string[]
  hasDiagram?: boolean
  diagramUrl?: string
  hasLatex?: boolean
}

// Transform database question to unified format
export function transformDatabaseQuestion(question: any): UnifiedQuestion | null {
  if (!question) return null

  // Normalize question type (handle variations like 'statement 1', 'statement 2', etc.)
  let questionType = question.question_type || question.type || 'mcq'
  const originalType = questionType
  questionType = questionType.toLowerCase().trim()
  
  
  // Handle statement variations (statement 1, statement 2, statement-1, statement-2, etc.)
  // Also handle "STATEMENT-1 STATEMENT-2" type questions
  if (questionType.includes('statement')) {
    questionType = 'statement'
  }
  // Handle matrix matching variations
  if (questionType === 'matrix_match' || questionType === 'matrix matching' || questionType === 'matching' || questionType.includes('matrix') || questionType.includes('match')) {
    questionType = 'matching'
  }
  
  // Transform options based on question type and available data
  let options: any = []
  let assertion = ''
  let reason = ''
  let columnA: any[] = []
  let columnB: any[] = []
  let correctMatches: Record<string, string> = {}

  // Handle different option formats
  if (questionType === 'mcq' || questionType === 'statement') {
    // Check for options array
    if (Array.isArray(question.options) && question.options.length > 0) {
      options = question.options.map((opt: any, idx: number) => {
        if (typeof opt === 'string') {
          return {
            id: String.fromCharCode(65 + idx), // A, B, C, D
            text: opt,
            latex: opt.includes('$') || opt.includes('\\(') ? opt : undefined
          }
        } else if (opt && typeof opt === 'object') {
          return {
            id: opt.id || String.fromCharCode(65 + idx),
            text: opt.text || opt.value || '',
            latex: opt.latex || (opt.text?.includes('$') ? opt.text : undefined)
          }
        }
        return {
          id: String.fromCharCode(65 + idx),
          text: ''
        }
      })
    }
    // Check for separate option fields (option_a, option_b, etc.)
    else if (question.option_a || question.option_b || question.option_c || question.option_d) {
      if (question.option_a) {
        options.push({ 
          id: 'A', 
          text: question.option_a, 
          latex: question.option_a_latex || (question.option_a.includes('$') ? question.option_a : undefined)
        })
      }
      if (question.option_b) {
        options.push({ 
          id: 'B', 
          text: question.option_b, 
          latex: question.option_b_latex || (question.option_b.includes('$') ? question.option_b : undefined)
        })
      }
      if (question.option_c) {
        options.push({ 
          id: 'C', 
          text: question.option_c, 
          latex: question.option_c_latex || (question.option_c.includes('$') ? question.option_c : undefined)
        })
      }
      if (question.option_d) {
        options.push({ 
          id: 'D', 
          text: question.option_d, 
          latex: question.option_d_latex || (question.option_d.includes('$') ? question.option_d : undefined)
        })
      }
    }
    
    // For statement questions, ALWAYS use True/False options
    if (questionType === 'statement') {
      options = [
        { id: 'A', text: 'True' },
        { id: 'B', text: 'False' }
      ]
    }
  } else if (questionType === 'assertion_reasoning') {
    // Extract assertion and reason
    assertion = question.assertion || ''
    reason = question.reason || ''
    
    // Standard options for assertion-reasoning
    options = [
      { id: 'A', text: 'Both Assertion and Reason are true and Reason is the correct explanation of Assertion' },
      { id: 'B', text: 'Both Assertion and Reason are true but Reason is not the correct explanation of Assertion' },
      { id: 'C', text: 'Assertion is true but Reason is false' },
      { id: 'D', text: 'Assertion is false but Reason is true' },
      { id: 'E', text: 'Both Assertion and Reason are false' }
    ]
  } else if (questionType === 'matching') {
    
    // Try all possible locations for column data
    // 1. Direct properties (check all variations: column_a, columnA, column_i, columnI, etc.)
    const columnAValue = question.column_a || question.columnA || 
                         question.column_i || question.columnI || 
                         question.column_1 || question.column1
    const columnBValue = question.column_b || question.columnB || 
                         question.column_ii || question.columnII || 
                         question.column_2 || question.column2
    
    if (columnAValue) {
      columnA = Array.isArray(columnAValue) ? columnAValue : 
                (typeof columnAValue === 'string' ? JSON.parse(columnAValue) : [])
    }
    if (columnBValue) {
      columnB = Array.isArray(columnBValue) ? columnBValue : 
                (typeof columnBValue === 'string' ? JSON.parse(columnBValue) : [])
    }
    
    // 2. Check if columns are stored in options object
    if ((!columnA || columnA.length === 0) && question.options) {
      if (typeof question.options === 'object' && !Array.isArray(question.options)) {
        columnA = question.options.columnA || question.options.column_a || 
                  question.options.columnI || question.options.column_i ||
                  question.options.column1 || question.options.column_1 || []
        columnB = question.options.columnB || question.options.column_b || 
                  question.options.columnII || question.options.column_ii ||
                  question.options.column2 || question.options.column_2 || []
        correctMatches = question.options.correctMatches || question.options.correct_matches || {}
      }
    }
    
    // 3. If still no columns, create dummy data for testing
    if ((!columnA || columnA.length === 0) && (!columnB || columnB.length === 0)) {
      // Create dummy data if no columns found
      columnA = ['Item 1', 'Item 2', 'Item 3', 'Item 4']
      columnB = ['Match A', 'Match B', 'Match C', 'Match D']
    }
    
    correctMatches = question.correct_matches || question.correctMatches || correctMatches || {}
  }

  // Extract correct answer
  let correctAnswer = question.correct_answer || question.correctAnswer || ''
  
  // Normalize correct answer format
  if (typeof correctAnswer === 'string') {
    // Convert lowercase to uppercase for consistency
    correctAnswer = correctAnswer.toUpperCase()
  }

  
  const result = {
    id: question.id,
    topicId: question.topic_id || question.topicId || 'general',
    questionType: questionType as any,
    content: {
      text: question.question_text || question.question || question.text || '',
      latex: question.question_latex || undefined,
      images: question.images || [],
      options: options.length > 0 ? options : undefined,
      assertion,
      reason,
      columnA: columnA.length > 0 ? columnA : undefined,
      columnB: columnB.length > 0 ? columnB : undefined,
      correctMatches: Object.keys(correctMatches).length > 0 ? correctMatches : undefined,
      correctAnswer
    },
    marks: question.marks || 4,
    negativeMarks: question.negative_marks || question.negativeMarks || 1,
    difficulty: question.difficulty || 'medium',
    solution: question.solution || question.explanation ? {
      text: question.solution?.text || question.explanation || 'Solution not available',
      latex: question.solution?.latex,
      steps: question.solution?.steps,
      images: question.solution?.images
    } : undefined,
    source: question.source || question.source_type || 'database',
    tags: question.tags || question.concepts_tested || [],
    hasDiagram: question.has_diagram || question.hasDiagram || false,
    diagramUrl: question.diagram_url || question.diagramUrl,
    hasLatex: question.has_latex || 
              question.question_text?.includes('$') || 
              question.question_text?.includes('\\(') ||
              false
  }
  
  return result
}

// Transform AI-generated question to unified format
export function transformAIQuestion(question: any): UnifiedQuestion | null {
  if (!question) return null

  // AI questions might have different structure
  const questionType = question.type || question.questionType || 'mcq'
  
  let options: any = []
  
  if (question.options && Array.isArray(question.options)) {
    options = question.options.map((opt: any, idx: number) => {
      if (typeof opt === 'string') {
        return {
          id: String.fromCharCode(65 + idx),
          text: opt
        }
      }
      return {
        id: opt.id || String.fromCharCode(65 + idx),
        text: opt.text || opt.value || '',
        latex: opt.latex
      }
    })
  }

  return {
    id: question.id || `q${Math.random().toString(36).substr(2, 9)}`,
    topicId: question.topicId || question.topic || 'physics',
    questionType: questionType as any,
    content: {
      text: question.question || question.text || '',
      latex: question.latex,
      images: question.images || [],
      options: options.length > 0 ? options : undefined,
      correctAnswer: question.correctAnswer || question.answer || ''
    },
    marks: question.marks || 4,
    negativeMarks: question.negativeMarks || 1,
    difficulty: question.difficulty || 'medium',
    solution: question.solution ? {
      text: question.solution.text || question.solution || 'Solution not available',
      latex: question.solution.latex,
      steps: question.solution.steps
    } : undefined,
    source: 'generated',
    tags: question.tags || question.concepts || [],
    hasDiagram: false,
    hasLatex: question.question?.includes('$') || question.text?.includes('$') || false
  }
}

// Generic transformer that detects and applies the right transformation
export function transformQuestion(question: any): UnifiedQuestion | null {
  if (!question) return null
  
  // Check if it's already in unified format
  if (question.questionType && question.content) {
    return question as UnifiedQuestion
  }
  
  // Detect source and apply appropriate transformation
  if (question.source === 'ai_generated' || question.source === 'generated') {
    return transformAIQuestion(question)
  }
  
  return transformDatabaseQuestion(question)
}

// Transform multiple questions
export function transformQuestions(questions: any[]): UnifiedQuestion[] {
  if (!questions || !Array.isArray(questions)) return []
  
  return questions
    .map(q => transformQuestion(q))
    .filter((q): q is UnifiedQuestion => q !== null)
}

// Calculate score for a question
export function calculateQuestionScore(
  question: UnifiedQuestion,
  userAnswer: string | number | null,
  isCorrect?: boolean
): number {
  if (isCorrect === true) {
    return question.marks
  }
  
  if (isCorrect === false || (userAnswer && userAnswer !== question.content.correctAnswer)) {
    return -question.negativeMarks
  }
  
  return 0
}

// Calculate total score for a test
export function calculateTestScore(
  questions: UnifiedQuestion[],
  answers: Record<string, any>
): {
  totalScore: number
  maxScore: number
  percentage: number
  correct: number
  incorrect: number
  unattempted: number
} {
  let totalScore = 0
  let maxScore = 0
  let correct = 0
  let incorrect = 0
  let unattempted = 0

  questions.forEach(question => {
    maxScore += question.marks
    const userAnswer = answers[question.id]
    
    if (!userAnswer) {
      unattempted++
    } else if (userAnswer === question.content.correctAnswer) {
      correct++
      totalScore += question.marks
    } else {
      incorrect++
      totalScore -= question.negativeMarks
    }
  })

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return {
    totalScore,
    maxScore,
    percentage,
    correct,
    incorrect,
    unattempted
  }
}