'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Test, TestResponse } from '@/types'
import { UnifiedQuestion, transformQuestion, transformDatabaseQuestion, transformAIQuestion, calculateTestScore } from '@/lib/utils/questionTransformer'
import QuestionDisplay from '@/components/test/QuestionDisplay'
import TestTimer from '@/components/test/TestTimer'
import QuestionPalette from '@/components/test/QuestionPalette'
import TestHeader from '@/components/test/TestHeader'
import SubmitModal from '@/components/test/SubmitModal'
import { ChevronLeft, ChevronRight, Flag, Save, Send, CheckCircle, BarChart, Eye } from 'lucide-react'
import { getDurationInSeconds } from '@/lib/utils/timeUtils'
import LatexRenderer from '@/components/test/LatexRenderer'
import { Toast } from '@/components/ui/Toast'

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const mode = searchParams.get('mode') || 'test'
  
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<UnifiedQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({})
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showMobilePalette, setShowMobilePalette] = useState(false)
  const [error, setError] = useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null)

  // Load test data
  useEffect(() => {
    loadTest()
  }, [params.id])

  const loadTest = async () => {
    try {
      setLoading(true)
      
      // Check authentication (skip for view mode)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user && mode !== 'view') {
        router.push('/auth')
        return
      }

      // Check if this is an AI-generated test stored in localStorage
      const testId = params.id as string
      const storedTest = localStorage.getItem(`ai_test_${testId}`)
      
      let test: Test
      let questions: UnifiedQuestion[]
      
      if (storedTest) {
        // Load AI-generated or practice test from localStorage
        const testData = JSON.parse(storedTest)
        test = testData.test
        
        // Transform questions to unified format
        questions = testData.questions.map((q: any) => {
          // Check if already in unified format
          if (q.questionType && q.content) {
            return q as UnifiedQuestion
          }
          // Transform using appropriate transformer
          return transformQuestion(q)
        }).filter((q: UnifiedQuestion | null) => q !== null) as UnifiedQuestion[]
      } else if (testId === 'demo-test-1') {
        // Quick test - fetch demo questions from database
        const response = await fetch('/api/questions/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceType: 'demo',
            count: 5,
            randomize: true
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }
        
        const data = await response.json()
        
        if (!data.questions || data.questions.length === 0) {
          // No demo questions found - show error message
          console.error('No demo questions found in database')
          setError({ 
            message: 'No practice questions available. Please try again later or select a different test.', 
            type: 'error' 
          })
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
          return
        }
        
        test = {
          id: testId,
          userId: user?.id || 'demo',
          testType: 'mock' as const,
          title: 'Quick Practice Test',
          questions: data.questions.map((q: any) => q.id),
          totalMarks: data.questions.reduce((sum: number, q: any) => sum + q.marks, 0),
          durationMinutes: 60,
          status: 'in_progress',
          createdAt: new Date().toISOString()
        }
        
        // Transform questions to unified format
        questions = data.questions.map((q: any) => transformDatabaseQuestion(q)).filter((q: any): q is UnifiedQuestion => q !== null)
      } else {
        // Load from database using API route to bypass RLS
        const response = await fetch(`/api/tests/${testId}`)
        
        if (!response.ok) {
          // Test not found
          router.push('/dashboard')
          return
        }
        
        const data = await response.json()
        test = data.test
        
        if (!data.questions || data.questions.length === 0) {
          console.error('No questions found for test:', testId)
          questions = []
        } else {
          // Transform database format to unified format
          questions = data.questions.map((question: any) => transformDatabaseQuestion(question)).filter((q: any): q is UnifiedQuestion => q !== null)
        }
      }

      setTest(test)
      setQuestions(questions)
      setTestStartTime(new Date())
      // Use utility function to ensure valid duration
      setTimeRemaining(getDurationInSeconds(test.durationMinutes, 60))
      
      // Load saved answers if any (from localStorage for now)
      const savedAnswers = localStorage.getItem(`test_${params.id}_answers`)
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers))
      }
      
      const savedMarked = localStorage.getItem(`test_${params.id}_marked`)
      if (savedMarked) {
        setMarkedForReview(new Set(JSON.parse(savedMarked)))
      }
    } catch (error) {
      console.error('Error loading test:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-save answers every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (test && Object.keys(answers).length > 0) {
        saveProgress()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(saveInterval)
  }, [answers, markedForReview])

  const saveProgress = async () => {
    setSaving(true)
    try {
      // Save current answers temporarily (will be used in handleSubmit)
      // This is just for the current session, not for persistence
      
      // Show success message
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 2000)
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleNavigate = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      // Calculate actual time taken
      const actualTimeTaken = test && testStartTime ? 
        Math.floor((new Date().getTime() - testStartTime.getTime()) / 1000) : 
        (test?.durationMinutes || 60) * 60 - timeRemaining
      
      // Calculate results using unified score calculator
      const scoreResult = calculateTestScore(questions, answers)
      
      // Track topic-wise performance
      const topicBreakdown: { [key: string]: { attempted: number, correct: number, totalTime: number } } = {}
      
      // Track difficulty-wise performance
      const difficultyBreakdown: { [key: string]: { attempted: number, correct: number } } = {
        'easy': { attempted: 0, correct: 0 },
        'medium': { attempted: 0, correct: 0 },
        'hard': { attempted: 0, correct: 0 }
      }
      
      questions.forEach((q: UnifiedQuestion) => {
        const topicName = q.topicId || 'General'
        
        if (!topicBreakdown[topicName]) {
          topicBreakdown[topicName] = { attempted: 0, correct: 0, totalTime: 0 }
        }
        
        const userAnswer = answers[q.id]
        if (userAnswer) {
          // Question was attempted
          topicBreakdown[topicName].attempted++
          topicBreakdown[topicName].totalTime += timeSpent[q.id] || 0
          
          const difficultyKey = q.difficulty || 'medium'
          if (difficultyBreakdown[difficultyKey]) {
            difficultyBreakdown[difficultyKey].attempted++
          }
          
          if (userAnswer === q.content.correctAnswer) {
            topicBreakdown[topicName].correct++
            if (difficultyBreakdown[difficultyKey]) {
              difficultyBreakdown[difficultyKey].correct++
            }
          }
        }
      })
      
      const attempted = scoreResult.correct + scoreResult.incorrect
      const unattempted = scoreResult.unattempted
      
      const testResult = {
        testId: params.id as string,
        testTitle: test?.title || 'Test',
        totalQuestions: questions.length,
        attempted,
        correct: scoreResult.correct,
        incorrect: scoreResult.incorrect,
        unattempted,
        score: scoreResult.totalScore,
        totalMarks: scoreResult.maxScore,
        percentage: scoreResult.percentage,
        timeTaken: actualTimeTaken,
        date: new Date().toISOString(),
        topicBreakdown,
        difficultyBreakdown,
        questionsData: questions, // Include all questions
        userAnswers: answers // Include user's answers
      }
      
      // Save to database
      const response = await fetch('/api/tests/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          testId: params.id,
          testResult
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save test result')
      }
      
      // For practice tests, store the result in localStorage
      if ((params.id as string).startsWith('practice-') || (params.id as string).startsWith('ai_test_')) {
        localStorage.setItem(`test_result_${data.result.id}`, JSON.stringify(testResult))
      }
      
      // Clear any localStorage data
      localStorage.removeItem(`test_${params.id}_answers`)
      localStorage.removeItem(`test_${params.id}_marked`)
      localStorage.removeItem(`ai_test_${params.id}`)
      
      // Redirect to result page with the saved result ID
      router.push(`/test/${params.id}/result?resultId=${data.result.id}`)
    } catch (error: any) {
      console.error('Error submitting test:', error)
      
      // Parse error details
      let errorMessage = 'Failed to submit test. Please try again.'
      
      if (error.message && error.message.includes('already submitted')) {
        errorMessage = error.message
        // For duplicate submission, show as warning instead of error
        setError({ message: errorMessage, type: 'warning' })
      } else if (error.message === 'Failed to save test result') {
        errorMessage = 'Unable to save your test result. Please check your internet connection and try again.'
        setError({ message: errorMessage, type: 'error' })
      } else if (error.message) {
        errorMessage = error.message
        setError({ message: errorMessage, type: 'error' })
      } else {
        setError({ message: errorMessage, type: 'error' })
      }
      
      // Auto-hide error after 7 seconds
      setTimeout(() => setError(null), 7000)
    } finally {
      setSaving(false)
      setShowSubmitModal(false)
    }
  }

  const handleTimeUp = () => {
    setError({ message: 'Time is up! Your test is being auto-submitted.', type: 'warning' })
    setTimeout(() => {
      handleSubmit()
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--background-elevated)] rounded-full shadow-lg mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-[var(--color-primary)] border-t-transparent"></div>
          </div>
          <p className="text-[var(--foreground-secondary)]">Preparing your test...</p>
        </div>
      </div>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="card-airbnb text-center p-8 animate-scale-in max-w-md">
          <h2 className="text-xl font-semibold mb-2">
            {!test ? 'Test Not Found' : 'No Questions Available'}
          </h2>
          <p className="text-[var(--foreground-secondary)] mb-6">
            {!test 
              ? 'The test you are looking for could not be found.'
              : (test as any).test_type === 'previous_year'
              ? 'This previous year paper has not been uploaded yet. Please check back later or try another paper.'
              : 'This test does not have any questions linked to it. Please contact support if this issue persists.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/previous-years')}
              className="btn-airbnb btn-airbnb-secondary"
            >
              Browse Papers
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-airbnb btn-airbnb-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Paper View Mode - Show all questions at once like a document
  if (mode === 'view') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{test?.title || 'Exam Paper'}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Duration: {test?.durationMinutes || 180} minutes</span>
                  <span>•</span>
                  <span>Total Marks: {questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                  <span>•</span>
                  <span>{questions.length} Questions</span>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Paper Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h2 className="font-semibold text-gray-900 mb-2">Instructions:</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Each correct answer carries {questions[0]?.marks || 4} marks</li>
              <li>• Each incorrect answer has a penalty of {questions[0]?.negativeMarks || 1} mark</li>
              <li>• Questions left unanswered will not be evaluated</li>
              <li>• This is a view-only mode for reference purposes</li>
            </ul>
          </div>

          {/* All Questions */}
          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow-sm border p-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          Marks: +{question.marks}/-{question.negativeMarks}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <div className="pl-11">
                  <LatexRenderer 
                    content={question.content.text}
                    className="text-gray-900 mb-4"
                  />
                  
                  {/* Assertion and Reason for assertion_reasoning questions */}
                  {question.questionType === 'assertion_reasoning' && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      {question.content.assertion && (
                        <div className="mb-3">
                          <span className="font-semibold text-gray-900">Assertion (A): </span>
                          <LatexRenderer content={question.content.assertion} className="inline text-gray-700" />
                        </div>
                      )}
                      {question.content.reason && (
                        <div>
                          <span className="font-semibold text-gray-900">Reason (R): </span>
                          <LatexRenderer content={question.content.reason} className="inline text-gray-700" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Question Diagram */}
                  {((question as any).hasDiagram || (question as any).diagramUrl) && (
                    <div className="my-4">
                      <img
                        src={(question as any).diagramUrl}
                        alt="Question diagram"
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                    </div>
                  )}

                  {/* Options for MCQ and Assertion Reasoning */}
                  {(question.questionType === 'mcq' || question.questionType === 'assertion_reasoning') && Array.isArray(question.content.options) && (
                    <div className="space-y-2">
                      {question.content.options.map((option: any, optIndex: number) => {
                        const optionLabel = String.fromCharCode(65 + optIndex)
                        const isCorrect = question.content.correctAnswer === option.id || 
                                        question.content.correctAnswer === option.text ||
                                        question.content.correctAnswer === optionLabel
                        
                        return (
                          <div
                            key={optIndex}
                            className={`flex items-start gap-3 p-3 rounded-lg ${
                              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}
                          >
                            <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-gray-600'}`}>
                              {optionLabel})
                            </span>
                            <div className={`flex-1 ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                              {option.latex ? (
                                <LatexRenderer 
                                  content={option.latex}
                                  className="inline-block"
                                />
                              ) : (
                                <span>{typeof option === 'string' ? option : option.text}</span>
                              )}
                              {isCorrect && (
                                <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Matching Question */}
                  {question.questionType === 'matching' && question.content?.options && typeof question.content.options === 'object' && !Array.isArray(question.content.options) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Column A */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">Column A</h4>
                          {(question.content.options as any).columnA?.map((item: any, idx: number) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded">
                              <span className="font-medium text-blue-600 mr-2">{idx + 1}.</span>
                              <LatexRenderer content={typeof item === 'string' ? item : item.text || item} className="inline text-gray-700" />
                            </div>
                          ))}
                        </div>
                        
                        {/* Column B */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">Column B</h4>
                          {(question.content.options as any).columnB?.map((item: any, idx: number) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded">
                              <span className="font-medium text-blue-600 mr-2">{String.fromCharCode(97 + idx)}.</span>
                              <LatexRenderer content={typeof item === 'string' ? item : item.text || item} className="inline text-gray-700" />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Correct Matches */}
                      {(question.content.options as any).correctMatches && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-green-700 font-medium">
                            Correct Matches: {JSON.stringify((question.content.options as any).correctMatches)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Numerical Answer */}
                  {question.questionType === 'numerical' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-700 font-medium">
                        Correct Answer: {question.content.correctAnswer}
                      </span>
                    </div>
                  )}

                  {/* Solution if available */}
                  {question.solution && question.solution.text && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Solution:</h4>
                      <LatexRenderer 
                        content={question.solution.text}
                        className="text-blue-800 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* End of Paper */}
          <div className="mt-12 text-center text-gray-500 font-medium">
            — End of Paper —
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered = !!answers[currentQuestion.id]
  const isMarked = markedForReview.has(currentQuestion.id)

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] flex flex-col">
      {/* Header */}
      <TestHeader
        testTitle={test.title}
        saving={saving}
        onSubmit={mode !== 'view' ? handleSubmit : () => {}}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Question Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <div className="card-airbnb animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="heading-airbnb-3 mb-1">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                      {currentQuestion.topicId ? currentQuestion.topicId.charAt(0).toUpperCase() + currentQuestion.topicId.slice(1) : 'Physics'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[var(--text-xs)] text-[var(--foreground-muted)] uppercase tracking-wide">Marking Scheme</p>
                      <p className="text-[var(--text-base)] font-semibold text-[var(--foreground)]">
                        +{currentQuestion.marks} / -{currentQuestion.negativeMarks}
                      </p>
                    </div>
                    <span className={`badge-airbnb ${
                      currentQuestion.difficulty === 'easy' ? 'badge-airbnb-success' :
                      currentQuestion.difficulty === 'medium' ? 'badge-airbnb-warning' :
                      'badge-airbnb-error'
                    }`}>
                      {currentQuestion.difficulty?.charAt(0).toUpperCase() + currentQuestion.difficulty?.slice(1)}
                    </span>
                  </div>
                </div>

                <QuestionDisplay
                  question={currentQuestion}
                  selectedAnswer={answers[currentQuestion.id]}
                  onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion.id, answer)}
                  showAnswer={mode === 'practice' || mode === 'view'}
                  mode={mode as 'test' | 'practice' | 'view'}
                />
              </div>

              {/* Navigation Buttons - Airbnb Style */}
              <div className="mt-8 flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleNavigate(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="btn-airbnb btn-airbnb-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  {mode === 'view' ? (
                    <button
                      onClick={() => handleNavigate(currentQuestionIndex + 1)}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="btn-airbnb btn-airbnb-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="btn-airbnb bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Finish Test
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigate(currentQuestionIndex + 1)}
                      className="btn-airbnb btn-airbnb-secondary flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {mode !== 'view' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswerSelect(currentQuestion.id, null)}
                      disabled={!isAnswered}
                      className="btn-airbnb btn-airbnb-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear Response
                    </button>
                    <button
                      onClick={() => handleMarkForReview(currentQuestion.id)}
                      className={`btn-airbnb flex items-center gap-2 ${
                        isMarked 
                        ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]' 
                        : 'btn-airbnb-secondary'
                    }`}
                  >
                    <Flag className="h-4 w-4" />
                    {isMarked ? 'Marked' : 'Mark for Review'}
                  </button>
                  <button
                    onClick={saveProgress}
                    disabled={saving}
                    className={`btn-airbnb flex items-center gap-2 transition-all ${
                      showSuccessMessage 
                        ? 'bg-[var(--color-success)] text-white' 
                        : 'btn-airbnb-primary'
                    } disabled:opacity-50`}
                  >
                    {showSuccessMessage ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Progress'}
                      </>
                    )}
                  </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Airbnb Style */}
        <div className="w-80 bg-[var(--background-elevated)] border-l border-[var(--border-color-light)] p-6">
          {/* Timer - hide in view mode */}
          {mode !== 'view' && (
            <div className="card-airbnb p-4 mb-6 border border-[var(--border-color-light)]">
              <TestTimer
                duration={test.durationMinutes * 60}
                onTimeUp={handleTimeUp}
                timeRemaining={timeRemaining}
                setTimeRemaining={setTimeRemaining}
              />
            </div>
          )}

          {/* View Mode Badge */}
          {mode === 'view' && (
            <div className="card-airbnb p-4 mb-6 border border-[var(--border-color-light)] bg-blue-50">
              <div className="flex items-center gap-2 text-blue-700">
                <Eye className="h-5 w-5" />
                <span className="font-semibold">View Mode</span>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Browsing paper with solutions
              </p>
            </div>
          )}

          {/* Question Palette */}
          <div className="card-airbnb p-4 mb-6 border border-[var(--border-color-light)]">
            <h3 className="text-[var(--text-base)] font-semibold text-[var(--foreground)] mb-4">Question Palette</h3>
            <QuestionPalette
              questions={questions}
              currentIndex={currentQuestionIndex}
              answers={mode === 'view' ? {} : answers}
              markedForReview={mode === 'view' ? new Set() : markedForReview}
              onQuestionSelect={handleNavigate}
            />
          </div>

          {/* Submit Button - hide in view mode */}
          {mode !== 'view' && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-airbnb w-full flex items-center justify-center gap-2 bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 mb-3"
            >
              <Send className="h-5 w-5" />
              Submit Test
            </button>
          )}
          
          {/* View Analytics Button - After test completion */}
          {currentQuestionIndex === questions.length - 1 && (
            <button
              onClick={() => router.push('/analytics')}
              className="btn-airbnb btn-airbnb-secondary w-full flex items-center justify-center gap-2 mb-6"
            >
              <BarChart className="h-5 w-5" />
              View Analytics
            </button>
          )}

          {/* Legend - Airbnb Style */}
          <div className="card-airbnb p-4 border border-[var(--border-color-light)]">
            <h3 className="text-[var(--text-sm)] font-semibold text-[var(--foreground)] mb-3 uppercase tracking-wide">Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[var(--color-success)] rounded-[var(--radius-sm)]"></div>
                <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[var(--color-error)] rounded-[var(--radius-sm)]"></div>
                <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Not Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[var(--color-warning)] rounded-[var(--radius-sm)]"></div>
                <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Marked for Review</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[var(--color-gray-light)] rounded-[var(--radius-sm)]"></div>
                <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Not Visited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit}
        answeredCount={Object.keys(answers).length}
        totalQuestions={questions.length}
        markedCount={markedForReview.size}
        unansweredCount={questions.length - Object.keys(answers).length}
      />
      
      {/* Error Toast */}
      {error && (
        <Toast
          message={error.message}
          type={error.type}
          onClose={() => setError(null)}
        />
      )}
    </div>
  )
}