'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

export function Select({ children, value, onValueChange, disabled = false }: SelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, disabled }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within Select')

  return (
    <button
      type="button"
      disabled={context.disabled}
      onClick={() => !context.disabled && context.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--background-elevated)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 text-[var(--foreground-secondary)] transition-transform ${
        context.open ? 'rotate-180' : ''
      }`} />
    </button>
  )
}

export function SelectValue({ placeholder, className = '' }: { placeholder?: string; className?: string }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within Select')

  return (
    <span className={`${!context.value ? 'text-[var(--foreground-secondary)]' : ''} ${className}`}>
      {context.value || placeholder || 'Select...'}
    </span>
  )
}

export function SelectContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(SelectContext)
  const ref = useRef<HTMLDivElement>(null)
  
  if (!context) throw new Error('SelectContent must be used within Select')

  useEffect(() => {
    if (!context) return
    
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node) && context) {
        context.setOpen(false)
      }
    }

    if (context.open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [context?.open, context])

  if (!context.open) return null

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 w-full rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--background-elevated)] shadow-lg animate-in fade-in-0 zoom-in-95 ${className}`}
    >
      <div className="max-h-60 overflow-auto py-1">
        {children}
      </div>
    </div>
  )
}

export function SelectItem({ value, children, className = '' }: { value: string; children: React.ReactNode; className?: string }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectItem must be used within Select')

  const isSelected = context.value === value

  return (
    <button
      type="button"
      onClick={() => {
        context.onValueChange?.(value)
        context.setOpen(false)
      }}
      className={`relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors ${
        isSelected ? 'bg-[var(--background-hover)] font-medium' : ''
      } ${className}`}
    >
      <span className="flex-1 text-left">{children}</span>
      {isSelected && (
        <Check className="h-4 w-4 text-[var(--color-primary)] ml-2" />
      )}
    </button>
  )
}

export default Select