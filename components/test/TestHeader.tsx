'use client'

import { Brain, Save, Send, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TestHeaderProps {
  testTitle: string
  saving: boolean
  onSubmit: () => void
}

export default function TestHeader({ testTitle, saving, onSubmit }: TestHeaderProps) {
  const router = useRouter()
  // const [showExitConfirm, setShowExitConfirm] = useState(false)  // TODO: Use modal instead of confirm
  
  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      router.push('/dashboard')
    }
  }
  return (
    <header className="bg-[var(--background-elevated)] border-b border-[var(--border-color-light)] shadow-sm">
      <div className="container-airbnb">
        <div className="flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleExit}
              className="btn-airbnb btn-airbnb-ghost flex items-center gap-2"
              title="Exit to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-[var(--text-base)] font-medium">Exit</span>
            </button>
            <div className="h-8 w-px bg-[var(--border-color)]" />
            <Brain className="h-7 w-7 text-[var(--color-primary)]" />
            <div>
              <h1 className="heading-airbnb-4 mb-0">{testTitle}</h1>
              <p className="text-[var(--text-xs)] text-[var(--foreground-secondary)]">MockTest AI - JEE Physics</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {saving && (
              <div className="flex items-center gap-2 text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                <Save className="h-4 w-4 animate-pulse" />
                Saving...
              </div>
            )}
            
            <button
              onClick={onSubmit}
              className="btn-airbnb bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}