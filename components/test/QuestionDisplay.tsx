'use client'

import { UnifiedQuestion } from '@/lib/utils/questionTransformer'
import LatexRenderer from './LatexRenderer'
import MatchingAnswerInput from './MatchingAnswerInput'

interface QuestionDisplayProps {
  question: UnifiedQuestion
  selectedAnswer: string | number | null
  onAnswerSelect: (answer: string | number | null) => void
  showAnswer?: boolean
  mode?: 'test' | 'practice' | 'view'
}

export default function QuestionDisplay({ 
  question, 
  selectedAnswer, 
  onAnswerSelect,
  showAnswer = false,
  mode = 'test'
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
    if (['mcq', 'statement', 'assertion_reasoning'].includes(question.questionType)) {
      onAnswerSelect(optionId)
    }
  }

  const handleNumericalInput = (value: string) => {
    if (question.questionType === 'numerical') {
      onAnswerSelect(value)
    }
  }

  const isCorrectOption = (optionId: string): boolean => {
    if (!showAnswer) return false
    return optionId === question.content.correctAnswer
  }

  const isSelectedWrong = (optionId: string): boolean => {
    if (!showAnswer) return false
    return selectedAnswer === optionId && optionId !== question.content.correctAnswer
  }

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <LatexRenderer 
        content={getFullQuestionText()}
        className="text-[var(--text-lg)] text-[var(--foreground)] leading-relaxed whitespace-pre-wrap"
      />

      {/* Question Diagram if any */}
      {(question.hasDiagram || question.diagramUrl) && (
        <div className="my-4 flex justify-center">
          <img
            src={question.diagramUrl}
            alt="Question diagram"
            className="max-w-full h-auto rounded-[var(--radius-base)] border border-[var(--border-color)] shadow-sm"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
        </div>
      )}

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
        {/* MCQ and Statement Type Questions */}
        {(question.questionType === 'mcq' || question.questionType === 'statement') && question.content?.options && question.content.options.length > 0 && (
          <>
            {question.content.options.map((option) => {
              const isCorrect = isCorrectOption(option.id)
              const isWrong = isSelectedWrong(option.id)
              
              return (
                <label
                  key={option.id}
                  className={`flex items-start p-4 rounded-[var(--radius-base)] border-2 cursor-pointer transition-all duration-[var(--transition-base)] ${
                    isCorrect ? 'border-[var(--color-success)] bg-[var(--color-success)]/10' :
                    isWrong ? 'border-[var(--color-error)] bg-[var(--color-error)]/10' :
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
                    disabled={mode === 'view'}
                    className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex items-start gap-2">
                        <span className="font-semibold text-[var(--foreground)]">{option.id}.</span>
                        {option.latex ? (
                          <LatexRenderer 
                            content={option.latex}
                            className="text-[var(--foreground)]"
                          />
                        ) : (
                          <span className="text-[var(--foreground)]">{option.text}</span>
                        )}
                      </div>
                      {showAnswer && (
                        <div className="ml-2">
                          {isCorrect && (
                            <span className="text-[var(--color-success)] font-semibold">✓</span>
                          )}
                          {isWrong && (
                            <span className="text-[var(--color-error)] font-semibold">✗</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              )
            })}
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
              className="w-full px-4 py-3 border border-[var(--border-color)] rounded-[var(--radius-base)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] transition-all duration-[var(--transition-base)] hover:border-[var(--border-color-hover)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
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
              {question.content?.assertion && (
                <div className="mt-3">
                  <p className="font-semibold">Assertion (A):</p>
                  <LatexRenderer content={question.content.assertion} className="text-[var(--foreground)]" />
                </div>
              )}
              {question.content?.reason && (
                <div className="mt-2">
                  <p className="font-semibold">Reason (R):</p>
                  <LatexRenderer content={question.content.reason} className="text-[var(--foreground)]" />
                </div>
              )}
            </div>
            {Array.isArray(question.content?.options) && question.content.options.map((option) => {
              const isCorrect = isCorrectOption(option.id)
              const isWrong = isSelectedWrong(option.id)
              
              return (
                <label
                  key={option.id}
                  className={`flex items-start p-4 rounded-[var(--radius-base)] border-2 cursor-pointer transition-all duration-[var(--transition-base)] ${
                    isCorrect ? 'border-[var(--color-success)] bg-[var(--color-success)]/10' :
                    isWrong ? 'border-[var(--color-error)] bg-[var(--color-error)]/10' :
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
                    disabled={mode === 'view'}
                    className="mt-1 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div className="ml-3 flex-1 flex items-center justify-between">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-[var(--foreground)]">{option.id}.</span>
                      <span className="text-[var(--foreground)]">
                        {option.text}
                      </span>
                    </div>
                    {showAnswer && (
                      <div className="ml-2">
                        {isCorrect && <span className="text-[var(--color-success)] font-semibold">✓</span>}
                        {isWrong && <span className="text-[var(--color-error)] font-semibold">✗</span>}
                      </div>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        )}

        {question.questionType === 'matching' && (question.content?.columnA || question.content?.columnB) && (
          <div className="space-y-4">
            {(() => {
              // Detect column naming from question text
              const questionText = question.content.text.toLowerCase()
              const hasColumnI = questionText.includes('column i') || questionText.includes('column-i')
              const hasColumnII = questionText.includes('column ii') || questionText.includes('column-ii')
              const columnAName = hasColumnI ? 'Column I' : 'Column A'
              const columnBName = hasColumnII ? 'Column II' : 'Column B'
              
              // Detect numbering style from question text
              // Look for patterns like (p), (q), (r), (s) or (1), (2), (3), (4)
              const hasLetterOptions = /\([p-s]\)|\(p\)|\(q\)|\(r\)|\(s\)/i.test(question.content.text)
              const hasNumberOptions = /\([1-4]\)|\(1\)|\(2\)|\(3\)|\(4\)/i.test(question.content.text)
              
              return (
                <>
                  <div className="p-4 bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 rounded-[var(--radius-base)] mb-4">
                    <p className="text-[var(--text-sm)] text-[var(--color-info)]">
                      <strong>Instructions:</strong> Match the items from {columnAName} with the correct items in {columnBName}.
                      Click the dropdown next to each item in {columnAName} to select its match from {columnBName}.
                    </p>
                  </div>
                  
                  {/* Interactive Matching Component */}
                  <MatchingAnswerInput
                    columnA={question.content.columnA || []}
                    columnB={question.content.columnB || []}
                    value={selectedAnswer as string}
                    onChange={(value) => onAnswerSelect(value)}
                    disabled={mode === 'view'}
                    showAnswer={showAnswer}
                    correctAnswer={question.content.correctMatches || (typeof question.content.correctAnswer === 'string' ? question.content.correctAnswer : undefined)}
                  />
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* Solution Display */}
      {showAnswer && question.solution && (
        <div className="mt-6 p-4 bg-[var(--background-secondary)] rounded-[var(--radius-base)] border border-[var(--border-color)]">
          <h4 className="font-semibold text-[var(--foreground)] mb-2">Solution:</h4>
          <LatexRenderer 
            content={question.solution.text} 
            className="text-[var(--foreground-secondary)]"
          />
          {question.solution.steps && question.solution.steps.length > 0 && (
            <div className="mt-3 space-y-2">
              <h5 className="font-medium text-[var(--foreground)]">Steps:</h5>
              {question.solution.steps.map((step, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="text-[var(--color-primary)] mr-2">{idx + 1}.</span>
                  <LatexRenderer content={step} className="text-[var(--foreground-secondary)]" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}