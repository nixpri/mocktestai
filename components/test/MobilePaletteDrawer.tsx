'use client'

import { X, Send } from 'lucide-react'
import QuestionPalette from './QuestionPalette'
import { Question } from '@/types'

interface MobilePaletteDrawerProps {
  isOpen: boolean
  onClose: () => void
  questions: Question[]
  currentIndex: number
  answers: Record<string, string | string[]>
  markedForReview: Set<string>
  onQuestionSelect: (index: number) => void
  onSubmit: () => void
}

export default function MobilePaletteDrawer({
  isOpen,
  onClose,
  questions,
  currentIndex,
  answers,
  markedForReview,
  onQuestionSelect,
  onSubmit
}: MobilePaletteDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--background-elevated)] shadow-xl animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-color-light)] flex items-center justify-between">
          <h3 className="text-lg font-semibold">Question Palette</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
            aria-label="Close palette"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 h-[calc(100%-80px)] overflow-y-auto">
          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            markedForReview={markedForReview}
            onQuestionSelect={(index) => {
              onQuestionSelect(index)
              onClose()
            }}
          />
          
          <button
            onClick={() => {
              onSubmit()
              onClose()
            }}
            className="btn-airbnb btn-airbnb-primary flex items-center gap-2 justify-center w-full mt-6"
          >
            <Send className="h-4 w-4" />
            Submit Test
          </button>
        </div>
      </div>
    </div>
  )
}