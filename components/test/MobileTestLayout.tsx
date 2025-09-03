'use client'

import { Clock, Menu } from 'lucide-react'
import TestTimer from './TestTimer'

interface MobileTestLayoutProps {
  testDuration: number
  timeRemaining: number
  setTimeRemaining: (time: number) => void
  onTimeUp: () => void
  onTogglePalette: () => void
}

export default function MobileTestLayout({
  testDuration,
  timeRemaining,
  setTimeRemaining,
  onTimeUp,
  onTogglePalette
}: MobileTestLayoutProps) {
  return (
    <div className="lg:hidden bg-[var(--background-elevated)] border-b border-[var(--border-color-light)] p-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-[var(--color-primary)]" />
        <TestTimer
          duration={testDuration}
          onTimeUp={onTimeUp}
          timeRemaining={timeRemaining}
          setTimeRemaining={setTimeRemaining}
        />
      </div>
      <button
        onClick={onTogglePalette}
        className="p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-hover)] transition-colors"
        aria-label="Toggle question palette"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  )
}