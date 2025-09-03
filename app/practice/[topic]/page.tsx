'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/utils/timeUtils'
import QuestionCard from '@/components/test/QuestionCard'
import QuestionNavigation from '@/components/test/QuestionNavigation'
import { ArrowLeft, Brain, CheckCircle, XCircle, HelpCircle, Lightbulb, BookOpen, SkipForward } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation?: string
  hint?: string
}

// Sample practice questions for each topic
const topicQuestions: Record<string, Question[]> = {
  mechanics: [
    {
      id: 1,
      question: "A ball is thrown vertically upward with velocity v₀. What is its velocity at the highest point?",
      options: ["v₀", "v₀/2", "0", "2v₀"],
      correctAnswer: 2,
      topic: "Mechanics",
      difficulty: "easy",
      explanation: "At the highest point of vertical motion, the velocity becomes zero momentarily before the ball starts falling down. This is because gravity continuously decelerates the upward motion until it stops.",
      hint: "Think about what happens when an object reaches its maximum height."
    },
    {
      id: 2,
      question: "A block of mass m slides down a frictionless incline of angle θ. What is its acceleration?",
      options: ["g", "g sin θ", "g cos θ", "g tan θ"],
      correctAnswer: 1,
      topic: "Mechanics",
      difficulty: "medium",
      explanation: "On a frictionless incline, the component of gravitational force along the incline is mg sin θ. Using F = ma, the acceleration a = g sin θ.",
      hint: "Resolve the weight of the block into components parallel and perpendicular to the incline."
    }
  ],
  waves: [
    {
      id: 1,
      question: "The frequency of a wave is 50 Hz and its wavelength is 2m. What is the wave velocity?",
      options: ["25 m/s", "50 m/s", "100 m/s", "200 m/s"],
      correctAnswer: 2,
      topic: "Waves",
      difficulty: "easy",
      explanation: "Wave velocity v = frequency × wavelength = 50 Hz × 2 m = 100 m/s",
      hint: "Remember the fundamental wave equation: v = fλ"
    }
  ],
  thermodynamics: [
    {
      id: 1,
      question: "In an isothermal process for an ideal gas, which quantity remains constant?",
      options: ["Pressure", "Volume", "Temperature", "Internal Energy"],
      correctAnswer: 2,
      topic: "Thermodynamics",
      difficulty: "easy",
      explanation: "By definition, an isothermal process occurs at constant temperature. The prefix 'iso' means 'same' and 'thermal' relates to temperature.",
      hint: "Break down the word 'isothermal' - 'iso' means same."
    }
  ],
  electricity: [
    {
      id: 1,
      question: "Two charges +q and -q are separated by distance d. What is the electric field at the midpoint?",
      options: ["Zero", "kq/d²", "2kq/d²", "4kq/d²"],
      correctAnswer: 3,
      topic: "Electricity",
      difficulty: "medium",
      explanation: "Both charges create fields pointing in the same direction at the midpoint (away from +q, towards -q). Each field has magnitude kq/(d/2)² = 4kq/d². Total field = 8kq/d².",
      hint: "Consider the direction of electric field due to each charge at the midpoint."
    }
  ],
  'modern-physics': [
    {
      id: 1,
      question: "What is the de Broglie wavelength of a particle with momentum p?",
      options: ["h/p", "p/h", "hp", "p²/h"],
      correctAnswer: 0,
      topic: "Modern Physics",
      difficulty: "easy",
      explanation: "The de Broglie wavelength λ = h/p, where h is Planck's constant and p is the momentum of the particle.",
      hint: "de Broglie related wave properties to particle momentum."
    }
  ],
  optics: [
    {
      id: 1,
      question: "A convex lens has focal length f. Where should an object be placed to get a real image of the same size?",
      options: ["At f", "At 2f", "At f/2", "At 3f"],
      correctAnswer: 1,
      topic: "Optics",
      difficulty: "medium",
      explanation: "For a convex lens to produce a real image of the same size as the object, the object must be placed at 2f (center of curvature). At this position, the image is also formed at 2f on the other side.",
      hint: "Think about the symmetry of ray diagrams when object and image are the same size."
    }
  ]
}

export default function PracticeTopicPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [showHint, setShowHint] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set())
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set())
  const [timeSpent, setTimeSpent] = useState(0)
  
  const router = useRouter()
  const params = useParams()
  const topic = params.topic as string
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      
      // Load questions for the topic
      const topicQuestions = getQuestionsForTopic(topic)
      setQuestions(topicQuestions)
      setLoading(false)
    }
    checkUser()
  }, [router, supabase, topic])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function getQuestionsForTopic(topicId: string): Question[] {
    return topicQuestions[topicId] || []
  }

  const handleAnswerSelect = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }))
    
    // Show instant feedback
    setShowFeedback(true)
    const question = questions[currentQuestionIndex]
    setAttemptedQuestions(prev => new Set([...prev, currentQuestionIndex]))
    
    if (optionIndex === question.correctAnswer) {
      setCorrectAnswers(prev => new Set([...prev, currentQuestionIndex]))
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowHint(false)
      setShowFeedback(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowHint(false)
      setShowFeedback(false)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleShowHint = () => {
    setShowHint(true)
  }

  const handleFinish = () => {
    router.push('/practice')
  }

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered = userAnswers[currentQuestionIndex] !== undefined
  const isCorrect = isAnswered && userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--background-elevated)] border-b border-[var(--border-color)] sticky top-0 z-10">
        <div className="container-airbnb py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/practice" 
                className="p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h2 className="text-lg font-semibold">Practice Mode: {topic.charAt(0).toUpperCase() + topic.slice(1).replace('-', ' ')}</h2>
                <div className="flex items-center gap-4 text-sm text-[var(--foreground-secondary)]">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                    {correctAnswers.size} correct
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-[var(--color-error)]" />
                    {attemptedQuestions.size - correctAnswers.size} incorrect
                  </span>
                  <span>{formatTime(timeSpent)} elapsed</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShowHint}
                disabled={showHint || isAnswered}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-info)]/10 text-[var(--color-info)] rounded-lg hover:bg-[var(--color-info)]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb className="h-4 w-4" />
                Show Hint
              </button>
              <button
                onClick={handleSkip}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </button>
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Exit Practice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-airbnb py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Question Area */}
          <div className="col-span-8">
            <div className="bg-[var(--background-elevated)] rounded-[var(--radius-lg)] p-8 border border-[var(--border-color)]">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentQuestion.difficulty === 'easy' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                    currentQuestion.difficulty === 'medium' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' :
                    'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-xs px-2 py-1 bg-[var(--background)] rounded-full">
                    {currentQuestion.topic}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
              </div>

              {/* Hint */}
              {showHint && currentQuestion.hint && (
                <div className="mb-6 p-4 bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-[var(--color-info)] mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Hint</p>
                      <p className="text-sm text-[var(--foreground-secondary)]">{currentQuestion.hint}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = userAnswers[currentQuestionIndex] === index
                  const isCorrectOption = index === currentQuestion.correctAnswer
                  const showCorrect = showFeedback && isCorrectOption
                  const showIncorrect = showFeedback && isSelected && !isCorrectOption
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !isAnswered && handleAnswerSelect(index)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrect ? 'border-[var(--color-success)] bg-[var(--color-success)]/10' :
                        showIncorrect ? 'border-[var(--color-error)] bg-[var(--color-error)]/10' :
                        isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' :
                        'border-[var(--border-color)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--background-hover)]'
                      } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                            showCorrect ? 'border-[var(--color-success)] text-[var(--color-success)]' :
                            showIncorrect ? 'border-[var(--color-error)] text-[var(--color-error)]' :
                            isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' :
                            'border-[var(--border-color)]'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </span>
                        {showCorrect && <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />}
                        {showIncorrect && <XCircle className="h-5 w-5 text-[var(--color-error)]" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div className={`p-4 rounded-lg border ${
                  isCorrect 
                    ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/20' 
                    : 'bg-[var(--color-error)]/10 border-[var(--color-error)]/20'
                }`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-[var(--color-success)] mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[var(--color-error)] mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      {currentQuestion.explanation && (
                        <div>
                          <p className="font-medium text-sm mb-1">Explanation:</p>
                          <p className="text-sm text-[var(--foreground-secondary)]">{currentQuestion.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Progress Panel */}
          <div className="col-span-4">
            <div className="bg-[var(--background-elevated)] rounded-[var(--radius-lg)] p-6 border border-[var(--border-color)] sticky top-24">
              <h3 className="font-semibold mb-4">Progress</h3>
              
              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--foreground-secondary)]">Completed</span>
                  <span className="font-medium">{attemptedQuestions.size} / {questions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--foreground-secondary)]">Accuracy</span>
                  <span className="font-medium">
                    {attemptedQuestions.size > 0 
                      ? Math.round((correctAnswers.size / attemptedQuestions.size) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--foreground-secondary)]">Time</span>
                  <span className="font-medium">{formatTime(timeSpent)}</span>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => {
                  const isAttempted = attemptedQuestions.has(index)
                  const isCorrect = correctAnswers.has(index)
                  const isCurrent = index === currentQuestionIndex
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentQuestionIndex(index)
                        setShowHint(false)
                        setShowFeedback(userAnswers[index] !== undefined)
                      }}
                      className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all ${
                        isCurrent ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' :
                        isCorrect ? 'border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                        isAttempted ? 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]' :
                        'border-[var(--border-color)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}