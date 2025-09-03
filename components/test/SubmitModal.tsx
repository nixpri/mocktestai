'use client'

import { AlertTriangle, Send, X } from 'lucide-react'

interface SubmitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  answeredCount: number
  totalQuestions: number
  markedCount: number
  unansweredCount: number
}

export default function SubmitModal({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  totalQuestions,
  markedCount,
  unansweredCount
}: SubmitModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="overlay-airbnb"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="modal-airbnb max-w-md w-full relative animate-scale-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-[var(--color-warning)]/10 rounded-full flex items-center justify-center mr-4">
              <AlertTriangle className="h-6 w-6 text-[var(--color-warning)]" />
            </div>
            <div>
              <h3 className="heading-airbnb-4 mb-1">Submit Test?</h3>
              <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Please review your test status</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[var(--background-secondary)] rounded-[var(--radius-base)] p-6 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-base)] text-[var(--foreground-secondary)]">Total Questions</span>
                <span className="text-[var(--text-lg)] font-semibold text-[var(--foreground)]">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-base)] text-[var(--color-success)]">✓ Answered</span>
                <span className="text-[var(--text-lg)] font-semibold text-[var(--color-success)]">{answeredCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-base)] text-[var(--color-error)]">✗ Not Answered</span>
                <span className="text-[var(--text-lg)] font-semibold text-[var(--color-error)]">{unansweredCount}</span>
              </div>
              {markedCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-base)] text-[var(--color-warning)]">⚑ Marked for Review</span>
                  <span className="text-[var(--text-lg)] font-semibold text-[var(--color-warning)]">{markedCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning message */}
          {unansweredCount > 0 && (
            <div className="bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-[var(--radius-base)] p-4 mb-6">
              <p className="text-[var(--text-sm)] text-[var(--color-warning)]">
                <strong>Note:</strong> You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. 
                These will be marked as incorrect.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-airbnb btn-airbnb-secondary flex-1"
            >
              Review Test
            </button>
            <button
              onClick={onConfirm}
              className="btn-airbnb bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 flex-1 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}