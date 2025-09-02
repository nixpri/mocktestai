export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  subscriptionTier: 'free' | 'pro' | 'institute'
  totalTestsTaken: number
  studyStreak: number
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  name: string
  description?: string
  orderIndex: number
  parentId?: string
  subtopics?: Topic[]
}

export interface Question {
  id: string
  topicId: string
  content: {
    text: string
    latex?: string
    images?: string[]
    options?: {
      id: string
      text: string
      latex?: string
    }[]
    correctAnswer?: string | number
  }
  questionType: 'mcq' | 'numerical' | 'assertion_reasoning'
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  negativeMarks: number
  solution?: {
    text: string
    latex?: string
    steps?: string[]
    images?: string[]
  }
  source: 'generated' | 'manual' | 'previous_year'
  year?: number
  tags: string[]
  validationScore?: number
}

export interface Test {
  id: string
  userId: string
  testType: 'mock' | 'topic_wise' | 'custom' | 'daily_practice' | 'quick'
  title: string
  questions: string[] // Array of question IDs
  totalMarks: number
  durationMinutes: number
  startedAt?: string
  submittedAt?: string
  status: 'created' | 'in_progress' | 'completed' | 'abandoned'
  createdAt: string
}

export interface TestResponse {
  id: string
  testId: string
  userId: string
  questionId: string
  userAnswer: any
  isCorrect: boolean
  marksObtained: number
  timeSpentSeconds: number
  markedForReview: boolean
}

export interface TestResult {
  id: string
  testId: string
  userId: string
  totalQuestions: number
  attemptedQuestions: number
  correctAnswers: number
  wrongAnswers: number
  totalMarksObtained: number
  totalMarks: number
  percentage: number
  timeTakenMinutes: number
  rank?: number
  percentile?: number
}