'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, InfoIcon, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <InfoIcon className="h-5 w-5" />
  }

  const colors = {
    success: 'bg-[var(--color-success)]/10 border-[var(--color-success)]/20 text-[var(--color-success)]',
    error: 'bg-[var(--color-error)]/10 border-[var(--color-error)]/20 text-[var(--color-error)]',
    warning: 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20 text-[var(--color-warning)]',
    info: 'bg-[var(--color-info)]/10 border-[var(--color-info)]/20 text-[var(--color-info)]'
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-start gap-3 min-w-[320px] max-w-[420px] p-4 rounded-[var(--radius-base)] border shadow-lg backdrop-blur-sm transition-all duration-300 ${
        colors[type]
      } ${
        isLeaving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-[var(--text-sm)] font-medium leading-relaxed">
          {message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-[var(--background-secondary)] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast container for managing multiple toasts
interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handleToast = (event: CustomEvent<Omit<ToastItem, 'id'>>) => {
      const newToast: ToastItem = {
        ...event.detail,
        id: Date.now().toString()
      }
      setToasts(prev => [...prev, newToast])
    }

    window.addEventListener('showToast' as any, handleToast)
    return () => window.removeEventListener('showToast' as any, handleToast)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Helper function to show toast
export function showToast(message: string, type: ToastType = 'info', duration = 5000) {
  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail: { message, type, duration }
    })
  )
}