'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, CheckCircle, Sparkles, Trophy, BarChart3, ArrowRight } from 'lucide-react'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center p-8">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* Left Side - Branding */}
        <div className="text-center md:text-left animate-slide-up">
          <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
            <Brain className="h-10 w-10 text-[var(--color-primary)]" />
            <span className="heading-airbnb-2 text-[var(--foreground)]">MockTest AI</span>
          </div>
          
          <h1 className="heading-airbnb-1 mb-4">
            Master JEE Physics with
            <span className="text-[var(--color-primary)]"> AI-Powered</span> Practice
          </h1>
          
          <p className="text-airbnb-body mb-10">
            Join thousands of students preparing smarter with personalized mock tests and detailed analytics.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 text-left">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-[var(--radius-sm)]">
                <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">AI-Generated Questions</h3>
                <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                  Unique questions tailored to your preparation level
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="p-2 bg-[var(--color-success)]/10 rounded-[var(--radius-sm)]">
                <Trophy className="h-5 w-5 text-[var(--color-success)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Track Your Progress</h3>
                <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                  Detailed analytics to identify and improve weak areas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="p-2 bg-[var(--color-info)]/10 rounded-[var(--radius-sm)]">
                <BarChart3 className="h-5 w-5 text-[var(--color-info)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Comprehensive Solutions</h3>
                <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                  Step-by-step explanations for every question
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Card */}
        <div className="card-airbnb p-10 animate-scale-in">
          <div className="text-center mb-8">
            <h2 className="heading-airbnb-3 mb-2">Welcome back</h2>
            <p className="text-airbnb-body">Sign in to continue your preparation</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 btn-airbnb border border-[var(--border-color)] bg-[var(--background-elevated)] hover:bg-[var(--background-secondary)] text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="mt-6 flex items-center justify-center">
            <div className="h-px bg-[var(--border-color)] flex-1"></div>
            <span className="text-[var(--foreground-muted)] text-[var(--text-xs)] px-4 uppercase tracking-wide">
              Secure Sign In
            </span>
            <div className="h-px bg-[var(--border-color)] flex-1"></div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-[var(--radius-sm)]">
              <p className="text-[var(--color-error)] text-[var(--text-sm)]">{error}</p>
            </div>
          )}

          <div className="mt-8">
            <div className="space-y-3">
              {[
                '100+ Physics practice questions',
                'Adaptive difficulty based on performance',
                'Detailed performance analytics',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success)] flex-shrink-0" />
                  <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--border-color-light)]">
            <p className="text-[var(--text-xs)] text-[var(--foreground-muted)] text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}