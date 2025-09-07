'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  className?: string
  loading?: boolean
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  disabled,
  loading = false,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
  
  const variants = {
    default: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm',
    secondary: 'bg-[var(--background-elevated)] text-[var(--foreground)] hover:bg-[var(--background-hover)] border border-[var(--border-color)]',
    outline: 'border border-[var(--border-color)] bg-transparent text-[var(--foreground)] hover:bg-[var(--background-hover)]',
    ghost: 'text-[var(--foreground)] hover:bg-[var(--background-hover)]',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12',
    icon: 'h-10 w-10 p-0'
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        children
      )}
    </button>
  )
}

export default Button