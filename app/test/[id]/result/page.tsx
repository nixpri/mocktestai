'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Trophy, Target, Clock, BarChart, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LatexRenderer from '@/components/test/LatexRenderer'

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
  questionsData?: any[]
  userAnswers?: { [key: string]: any }
}

export default function TestResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadResult()
  }, [params.id, searchParams])

  const loadResult = async () => {
    try {
      // Get result ID from URL
      const resultId = searchParams.get('resultId')
      
      if (!resultId) {
        console.log('No result ID provided')
        router.push('/dashboard')
        return
      }
      
      // Fetch result from database
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
      
      // Transform database result to display format
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
        questionsData: testResult.questions_data || [],
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculating results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Result not found</p>
          <Link href="/dashboard" className="mt-4 text-indigo-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const getPerformanceMessage = () => {
    if (result.percentage >= 80) return { text: 'Excellent!', color: 'text-green-600' }
    if (result.percentage >= 60) return { text: 'Good Job!', color: 'text-blue-600' }
    if (result.percentage >= 40) return { text: 'Keep Practicing!', color: 'text-yellow-600' }
    return { text: 'Need Improvement', color: 'text-red-600' }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Test Results</h1>
            <div className="flex space-x-4">
              <Link
                href="/analytics"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BarChart className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Results Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className={`text-3xl font-bold ${performance.color}`}>
              {performance.text}
            </h2>
            <p className="text-gray-600 mt-2">{result.testTitle}</p>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-8">
            <div className="text-center">
              <p className="text-sm opacity-90">Your Score</p>
              <p className="text-5xl font-bold my-2">
                {result.score}/{result.totalMarks}
              </p>
              <p className="text-lg">{result.percentage}%</p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{result.totalQuestions}</p>
              <p className="text-sm text-gray-600">Total Questions</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{result.correct}</p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{result.incorrect}</p>
              <p className="text-sm text-gray-600">Incorrect</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{result.unattempted}</p>
              <p className="text-sm text-gray-600">Unattempted</p>
            </div>
          </div>

          {/* Time Stats */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Time Taken</p>
                <p className="font-semibold">
                  {Math.floor(result.timeTaken / 60)} minutes
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Attempted</p>
              <p className="text-2xl font-bold">{result.attempted}/{result.totalQuestions}</p>
            </div>
          </div>
        </div>

        {/* Topic-wise Performance */}
        {result.topicBreakdown && Object.keys(result.topicBreakdown).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Topic-wise Performance</h3>
            <div className="space-y-3">
              {Object.entries(result.topicBreakdown).map(([topic, data]: [string, any]) => (
                <div key={topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{topic}</p>
                    <p className="text-sm text-gray-600">
                      {data.correct}/{data.attempted} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      data.attempted > 0 ? (
                        (data.correct / data.attempted) >= 0.8 ? 'text-green-600' :
                        (data.correct / data.attempted) >= 0.6 ? 'text-yellow-600' :
                        'text-red-600'
                      ) : 'text-gray-400'
                    }`}>
                      {data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Analysis */}
        {result.difficultyBreakdown && Object.keys(result.difficultyBreakdown).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Difficulty Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(result.difficultyBreakdown).map(([difficulty, data]: [string, any]) => (
                <div key={difficulty} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">{difficulty}</p>
                  <p className="text-2xl font-bold my-2">
                    {data.correct}/{data.attempted}
                  </p>
                  <p className={`text-sm ${
                    data.attempted > 0 ? (
                      (data.correct / data.attempted) >= 0.8 ? 'text-green-600' :
                      (data.correct / data.attempted) >= 0.6 ? 'text-yellow-600' :
                      'text-red-600'
                    ) : 'text-gray-400'
                  }`}>
                    {data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0}% accuracy
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question-wise Review */}
        {result.questionsData && result.questionsData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Question Review</h3>
            <div className="space-y-4">
              {result.questionsData.map((question: any, index: number) => {
                const userAnswer = result.userAnswers?.[question.id]
                
                // Handle different ways correct answer might be stored
                let correctAnswer = question.content?.correctAnswer || 
                                   question.correctAnswer || 
                                   question.correct_answer || ''
                
                // Normalize the answer for comparison
                const normalizedUserAnswer = userAnswer?.toString().toLowerCase()
                const normalizedCorrectAnswer = correctAnswer?.toString().toLowerCase()
                
                // Check if answer is correct based on question type
                let isCorrect = false
                if (question.questionType === 'numerical' || question.type === 'numerical') {
                  const numericalAnswer = question.content?.numericalAnswer || 
                                         question.numericalAnswer || 
                                         question.numerical_answer
                  const tolerance = question.content?.numericalTolerance || 
                                   question.numericalTolerance || 
                                   question.numerical_tolerance || 0.01
                  if (numericalAnswer !== undefined && userAnswer !== undefined) {
                    const userNum = parseFloat(userAnswer)
                    const correctNum = parseFloat(numericalAnswer)
                    isCorrect = Math.abs(userNum - correctNum) <= tolerance
                  }
                } else {
                  isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
                }
                
                const wasAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== ''
                
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                          {wasAttempted ? (
                            isCorrect ? (
                              <span className="flex items-center text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Correct
                              </span>
                            ) : (
                              <span className="flex items-center text-red-600 text-sm">
                                <XCircle className="h-4 w-4 mr-1" />
                                Incorrect
                              </span>
                            )
                          ) : (
                            <span className="flex items-center text-yellow-600 text-sm">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Not Attempted
                            </span>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {question.difficulty || 'Medium'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {question.topicId || question.topic || 'General'}
                          </span>
                        </div>
                        <div className="text-gray-800 mb-3">
                          <LatexRenderer 
                            content={question.content?.text || question.content?.questionText || question.question || 'Question text not available'}
                            className="text-base"
                          />
                        </div>
                        
                        {/* Options for MCQ */}
                        {(question.questionType === 'mcq' || question.type === 'mcq') && question.content?.options && (
                          <div className="space-y-2 mb-3">
                            {question.content.options.map((option: any, optIndex: number) => {
                              const optionLetter = String.fromCharCode(65 + optIndex) // A, B, C, D
                              const optionId = String.fromCharCode(97 + optIndex) // a, b, c, d
                              
                              // Check if this is the user's answer
                              const isUserAnswer = userAnswer === optionId || 
                                                  userAnswer === optionLetter || 
                                                  userAnswer === optionLetter.toLowerCase()
                              
                              // Check if this is the correct answer
                              const isCorrectOption = normalizedCorrectAnswer === optionId || 
                                                     normalizedCorrectAnswer === optionLetter.toLowerCase()
                              
                              // Handle both string and object format for options
                              const optionText = typeof option === 'string' ? option : (option.text || option)
                            
                            return (
                              <div 
                                key={optIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectOption 
                                    ? 'bg-green-50 border-green-400' 
                                    : isUserAnswer && !isCorrect
                                    ? 'bg-red-50 border-red-300'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className="font-semibold mr-3 text-gray-700">{optionLetter}.</span>
                                  <div className="flex-1 text-gray-800">
                                    <LatexRenderer content={optionText} className="text-sm" />
                                  </div>
                                  {isCorrectOption && (
                                    <span className="flex items-center ml-2 text-green-600 text-sm font-medium">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Correct
                                    </span>
                                  )}
                                  {isUserAnswer && !isCorrect && (
                                    <span className="flex items-center ml-2 text-red-600 text-sm font-medium">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Your Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          </div>
                        )}
                        
                        {/* Numerical Answer */}
                        {(question.questionType === 'numerical' || question.type === 'numerical') && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Your Answer:</p>
                                <p className={`text-lg font-semibold ${wasAttempted ? (isCorrect ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                                  {wasAttempted ? userAnswer : 'Not attempted'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Correct Answer:</p>
                                <p className="text-lg font-semibold text-green-600">
                                  {question.content?.numericalAnswer || question.numericalAnswer || question.numerical_answer || 'N/A'}
                                  {(question.content?.numericalTolerance || question.numericalTolerance || question.numerical_tolerance) && (
                                    <span className="text-sm text-gray-500 ml-1">
                                      (±{question.content?.numericalTolerance || question.numericalTolerance || question.numerical_tolerance})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Assertion Reasoning */}
                        {(question.questionType === 'assertion' || question.type === 'assertion') && (
                          <div className="mt-3 space-y-2">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-900 mb-1">Assertion:</p>
                              <div className="text-sm text-blue-800">
                                <LatexRenderer 
                                  content={question.content?.assertion || question.assertion || 'N/A'}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-sm font-medium text-purple-900 mb-1">Reason:</p>
                              <div className="text-sm text-purple-800">
                                <LatexRenderer 
                                  content={question.content?.reason || question.reason || 'N/A'}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Your Answer:</p>
                                  <p className={`text-sm font-semibold ${wasAttempted ? (isCorrect ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                                    {wasAttempted ? userAnswer : 'Not attempted'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Correct Answer:</p>
                                  <p className="text-sm font-semibold text-green-600">
                                    {question.content?.correctAnswer || question.correctAnswer || question.correct_answer || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Explanation - Always show if available */}
                        {(question.solution?.text || question.content?.explanation || question.explanation) && (
                          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <p className="text-sm font-semibold text-indigo-900 mb-2">
                              💡 Explanation:
                            </p>
                            <div className="text-sm text-indigo-800 leading-relaxed">
                              <LatexRenderer 
                                content={question.solution?.text || question.content?.explanation || question.explanation}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/test/generate"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-indigo-600 mb-2">
              <Trophy className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="font-semibold">Take Another Test</h3>
            <p className="text-sm text-gray-600 mt-1">Practice more questions</p>
          </Link>
          
          <Link
            href="/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-blue-600 mb-2">
              <BarChart className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="font-semibold">View Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Track your progress</p>
          </Link>
          
          <Link
            href="/dashboard"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-green-600 mb-2">
              <CheckCircle className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="font-semibold">Dashboard</h3>
            <p className="text-sm text-gray-600 mt-1">Go to home</p>
          </Link>
        </div>
      </div>
    </div>
  )
}