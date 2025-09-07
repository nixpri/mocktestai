'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, BookOpen, Trophy, Target, LogOut, Clock, TrendingUp, ArrowRight, BarChart3, Calendar, GraduationCap, Menu, X, Filter, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Practice mode state
  const [practiceMode, setPracticeMode] = useState<'timed' | 'random'>('random')
  const [practiceFilters, setPracticeFilters] = useState({
    years: [] as string[],
    subjects: [] as string[],
    difficulty: [] as string[],
    questionCount: 10
  })
  const [showPracticeModal, setShowPracticeModal] = useState(false)
  
  const [stats, setStats] = useState({
    totalTests: 0,
    avgScore: '-',
    totalQuestions: 0,
    recentTests: [] as Array<{ id: string; testId?: string; testTitle: string; score: number; percentage?: number; date: string; totalQuestions?: number; timeTaken?: number; totalMarks?: number }>
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])
  
  useEffect(() => {
    if (!authChecking && user) {
      loadStats()
    }
  }, [authChecking, user])
  
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
    setAuthChecking(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
        
        // Check if user is admin
        setIsAdmin(user?.email === 'nixpri@gmail.com')
        
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
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
      setAuthChecking(false)
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" />
              <span className="text-base sm:text-[var(--text-xl)] font-semibold text-[var(--foreground)]">MockTest AI</span>
            </div>
            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-4 lg:gap-6">
              <Link
                href="/analytics"
                className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors duration-[var(--transition-base)]"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-[var(--text-base)] font-medium">Analytics</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-[var(--transition-base)]"
                >
                  <span className="text-[var(--text-base)] font-medium">Admin Panel</span>
                </Link>
              )}
              <div className="flex items-center gap-2 lg:gap-4">
                <span className="hidden lg:inline text-[var(--text-sm)] text-[var(--foreground-secondary)] max-w-[200px] truncate">
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
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[var(--background-elevated)] border-b border-[var(--border-color-light)] px-4 py-3">
          <Link
            href="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-3 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <span>Admin Panel</span>
            </Link>
          )}
          <div className="p-3 text-sm text-[var(--foreground-secondary)]">
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full p-3 text-[var(--foreground-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="container-airbnb py-6 sm:py-12">
        {/* Welcome Section - Airbnb Style */}
        <div className="mb-6 sm:mb-10 animate-slide-up pt-3 sm:pt-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Welcome back!</h1>
          <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">Choose your practice mode and start improving today</p>
        </div>

        {/* Quick Actions - Epic Card Design */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Link href="/test/generate" className="group block">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--background-elevated)] border-2 border-[var(--border-color)] hover:border-[var(--color-success)] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full">
              <div className="p-8 h-full flex flex-col min-h-[320px]">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-[var(--color-success)]/20 to-[var(--color-success)]/10 rounded-2xl">
                    <Brain className="h-8 w-8 text-[var(--color-success)]" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-[var(--foreground)]">AI Generated</h3>
                    <p className="text-sm sm:text-base text-[var(--foreground-secondary)] mb-3 sm:mb-4">Personalized test tailored to your level</p>
                    <div className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
                      <span>🤖 Smart AI</span>
                      <span>🎯 Adaptive</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--border-color-light)]">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-success)]">Customize Test →</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Custom Practice Session Card */}
          <div className="group block cursor-pointer" onClick={() => setShowPracticeModal(true)}>
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--background-elevated)] border-2 border-[var(--border-color)] hover:border-[var(--color-info)] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full">
              <div className="p-8 h-full flex flex-col min-h-[320px]">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-[var(--color-info)]/20 to-[var(--color-info)]/10 rounded-2xl">
                    <Filter className="h-8 w-8 text-[var(--color-info)]" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-[var(--foreground)]">Custom Practice</h3>
                    <p className="text-sm sm:text-base text-[var(--foreground-secondary)] mb-3 sm:mb-4">Create personalized practice sessions from previous year questions</p>
                    <div className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
                      <span>🎯 Filtered</span>
                      <span>📚 Past Papers</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--border-color-light)]">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-info)]">Configure Practice →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Years Card */}
          <Link href="/previous-years" className="group block">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--background-elevated)] border-2 border-[var(--border-color)] hover:border-[var(--color-warning)] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full">
              <div className="p-8 h-full flex flex-col min-h-[320px]">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-[var(--color-warning)]/20 to-[var(--color-warning)]/10 rounded-2xl">
                    <Calendar className="h-8 w-8 text-[var(--color-warning)]" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-[var(--foreground)]">Previous Years</h3>
                    <p className="text-sm sm:text-base text-[var(--foreground-secondary)] mb-3 sm:mb-4">Practice with authentic JEE papers from past exams</p>
                    <div className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
                      <span>📚 Real Papers</span>
                      <span>🎯 Pattern Analysis</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--border-color-light)]">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-warning)]">Browse Papers →</span>
                  </div>
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
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-r from-[var(--color-primary)] to-cyan-500 p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
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
                  href={`/test/${test.testId || test.id}/result?resultId=${test.id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-4 bg-[var(--background-secondary)] rounded-[var(--radius-base)] hover:bg-[var(--background-elevated)] hover:shadow-md hover:scale-[1.01] transition-all duration-200 border border-transparent hover:border-[var(--border-color)]">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                        (test.percentage || test.score) >= 80 ? 'bg-gradient-to-br from-[var(--color-success)] to-green-600' :
                        (test.percentage || test.score) >= 60 ? 'bg-gradient-to-br from-[var(--color-warning)] to-orange-600' :
                        'bg-gradient-to-br from-[var(--color-error)] to-red-600'
                      }`}>
                        {test.percentage || test.score}%
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
                            📝 {test.totalQuestions || 0} questions
                          </span>
                          <span className="flex items-center gap-1">
                            ⏱️ {Math.floor((test.timeTaken || 0) / 60)} mins
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center px-4 py-2 bg-[var(--background-elevated)] rounded-lg">
                        <p className="text-[var(--text-lg)] font-bold text-[var(--foreground)]">
                          {test.score}/{test.totalMarks || 100}
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
              <button 
                onClick={() => setShowPracticeModal(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
              >
                <GraduationCap className="h-5 w-5" />
                Start Custom Practice
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Practice Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Configure Custom Practice Session</h2>
                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Create a personalized practice session from previous year questions
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Practice Mode Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Practice Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPracticeMode('random')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      practiceMode === 'random'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Zap className="h-5 w-5 mb-2" />
                    <div className="font-semibold">Random Mix</div>
                    <div className="text-sm opacity-75 mt-1">No time limit</div>
                  </button>
                  <button
                    onClick={() => setPracticeMode('timed')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      practiceMode === 'timed'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Clock className="h-5 w-5 mb-2" />
                    <div className="font-semibold">Timed Mode</div>
                    <div className="text-sm opacity-75 mt-1">2 min/question</div>
                  </button>
                </div>
              </div>
              
              {/* Number of Questions */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[5, 10, 15, 20, 30, 50].map(count => (
                    <button
                      key={count}
                      onClick={() => setPracticeFilters(prev => ({ ...prev, questionCount: count }))}
                      className={`py-2 px-4 rounded-lg border-2 transition-all ${
                        practiceFilters.questionCount === count
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Session Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Session Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mode:</span>
                    <span className="ml-2 font-medium">
                      {practiceMode === 'timed' ? 'Timed (2 min/question)' : 'Random Mix (No Timer)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Questions:</span>
                    <span className="ml-2 font-medium">{practiceFilters.questionCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">
                      {practiceMode === 'timed' 
                        ? `${practiceFilters.questionCount * 2} minutes`
                        : 'Unlimited'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Source:</span>
                    <span className="ml-2 font-medium">Previous Year Papers</span>
                  </div>
                </div>
              </div>
              
              {/* Info Message */}
              <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                <span className="mt-0.5">ℹ️</span>
                <div>
                  <p className="font-medium">Practice Mode Features:</p>
                  <ul className="mt-1 space-y-1 text-blue-600">
                    <li>• Questions from authentic previous year papers</li>
                    <li>• View solutions immediately after answering</li>
                    <li>• No negative marking in practice mode</li>
                    <li>• Detailed explanations for each question</li>
                  </ul>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // Start practice session
                    const { data: { user } } = await supabase.auth.getUser()
                    
                    if (!user) {
                      router.push('/auth?redirect=/dashboard')
                      return
                    }
                    
                    // Import the transformer
                    const { transformDatabaseQuestion } = await import('@/lib/utils/questionTransformer')
                    
                    // Fetch random questions from previous years
                    const { data: questions, error } = await supabase
                      .from('questions')
                      .select('*')
                      .eq('source_type', 'previous_year')
                      .limit(practiceFilters.questionCount)
                    
                    if (error || !questions || questions.length === 0) {
                      alert('No questions available. Please try again later.')
                      return
                    }
                    
                    // Transform questions to unified format
                    const transformedQuestions = questions.map(q => transformDatabaseQuestion(q)).filter(q => q !== null)
                    
                    // Create a practice test
                    const testId = `practice-${Date.now()}`
                    const testData = {
                      test: {
                        id: testId,
                        title: `Custom Practice - ${new Date().toLocaleDateString()}`,
                        testType: 'practice',
                        durationMinutes: practiceMode === 'timed' ? practiceFilters.questionCount * 2 : 999,
                        questions: transformedQuestions.map(q => q!.id),
                        totalMarks: transformedQuestions.reduce((sum, q) => sum + (q!.marks || 4), 0)
                      },
                      questions: transformedQuestions
                    }
                    
                    // Store in localStorage
                    localStorage.setItem(`ai_test_${testId}`, JSON.stringify(testData))
                    
                    // Navigate to test page
                    router.push(`/test/${testId}?mode=practice`)
                    setShowPracticeModal(false)
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Start Practice Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}