'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, BookOpen, Trophy, Target, LogOut, Plus, Clock, TrendingUp } from 'lucide-react'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">JEE Physics AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/analytics"
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <TrendingUp className="h-5 w-5" />
                <span>Analytics</span>
              </Link>
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Ready to practice JEE Physics?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/test/demo-test-1" className="bg-indigo-600 text-white p-6 rounded-xl hover:bg-indigo-700 transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Quick Test</h3>
                <p className="text-indigo-100">5 questions • 60 minutes</p>
              </div>
              <Plus className="h-8 w-8 text-indigo-200" />
            </div>
          </Link>

          <Link href="/test/generate" className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">AI Generated Test</h3>
                <p className="text-green-100">Custom AI questions</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </Link>

          <Link href="/test/topic" className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Topic Test</h3>
                <p className="text-purple-100">Choose your topic</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-200" />
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.totalTests}</span>
            </div>
            <h3 className="text-gray-600 text-sm">Tests Taken</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">{stats.avgScore}</span>
            </div>
            <h3 className="text-gray-600 text-sm">Avg. Score</h3>
          </div>

          <Link href="/analytics" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">View</span>
            </div>
            <h3 className="text-gray-600 text-sm">Analytics</h3>
          </Link>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">{stats.totalQuestions}</span>
            </div>
            <h3 className="text-gray-600 text-sm">Questions Solved</h3>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Tests</h2>
          {stats.recentTests.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTests.map((test, index) => (
                <Link
                  key={index}
                  href={`/test/${test.testId}/result?resultId=${test.id}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{test.testTitle}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(test.date).toLocaleDateString()} • {test.totalQuestions} questions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      test.percentage >= 80 ? 'text-green-600' :
                      test.percentage >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {test.percentage}%
                    </p>
                    <p className="text-sm text-gray-500">Score: {test.score}/{test.totalMarks}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No tests taken yet</p>
              <p className="text-sm mt-2">Start your first test to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}