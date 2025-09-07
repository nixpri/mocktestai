'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--background-elevated)] rounded-[var(--radius-lg)] p-8 border border-[var(--color-error)]/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[var(--color-error)]/10 rounded-full">
                <AlertCircle className="h-6 w-6 text-[var(--color-error)]" />
              </div>
              <h2 className="text-xl font-semibold">Something went wrong</h2>
            </div>
            
            <p className="text-[var(--foreground-secondary)] mb-6">
              We encountered an unexpected error. Please try refreshing the page or return to the dashboard.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-[var(--background)] rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-[var(--foreground-secondary)]">
                  Error details
                </summary>
                <pre className="mt-2 text-xs overflow-auto text-[var(--color-error)]">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 btn-airbnb btn-airbnb-primary flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </button>
              <Link
                href="/dashboard"
                className="flex-1 btn-airbnb btn-airbnb-secondary flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function ErrorMessage({ 
  title = 'Error', 
  message = 'Something went wrong', 
  onRetry,
  showHome = true 
}: { 
  title?: string
  message?: string
  onRetry?: () => void
  showHome?: boolean
}) {
  return (
    <div className="bg-[var(--color-error)]/5 border border-[var(--color-error)]/20 rounded-[var(--radius-base)] p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-[var(--color-error)] mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-[var(--foreground-secondary)]">{message}</p>
          
          <div className="flex gap-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Try again
              </button>
            )}
            {showHome && (
              <Link
                href="/dashboard"
                className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
              >
                Go to dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}