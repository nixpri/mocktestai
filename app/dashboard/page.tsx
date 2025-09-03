'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, BookOpen, Trophy, Target, LogOut, Plus, Clock, TrendingUp, ArrowRight, Zap, BarChart3, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTests: 0,
    avgScore: '-',
    totalQuestions: 0,
    recentTests: [] as any[]
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadStats()
  }, [])
  
  const loadStats = async () => {
    try {
      // Fetch test history from database
      const response = await fetch('/api/tests/results', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success && data.testHistory) {
        const history = data.testHistory
        
        if (history.length > 0) {
          const totalTests = history.length
          const totalQuestions = history.reduce((sum: number, test: any) => sum + test.totalQuestions, 0)
          const totalScore = history.reduce((sum: number, test: any) => sum + test.score, 0)
          const totalMaxScore = history.reduce((sum: number, test: any) => sum + test.totalMarks, 0)
          const avgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) + '%' : '-'
          const recentTests = history.slice(-3).reverse()
          
          setStats({
            totalTests,
            avgScore,
            totalQuestions,
            recentTests
          })
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
        
        // Ensure profile exists (for Google OAuth users)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!profile) {
          // Create profile if it doesn't exist (Google OAuth users)
          const fullName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0]
          
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: fullName,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
            })
            .select()
            .single()
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Brain className="h-12 w-12 text-[var(--color-primary)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--foreground-secondary)]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      {/* Navigation - Airbnb Style */}
      <nav className="bg-[var(--background-elevated)] border-b border-[var(--border-color-light)]">
        <div className="container-airbnb">
          <div className="flex justify-between h-[72px] items-center">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-[var(--color-primary)]" />
              <span className="text-[var(--text-xl)] font-semibold text-[var(--foreground)]">MockTest AI</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/analytics"
                className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors duration-[var(--transition-base)]"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-[var(--text-base)] font-medium">Analytics</span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                  {user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-[var(--foreground-secondary)] hover:text-[var(--color-error)] transition-colors duration-[var(--transition-base)]"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container-airbnb py-12">
        {/* Welcome Section - Airbnb Style */}
        <div className="mb-10 animate-slide-up pt-6">
          <h1 className="heading-airbnb-1 mb-3">Welcome back!</h1>
          <p className="text-airbnb-body">Choose your practice mode and start improving today</p>
        </div>

        {/* Quick Actions - Epic Card Design */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Link href="/test/demo-test-1" className="group block">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl" style={{ minHeight: '280px', background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' }}></div>
              <div className="relative p-8 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)' }}>
                    <Zap className="h-8 w-8" style={{ color: '#FFFFFF' }} />
                  </div>
                  <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" style={{ color: '#FFFFFF' }} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>Quick Practice</h3>
                  <p className="text-base mb-4" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Jump right in with 5 curated questions</p>
                  <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    <span>📝 5 questions</span>
                    <span>⏱️ 60 minutes</span>
                  </div>
                </div>
                <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Start Instantly →</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/test/generate" className="group block">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--background-elevated)] border-2 border-[var(--border-color)] hover:border-[var(--color-success)] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl" style={{ minHeight: '280px' }}>
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-[var(--color-success)]/20 to-[var(--color-success)]/10 rounded-2xl">
                    <Brain className="h-8 w-8 text-[var(--color-success)]" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-3 text-[var(--foreground)]">AI Generated</h3>
                  <p className="text-base text-[var(--foreground-secondary)] mb-4">Personalized test tailored to your level</p>
                  <div className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
                    <span>🤖 Smart AI</span>
                    <span>🎯 Adaptive</span>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-[var(--border-color-light)]">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-success)]">Customize Test →</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/questions" className="group block">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--background-elevated)] border-2 border-[var(--border-color)] hover:border-[var(--color-info)] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl" style={{ minHeight: '280px' }}>
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-[var(--color-info)]/20 to-[var(--color-info)]/10 rounded-2xl">
                    <BookOpen className="h-8 w-8 text-[var(--color-info)]" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-3 text-[var(--foreground)]">Question Bank</h3>
                  <p className="text-base text-[var(--foreground-secondary)] mb-4">Browse and manage all questions</p>
                  <div className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
                    <span>📚 Full Access</span>
                    <span>⚙️ Admin Tools</span>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-[var(--border-color-light)]">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-info)]">Manage Questions →</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid - Non-clickable stats with prominent Analytics CTA */}
        <div className="mb-10">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Non-clickable stat cards - no hover effects */}
            <div className="bg-[var(--background-elevated)] p-6 rounded-[var(--radius-base)] border border-[var(--border-color-light)]">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-[var(--color-warning)]/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-[var(--color-warning)]" />
                </div>
                <span className="text-3xl font-bold text-[var(--foreground)]">{stats.totalTests}</span>
              </div>
              <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Tests Completed</p>
            </div>

            <div className="bg-[var(--background-elevated)] p-6 rounded-[var(--radius-base)] border border-[var(--border-color-light)]">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-[var(--color-success)]/10 rounded-lg">
                  <Target className="h-6 w-6 text-[var(--color-success)]" />
                </div>
                <span className="text-3xl font-bold text-[var(--foreground)]">{stats.avgScore}</span>
              </div>
              <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Average Score</p>
            </div>

            <div className="bg-[var(--background-elevated)] p-6 rounded-[var(--radius-base)] border border-[var(--border-color-light)]">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <span className="text-3xl font-bold text-[var(--foreground)]">{stats.totalQuestions}</span>
              </div>
              <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">Questions Solved</p>
            </div>
          </div>

          {/* Prominent Analytics CTA Button */}
          <Link href="/analytics" className="block group">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-r from-[var(--color-info)] to-[var(--color-primary)] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">View Performance Analytics</h3>
                    <p className="text-sm text-white/90">Track your progress, identify weak areas, and improve</p>
                  </div>
                </div>
                <ArrowRight className="h-8 w-8 text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Tests - Epic List Design */}
        <div className="bg-[var(--background-elevated)] rounded-[var(--radius-lg)] p-8 border border-[var(--border-color-light)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <Clock className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Recent Activity</h2>
            </div>
            {stats.recentTests.length > 0 && (
              <Link href="/analytics" className="px-4 py-2 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 group">
                View all
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
          
          {stats.recentTests.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTests.map((test, index) => (
                <Link
                  key={index}
                  href={`/test/${test.testId}/result?resultId=${test.id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-4 bg-[var(--background-secondary)] rounded-[var(--radius-base)] hover:bg-[var(--background-elevated)] hover:shadow-md hover:scale-[1.01] transition-all duration-200 border border-transparent hover:border-[var(--border-color)]">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                        test.percentage >= 80 ? 'bg-gradient-to-br from-[var(--color-success)] to-green-600' :
                        test.percentage >= 60 ? 'bg-gradient-to-br from-[var(--color-warning)] to-orange-600' :
                        'bg-gradient-to-br from-[var(--color-error)] to-red-600'
                      }`}>
                        {test.percentage}%
                      </div>
                      <div>
                        <p className="text-[var(--text-lg)] font-semibold text-[var(--foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                          {test.testTitle}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            📝 {test.totalQuestions} questions
                          </span>
                          <span className="flex items-center gap-1">
                            ⏱️ {Math.floor(test.timeTaken / 60)} mins
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center px-4 py-2 bg-[var(--background-elevated)] rounded-lg">
                        <p className="text-[var(--text-lg)] font-bold text-[var(--foreground)]">
                          {test.score}/{test.totalMarks}
                        </p>
                        <p className="text-[var(--text-xs)] text-[var(--foreground-muted)] uppercase tracking-wide">
                          Score
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gradient-to-b from-[var(--background-secondary)] to-transparent rounded-xl">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 mb-6 animate-pulse">
                <Trophy className="h-12 w-12 text-[var(--color-primary)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)] mb-3">No tests yet</p>
              <p className="text-[var(--text-base)] text-[var(--foreground-secondary)] mb-8">Start practicing to see your progress here</p>
              <Link href="/test/demo-test-1" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                <Zap className="h-5 w-5" />
                Take your first test
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}