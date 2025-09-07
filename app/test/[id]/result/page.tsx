'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Trophy, Target, Clock, BarChart3, CheckCircle, XCircle, AlertCircle, Brain, Download, Share2, RefreshCw, TrendingUp, Award, Zap, BookOpen, ArrowRight, Sparkles, Eye, EyeOff, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LatexRenderer from '@/components/test/LatexRenderer'
import { formatDuration } from '@/lib/utils/timeUtils'
import { transformDatabaseQuestion, UnifiedQuestion } from '@/lib/utils/questionTransformer'
import QuestionDisplay from '@/components/test/QuestionDisplay'

interface TestResult {
  testId: string
  testTitle: string
  totalQuestions: number
  attempted: number
  correct: number
  incorrect: number
  unattempted: number
  score: number
  totalMarks: number
  percentage: number
  timeTaken: number
  date: string
  topicBreakdown?: any
  difficultyBreakdown?: any
  questionsData?: UnifiedQuestion[]
  userAnswers?: { [key: string]: any }
}

export default function TestResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSolutions, setShowSolutions] = useState(false)
  const [activeQuestionTab, setActiveQuestionTab] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all')
  const supabase = createClient()

  useEffect(() => {
    loadResult()
  }, [params.id, searchParams])

  const loadResult = async () => {
    try {
      const resultId = searchParams.get('resultId')
      
      if (!resultId) {
        console.log('No result ID provided')
        router.push('/dashboard')
        return
      }
      
      // Check if this is a local practice test result
      if (resultId.startsWith('local-')) {
        const localResult = localStorage.getItem(`test_result_${resultId}`)
        if (localResult) {
          setResult(JSON.parse(localResult))
          return
        }
      }
      
      const { data: testResult, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('id', resultId)
        .single()
      
      if (error || !testResult) {
        console.error('Error fetching test result:', error)
        router.push('/dashboard')
        return
      }
      
      // Transform questions to unified format
      const transformedQuestions = (testResult.questions_data || [])
        .map((q: any) => transformDatabaseQuestion(q))
        .filter((q: UnifiedQuestion | null): q is UnifiedQuestion => q !== null)
      
      const displayResult: TestResult = {
        testId: testResult.test_id,
        testTitle: testResult.test_title || 'Test',
        totalQuestions: testResult.total_questions,
        attempted: testResult.attempted_questions,
        correct: testResult.correct_answers,
        incorrect: testResult.wrong_answers,
        unattempted: testResult.total_questions - testResult.attempted_questions,
        score: testResult.total_marks_obtained,
        totalMarks: testResult.total_marks,
        percentage: testResult.percentage,
        timeTaken: testResult.time_taken_minutes * 60,
        date: testResult.created_at,
        topicBreakdown: testResult.topic_breakdown || {},
        difficultyBreakdown: testResult.difficulty_breakdown || {},
        questionsData: transformedQuestions,
        userAnswers: testResult.user_answers || {}
      }
      
      setResult(displayResult)
    } catch (error) {
      console.error('Error loading result:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceLevel = () => {
    if (!result) return { level: '', message: '', color: '' }
    
    if (result.percentage >= 90) return { 
      level: 'Outstanding!', 
      message: 'You\'re among the top performers!',
      color: 'from-[var(--color-success)] to-emerald-600',
      textColor: 'text-[var(--color-success)]'
    }
    if (result.percentage >= 75) return { 
      level: 'Excellent!', 
      message: 'Great job! Keep up the good work.',
      color: 'from-[var(--color-info)] to-blue-500',
      textColor: 'text-[var(--color-info)]'
    }
    if (result.percentage >= 60) return { 
      level: 'Good Progress!', 
      message: 'You\'re on the right track.',
      color: 'from-[var(--color-primary)] to-cyan-500',
      textColor: 'text-[var(--color-primary)]'
    }
    if (result.percentage >= 40) return { 
      level: 'Keep Going!', 
      message: 'Practice makes perfect.',
      color: 'from-[var(--color-warning)] to-amber-500',
      textColor: 'text-[var(--color-warning)]'
    }
    return { 
      level: 'Room for Improvement', 
      message: 'Every expert was once a beginner.',
      color: 'from-gray-400 to-gray-500',
      textColor: 'text-gray-600'
    }
  }

  const filteredQuestions = () => {
    if (!result?.questionsData) return []
    
    return result.questionsData.filter((question: any) => {
      const userAnswer = result.userAnswers?.[question.id]
      const wasAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== ''
      
      let isCorrect = false
      if (question.questionType === 'numerical' || question.type === 'numerical') {
        const numericalAnswer = question.content?.numericalAnswer || question.numericalAnswer || question.numerical_answer
        const tolerance = question.content?.numericalTolerance || question.numericalTolerance || question.numerical_tolerance || 0.01
        if (numericalAnswer !== undefined && userAnswer !== undefined) {
          const userNum = parseFloat(userAnswer)
          const correctNum = parseFloat(numericalAnswer)
          isCorrect = Math.abs(userNum - correctNum) <= tolerance
        }
      } else {
        const correctAnswer = question.content?.correctAnswer || question.correctAnswer || question.correct_answer || ''
        isCorrect = userAnswer?.toString().toLowerCase() === correctAnswer?.toString().toLowerCase()
      }
      
      switch(activeQuestionTab) {
        case 'correct': return wasAttempted && isCorrect
        case 'incorrect': return wasAttempted && !isCorrect
        case 'unattempted': return !wasAttempted
        default: return true
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Brain className="h-12 w-12 text-[var(--color-primary)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--foreground-secondary)]">Calculating your results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-error)]">Result not found</p>
          <Link href="/dashboard" className="mt-4 text-[var(--color-primary)] hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const performance = getPerformanceLevel()

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      {/* Header */}
      <nav className="bg-[var(--background-elevated)] border-b border-[var(--border-color-light)]">
        <div className="container-airbnb">
          <div className="flex justify-between h-[72px] items-center">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-[var(--color-primary)]" />
              <span className="text-[var(--text-xl)] font-semibold text-[var(--foreground)]">MockTest AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-[var(--background-secondary)] rounded-[var(--radius-sm)] transition-colors">
                <Download className="h-5 w-5 text-[var(--foreground-secondary)]" />
              </button>
              <button className="p-2 hover:bg-[var(--background-secondary)] rounded-[var(--radius-sm)] transition-colors">
                <Share2 className="h-5 w-5 text-[var(--foreground-secondary)]" />
              </button>
              <Link 
                href="/dashboard" 
                className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors text-[var(--text-sm)]"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Score Display */}
      <div className={`bg-gradient-to-br ${performance.color} py-12`}>
        <div className="container-airbnb">
          <div className="text-center text-white animate-fade-in">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-white/90" />
            <h1 className="text-3xl font-bold mb-2">{performance.level}</h1>
            <p className="text-lg text-white/90 mb-6">{performance.message}</p>
            
            <div className="inline-flex bg-white/20 backdrop-blur-md rounded-[var(--radius-xl)] px-12 py-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{result.score}</div>
                <div className="text-sm text-white/90 mb-3">out of {result.totalMarks}</div>
                <div className="text-3xl font-bold text-white/95">{result.percentage}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-airbnb py-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 -mt-8">
          <div className="card-airbnb p-6 border border-[var(--border-color-light)] bg-white animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-3">
              <Target className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-2xl font-bold text-[var(--foreground)]">{result.attempted}</span>
            </div>
            <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Attempted</p>
            <div className="mt-2 h-1 bg-[var(--background-secondary)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-primary)]" 
                style={{width: `${(result.attempted / result.totalQuestions) * 100}%`}}
              />
            </div>
          </div>

          <div className="card-airbnb p-6 border border-[var(--border-color-light)] bg-white animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />
              <span className="text-2xl font-bold text-[var(--color-success)]">{result.correct}</span>
            </div>
            <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Correct</p>
            <div className="mt-2 h-1 bg-[var(--background-secondary)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-success)]" 
                style={{width: `${(result.correct / result.totalQuestions) * 100}%`}}
              />
            </div>
          </div>

          <div className="card-airbnb p-6 border border-[var(--border-color-light)] bg-white animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-3">
              <XCircle className="h-5 w-5 text-[var(--color-error)]" />
              <span className="text-2xl font-bold text-[var(--color-error)]">{result.incorrect}</span>
            </div>
            <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Incorrect</p>
            <div className="mt-2 h-1 bg-[var(--background-secondary)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-error)]" 
                style={{width: `${(result.incorrect / result.totalQuestions) * 100}%`}}
              />
            </div>
          </div>

          <div className="card-airbnb p-6 border border-[var(--border-color-light)] bg-white animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-5 w-5 text-[var(--color-info)]" />
              <span className="text-2xl font-bold text-[var(--foreground)]">{formatDuration(Math.floor(result.timeTaken / 60))}</span>
            </div>
            <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Minutes</p>
            <div className="mt-2 text-[var(--text-xs)] text-[var(--foreground-muted)]">
              Avg: {Math.round(result.timeTaken / result.attempted)}s per question
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Topic Performance */}
          {result.topicBreakdown && Object.keys(result.topicBreakdown).length > 0 && (
            <div className="card-airbnb p-6">
              <h3 className="heading-airbnb-4 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                Topic Performance
              </h3>
              <div className="space-y-3">
                {Object.entries(result.topicBreakdown).map(([topic, data]: [string, any]) => {
                  const accuracy = data.attempted > 0 ? (data.correct / data.attempted) * 100 : 0
                  return (
                    <div key={topic}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[var(--text-sm)] font-medium capitalize">{topic}</span>
                        <span className={`text-[var(--text-sm)] font-semibold ${
                          accuracy >= 80 ? performance.textColor :
                          accuracy >= 60 ? 'text-[var(--color-warning)]' :
                          'text-[var(--color-error)]'
                        }`}>
                          {Math.round(accuracy)}%
                        </span>
                      </div>
                      <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            accuracy >= 80 ? 'bg-[var(--color-success)]' :
                            accuracy >= 60 ? 'bg-[var(--color-warning)]' :
                            'bg-[var(--color-error)]'
                          }`}
                          style={{width: `${accuracy}%`}}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[var(--text-xs)] text-[var(--foreground-muted)]">
                          {data.correct}/{data.attempted} correct
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Difficulty Analysis */}
          {result.difficultyBreakdown && Object.keys(result.difficultyBreakdown).length > 0 && (
            <div className="card-airbnb p-6">
              <h3 className="heading-airbnb-4 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--color-info)]" />
                Difficulty Analysis
              </h3>
              <div className="space-y-4">
                {Object.entries(result.difficultyBreakdown).map(([difficulty, data]: [string, any]) => {
                  const accuracy = data.attempted > 0 ? (data.correct / data.attempted) * 100 : 0
                  const difficultyConfig = {
                    'Easy': { color: 'bg-[var(--color-success)]', icon: '🟢' },
                    'Medium': { color: 'bg-[var(--color-warning)]', icon: '🟡' },
                    'Hard': { color: 'bg-[var(--color-error)]', icon: '🔴' }
                  }
                  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.Medium
                  
                  return (
                    <div key={difficulty} className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-[var(--radius-sm)]">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{config.icon}</span>
                        <div>
                          <p className="font-medium text-[var(--text-sm)]">{difficulty}</p>
                          <p className="text-[var(--text-xs)] text-[var(--foreground-muted)]">
                            {data.correct}/{data.attempted} solved
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[var(--foreground)]">{Math.round(accuracy)}%</p>
                        <p className="text-[var(--text-xs)] text-[var(--foreground-muted)]">accuracy</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Questions Review Section */}
        <div className="card-airbnb p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-airbnb-3">Question Review</h3>
            <button
              onClick={() => setShowSolutions(!showSolutions)}
              className={`btn-airbnb flex items-center gap-2 ${
                showSolutions 
                  ? 'btn-airbnb-secondary' 
                  : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
              }`}
            >
              {showSolutions ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Solutions
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Correct Answers & Solutions
                </>
              )}
            </button>
          </div>

          {/* Question Filter Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-[var(--background-secondary)] rounded-[var(--radius-base)] inline-flex">
            {[
              { id: 'all', label: 'All Questions', count: result.totalQuestions },
              { id: 'correct', label: 'Correct', count: result.correct, color: 'text-[var(--color-success)]' },
              { id: 'incorrect', label: 'Incorrect', count: result.incorrect, color: 'text-[var(--color-error)]' },
              { id: 'unattempted', label: 'Skipped', count: result.unattempted, color: 'text-[var(--color-warning)]' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveQuestionTab(tab.id as any)}
                className={`px-4 py-2 rounded-[var(--radius-sm)] font-medium transition-all text-sm ${
                  activeQuestionTab === tab.id 
                    ? 'bg-white shadow-sm text-[var(--foreground)]' 
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <span className={tab.color}>{tab.label}</span>
                <span className="ml-2 text-[var(--foreground-muted)]">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions().map((question: UnifiedQuestion, index: number) => {
              const userAnswer = result.userAnswers?.[question.id]
              const correctAnswer = question.content?.correctAnswer
              
              const isCorrect = userAnswer === correctAnswer
              const wasAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== ''
              
              return (
                <div key={question.id} className="border border-[var(--border-color-light)] rounded-[var(--radius-base)] overflow-hidden hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          wasAttempted ? (isCorrect ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]') : 'bg-[var(--color-warning)]'
                        }`}>
                          {wasAttempted ? (isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />) : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-[var(--text-sm)] font-medium text-[var(--foreground)]">
                            Question {index + 1}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[var(--text-xs)] px-2 py-0.5 bg-[var(--background-secondary)] rounded-full text-[var(--foreground-muted)]">
                              {question.topicId || 'General'}
                            </span>
                            <span className="text-[var(--text-xs)] px-2 py-0.5 bg-[var(--background-secondary)] rounded-full text-[var(--foreground-muted)]">
                              {question.difficulty || 'Medium'}
                            </span>
                            <span className="text-[var(--text-xs)] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                              {question.questionType.toUpperCase().replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--text-sm)] font-semibold text-[var(--foreground)]">
                          {wasAttempted ? (isCorrect ? `+${question.marks}` : `-${question.negativeMarks}`) : '0'} marks
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <QuestionDisplay
                        question={question}
                        selectedAnswer={userAnswer}
                        onAnswerSelect={() => {}}
                        showAnswer={showSolutions}
                        mode="view"
                      />
                    </div>

                    {/* User's Answer Display for non-MCQ types that QuestionDisplay doesn't show */}
                    {showSolutions && wasAttempted && !isCorrect && (
                      <div className="p-3 bg-[var(--color-error)]/5 border border-[var(--color-error)]/20 rounded-[var(--radius-sm)] mb-4">
                        <p className="text-[var(--text-xs)] text-[var(--color-error)] font-semibold mb-1">Your Answer:</p>
                        <p className="text-[var(--text-sm)] text-[var(--foreground)]">{userAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Link href="/test/demo-test-1" className="group">
            <div className="card-airbnb p-6 hover-lift text-center transition-all">
              <RefreshCw className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-3" />
              <h3 className="heading-airbnb-4 mb-2">Retry Test</h3>
              <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)] mb-3">
                Practice the same concepts again
              </p>
              <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] mx-auto group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link href="/test/generate" className="group">
            <div className="card-airbnb p-6 hover-lift text-center transition-all">
              <Sparkles className="h-8 w-8 text-[var(--color-info)] mx-auto mb-3" />
              <h3 className="heading-airbnb-4 mb-2">New Test</h3>
              <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)] mb-3">
                Generate a fresh AI test
              </p>
              <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] mx-auto group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link href="/analytics" className="group">
            <div className="card-airbnb p-6 hover-lift text-center transition-all">
              <BarChart3 className="h-8 w-8 text-[var(--color-success)] mx-auto mb-3" />
              <h3 className="heading-airbnb-4 mb-2">Analytics</h3>
              <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)] mb-3">
                Track your progress
              </p>
              <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] mx-auto group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}