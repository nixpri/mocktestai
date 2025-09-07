'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { UnifiedQuestion } from '@/lib/utils/questionTransformer'
import QuestionDisplay from '@/components/test/QuestionDisplay'
import TestTimer from '@/components/test/TestTimer'
import QuestionPalette from '@/components/test/QuestionPalette'
import TestHeader from '@/components/test/TestHeader'
import SubmitModal from '@/components/test/SubmitModal'
import MobileTestLayout from '@/components/test/MobileTestLayout'
import { ChevronLeft, ChevronRight, Flag, Save, Send } from 'lucide-react'

interface TestInterfaceProps {
  testId: string
  testTitle: string
  duration: number // in minutes
  questions: UnifiedQuestion[]
  onSubmit: (answers: Record<string, any>, timeSpent: Record<string, number>) => Promise<void>
  onSave?: (answers: Record<string, any>, timeSpent: Record<string, number>) => Promise<void>
  initialAnswers?: Record<string, any>
  initialTimeSpent?: Record<string, number>
  mode?: 'test' | 'practice'
}

export default function TestInterface({
  testId,
  testTitle,
  duration,
  questions,
  onSubmit,
  onSave,
  initialAnswers = {},
  initialTimeSpent = {},
  mode = 'test'
}: TestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers)
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>(initialTimeSpent)
  const [saving, setSaving] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(duration * 60)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showMobilePalette, setShowMobilePalette] = useState(false)
  const questionStartTimeRef = useRef<Date>(new Date())
  const lastQuestionIndexRef = useRef<number>(0)

  // Track time spent on each question
  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    // Update time spent for previous question
    if (lastQuestionIndexRef.current !== currentQuestionIndex) {
      const prevQuestion = questions[lastQuestionIndexRef.current]
      if (prevQuestion) {
        const timeOnQuestion = (new Date().getTime() - questionStartTimeRef.current.getTime()) / 1000
        setTimeSpent(prev => ({
          ...prev,
          [prevQuestion.id]: (prev[prevQuestion.id] || 0) + timeOnQuestion
        }))
      }
      
      // Reset timer for new question
      questionStartTimeRef.current = new Date()
      lastQuestionIndexRef.current = currentQuestionIndex
    }
  }, [currentQuestionIndex, questions])

  const handleSave = useCallback(async () => {
    if (!onSave || saving) return
    
    setSaving(true)
    try {
      // Update time spent for current question
      const currentQuestion = questions[currentQuestionIndex]
      if (currentQuestion) {
        const timeOnQuestion = (new Date().getTime() - questionStartTimeRef.current.getTime()) / 1000
        const updatedTimeSpent = {
          ...timeSpent,
          [currentQuestion.id]: (timeSpent[currentQuestion.id] || 0) + timeOnQuestion
        }
        await onSave(answers, updatedTimeSpent)
        setTimeSpent(updatedTimeSpent)
        questionStartTimeRef.current = new Date()
      } else {
        await onSave(answers, timeSpent)
      }
    } catch (error) {
      console.error('Failed to save test progress:', error)
    } finally {
      setSaving(false)
    }
  }, [onSave, saving, questions, currentQuestionIndex, timeSpent, answers])

  const handleSubmit = useCallback(async () => {
    // Update time spent for current question
    const currentQuestion = questions[currentQuestionIndex]
    const finalTimeSpent = { ...timeSpent }
    
    if (currentQuestion) {
      const timeOnQuestion = (new Date().getTime() - questionStartTimeRef.current.getTime()) / 1000
      finalTimeSpent[currentQuestion.id] = (timeSpent[currentQuestion.id] || 0) + timeOnQuestion
    }
    
    await onSubmit(answers, finalTimeSpent)
  }, [onSubmit, questions, currentQuestionIndex, timeSpent, answers])

  // Handle timer expiry
  const handleTimeUp = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  // Auto-save periodically
  useEffect(() => {
    if (!onSave || mode !== 'test') return
    
    const interval = setInterval(async () => {
      await handleSave()
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(interval)
  }, [onSave, mode, handleSave])

  const handleAnswerChange = (questionId: string, answer: string | number | null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleMarkForReview = () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    setMarkedForReview(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id)
      } else {
        newSet.add(currentQuestion.id)
      }
      return newSet
    })
  }


  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isMarkedForReview = currentQuestion ? markedForReview.has(currentQuestion.id) : false

  // Calculate statistics
  const stats = {
    answered: Object.keys(answers).filter(id => answers[id]).length,
    notAnswered: questions.length - Object.keys(answers).filter(id => answers[id]).length,
    markedForReview: markedForReview.size,
    notVisited: questions.filter(q => 
      !answers[q.id] && !markedForReview.has(q.id) && 
      questions.indexOf(q) !== currentQuestionIndex
    ).length
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen bg-[var(--background)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <TestHeader
            title={testTitle}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onSave={onSave ? handleSave : undefined}
            saving={saving}
          />

          <div className="flex-1 overflow-auto p-6">
            {currentQuestion && (
              <QuestionDisplay
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id] || null}
                onAnswerSelect={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                showAnswer={false}
                mode={mode}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="border-t border-[var(--border-color)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-[var(--background-elevated)] text-[var(--foreground)] rounded-[var(--radius)] border border-[var(--border-color)] hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <button
                  onClick={handleMarkForReview}
                  className={`px-4 py-2 rounded-[var(--radius)] border transition-colors flex items-center gap-2 ${
                    isMarkedForReview
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                      : 'bg-[var(--background-elevated)] border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--background-hover)]'
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  {isMarkedForReview ? 'Marked' : 'Mark for Review'}
                </button>
              </div>

              <div className="flex gap-2">
                {mode === 'test' && onSave && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-[var(--background-elevated)] text-[var(--foreground)] rounded-[var(--radius)] border border-[var(--border-color)] hover:bg-[var(--background-hover)] disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Progress'}
                  </button>
                )}

                <button
                  onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-[var(--radius)] hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-[var(--border-color)] bg-[var(--background-elevated)] flex flex-col">
          {mode === 'test' && (
            <TestTimer
              duration={duration}
              onTimeUp={handleTimeUp}
              timeRemaining={timeRemaining}
              setTimeRemaining={setTimeRemaining}
            />
          )}
          
          <QuestionPalette
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            markedForReview={markedForReview}
            onQuestionSelect={navigateToQuestion}
            stats={stats}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <MobileTestLayout
        title={testTitle}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        question={currentQuestion}
        answer={currentQuestion ? answers[currentQuestion.id] : undefined}
        onAnswerChange={currentQuestion ? (answer) => handleAnswerChange(currentQuestion.id, answer) : () => {}}
        isMarkedForReview={isMarkedForReview}
        onMarkForReview={handleMarkForReview}
        onPrevious={() => navigateToQuestion(currentQuestionIndex - 1)}
        onNext={() => navigateToQuestion(currentQuestionIndex + 1)}
        onSubmit={() => setShowSubmitModal(true)}
        onShowPalette={() => setShowMobilePalette(true)}
        disablePrevious={currentQuestionIndex === 0}
        disableNext={currentQuestionIndex === questions.length - 1}
        showHint={mode === 'practice'}
        duration={mode === 'test' ? duration : undefined}
        onTimeUp={mode === 'test' ? handleTimeUp : undefined}
        timeRemaining={mode === 'test' ? timeRemaining : undefined}
        setTimeRemaining={mode === 'test' ? setTimeRemaining : undefined}
        questions={questions}
        answers={answers}
        markedForReview={markedForReview}
        onQuestionSelect={navigateToQuestion}
        showMobilePalette={showMobilePalette}
        onClosePalette={() => setShowMobilePalette(false)}
        stats={stats}
      />

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitModal
          stats={stats}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}
    </>
  )
}