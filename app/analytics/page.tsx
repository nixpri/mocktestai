'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Brain, TrendingUp, Target, Clock, Award, 
  BarChart3, Activity, Calendar, ChevronRight,
  BookOpen, Zap, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface AnalyticsData {
  overview: {
    totalTests: number
    totalQuestions: number
    averageScore: number
    studyStreak: number
    totalTimeSpent: number
    overallAccuracy: number
  }
  performanceTrend: Array<{
    date: string
    score: number
    accuracy: number
  }>
  topicPerformance: Array<{
    topic: string
    attempted: number
    correct: number
    accuracy: number
    avgTime: number
  }>
  difficultyAnalysis: Array<{
    difficulty: string
    attempted: number
    correct: number
    accuracy: number
  }>
  recentTests: Array<{
    id: string
    title: string
    date: string
    score: number
    percentage: number
    timeTaken: number
  }>
  weakAreas: Array<{
    topic: string
    subtopic: string
    accuracy: number
    suggestion: string
  }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
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
      const data = await response.json()
      
      if (!data.success) {
        console.error('Failed to fetch test results')
        setTestHistory([])
        return
      }
      
      const history = data.testHistory || []
      setTestHistory(history)
      
      // Calculate real statistics from test history
      let analyticsData: AnalyticsData
      
      if (history.length > 0) {
        // Calculate overview stats
        const totalTests = history.length
        const totalQuestions = history.reduce((sum: number, test: any) => sum + test.totalQuestions, 0)
        const totalScore = history.reduce((sum: number, test: any) => sum + test.score, 0)
        const averageScore = Math.round((totalScore / (history.reduce((sum: number, test: any) => sum + test.totalMarks, 0) || 1)) * 100)
        const totalCorrect = history.reduce((sum: number, test: any) => sum + test.correct, 0)
        const overallAccuracy = Math.round((totalCorrect / (totalQuestions || 1)) * 100)
        
        // Calculate streak (simplified)
        const today = new Date()
        // Calculate real streak based on consecutive days with tests
        let studyStreak = 0
        if (history.length > 0) {
          const sortedHistory = [...history].sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          
          let currentDate = new Date()
          let consecutiveDays = 0
          
          for (const test of sortedHistory) {
            const testDate = new Date(test.date)
            const dayDiff = Math.floor((currentDate.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24))
            
            if (dayDiff <= 1) {
              consecutiveDays++
              currentDate = testDate
            } else {
              break
            }
          }
          
          studyStreak = consecutiveDays
        }
        
        // Performance trend from last 7 tests
        const performanceTrend = history.slice(-7).map((test: any) => ({
          date: new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: test.percentage,
          accuracy: Math.round((test.correct / test.totalQuestions) * 100)
        }))
        
        // Topic performance (aggregated from real test data)
        const topicStats: { [key: string]: { attempted: number, correct: number, totalTime: number } } = {}
        
        // Aggregate topic performance from test history
        history.forEach((test: any) => {
          if (test.topicBreakdown) {
            Object.entries(test.topicBreakdown).forEach(([topic, stats]: [string, any]) => {
              if (!topicStats[topic]) {
                topicStats[topic] = { attempted: 0, correct: 0, totalTime: 0 }
              }
              topicStats[topic].attempted += stats.attempted || 0
              topicStats[topic].correct += stats.correct || 0
              topicStats[topic].totalTime += stats.totalTime || 0
            })
          }
        })
        
        // Convert to array format and ensure we have data for visualization
        let topicPerformance = Object.entries(topicStats).map(([topic, stats]) => ({
          topic,
          attempted: stats.attempted,
          correct: stats.correct,
          accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
          avgTime: stats.attempted > 0 ? Math.round((stats.totalTime / stats.attempted / 60) * 10) / 10 : 0
        }))
        
        // Always show at least default topics for the radar chart to render
        const defaultTopics = ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics', 'Waves']
        if (topicPerformance.length === 0) {
          topicPerformance = defaultTopics.map(topic => ({
            topic,
            attempted: 0,
            correct: 0,
            accuracy: 0,
            avgTime: 0
          }))
        } else {
          // Add missing default topics with zero values
          defaultTopics.forEach(defaultTopic => {
            if (!topicPerformance.find(t => t.topic === defaultTopic)) {
              topicPerformance.push({
                topic: defaultTopic,
                attempted: 0,
                correct: 0,
                accuracy: 0,
                avgTime: 0
              })
            }
          })
        }
        
        // Recent tests
        const recentTests = history.slice(-5).reverse().map((test: any, index: number) => ({
          id: test.testId,
          title: test.testTitle,
          date: new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          score: test.score,
          percentage: test.percentage,
          timeTaken: Math.round(test.timeTaken / 60)
        }))
        
        // Difficulty analysis from real test data
        const difficultyStats: { [key: string]: { attempted: number, correct: number } } = {
          'Easy': { attempted: 0, correct: 0 },
          'Medium': { attempted: 0, correct: 0 },
          'Hard': { attempted: 0, correct: 0 }
        }
        
        history.forEach((test: any) => {
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
          accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0
        }))
        
        // Calculate weak areas from actual performance
        const weakAreas: any[] = []
        topicPerformance.forEach(topic => {
          // Only consider topics that have been attempted
          if (topic.attempted > 0 && topic.accuracy < 60) {
            weakAreas.push({
              topic: topic.topic,
              subtopic: `${topic.topic} concepts`,
              accuracy: Math.round(topic.accuracy),
              suggestion: `Practice more ${topic.topic} problems to improve accuracy from ${Math.round(topic.accuracy)}%`
            })
          }
        })
        
        // Sort weak areas by accuracy (lowest first)
        weakAreas.sort((a, b) => a.accuracy - b.accuracy)
        
        analyticsData = {
          overview: {
            totalTests,
            totalQuestions,
            averageScore,
            studyStreak,
            totalTimeSpent: history.reduce((sum: number, test: any) => sum + (test.timeTaken / 60), 0),
            overallAccuracy
          },
          performanceTrend: performanceTrend.length > 0 ? performanceTrend : [
            { date: 'No Data', score: 0, accuracy: 0 }
          ],
          topicPerformance,
          difficultyAnalysis,
          recentTests: recentTests.length > 0 ? recentTests : [],
          weakAreas: weakAreas.slice(0, 3) // Show top 3 weak areas
        }
      } else {
        // No test history - show empty data state
        analyticsData = {
          overview: {
            totalTests: 0,
            totalQuestions: 0,
            averageScore: 0,
            studyStreak: 0,
            totalTimeSpent: 0,
            overallAccuracy: 0
          },
          performanceTrend: [{ date: 'Take a test', score: 0, accuracy: 0 }],
          topicPerformance: [
            { topic: 'Mechanics', attempted: 0, correct: 0, accuracy: 0, avgTime: 0 },
            { topic: 'Thermodynamics', attempted: 0, correct: 0, accuracy: 0, avgTime: 0 },
            { topic: 'Electromagnetism', attempted: 0, correct: 0, accuracy: 0, avgTime: 0 },
            { topic: 'Optics', attempted: 0, correct: 0, accuracy: 0, avgTime: 0 },
            { topic: 'Modern Physics', attempted: 0, correct: 0, accuracy: 0, avgTime: 0 },
            { topic: 'Waves', attempted: 0, correct: 0, accuracy: 0, avgTime: 0 },
          ],
          difficultyAnalysis: [
            { difficulty: 'Easy', attempted: 0, correct: 0, accuracy: 0 },
            { difficulty: 'Medium', attempted: 0, correct: 0, accuracy: 0 },
            { difficulty: 'Hard', attempted: 0, correct: 0, accuracy: 0 },
          ],
          recentTests: [],
          weakAreas: []
        }
      }

      setAnalyticsData(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
          <Link href="/dashboard" className="mt-4 text-indigo-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Performance Analytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="all">All time</option>
              </select>
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold">{analyticsData.overview.totalTests}</span>
            </div>
            <p className="text-sm text-gray-600">Tests Taken</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">{analyticsData.overview.averageScore}%</span>
            </div>
            <p className="text-sm text-gray-600">Avg Score</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">{analyticsData.overview.overallAccuracy}%</span>
            </div>
            <p className="text-sm text-gray-600">Accuracy</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">{analyticsData.overview.studyStreak}</span>
            </div>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-8 w-8 text-indigo-500" />
              <span className="text-2xl font-bold">{analyticsData.overview.totalQuestions}</span>
            </div>
            <p className="text-sm text-gray-600">Questions</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">{Math.floor(analyticsData.overview.totalTimeSpent / 60)}h</span>
            </div>
            <p className="text-sm text-gray-600">Time Spent</p>
          </div>
        </div>

        {/* Performance Trend & Topic Performance */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
              Performance Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#4F46E5" name="Score %" strokeWidth={2} />
                <Line type="monotone" dataKey="accuracy" stroke="#10B981" name="Accuracy %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Performance Radar */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
              Topic-wise Performance
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={analyticsData.topicPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="topic" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Accuracy %" dataKey="accuracy" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Analysis & Topic Breakdown */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Difficulty Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Difficulty Analysis</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analyticsData.difficultyAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ difficulty, accuracy }) => `${difficulty}: ${accuracy}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="accuracy"
                >
                  {analyticsData.difficultyAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Topic Breakdown</h3>
            <div className="space-y-3">
              {analyticsData.topicPerformance.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                      <span className="text-sm text-gray-500">
                        {topic.correct}/{topic.attempted} correct • {topic.accuracy}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tests & Weak Areas */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
              Recent Tests
            </h3>
            <div className="space-y-3">
              {analyticsData.recentTests.length > 0 ? (
                analyticsData.recentTests.map((test) => (
                <Link
                  key={test.id}
                  href={`/test/${test.id}/result`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{test.title}</p>
                    <p className="text-sm text-gray-500">{test.date} • {test.timeTaken} min</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${
                      test.percentage >= 80 ? 'text-green-600' :
                      test.percentage >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {test.percentage}%
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
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
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              Areas for Improvement
            </h3>
            <div className="space-y-4">
              {analyticsData.weakAreas.length > 0 ? (
                analyticsData.weakAreas.map((area, index) => (
                <div key={index} className="border-l-4 border-red-400 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{area.topic}</p>
                    <span className="text-sm text-red-600">{area.accuracy}% accuracy</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{area.subtopic}</p>
                  <p className="text-xs text-gray-500 italic">{area.suggestion}</p>
                </div>
              ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">Great job! No weak areas detected</p>
                  <p className="text-sm">Keep practicing to maintain your performance</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Study Recommendations - Based on actual data */}
        {analyticsData.overview.totalTests > 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Personalized Study Plan</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="font-semibold mb-2">Focus Areas</h4>
                <ul className="text-sm space-y-1">
                  {analyticsData.weakAreas.length > 0 ? (
                    analyticsData.weakAreas.slice(0, 3).map((area, i) => (
                      <li key={i}>• {area.topic}</li>
                    ))
                  ) : (
                    <li>• Keep practicing all topics</li>
                  )}
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="font-semibold mb-2">Recommended Practice</h4>
                <ul className="text-sm space-y-1">
                  <li>• {Math.max(10, 30 - analyticsData.overview.totalQuestions / 10)} questions daily</li>
                  <li>• {analyticsData.overview.totalTests < 5 ? '3' : '2'} mock tests weekly</li>
                  <li>• Focus on {analyticsData.overview.averageScore < 60 ? 'Medium' : 'Hard'} problems</li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="font-semibold mb-2">Target This Week</h4>
                <ul className="text-sm space-y-1">
                  <li>• Improve accuracy to {Math.min(95, analyticsData.overview.overallAccuracy + 10)}%</li>
                  <li>• Complete {Math.max(50, analyticsData.overview.totalQuestions + 20)} questions</li>
                  <li>• {analyticsData.overview.studyStreak > 0 ? `Maintain ${analyticsData.overview.studyStreak}-day streak` : 'Start a study streak'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}