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
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Submit Test?</h3>
              <p className="text-sm text-gray-500">Please review your test status</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Questions</span>
                <span className="font-semibold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">✓ Answered</span>
                <span className="font-semibold text-green-600">{answeredCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">✗ Not Answered</span>
                <span className="font-semibold text-red-600">{unansweredCount}</span>
              </div>
              {markedCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600">⚑ Marked for Review</span>
                  <span className="font-semibold text-yellow-600">{markedCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning message */}
          {unansweredCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. 
                These will be marked as incorrect.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
            >
              Review Test
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center justify-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}