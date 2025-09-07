'use client'

import { Clock, Menu, ChevronLeft, ChevronRight, Flag, Send } from 'lucide-react'
import TestTimer from './TestTimer'
import QuestionDisplay from './QuestionDisplay'
import MobilePaletteDrawer from './MobilePaletteDrawer'
import { UnifiedQuestion } from '@/lib/utils/questionTransformer'

interface MobileTestLayoutProps {
  title: string
  currentQuestion: number
  totalQuestions: number
  question?: UnifiedQuestion
  answer?: any
  onAnswerChange: (answer: string | number | null) => void
  isMarkedForReview: boolean
  onMarkForReview: () => void
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  onShowPalette: () => void
  disablePrevious: boolean
  disableNext: boolean
  showHint?: boolean
  duration?: number
  onTimeUp?: () => void
  timeRemaining?: number
  setTimeRemaining?: (time: number) => void
  questions: UnifiedQuestion[]
  answers: Record<string, any>
  markedForReview: Set<string>
  onQuestionSelect: (index: number) => void
  showMobilePalette: boolean
  onClosePalette: () => void
  stats: {
    answered: number
    notAnswered: number
    markedForReview: number
    notVisited: number
  }
}

export default function MobileTestLayout({
  title,
  currentQuestion,
  totalQuestions,
  question,
  answer,
  onAnswerChange,
  isMarkedForReview,
  onMarkForReview,
  onPrevious,
  onNext,
  onSubmit,
  onShowPalette,
  disablePrevious,
  disableNext,
  showHint = false,
  duration,
  onTimeUp,
  timeRemaining,
  setTimeRemaining,
  questions,
  answers,
  markedForReview,
  onQuestionSelect,
  showMobilePalette,
  onClosePalette,
  stats
}: MobileTestLayoutProps) {
  const mode = duration ? 'test' : 'practice'
  
  return (
    <div className="lg:hidden h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--background-elevated)] border-b border-[var(--border-color)] p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-[var(--foreground)] truncate">{title}</h1>
          <button
            onClick={onShowPalette}
            className="p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-hover)] transition-colors"
            aria-label="Show question palette"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--foreground-secondary)]">
            Question {currentQuestion} of {totalQuestions}
          </span>
          {duration && onTimeUp && timeRemaining !== undefined && setTimeRemaining && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--color-primary)]" />
              <TestTimer
                duration={duration}
                onTimeUp={onTimeUp}
                timeRemaining={timeRemaining}
                setTimeRemaining={setTimeRemaining}
              />
            </div>
          )}
        </div>
      </div>

      {/* Question Display */}
      <div className="flex-1 overflow-y-auto p-4">
        {question && (
          <QuestionDisplay
            question={question}
            selectedAnswer={answer || null}
            onAnswerSelect={onAnswerChange}
            showAnswer={showHint}
            mode={mode}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-[var(--background-elevated)] border-t border-[var(--border-color)] p-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={onPrevious}
            disabled={disablePrevious}
            className="flex-1 py-2 px-3 bg-[var(--background-secondary)] text-[var(--foreground)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          
          <button
            onClick={onMarkForReview}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isMarkedForReview
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-300'
                : 'bg-[var(--background-secondary)] text-[var(--foreground)]'
            }`}
          >
            <Flag className="h-4 w-4" />
            {isMarkedForReview ? 'Marked' : 'Mark'}
          </button>
          
          <button
            onClick={onNext}
            disabled={disableNext}
            className="flex-1 py-2 px-3 bg-[var(--color-primary)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={onSubmit}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          Submit Test
        </button>
      </div>

      {/* Mobile Palette Drawer */}
      {showMobilePalette && (
        <MobilePaletteDrawer
          questions={questions}
          currentQuestionIndex={currentQuestion - 1}
          answers={answers}
          markedForReview={markedForReview}
          onQuestionSelect={onQuestionSelect}
          onClose={onClosePalette}
          stats={stats}
        />
      )}
    </div>
  )
}