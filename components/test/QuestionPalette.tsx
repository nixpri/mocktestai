'use client'

import { Question } from '@/types'

interface QuestionPaletteProps {
  questions: Question[]
  currentIndex: number
  answers: Record<string, string | number | null>
  markedForReview: Set<string>
  onQuestionSelect: (index: number) => void
}

export default function QuestionPalette({
  questions,
  currentIndex,
  answers,
  markedForReview,
  onQuestionSelect
}: QuestionPaletteProps) {
  const getQuestionStatus = (question: Question, index: number) => {
    const isAnswered = !!answers[question.id]
    const isMarked = markedForReview.has(question.id)
    const isCurrent = index === currentIndex
    
    if (isCurrent) {
      return 'border-2 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
    }
    
    if (isMarked && isAnswered) {
      return 'bg-[var(--color-success)] text-white ring-2 ring-[var(--color-warning)]'
    }
    
    if (isMarked) {
      return 'bg-[var(--color-warning)] text-white'
    }
    
    if (isAnswered) {
      return 'bg-[var(--color-success)] text-white'
    }
    
    return 'bg-[var(--color-error)] text-white'
  }

  const getSectionName = (topicId: string) => {
    const topicMap: Record<string, string> = {
      'mechanics': 'Mechanics',
      'thermodynamics': 'Thermodynamics',
      'electromagnetism': 'Electromagnetism',
      'optics': 'Optics',
      'modern_physics': 'Modern Physics',
      'waves': 'Waves & Oscillations'
    }
    return topicMap[topicId] || 'General'
  }

  // Group questions by topic
  const groupedQuestions = questions.reduce((acc, question, index) => {
    const topic = question.topicId || 'general'
    if (!acc[topic]) {
      acc[topic] = []
    }
    acc[topic].push({ question, index })
    return acc
  }, {} as Record<string, Array<{ question: Question, index: number }>>)

  const totalAnswered = Object.keys(answers).length
  const totalMarked = markedForReview.size
  const totalNotAnswered = questions.length - totalAnswered

  return (
    <div className="space-y-4">
      {/* Summary Stats - Airbnb Style */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--color-success)]/10 p-3 rounded-[var(--radius-sm)] text-center">
          <div className="text-[var(--text-xl)] font-bold text-[var(--color-success)]">{totalAnswered}</div>
          <div className="text-[var(--text-xs)] text-[var(--foreground-secondary)] uppercase tracking-wide">Answered</div>
        </div>
        <div className="bg-[var(--color-error)]/10 p-3 rounded-[var(--radius-sm)] text-center">
          <div className="text-[var(--text-xl)] font-bold text-[var(--color-error)]">{totalNotAnswered}</div>
          <div className="text-[var(--text-xs)] text-[var(--foreground-secondary)] uppercase tracking-wide">Not Answered</div>
        </div>
        <div className="bg-[var(--color-warning)]/10 p-3 rounded-[var(--radius-sm)] text-center">
          <div className="text-[var(--text-xl)] font-bold text-[var(--color-warning)]">{totalMarked}</div>
          <div className="text-[var(--text-xs)] text-[var(--foreground-secondary)] uppercase tracking-wide">Marked</div>
        </div>
        <div className="bg-[var(--background-secondary)] p-3 rounded-[var(--radius-sm)] text-center">
          <div className="text-[var(--text-xl)] font-bold text-[var(--foreground)]">{questions.length}</div>
          <div className="text-[var(--text-xs)] text-[var(--foreground-secondary)] uppercase tracking-wide">Total</div>
        </div>
      </div>

      {/* Question Grid - Airbnb Style */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {Object.entries(groupedQuestions).map(([topic, items]) => (
          <div key={topic}>
            <h4 className="text-[var(--text-xs)] font-semibold text-[var(--foreground-secondary)] uppercase tracking-wide mb-3">
              {getSectionName(topic)}
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {items.map(({ question, index }) => (
                <button
                  key={question.id}
                  onClick={() => onQuestionSelect(index)}
                  className={`
                    w-10 h-10 rounded-[var(--radius-sm)] font-semibold text-[var(--text-sm)]
                    transition-all duration-[var(--transition-base)] transform hover:scale-110
                    ${getQuestionStatus(question, index)}
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}