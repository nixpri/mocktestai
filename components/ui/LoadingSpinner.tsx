'use client'

import { Brain, Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
  className?: string
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'medium',
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  }

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <Brain className={`${sizeClasses[size]} text-[var(--color-primary)] opacity-20`} />
        <Loader2 className={`${sizeClasses[size]} text-[var(--color-primary)] animate-spin absolute top-0 left-0`} />
      </div>
      {message && (
        <p className="mt-4 text-[var(--foreground-secondary)] text-sm sm:text-base animate-pulse">
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

export function LoadingCard({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="bg-[var(--background-elevated)] rounded-[var(--radius-lg)] p-8 border border-[var(--border-color)] animate-pulse">
      <LoadingSpinner message={message} size="small" />
    </div>
  )
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-[var(--background-elevated)] rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}