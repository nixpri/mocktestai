'use client'

import { Question } from '@/types'

interface QuestionPaletteProps {
  questions: Question[]
  currentIndex: number
  answers: Record<string, any>
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
      return 'border-2 border-indigo-600 ring-2 ring-indigo-200'
    }
    
    if (isMarked && isAnswered) {
      return 'bg-green-500 text-white ring-2 ring-yellow-400'
    }
    
    if (isMarked) {
      return 'bg-yellow-500 text-white'
    }
    
    if (isAnswered) {
      return 'bg-green-500 text-white'
    }
    
    return 'bg-red-500 text-white'
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
      <h3 className="font-semibold text-gray-800">Question Palette</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-green-50 p-2 rounded text-center">
          <div className="font-semibold text-green-700">{totalAnswered}</div>
          <div className="text-green-600">Answered</div>
        </div>
        <div className="bg-red-50 p-2 rounded text-center">
          <div className="font-semibold text-red-700">{totalNotAnswered}</div>
          <div className="text-red-600">Not Answered</div>
        </div>
        <div className="bg-yellow-50 p-2 rounded text-center">
          <div className="font-semibold text-yellow-700">{totalMarked}</div>
          <div className="text-yellow-600">Marked</div>
        </div>
        <div className="bg-gray-50 p-2 rounded text-center">
          <div className="font-semibold text-gray-700">{questions.length}</div>
          <div className="text-gray-600">Total</div>
        </div>
      </div>

      {/* Question Grid */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedQuestions).map(([topic, items]) => (
          <div key={topic}>
            <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
              {getSectionName(topic)}
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {items.map(({ question, index }) => (
                <button
                  key={question.id}
                  onClick={() => onQuestionSelect(index)}
                  className={`
                    w-10 h-10 rounded-lg font-semibold text-sm
                    transition-all transform hover:scale-105
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