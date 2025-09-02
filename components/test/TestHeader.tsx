'use client'

import { Brain, Save, Send, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TestHeaderProps {
  testTitle: string
  saving: boolean
  onSubmit: () => void
}

export default function TestHeader({ testTitle, saving, onSubmit }: TestHeaderProps) {
  const router = useRouter()
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      router.push('/dashboard')
    }
  }
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExit}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Exit to Dashboard"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Exit</span>
            </button>
            <div className="h-8 w-px bg-gray-300" />
            <Brain className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{testTitle}</h1>
              <p className="text-xs text-gray-500">MockTest AI - JEE Physics</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {saving && (
              <div className="flex items-center text-sm text-gray-600">
                <Save className="h-4 w-4 mr-1 animate-pulse" />
                Saving...
              </div>
            )}
            
            <button
              onClick={onSubmit}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}