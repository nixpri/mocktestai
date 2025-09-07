'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  label?: string
}

export function Checkbox({ 
  id, 
  checked = false, 
  onCheckedChange, 
  disabled = false,
  className = '',
  label,
  ...props
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  const checkbox = (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={`h-5 w-5 rounded-[var(--radius-sm)] border-2 transition-all ${
        checked 
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
          : 'bg-[var(--background-elevated)] border-[var(--border-color)] hover:border-[var(--color-primary)]'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${className}`}
      {...props}
    >
      {checked && (
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      )}
    </button>
  )

  if (label) {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        {checkbox}
        <span className="text-sm text-[var(--foreground)] select-none">
          {label}
        </span>
      </label>
    )
  }

  return checkbox
}

export default Checkbox