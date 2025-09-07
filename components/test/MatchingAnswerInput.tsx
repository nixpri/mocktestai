'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'

interface MatchingAnswerInputProps {
  columnA: any[]
  columnB: any[]
  value: string | Record<string, string> | null
  onChange: (value: string) => void
  disabled?: boolean
  showAnswer?: boolean
  correctAnswer?: string | Record<string, string>
}

export default function MatchingAnswerInput({
  columnA,
  columnB,
  value,
  onChange,
  disabled = false,
  showAnswer = false,
  correctAnswer
}: MatchingAnswerInputProps) {
  // Parse the value into a mapping object
  const parseValue = (val: string | Record<string, string> | null): Record<string, string> => {
    if (!val) return {}
    if (typeof val === 'object') return val
    if (typeof val !== 'string') return {}
    if (val.trim() === '') return {}
    
    // Parse string format like "1-a, 2-b, 3-c, 4-d"
    const matches: Record<string, string> = {}
    try {
      const pairs = val.split(',').map(p => p.trim()).filter(p => p)
      pairs.forEach(pair => {
        const [left, right] = pair.split('-').map(s => s.trim())
        if (left && right) {
          matches[left] = right
        }
      })
    } catch (e) {
      console.error('Error parsing match value:', e)
      return {}
    }
    return matches
  }

  const [matches, setMatches] = useState<Record<string, string>>(parseValue(value))
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Reset matches when value prop changes (e.g., when navigating to a different question)
  useEffect(() => {
    setMatches(parseValue(value))
    setOpenDropdown(null) // Also close any open dropdown
  }, [value, columnA, columnB]) // Also reset if columns change

  // Detect the numbering style from question text
  const hasLetterOptions = columnB.some((item: any) => {
    const text = typeof item === 'string' ? item : (item.text || item.value || '')
    return /\([p-s]\)|\(p\)|\(q\)|\(r\)|\(s\)/i.test(text)
  })

  const hasNumberOptions = columnA.some((item: any) => {
    const text = typeof item === 'string' ? item : (item.text || item.value || '')
    return /\([1-4]\)|\(1\)|\(2\)|\(3\)|\(4\)/i.test(text)
  })

  // Generate labels for columns
  const getColumnALabel = (index: number) => {
    return hasNumberOptions ? `(${index + 1})` : `${index + 1}`
  }

  const getColumnBLabel = (index: number) => {
    if (hasLetterOptions) {
      return String.fromCharCode(112 + index) // p, q, r, s
    }
    return String.fromCharCode(97 + index) // a, b, c, d
  }

  const handleMatch = (aIndex: string, bLabel: string) => {
    const newMatches = { ...matches }
    
    if (bLabel === '') {
      // Clear the match
      delete newMatches[aIndex]
    } else {
      // Remove any existing match to this B item
      Object.keys(newMatches).forEach(key => {
        if (newMatches[key] === bLabel && key !== aIndex) {
          delete newMatches[key]
        }
      })
      newMatches[aIndex] = bLabel
    }
    
    setMatches(newMatches)
    setOpenDropdown(null)
    
    // Convert to string format and notify parent
    const matchPairs = Object.entries(newMatches)
      .sort(([a], [b]) => {
        // Sort numerically if both are numbers
        const aNum = parseInt(a)
        const bNum = parseInt(b)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        return a.localeCompare(b)
      })
      .map(([left, right]) => `${left}-${right}`)
      .join(', ')
    
    onChange(matchPairs)
  }

  const getMatchedItem = (aIndex: string) => {
    return matches[aIndex] || ''
  }

  const isCorrectMatch = (aIndex: string, bLabel: string) => {
    if (!showAnswer || !correctAnswer) return false
    
    if (typeof correctAnswer === 'string') {
      // Parse the correct answer string
      const correct = parseValue(correctAnswer)
      return correct[aIndex] === bLabel
    } else {
      return correctAnswer[aIndex] === bLabel
    }
  }

  const isIncorrectMatch = (aIndex: string) => {
    if (!showAnswer || !correctAnswer) return false
    
    const userMatch = matches[aIndex]
    if (!userMatch) return false
    
    if (typeof correctAnswer === 'string') {
      const correct = parseValue(correctAnswer)
      return correct[aIndex] !== userMatch
    } else {
      return correctAnswer[aIndex] !== userMatch
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column A with dropdowns */}
        <div className="space-y-3">
          <h4 className="font-semibold text-[var(--foreground)] mb-3">Column I</h4>
          {columnA.map((item, idx) => {
            const aIndex = (idx + 1).toString()
            const aLabel = getColumnALabel(idx)
            const itemText = typeof item === 'string' ? item : (item.text || item.value || item)
            const matchedValue = getMatchedItem(aIndex)
            const isIncorrect = isIncorrectMatch(aIndex)
            
            return (
              <div key={idx} className="relative">
                <div className={`p-3 bg-[var(--background-secondary)] rounded-[var(--radius-sm)] border ${
                  isIncorrect ? 'border-[var(--color-error)]' : 'border-[var(--border-color)]'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="font-medium text-[var(--color-primary)] mr-2">
                        {aLabel}
                      </span>
                      <span className="text-[var(--foreground)]">{itemText}</span>
                    </div>
                    
                    {/* Dropdown selector */}
                    <div className="relative">
                      <button
                        onClick={() => !disabled && setOpenDropdown(openDropdown === aIndex ? null : aIndex)}
                        disabled={disabled}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] border transition-all ${
                          matchedValue 
                            ? isIncorrect 
                              ? 'bg-[var(--color-error)]/10 border-[var(--color-error)] text-[var(--color-error)]'
                              : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                            : 'bg-[var(--background)] border-[var(--border-color)] text-[var(--foreground-secondary)]'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--color-primary)] cursor-pointer'}`}
                      >
                        <span className="min-w-[40px] text-center">
                          {matchedValue || '—'}
                        </span>
                        {!disabled && (
                          matchedValue ? (
                            <X className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        )}
                      </button>
                      
                      {/* Dropdown menu */}
                      {openDropdown === aIndex && !disabled && (
                        <div className="absolute right-0 top-full mt-1 z-10 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-sm)] shadow-lg min-w-[80px]">
                          <button
                            onClick={() => handleMatch(aIndex, '')}
                            className="w-full px-3 py-2 text-left hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] text-sm"
                          >
                            Clear
                          </button>
                          {columnB.map((_, bIdx) => {
                            const bLabel = getColumnBLabel(bIdx)
                            const isUsed = Object.values(matches).includes(bLabel) && matches[aIndex] !== bLabel
                            const isCorrect = isCorrectMatch(aIndex, bLabel)
                            
                            return (
                              <button
                                key={bIdx}
                                onClick={() => handleMatch(aIndex, bLabel)}
                                disabled={isUsed}
                                className={`w-full px-3 py-2 text-left transition-colors text-sm flex items-center justify-between ${
                                  isUsed 
                                    ? 'opacity-40 cursor-not-allowed text-[var(--foreground-muted)]' 
                                    : 'hover:bg-[var(--background-secondary)] text-[var(--foreground)]'
                                } ${isCorrect && showAnswer ? 'text-[var(--color-success)]' : ''}`}
                              >
                                <span>{bLabel}</span>
                                {isCorrect && showAnswer && <Check className="h-3 w-3 text-[var(--color-success)]" />}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Show correct answer if in answer mode */}
                {showAnswer && isIncorrect && correctAnswer && (
                  <div className="mt-1 text-xs text-[var(--color-success)] pl-3">
                    Correct: {typeof correctAnswer === 'string' ? parseValue(correctAnswer)[aIndex] : correctAnswer[aIndex]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Column B for reference */}
        <div className="space-y-3">
          <h4 className="font-semibold text-[var(--foreground)] mb-3">Column II</h4>
          {columnB.map((item, idx) => {
            const bLabel = getColumnBLabel(idx)
            const itemText = typeof item === 'string' ? item : (item.text || item.value || item)
            const isMatched = Object.values(matches).includes(bLabel)
            
            return (
              <div 
                key={idx} 
                className={`p-3 rounded-[var(--radius-sm)] border transition-all ${
                  isMatched 
                    ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30' 
                    : 'bg-[var(--background-secondary)] border-[var(--border-color)]'
                }`}
              >
                <span className={`font-medium mr-2 ${
                  isMatched ? 'text-[var(--color-primary)]' : 'text-[var(--foreground-muted)]'
                }`}>
                  ({bLabel})
                </span>
                <span className={isMatched ? 'text-[var(--foreground)]' : 'text-[var(--foreground-secondary)]'}>
                  {itemText}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Summary of matches */}
      <div className="mt-4 p-3 bg-[var(--background-secondary)] rounded-[var(--radius-sm)] border border-[var(--border-color)]">
        <p className="text-sm text-[var(--foreground-secondary)] mb-1">Your matches:</p>
        <p className="text-[var(--foreground)] font-medium">
          {Object.keys(matches).length > 0 
            ? Object.entries(matches)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([left, right]) => `${left}-${right}`)
                .join(', ')
            : 'No matches selected'}
        </p>
      </div>
    </div>
  )
}