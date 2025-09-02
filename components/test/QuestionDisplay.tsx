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
        className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap"
      />

      {/* Question Images if any */}
      {question.content.images && question.content.images.length > 0 && (
        <div className="space-y-4">
          {question.content.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Question figure ${index + 1}`}
              className="max-w-full h-auto rounded-lg border border-gray-200"
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
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAnswer === option.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedAnswer === option.id}
                  onChange={() => handleOptionSelect(option.id)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3 flex-1">
                  {option.latex ? (
                    <LatexRenderer 
                      content={option.latex}
                      className="text-gray-700"
                    />
                  ) : (
                    <span className="text-gray-700">{option.text}</span>
                  )}
                </div>
              </label>
            ))}
          </>
        )}

        {question.questionType === 'numerical' && (
          <div className="flex items-center space-x-4">
            <label className="text-gray-700 font-medium">
              Your Answer:
            </label>
            <input
              type="number"
              value={selectedAnswer || ''}
              onChange={(e) => handleNumericalInput(e.target.value)}
              placeholder="Enter numerical value"
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              step="any"
            />
          </div>
        )}

        {question.questionType === 'assertion_reasoning' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Instructions:</strong> This question contains an Assertion (A) and a Reason (R).
                Choose the correct option based on whether both are true and if R is the correct explanation of A.
              </p>
            </div>
            {question.content?.options?.map((option) => (
              <label
                key={option.id}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAnswer === option.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedAnswer === option.id}
                  onChange={() => handleOptionSelect(option.id)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-gray-700">
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