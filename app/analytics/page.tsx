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
  primary: '#0891B2',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#F43F5E',
  purple: '#8B5CF6',
  pink: '#EC4899'
}

const DIFFICULTY_COLORS = {
  Easy: '#10B981',
  Medium: '#F59E0B',
  Hard: '#F43F5E'
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
        <div className="bg-[var(--background-elevated)] p-3 rounded-[var(--radius-sm)] shadow-lg border border-[var(--border-color)]">
          <p className="text-[var(--text-sm)] font-semibold text-[var(--foreground)]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-[var(--text-sm)]" style={{ color: entry.color }}>
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
      <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Brain className="h-12 w-12 text-[var(--color-primary)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--foreground-secondary)]">Analyzing your performance...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="card-airbnb max-w-md w-full animate-scale-in">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-error)]/10 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-[var(--color-error)]" />
            </div>
            <h2 className="heading-airbnb-4 mb-2">Error Loading Analytics</h2>
            <p className="text-airbnb-body mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={loadAnalytics}
                className="btn-airbnb btn-airbnb-primary flex-1"
              >
                Retry
              </button>
              <Link
                href="/dashboard"
                className="btn-airbnb btn-airbnb-secondary flex-1 text-center"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const data = analyticsData || getEmptyAnalyticsData()
  const hasData = data.overview.totalTests > 0

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      {/* Navigation - Airbnb Style */}
      <nav className="bg-[var(--background-elevated)] border-b border-[var(--border-color-light)] sticky top-0 z-10">
        <div className="container-airbnb">
          <div className="flex justify-between h-[72px] items-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-[var(--color-primary)]" />
              <div>
                <h1 className="heading-airbnb-4 mb-0">Performance Analytics</h1>
                <p className="text-[var(--text-xs)] text-[var(--foreground-secondary)]">Track your progress and improve</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
                className="select-airbnb"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="all">All time</option>
              </select>
              <Link
                href="/dashboard"
                className="btn-airbnb btn-airbnb-ghost"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-airbnb py-12">
        {/* Empty State */}
        {!hasData ? (
          <div className="card-airbnb text-center py-16 animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--background-secondary)] rounded-full mb-6">
                <BarChart3 className="h-10 w-10 text-[var(--foreground-muted)]" />
              </div>
              <h2 className="heading-airbnb-2 mb-3">No Data Available</h2>
              <p className="text-airbnb-body mb-8">
                Start taking tests to see your performance analytics and track your progress.
              </p>
              <Link
                href="/dashboard"
                className="btn-airbnb btn-airbnb-primary inline-flex items-center gap-2"
              >
                Take Your First Test
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Stats Section */}
            <div className="mb-10 animate-slide-up">
              <h2 className="heading-airbnb-2 mb-6">Your Performance Overview</h2>
              
              {/* Overview Cards - Airbnb Style */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                <div className="card-airbnb p-6 border border-[var(--border-color-light)] hover-scale">
                  <div className="flex items-center justify-between mb-3">
                    <Trophy className="h-5 w-5 text-[var(--color-warning)]" />
                    <span className="heading-airbnb-3">{data.overview.totalTests}</span>
                  </div>
                  <p className="text-airbnb-small text-[var(--foreground-secondary)]">Tests Taken</p>
                </div>
              
                <div className="card-airbnb p-6 border border-[var(--border-color-light)] hover-scale">
                  <div className="flex items-center justify-between mb-3">
                    <Target className="h-5 w-5 text-[var(--color-success)]" />
                    <div className="text-right">
                      <span className="heading-airbnb-3">{data.overview.averageScore}%</span>
                      {data.overview.improvement !== 0 && (
                        <div className={`flex items-center justify-end text-[var(--text-xs)] mt-1 ${data.overview.improvement > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                          {data.overview.improvement > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(data.overview.improvement)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-airbnb-small text-[var(--foreground-secondary)]">Avg Score</p>
                </div>
              
                <div className="card-airbnb p-6 border border-[var(--border-color-light)] hover-scale">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="h-5 w-5 text-[var(--color-info)]" />
                    <span className="heading-airbnb-3">{data.overview.overallAccuracy}%</span>
                  </div>
                  <p className="text-airbnb-small text-[var(--foreground-secondary)]">Accuracy</p>
                </div>
                
                <div className="card-airbnb p-6 border border-[var(--border-color-light)] hover-scale">
                  <div className="flex items-center justify-between mb-3">
                    <Zap className="h-5 w-5 text-[var(--color-primary)]" />
                    <span className="heading-airbnb-3">{data.overview.studyStreak}</span>
                  </div>
                  <p className="text-airbnb-small text-[var(--foreground-secondary)]">Day Streak</p>
                </div>
                
                <div className="card-airbnb p-6 border border-[var(--border-color-light)] hover-scale">
                  <div className="flex items-center justify-between mb-3">
                    <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                    <span className="heading-airbnb-3">{data.overview.totalQuestions}</span>
                  </div>
                  <p className="text-airbnb-small text-[var(--foreground-secondary)]">Questions</p>
                </div>
                
                <div className="card-airbnb p-6 border border-[var(--border-color-light)] hover-scale">
                  <div className="flex items-center justify-between mb-3">
                    <Clock className="h-5 w-5 text-[var(--color-error)]" />
                    <span className="heading-airbnb-3">{Math.floor(data.overview.totalTimeSpent / 3600)}h</span>
                  </div>
                  <p className="text-airbnb-small text-[var(--foreground-secondary)]">Time Spent</p>
                </div>
                
                <div className="card-airbnb p-6 border border-[var(--border-color-light)] hover-scale">
                  <div className="flex items-center justify-between mb-3">
                    <Award className="h-5 w-5 text-[var(--color-success)]" />
                    <span className="heading-airbnb-3">{data.overview.bestScore}%</span>
                  </div>
                  <p className="text-airbnb-small text-[var(--foreground-secondary)]">Best Score</p>
                </div>
                
                <div className="card-airbnb p-6 border border-[var(--border-color-light)] hover-scale">
                  <div className="flex items-center justify-between mb-3">
                    <Percent className="h-5 w-5 text-[var(--color-warning)]" />
                    <span className="heading-airbnb-3">
                      {data.overview.improvement > 0 ? '+' : ''}{data.overview.improvement}%
                    </span>
                  </div>
                  <p className="text-airbnb-small text-[var(--foreground-secondary)]">Improvement</p>
                </div>
              </div>
            {/* Charts Section - Airbnb Style */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Performance Trend */}
              <div className="card-airbnb">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-airbnb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
                    Performance Trend
                  </h3>
                  <span className="text-airbnb-xs">Score & Accuracy over time</span>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--foreground-secondary)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--foreground-secondary)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 'var(--text-sm)' }} />
                      <Area type="monotone" dataKey="score" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorScore)" name="Score %" strokeWidth={2} />
                      <Area type="monotone" dataKey="accuracy" stroke={CHART_COLORS.success} fillOpacity={1} fill="url(#colorAccuracy)" name="Accuracy %" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-[var(--foreground-muted)]">
                    <p>No trend data available</p>
                  </div>
                )}
              </div>

              {/* Topic Performance */}
              <div className="card-airbnb">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="heading-airbnb-3 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
                    Topic Performance
                  </h3>
                  <span className="text-airbnb-xs">Accuracy by topic</span>
                </div>
                {data.topicPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.topicPerformance.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" />
                      <XAxis dataKey="topic" tick={{ fontSize: 11, fill: 'var(--foreground-secondary)' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--foreground-secondary)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="accuracy" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-[var(--foreground-muted)]">
                    <p>No topic data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Analysis & Topic Details */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Difficulty Pie Chart */}
              <div className="card-airbnb">
                <h3 className="heading-airbnb-3 mb-6">Difficulty Analysis</h3>
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
                          <div className="flex items-center gap-1 mb-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS] }}
                            />
                            <span className="text-airbnb-xs">{item.difficulty}</span>
                          </div>
                          <p className="text-[var(--text-sm)] font-semibold text-[var(--foreground)]">{item.accuracy}%</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-[var(--foreground-muted)]">
                    <p className="text-[var(--text-sm)]">No difficulty data</p>
                  </div>
                )}
              </div>

              {/* Topic Breakdown */}
              <div className="card-airbnb lg:col-span-2">
                <h3 className="heading-airbnb-3 mb-6">Topic Breakdown</h3>
                {data.topicPerformance.length > 0 ? (
                  <div className="space-y-4 max-h-[280px] overflow-y-auto">
                    {data.topicPerformance.map((topic, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[var(--text-base)] font-medium text-[var(--foreground)]">{topic.topic}</span>
                          <div className="flex items-center gap-3">
                            {topic.trend !== 0 && (
                              <span className={`text-[var(--text-xs)] flex items-center gap-1 ${topic.trend > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                                {topic.trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {Math.abs(topic.trend)}%
                              </span>
                            )}
                            <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                              {topic.correct}/{topic.attempted} • {topic.accuracy}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-[var(--background-secondary)] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-[var(--transition-slow)] ease-out"
                            style={{ 
                              width: `${topic.accuracy}%`,
                              backgroundColor: topic.accuracy >= 70 ? 'var(--color-success)' : 
                                             topic.accuracy >= 50 ? 'var(--color-warning)' : 
                                             'var(--color-error)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-[var(--foreground-muted)]">
                    <p>No topic performance data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Tests & Weak Areas */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Tests */}
              <div className="card-airbnb">
                <h3 className="heading-airbnb-3 mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
                  Recent Tests
                </h3>
                <div className="space-y-2">
                  {data.recentTests.length > 0 ? (
                    data.recentTests.map((test) => (
                      <Link
                        key={test.id}
                        href={`/test/${test.testId}/result?resultId=${test.id}`}
                        className="flex items-center justify-between p-4 -mx-4 rounded-[var(--radius-base)] hover:bg-[var(--background-secondary)] transition-all duration-[var(--transition-base)] group"
                      >
                        <div className="flex-1">
                          <p className="text-[var(--text-base)] font-medium text-[var(--foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                            {test.title}
                          </p>
                          <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">
                            {test.date} • {test.timeTaken} min
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {test.trend !== 'same' && (
                            <div className={`${test.trend === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                              {test.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                            </div>
                          )}
                          <span className={`font-semibold ${
                            test.percentage >= 80 ? 'text-[var(--color-success)]' :
                            test.percentage >= 60 ? 'text-[var(--color-warning)]' :
                            'text-[var(--color-error)]'
                          }`}>
                            {test.percentage}%
                          </span>
                          <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)] group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[var(--foreground-secondary)]">
                      <p className="mb-2">No tests taken yet</p>
                      <Link href="/dashboard" className="text-[var(--color-primary)] hover:underline text-[var(--text-sm)]">
                        Take your first test →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Weak Areas */}
              <div className="card-airbnb">
                <h3 className="heading-airbnb-3 mb-6 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[var(--color-error)]" />
                  Areas for Improvement
                </h3>
                <div className="space-y-4">
                  {data.weakAreas.length > 0 ? (
                    data.weakAreas.map((area, index) => (
                      <div 
                        key={index} 
                        className={`border-l-4 pl-4 ${
                          area.priority === 'high' ? 'border-[var(--color-error)]' :
                          area.priority === 'medium' ? 'border-[var(--color-warning)]' :
                          'border-[var(--color-info)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[var(--text-base)] font-medium text-[var(--foreground)]">{area.topic}</p>
                          <div className="flex items-center gap-2">
                            <span className={`badge-airbnb ${
                              area.priority === 'high' ? 'badge-airbnb-error' :
                              area.priority === 'medium' ? 'badge-airbnb-warning' :
                              'badge-airbnb-primary'
                            }`}>
                              {area.priority}
                            </span>
                            <span className="text-[var(--text-sm)] text-[var(--color-error)] font-medium">{area.accuracy}%</span>
                          </div>
                        </div>
                        <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)] mb-2">{area.subtopic}</p>
                        <p className="text-[var(--text-xs)] text-[var(--foreground-muted)] italic">{area.suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-success)]/10 rounded-full mb-4">
                        <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
                      </div>
                      <p className="text-[var(--text-base)] font-medium text-[var(--foreground)] mb-2">Excellent Performance!</p>
                      <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">No weak areas detected. Keep up the great work!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Study Recommendations - Airbnb Style */}
            {data.overview.totalTests > 0 && (
              <div className="card-airbnb bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white p-8">
                <h3 className="heading-airbnb-2 mb-8 text-white">Your Personalized Study Plan</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/20 backdrop-blur rounded-[var(--radius-base)] p-6">
                    <h4 className="text-[var(--text-lg)] font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Focus Areas
                    </h4>
                    <ul className="text-[var(--text-sm)] space-y-2 text-white/90">
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
                  
                  <div className="bg-white/20 backdrop-blur rounded-[var(--radius-base)] p-6">
                    <h4 className="text-[var(--text-lg)] font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Recommended Practice
                    </h4>
                    <ul className="text-[var(--text-sm)] space-y-2 text-white/90">
                      <li>• {Math.max(10, Math.round(30 - data.overview.totalQuestions / 20))} questions daily</li>
                      <li>• {data.overview.totalTests < 10 ? '3-4' : '2-3'} mock tests weekly</li>
                      <li>• Focus on {data.overview.averageScore < 60 ? 'Medium' : 'Hard'} difficulty</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur rounded-[var(--radius-base)] p-6">
                    <h4 className="text-[var(--text-lg)] font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Weekly Goals
                    </h4>
                    <ul className="text-[var(--text-sm)] space-y-2 text-white/90">
                      <li>• Reach {Math.min(95, data.overview.overallAccuracy + 10)}% accuracy</li>
                      <li>• Complete {Math.round(data.overview.totalQuestions * 0.3)} questions</li>
                      <li>• {data.overview.studyStreak > 0 ? `Extend ${data.overview.studyStreak}-day streak` : 'Start a 7-day streak'}</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/dashboard"
                    className="btn-airbnb bg-white text-[var(--color-primary)] hover:bg-[var(--background-secondary)] px-8 py-3"
                  >
                    Start Practicing Now →
                  </Link>
                </div>
              </div>
            )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}