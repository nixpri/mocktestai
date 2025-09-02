'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Brain, TrendingUp, Target, Clock, Award, 
  BarChart3, Activity, Calendar, ChevronRight,
  BookOpen, Zap, AlertCircle, ArrowUp, ArrowDown,
  Trophy, Percent, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Area, AreaChart
} from 'recharts'

interface TestResult {
  id: string
  testId: string
  testTitle: string
  testType: string
  totalQuestions: number
  attempted: number
  correct: number
  incorrect: number
  unattempted: number
  score: number
  totalMarks: number
  percentage: number
  timeTaken: number
  date: string
  topicBreakdown: Record<string, any>
  difficultyBreakdown: Record<string, any>
}

interface AnalyticsData {
  overview: {
    totalTests: number
    totalQuestions: number
    averageScore: number
    studyStreak: number
    totalTimeSpent: number
    overallAccuracy: number
    improvement: number
    bestScore: number
  }
  performanceTrend: Array<{
    date: string
    score: number
    accuracy: number
    tests: number
  }>
  topicPerformance: Array<{
    topic: string
    attempted: number
    correct: number
    accuracy: number
    avgTime: number
    trend: number
  }>
  difficultyAnalysis: Array<{
    difficulty: string
    attempted: number
    correct: number
    accuracy: number
    value: number
  }>
  recentTests: Array<{
    id: string
    testId: string
    title: string
    date: string
    score: number
    percentage: number
    timeTaken: number
    trend: 'up' | 'down' | 'same'
  }>
  weakAreas: Array<{
    topic: string
    subtopic: string
    accuracy: number
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }>
}

const CHART_COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899'
}

const DIFFICULTY_COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444'
}

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [testHistory, setTestHistory] = useState<TestResult[]>([])
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const filterByTimeRange = (data: TestResult[]) => {
    if (timeRange === 'all') return data
    
    const now = new Date()
    const cutoff = new Date()
    
    if (timeRange === 'week') {
      cutoff.setDate(now.getDate() - 7)
    } else if (timeRange === 'month') {
      cutoff.setDate(now.getDate() - 30)
    }
    
    return data.filter(test => new Date(test.date) >= cutoff)
  }

  const calculateStreak = (history: TestResult[]) => {
    if (history.length === 0) return 0
    
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const test of sortedHistory) {
      const testDate = new Date(test.date)
      testDate.setHours(0, 0, 0, 0)
      
      const dayDiff = Math.floor((currentDate.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff <= 1) {
        streak++
        currentDate = testDate
      } else {
        break
      }
    }
    
    return streak
  }

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Fetch test history from database
      const response = await fetch('/api/tests/results', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch test results')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch test results')
      }
      
      const allHistory = data.testHistory || []
      const history = filterByTimeRange(allHistory)
      
      setTestHistory(allHistory)
      
      // Calculate analytics from filtered history
      if (history.length === 0) {
        // Show empty state data
        setAnalyticsData(getEmptyAnalyticsData())
        return
      }
      
      // Calculate overview stats
      const totalTests = history.length
      const totalQuestions = history.reduce((sum, test) => sum + test.totalQuestions, 0)
      const totalScore = history.reduce((sum, test) => sum + test.score, 0)
      const totalMaxScore = history.reduce((sum, test) => sum + test.totalMarks, 0)
      const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0
      const totalCorrect = history.reduce((sum, test) => sum + test.correct, 0)
      const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
      const totalTimeSpent = history.reduce((sum, test) => sum + test.timeTaken, 0)
      const bestScore = Math.max(...history.map(test => test.percentage), 0)
      
      // Calculate improvement (compare first half vs second half)
      let improvement = 0
      if (history.length >= 2) {
        const midPoint = Math.floor(history.length / 2)
        const firstHalf = history.slice(0, midPoint)
        const secondHalf = history.slice(midPoint)
        
        const firstAvg = firstHalf.reduce((sum, test) => sum + test.percentage, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((sum, test) => sum + test.percentage, 0) / secondHalf.length
        
        improvement = Math.round(secondAvg - firstAvg)
      }
      
      const studyStreak = calculateStreak(allHistory)
      
      // Performance trend - show individual tests if less than 7, otherwise group by date
      let performanceTrend: Array<{ date: string; score: number; accuracy: number; tests: number }>
      
      if (history.length <= 7) {
        // Show individual tests if we have 7 or fewer
        performanceTrend = history.slice(-7).map(test => ({
          date: new Date(test.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          score: test.percentage,
          accuracy: Math.round((test.correct / test.totalQuestions) * 100),
          tests: 1
        }))
      } else {
        // Group by date if we have more than 7 tests
        const trendMap = new Map<string, { score: number[], accuracy: number[], tests: number }>()
        
        history.forEach(test => {
          const date = new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          
          if (!trendMap.has(date)) {
            trendMap.set(date, { score: [], accuracy: [], tests: 0 })
          }
          
          const entry = trendMap.get(date)!
          entry.score.push(test.percentage)
          entry.accuracy.push(Math.round((test.correct / test.totalQuestions) * 100))
          entry.tests++
        })
        
        performanceTrend = Array.from(trendMap.entries())
          .slice(-7)
          .map(([date, data]) => ({
            date,
            score: Math.round(data.score.reduce((a, b) => a + b, 0) / data.score.length),
            accuracy: Math.round(data.accuracy.reduce((a, b) => a + b, 0) / data.accuracy.length),
            tests: data.tests
          }))
      }
      
      // Topic performance with trends
      const topicStats: Record<string, { 
        attempted: number, 
        correct: number, 
        totalTime: number,
        scores: number[]
      }> = {}
      
      history.forEach(test => {
        if (test.topicBreakdown) {
          Object.entries(test.topicBreakdown).forEach(([topic, stats]: [string, any]) => {
            if (!topicStats[topic]) {
              topicStats[topic] = { attempted: 0, correct: 0, totalTime: 0, scores: [] }
            }
            topicStats[topic].attempted += stats.attempted || 0
            topicStats[topic].correct += stats.correct || 0
            topicStats[topic].totalTime += stats.totalTime || 0
            if (stats.attempted > 0) {
              topicStats[topic].scores.push((stats.correct / stats.attempted) * 100)
            }
          })
        }
      })
      
      const topicPerformance = Object.entries(topicStats)
        .map(([topic, stats]) => {
          const accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0
          const avgTime = stats.attempted > 0 ? Math.round((stats.totalTime / stats.attempted / 60) * 10) / 10 : 0
          
          // Calculate trend (compare recent vs older performance)
          let trend = 0
          if (stats.scores.length >= 2) {
            const recent = stats.scores.slice(-Math.ceil(stats.scores.length / 2))
            const older = stats.scores.slice(0, Math.floor(stats.scores.length / 2))
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
            const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
            trend = Math.round(recentAvg - olderAvg)
          }
          
          return {
            topic,
            attempted: stats.attempted,
            correct: stats.correct,
            accuracy,
            avgTime,
            trend
          }
        })
        .sort((a, b) => b.attempted - a.attempted)
      
      // Difficulty analysis
      const difficultyStats: Record<string, { attempted: number, correct: number }> = {
        'Easy': { attempted: 0, correct: 0 },
        'Medium': { attempted: 0, correct: 0 },
        'Hard': { attempted: 0, correct: 0 }
      }
      
      history.forEach(test => {
        if (test.difficultyBreakdown) {
          Object.entries(test.difficultyBreakdown).forEach(([difficulty, stats]: [string, any]) => {
            if (difficultyStats[difficulty]) {
              difficultyStats[difficulty].attempted += stats.attempted || 0
              difficultyStats[difficulty].correct += stats.correct || 0
            }
          })
        }
      })
      
      const difficultyAnalysis = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
        difficulty,
        attempted: stats.attempted,
        correct: stats.correct,
        accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
        value: stats.attempted
      }))
      
      // Recent tests with trend
      const recentTests = allHistory.slice(0, 5).map((test, index) => {
        let trend: 'up' | 'down' | 'same' = 'same'
        if (index < allHistory.length - 1) {
          const prevTest = allHistory[index + 1]
          if (test.percentage > prevTest.percentage) trend = 'up'
          else if (test.percentage < prevTest.percentage) trend = 'down'
        }
        
        return {
          id: test.id,
          testId: test.testId, // Add testId for correct navigation
          title: test.testTitle,
          date: new Date(test.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          score: test.score,
          percentage: test.percentage,
          timeTaken: Math.round(test.timeTaken / 60),
          trend
        }
      })
      
      // Weak areas with priority
      const weakAreas = topicPerformance
        .filter(topic => topic.attempted > 0 && topic.accuracy < 70)
        .map(topic => ({
          topic: topic.topic,
          subtopic: `${topic.topic} concepts`,
          accuracy: topic.accuracy,
          suggestion: generateSuggestion(topic.topic, topic.accuracy),
          priority: topic.accuracy < 40 ? 'high' as const : 
                   topic.accuracy < 60 ? 'medium' as const : 
                   'low' as const
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5)
      
      setAnalyticsData({
        overview: {
          totalTests,
          totalQuestions,
          averageScore,
          studyStreak,
          totalTimeSpent,
          overallAccuracy,
          improvement,
          bestScore
        },
        performanceTrend,
        topicPerformance,
        difficultyAnalysis,
        recentTests,
        weakAreas
      })
      
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const generateSuggestion = (topic: string, accuracy: number): string => {
    if (accuracy < 40) {
      return `Focus on fundamental concepts in ${topic}. Start with easier problems and gradually increase difficulty.`
    } else if (accuracy < 60) {
      return `Practice more ${topic} problems. Focus on understanding solution patterns and common mistakes.`
    } else {
      return `Good progress in ${topic}! Challenge yourself with harder problems to reach mastery.`
    }
  }

  const getEmptyAnalyticsData = (): AnalyticsData => ({
    overview: {
      totalTests: 0,
      totalQuestions: 0,
      averageScore: 0,
      studyStreak: 0,
      totalTimeSpent: 0,
      overallAccuracy: 0,
      improvement: 0,
      bestScore: 0
    },
    performanceTrend: [],
    topicPerformance: [],
    difficultyAnalysis: [
      { difficulty: 'Easy', attempted: 0, correct: 0, accuracy: 0, value: 0 },
      { difficulty: 'Medium', attempted: 0, correct: 0, accuracy: 0, value: 0 },
      { difficulty: 'Hard', attempted: 0, correct: 0, accuracy: 0, value: 0 }
    ],
    recentTests: [],
    weakAreas: []
  })

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 mx-auto"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Analyzing your performance...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={loadAnalytics}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Retry
            </button>
            <Link
              href="/dashboard"
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const data = analyticsData || getEmptyAnalyticsData()
  const hasData = data.overview.totalTests > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Performance Analytics</h1>
                <p className="text-xs text-gray-500">Track your progress and improve</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
                className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="all">All time</option>
              </select>
              <Link
                href="/dashboard"
                className="px-4 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium text-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Empty State */}
        {!hasData ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
              <p className="text-gray-600 mb-6">
                Start taking tests to see your performance analytics and track your progress.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Take Your First Test
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-xl font-bold text-gray-900">{data.overview.totalTests}</span>
                </div>
                <p className="text-xs text-gray-600">Tests Taken</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900">{data.overview.averageScore}%</span>
                    {data.overview.improvement !== 0 && (
                      <div className={`flex items-center justify-end text-xs ${data.overview.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.overview.improvement > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(data.overview.improvement)}%
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">Avg Score</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-xl font-bold text-gray-900">{data.overview.overallAccuracy}%</span>
                </div>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <span className="text-xl font-bold text-gray-900">{data.overview.studyStreak}</span>
                </div>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  <span className="text-xl font-bold text-gray-900">{data.overview.totalQuestions}</span>
                </div>
                <p className="text-xs text-gray-600">Questions</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="text-xl font-bold text-gray-900">{Math.floor(data.overview.totalTimeSpent / 3600)}h</span>
                </div>
                <p className="text-xs text-gray-600">Time Spent</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-5 w-5 text-green-500" />
                  <span className="text-xl font-bold text-gray-900">{data.overview.bestScore}%</span>
                </div>
                <p className="text-xs text-gray-600">Best Score</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <Percent className="h-5 w-5 text-orange-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {data.overview.improvement > 0 ? '+' : ''}{data.overview.improvement}%
                  </span>
                </div>
                <p className="text-xs text-gray-600">Improvement</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Performance Trend */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
                    Performance Trend
                  </h3>
                  <span className="text-xs text-gray-500">Score & Accuracy over time</span>
                </div>
                {data.performanceTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.performanceTrend}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="score" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorScore)" name="Score %" strokeWidth={2} />
                      <Area type="monotone" dataKey="accuracy" stroke={CHART_COLORS.success} fillOpacity={1} fill="url(#colorAccuracy)" name="Accuracy %" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-400">
                    <p>No trend data available</p>
                  </div>
                )}
              </div>

              {/* Topic Performance */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
                    Topic Performance
                  </h3>
                  <span className="text-xs text-gray-500">Accuracy by topic</span>
                </div>
                {data.topicPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.topicPerformance.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="topic" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="accuracy" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-400">
                    <p>No topic data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Analysis & Topic Details */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Difficulty Pie Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Analysis</h3>
                {data.difficultyAnalysis.some(d => d.attempted > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.difficultyAnalysis}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.difficultyAnalysis.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-around mt-4">
                      {data.difficultyAnalysis.map((item) => (
                        <div key={item.difficulty} className="text-center">
                          <div className="flex items-center space-x-1 mb-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS] }}
                            />
                            <span className="text-xs text-gray-600">{item.difficulty}</span>
                          </div>
                          <p className="text-sm font-semibold">{item.accuracy}%</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400">
                    <p className="text-sm">No difficulty data</p>
                  </div>
                )}
              </div>

              {/* Topic Breakdown */}
              <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Breakdown</h3>
                {data.topicPerformance.length > 0 ? (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {data.topicPerformance.map((topic, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                          <div className="flex items-center space-x-2">
                            {topic.trend !== 0 && (
                              <span className={`text-xs flex items-center ${topic.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {topic.trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {Math.abs(topic.trend)}%
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {topic.correct}/{topic.attempted} • {topic.accuracy}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${topic.accuracy}%`,
                              backgroundColor: topic.accuracy >= 70 ? CHART_COLORS.success : 
                                             topic.accuracy >= 50 ? CHART_COLORS.warning : 
                                             CHART_COLORS.danger
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400">
                    <p>No topic performance data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Tests & Weak Areas */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Recent Tests */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                  Recent Tests
                </h3>
                <div className="space-y-3">
                  {data.recentTests.length > 0 ? (
                    data.recentTests.map((test) => (
                      <Link
                        key={test.id}
                        href={`/test/${test.testId}/result?resultId=${test.id}`}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition">
                            {test.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {test.date} • {test.timeTaken} min
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {test.trend !== 'same' && (
                            <div className={`${test.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {test.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                            </div>
                          )}
                          <span className={`font-semibold ${
                            test.percentage >= 80 ? 'text-green-600' :
                            test.percentage >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {test.percentage}%
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No tests taken yet</p>
                      <Link href="/dashboard" className="text-indigo-600 hover:underline text-sm">
                        Take your first test →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Weak Areas */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  Areas for Improvement
                </h3>
                <div className="space-y-4">
                  {data.weakAreas.length > 0 ? (
                    data.weakAreas.map((area, index) => (
                      <div 
                        key={index} 
                        className={`border-l-4 pl-4 ${
                          area.priority === 'high' ? 'border-red-500' :
                          area.priority === 'medium' ? 'border-yellow-500' :
                          'border-blue-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900">{area.topic}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              area.priority === 'high' ? 'bg-red-100 text-red-700' :
                              area.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {area.priority}
                            </span>
                            <span className="text-sm text-red-600 font-medium">{area.accuracy}%</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{area.subtopic}</p>
                        <p className="text-xs text-gray-500 italic">{area.suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="mb-2 font-medium">Excellent Performance!</p>
                      <p className="text-sm">No weak areas detected. Keep up the great work!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Study Recommendations */}
            {data.overview.totalTests > 0 && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Personalized Study Plan</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Focus Areas
                    </h4>
                    <ul className="text-sm space-y-1">
                      {data.weakAreas.length > 0 ? (
                        data.weakAreas.slice(0, 3).map((area, i) => (
                          <li key={i}>• {area.topic} ({area.accuracy}%)</li>
                        ))
                      ) : (
                        <>
                          <li>• Maintain current performance</li>
                          <li>• Try harder difficulty levels</li>
                          <li>• Explore new topics</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Recommended Practice
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• {Math.max(10, Math.round(30 - data.overview.totalQuestions / 20))} questions daily</li>
                      <li>• {data.overview.totalTests < 10 ? '3-4' : '2-3'} mock tests weekly</li>
                      <li>• Focus on {data.overview.averageScore < 60 ? 'Medium' : 'Hard'} difficulty</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      Weekly Goals
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Reach {Math.min(95, data.overview.overallAccuracy + 10)}% accuracy</li>
                      <li>• Complete {Math.round(data.overview.totalQuestions * 0.3)} questions</li>
                      <li>• {data.overview.studyStreak > 0 ? `Extend ${data.overview.studyStreak}-day streak` : 'Start a 7-day streak'}</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Link
                    href="/dashboard"
                    className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-medium"
                  >
                    Start Practicing Now →
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}