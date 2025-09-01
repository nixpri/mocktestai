'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brain, BookOpen, Trophy, Target, LogOut, Plus, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

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
          <Link href="/test/quick" className="bg-indigo-600 text-white p-6 rounded-xl hover:bg-indigo-700 transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Quick Test</h3>
                <p className="text-indigo-100">20 questions • 30 minutes</p>
              </div>
              <Plus className="h-8 w-8 text-indigo-200" />
            </div>
          </Link>

          <Link href="/test/mock" className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Mock Test</h3>
                <p className="text-green-100">Full JEE pattern • 3 hours</p>
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
              <span className="text-2xl font-bold">0</span>
            </div>
            <h3 className="text-gray-600 text-sm">Tests Taken</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">-</span>
            </div>
            <h3 className="text-gray-600 text-sm">Avg. Score</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">0</span>
            </div>
            <h3 className="text-gray-600 text-sm">Day Streak</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">0</span>
            </div>
            <h3 className="text-gray-600 text-sm">Questions Solved</h3>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Tests</h2>
          <div className="text-center py-12 text-gray-500">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No tests taken yet</p>
            <p className="text-sm mt-2">Start your first test to see results here</p>
          </div>
        </div>
      </div>
    </div>
  )
}