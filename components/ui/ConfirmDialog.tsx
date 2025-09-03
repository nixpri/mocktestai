'use client'

import { AlertTriangle, Info, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const typeStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-[var(--color-error)]',
      iconBg: 'bg-[var(--color-error)]/10',
      confirmBtn: 'bg-[var(--color-error)] hover:bg-[var(--color-error-dark)]'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-[var(--color-warning)]',
      iconBg: 'bg-[var(--color-warning)]/10',
      confirmBtn: 'bg-[var(--color-warning)] hover:bg-[var(--color-warning-dark)]'
    },
    info: {
      icon: Info,
      iconColor: 'text-[var(--color-info)]',
      iconBg: 'bg-[var(--color-info)]/10',
      confirmBtn: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
    }
  }

  const style = typeStyles[type]
  const Icon = style.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-[var(--background-elevated)] rounded-[var(--radius-lg)] p-6 max-w-md w-full shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex gap-4">
          <div className={`p-3 ${style.iconBg} rounded-full h-fit`}>
            <Icon className={`h-6 w-6 ${style.iconColor}`} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-[var(--foreground-secondary)] text-sm sm:text-base">
              {message}
            </p>
            
            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  if (!loading) onClose()
                }}
                disabled={loading}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${style.confirmBtn}`}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for easy usage
import { useState } from 'react'

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogProps, setDialogProps] = useState<Partial<ConfirmDialogProps>>({})
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = (props: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>) => {
    return new Promise<boolean>((resolve) => {
      setDialogProps(props)
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }

  const handleConfirm = () => {
    resolvePromise?.(true)
    setIsOpen(false)
  }

  const handleClose = () => {
    resolvePromise?.(false)
    setIsOpen(false)
  }

  const Dialog = () => (
    <ConfirmDialog
      {...dialogProps}
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={dialogProps.title || 'Confirm'}
      message={dialogProps.message || 'Are you sure?'}
    />
  )

  return { confirm, Dialog }
}