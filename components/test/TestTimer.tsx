'use client'

import { useEffect, useState, useRef } from 'react'
import { Clock, Pause, Play } from 'lucide-react'
import { formatTime } from '@/lib/utils/timeUtils'

interface TestTimerProps {
  duration: number // in seconds
  onTimeUp: () => void
  timeRemaining: number
  setTimeRemaining: (time: number | ((prev: number) => number)) => void
}

export default function TestTimer({ 
  duration, 
  onTimeUp, 
  timeRemaining, 
  setTimeRemaining 
}: TestTimerProps) {
  const [isPaused, setIsPaused] = useState(false)
  const lastUpdateTime = useRef(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPaused) return

    lastUpdateTime.current = Date.now()
    
    const updateTimer = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - lastUpdateTime.current) / 1000)
      
      if (elapsed > 0) {
        lastUpdateTime.current = now
        setTimeRemaining((prev) => {
          const newTime = Math.max(0, prev - elapsed)
          if (newTime === 0 && prev > 0) {
            onTimeUp()
          }
          return newTime
        })
      }
    }

    // Update every second
    timerRef.current = setInterval(updateTimer, 1000)
    
    // Also update when tab becomes visible to catch up
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTimer()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPaused, onTimeUp, setTimeRemaining])


  const getTimeColor = () => {
    const percentageRemaining = (timeRemaining / duration) * 100
    if (percentageRemaining > 25) return 'text-[var(--color-success)] bg-[var(--color-success)]/10'
    if (percentageRemaining > 10) return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10'
    return 'text-[var(--color-error)] bg-[var(--color-error)]/10 animate-pulse'
  }

  const getProgressWidth = () => {
    return `${(timeRemaining / duration) * 100}%`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[var(--color-primary)]" />
          <span className="text-[var(--text-base)] font-semibold text-[var(--foreground)]">Time Remaining</span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-2 hover:bg-[var(--background-secondary)] rounded-[var(--radius-sm)] transition-colors"
          title={isPaused ? 'Resume timer' : 'Pause timer'}
        >
          {isPaused ? (
            <Play className="h-4 w-4 text-[var(--foreground-secondary)]" />
          ) : (
            <Pause className="h-4 w-4 text-[var(--foreground-secondary)]" />
          )}
        </button>
      </div>

      <div className={`heading-airbnb-2 text-center py-3 px-4 rounded-[var(--radius-base)] ${getTimeColor()}`}>
        {formatTime(timeRemaining)}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-[var(--background-secondary)] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] transition-all duration-1000"
            style={{ width: getProgressWidth() }}
          />
        </div>
      </div>

      {isPaused && (
        <div className="mt-3 text-[var(--text-xs)] text-[var(--color-warning)] text-center uppercase tracking-wide">
          Timer is paused
        </div>
      )}

      {timeRemaining < 300 && timeRemaining > 0 && !isPaused && (
        <div className="mt-3 text-[var(--text-xs)] text-[var(--color-error)] text-center font-semibold uppercase tracking-wide">
          Less than 5 minutes remaining!
        </div>
      )}
    </div>
  )
}