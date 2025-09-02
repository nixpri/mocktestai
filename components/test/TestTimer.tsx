'use client'

import { useEffect, useState } from 'react'
import { Clock, Pause, Play } from 'lucide-react'

interface TestTimerProps {
  duration: number // in seconds
  onTimeUp: () => void
  timeRemaining: number
  setTimeRemaining: (time: number) => void
}

export default function TestTimer({ 
  duration, 
  onTimeUp, 
  timeRemaining, 
  setTimeRemaining 
}: TestTimerProps) {
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, onTimeUp, setTimeRemaining])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const getTimeColor = () => {
    const percentageRemaining = (timeRemaining / duration) * 100
    if (percentageRemaining > 25) return 'text-green-600 bg-green-50'
    if (percentageRemaining > 10) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50 animate-pulse'
  }

  const getProgressWidth = () => {
    return `${(timeRemaining / duration) * 100}%`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Time Remaining</span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={isPaused ? 'Resume timer' : 'Pause timer'}
        >
          {isPaused ? (
            <Play className="h-4 w-4 text-gray-600" />
          ) : (
            <Pause className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      <div className={`text-2xl font-bold text-center py-3 px-4 rounded-lg ${getTimeColor()}`}>
        {formatTime(timeRemaining)}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000"
            style={{ width: getProgressWidth() }}
          />
        </div>
      </div>

      {isPaused && (
        <div className="mt-2 text-xs text-yellow-600 text-center">
          Timer is paused
        </div>
      )}

      {timeRemaining < 300 && timeRemaining > 0 && !isPaused && (
        <div className="mt-2 text-xs text-red-600 text-center font-semibold">
          Less than 5 minutes remaining!
        </div>
      )}
    </div>
  )
}