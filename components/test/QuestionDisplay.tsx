'use client'

import { Question } from '@/types'
import LatexRenderer from './LatexRenderer'

interface QuestionDisplayProps {
  question: Question
  selectedAnswer: any
  onAnswerSelect: (answer: any) => void
}

export default function QuestionDisplay({ 
  question, 
  selectedAnswer, 
  onAnswerSelect 
}: QuestionDisplayProps) {
  const getFullQuestionText = (): string => {
    // Safeguard for questions with missing or malformed content
    if (!question.content) {
      console.error('Question has no content:', question)
      return 'Error: Question content is missing'
    }
    
    let content = question.content.text || ''
    if (question.content.latex) {
      content += `\n\n${question.content.latex}`
    }
    return content
  }

  const handleOptionSelect = (optionId: string) => {
    if (question.questionType === 'mcq') {
      onAnswerSelect(optionId)
    }
  }

  const handleNumericalInput = (value: string) => {
    if (question.questionType === 'numerical') {
      onAnswerSelect(value)
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <LatexRenderer 
        content={getFullQuestionText()}
        className="text-[var(--text-lg)] text-[var(--foreground)] leading-relaxed whitespace-pre-wrap"
      />

      {/* Question Images if any */}
      {question.content.images && question.content.images.length > 0 && (
        <div className="space-y-4">
          {question.content.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Question figure ${index + 1}`}
              className="max-w-full h-auto rounded-[var(--radius-base)] border border-[var(--border-color)]"
            />
          ))}
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-3">
        {question.questionType === 'mcq' && question.content?.options && (
          <>
            {question.content.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-start p-4 rounded-[var(--radius-base)] border-2 cursor-pointer transition-all duration-[var(--transition-base)] ${
                  selectedAnswer === option.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--border-color)] hover:border-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedAnswer === option.id}
                  onChange={() => handleOptionSelect(option.id)}
                  className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div className="ml-3 flex-1">
                  {option.latex ? (
                    <LatexRenderer 
                      content={option.latex}
                      className="text-[var(--foreground)]"
                    />
                  ) : (
                    <span className="text-[var(--foreground)]">{option.text}</span>
                  )}
                </div>
              </label>
            ))}
          </>
        )}

        {question.questionType === 'numerical' && (
          <div className="flex items-center gap-4">
            <label className="text-[var(--foreground)] font-medium">
              Your Answer:
            </label>
            <input
              type="number"
              value={selectedAnswer || ''}
              onChange={(e) => handleNumericalInput(e.target.value)}
              placeholder="Enter numerical value"
              className="input-airbnb"
              step="any"
            />
          </div>
        )}

        {question.questionType === 'assertion_reasoning' && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-[var(--radius-base)]">
              <p className="text-[var(--text-sm)] text-[var(--color-warning)]">
                <strong>Instructions:</strong> This question contains an Assertion (A) and a Reason (R).
                Choose the correct option based on whether both are true and if R is the correct explanation of A.
              </p>
            </div>
            {question.content?.options?.map((option) => (
              <label
                key={option.id}
                className={`flex items-start p-4 rounded-[var(--radius-base)] border-2 cursor-pointer transition-all duration-[var(--transition-base)] ${
                  selectedAnswer === option.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--border-color)] hover:border-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedAnswer === option.id}
                  onChange={() => handleOptionSelect(option.id)}
                  className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="ml-3 text-[var(--foreground)]">
                  {option.text}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}