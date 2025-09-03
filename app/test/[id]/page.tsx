'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Question, Test, TestResponse } from '@/types'
import QuestionDisplay from '@/components/test/QuestionDisplay'
import TestTimer from '@/components/test/TestTimer'
import QuestionPalette from '@/components/test/QuestionPalette'
import TestHeader from '@/components/test/TestHeader'
import SubmitModal from '@/components/test/SubmitModal'
import { ChevronLeft, ChevronRight, Flag, Save, Send, CheckCircle, BarChart } from 'lucide-react'

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
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

  // Load test data
  useEffect(() => {
    loadTest()
  }, [params.id])

  const loadTest = async () => {
    try {
      setLoading(true)
      
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Check if this is an AI-generated test stored in localStorage
      const testId = params.id as string
      const storedTest = localStorage.getItem(`ai_test_${testId}`)
      
      let test: Test
      let questions: Question[]
      
      if (storedTest) {
        // Load AI-generated test from localStorage
        const testData = JSON.parse(storedTest)
        test = testData.test
        
        // Transform questions to ensure they have the correct structure
        questions = testData.questions.map((q: any) => {
          // Check if question already has the correct structure
          if (q.content && q.content.text) {
            return q
          }
          
          // Transform old format to new format
          return {
            id: q.id || `q${Math.random().toString(36).substr(2, 9)}`,
            topicId: q.topicId || 'physics',
            content: {
              text: q.question || q.text || '',
              options: q.options || [],
              correctAnswer: q.correctAnswer || ''
            },
            questionType: q.questionType || 'mcq',
            difficulty: q.difficulty || 'medium',
            marks: q.marks || 4,
            negativeMarks: q.negativeMarks || 1,
            solution: q.solution || { text: 'Solution not available' },
            source: q.source || 'generated',
            tags: q.tags || q.concepts || []
          }
        })
      } else if (testId === 'demo-test-1') {
        // Quick test - fetch demo questions from database
        const response = await fetch('/api/questions/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'demo',
            count: 5,
            randomize: true
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }
        
        const data = await response.json()
        
        if (!data.questions || data.questions.length === 0) {
          // No demo questions found - show error
          console.error('No demo questions found in database')
          router.push('/dashboard')
          return
        }
        
        test = {
          id: testId,
          userId: user.id,
          testType: 'quick',
          title: 'Quick Practice Test',
          questions: data.questions.map((q: any) => q.id),
          totalMarks: data.questions.reduce((sum: number, q: any) => sum + q.marks, 0),
          durationMinutes: 60,
          status: 'in_progress',
          createdAt: new Date().toISOString()
        }
        
        // Transform questions to match expected format
        questions = data.questions.map((q: any) => {
          // Handle options - they might be JSONB array or already parsed
          let formattedOptions: any[] = []
          if (q.type === 'mcq' && q.options) {
            // Check if options is already an array
            const optionsArray = Array.isArray(q.options) ? q.options : 
                                (typeof q.options === 'string' ? JSON.parse(q.options) : [])
            
            formattedOptions = optionsArray.map((opt: any, idx: number) => ({
              id: String.fromCharCode(97 + idx), // a, b, c, d
              text: typeof opt === 'string' ? opt : (opt.text || opt)
            }))
          }
          
          return {
            id: q.id,
            topicId: q.topic,
            content: {
              text: q.question,
              options: formattedOptions,
              correctAnswer: q.correctAnswer?.toLowerCase() || '',
              numericalAnswer: q.numericalAnswer,
              numericalTolerance: q.numericalTolerance,
              assertion: q.assertion,
              reason: q.reason
            },
            questionType: q.type,
            difficulty: q.difficulty,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            solution: { text: q.explanation || 'Solution not available' },
            source: q.source || 'demo',
            tags: q.tags || []
          }
        })
      } else {
        // Try to load from database (fallback)
        const { data: testData, error } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single()
        
        if (error || !testData) {
          // Test not found
          router.push('/dashboard')
          return
        }
        
        test = testData
        questions = testData.questions || []
      }

      setTest(test)
      setQuestions(questions)
      setTestStartTime(new Date())
      setTimeRemaining(test.durationMinutes * 60) // Convert to seconds
      
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
      // Calculate results immediately
      let correct = 0
      let incorrect = 0
      
      // Track topic-wise performance
      const topicBreakdown: { [key: string]: { attempted: number, correct: number, totalTime: number } } = {}
      
      // Track difficulty-wise performance
      const difficultyBreakdown: { [key: string]: { attempted: number, correct: number } } = {
        'Easy': { attempted: 0, correct: 0 },
        'Medium': { attempted: 0, correct: 0 },
        'Hard': { attempted: 0, correct: 0 }
      }
      
      // For Quick Test, assign default topics and difficulties
      const defaultTopics = ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics']
      const defaultDifficulties = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard']
      
      questions.forEach((q: any, index: number) => {
        // For Quick Test, assign topics in round-robin fashion
        const topicName = q.topicId ? 
          q.topicId.charAt(0).toUpperCase() + q.topicId.slice(1) : 
          (params.id === 'demo-test-1' ? defaultTopics[index % defaultTopics.length] : 'General')
        
        if (!topicBreakdown[topicName]) {
          topicBreakdown[topicName] = { attempted: 0, correct: 0, totalTime: 0 }
        }
        
        if (answers[q.id]) {
          // Question was attempted
          topicBreakdown[topicName].attempted++
          topicBreakdown[topicName].totalTime += 120 // Assuming 2 minutes per question
          
          const difficultyKey = q.difficulty ? 
            q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1) : 
            (params.id === 'demo-test-1' ? defaultDifficulties[index % defaultDifficulties.length] : 'Medium')
          
          if (difficultyBreakdown[difficultyKey]) {
            difficultyBreakdown[difficultyKey].attempted++
          }
          
          if (answers[q.id] === q.content.correctAnswer) {
            correct++
            topicBreakdown[topicName].correct++
            if (difficultyBreakdown[difficultyKey]) {
              difficultyBreakdown[difficultyKey].correct++
            }
          } else {
            incorrect++
          }
        }
      })
      
      const attempted = correct + incorrect
      const unattempted = questions.length - attempted
      const score = (correct * 4) - (incorrect * 1)
      const totalMarks = questions.length * 4
      const percentage = Math.max(0, (score / totalMarks) * 100)
      
      const testResult = {
        testId: params.id as string,
        testTitle: test.title,
        totalQuestions: questions.length,
        attempted,
        correct,
        incorrect,
        unattempted,
        score,
        totalMarks,
        percentage: Math.round(percentage * 10) / 10,
        timeTaken: test.durationMinutes * 60,
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
        throw new Error('Failed to save test result')
      }
      
      // Clear any localStorage data
      localStorage.removeItem(`test_${params.id}_answers`)
      localStorage.removeItem(`test_${params.id}_marked`)
      localStorage.removeItem(`ai_test_${params.id}`)
      
      // Redirect to result page with the saved result ID
      router.push(`/test/${params.id}/result?resultId=${data.result.id}`)
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Failed to submit test. Please try again.')
    } finally {
      setSaving(false)
      setShowSubmitModal(false)
    }
  }

  const handleTimeUp = () => {
    alert('Time is up! Your test will be auto-submitted.')
    handleSubmit()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Test not found or no questions available.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-indigo-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered = !!answers[currentQuestion.id]
  const isMarked = markedForReview.has(currentQuestion.id)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <TestHeader
        testTitle={test.title}
        saving={saving}
        onSubmit={handleSubmit}
      />

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Question Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Marks: +{currentQuestion.marks} / -{currentQuestion.negativeMarks}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                </div>

                <QuestionDisplay
                  question={currentQuestion}
                  selectedAnswer={answers[currentQuestion.id]}
                  onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion.id, answer)}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleNavigate(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Finish Test
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigate(currentQuestionIndex + 1)}
                      className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAnswerSelect(currentQuestion.id, null)}
                    disabled={!isAnswered}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Response
                  </button>
                  <button
                    onClick={() => handleMarkForReview(currentQuestion.id)}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isMarked 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {isMarked ? 'Marked' : 'Mark for Review'}
                  </button>
                  <button
                    onClick={saveProgress}
                    disabled={saving}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                      showSuccessMessage 
                        ? 'bg-green-600 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    } disabled:opacity-50`}
                  >
                    {showSuccessMessage ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        {saving ? 'Saving...' : 'Save Progress'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          {/* Timer */}
          <TestTimer
            duration={test.durationMinutes * 60}
            onTimeUp={handleTimeUp}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
          />

          {/* Question Palette */}
          <div className="mt-6">
            <QuestionPalette
              questions={questions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              markedForReview={markedForReview}
              onQuestionSelect={handleNavigate}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="mt-6 w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            <Send className="h-5 w-5 mr-2" />
            Submit Test
          </button>
          
          {/* View Analytics Button - After test completion */}
          {currentQuestionIndex === questions.length - 1 && (
            <button
              onClick={() => router.push('/analytics')}
              className="mt-3 w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              <BarChart className="h-5 w-5 mr-2" />
              View Analytics
            </button>
          )}

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded mr-2"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-500 rounded mr-2"></div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-yellow-500 rounded mr-2"></div>
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-300 rounded mr-2"></div>
                <span>Not Visited</span>
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
    </div>
  )
}