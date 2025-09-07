'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Sparkles, Loader2, AlertCircle, BookOpen, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function GenerateTestPage() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick')
  const [formData, setFormData] = useState({
    title: 'JEE Physics Mock Test',
    topics: ['mechanics'],
    totalQuestions: 10,
    duration: 60,
    difficulty: {
      easy: 3,
      medium: 5,
      hard: 2
    }
  })

  const quickTestPresets = [
    {
      id: 'quick-5',
      title: 'Quick Practice',
      questions: 5,
      duration: 15,
      icon: Zap,
      color: 'bg-gradient-to-br from-[var(--color-info)] to-[var(--color-primary)]',
      description: 'Perfect for a quick revision'
    },
    {
      id: 'standard-10',
      title: 'Standard Test',
      questions: 10,
      duration: 30,
      icon: BookOpen,
      color: 'bg-gradient-to-br from-[var(--color-success)] to-teal-500',
      description: 'Balanced practice session'
    },
    {
      id: 'full-20',
      title: 'Full Mock Test',
      questions: 20,
      duration: 60,
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-[var(--color-warning)] to-orange-500',
      description: 'Complete exam simulation'
    }
  ]

  const topics = [
    { id: 'mechanics', name: 'Mechanics', icon: '⚙️' },
    { id: 'thermodynamics', name: 'Thermodynamics', icon: '🔥' },
    { id: 'electromagnetism', name: 'Electromagnetism', icon: '⚡' },
    { id: 'optics', name: 'Optics', icon: '💡' },
    { id: 'modern-physics', name: 'Modern Physics', icon: '⚛️' },
    { id: 'waves', name: 'Waves & Oscillations', icon: '〰️' }
  ]

  const handleQuickTest = async (preset: typeof quickTestPresets[0]) => {
    setGenerating(true)
    setError(null)
    
    const quickFormData = {
      title: preset.title,
      topics: ['mechanics', 'thermodynamics'],
      totalQuestions: preset.questions,
      duration: preset.duration,
      difficulty: {
        easy: Math.floor(preset.questions * 0.3),
        medium: Math.floor(preset.questions * 0.5),
        hard: Math.floor(preset.questions * 0.2)
      }
    }

    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mock_test',
          params: {
            ...quickFormData,
            difficultyDistribution: quickFormData.difficulty
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes('overloaded')) {
          throw new Error('AI service is busy. Please try again in a moment.')
        } else if (data.error?.includes('API key')) {
          throw new Error('AI service not configured. Please contact support.')
        } else {
          throw new Error(data.details || data.error || 'Failed to generate test')
        }
      }

      if (data.success && data.test) {
        localStorage.setItem(`ai_test_${data.test.id}`, JSON.stringify({
          test: data.test,
          questions: data.questions || []
        }))
        router.push(`/test/${data.test.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the test')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateTest = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mock_test',
          params: {
            ...formData,
            difficultyDistribution: formData.difficulty
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes('overloaded')) {
          throw new Error('AI service is busy. Please try again in a moment.')
        } else if (data.error?.includes('API key')) {
          throw new Error('AI service not configured. Please contact support.')
        } else {
          throw new Error(data.details || data.error || 'Failed to generate test')
        }
      }

      if (data.success && data.test) {
        localStorage.setItem(`ai_test_${data.test.id}`, JSON.stringify({
          test: data.test,
          questions: data.questions || []
        }))
        router.push(`/test/${data.test.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the test')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      {/* Header */}
      <nav className="bg-[var(--background-elevated)] border-b border-[var(--border-color-light)]">
        <div className="container-airbnb">
          <div className="flex justify-between h-[72px] items-center">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-[var(--color-primary)]" />
              <span className="text-[var(--text-xl)] font-semibold text-[var(--foreground)]">MockTest AI</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors text-[var(--text-sm)]"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container-airbnb py-12">
        {/* Page Header */}
        <div className="text-center mb-10 animate-fade-in pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="heading-airbnb-1 mb-3">Generate AI-Powered Test</h1>
          <p className="text-airbnb-body max-w-2xl mx-auto">
            Create personalized mock tests with our advanced AI. Choose from quick presets or customize every detail.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-[var(--background-secondary)] rounded-[var(--radius-base)]">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-6 py-3 rounded-[var(--radius-sm)] font-medium transition-all ${
                activeTab === 'quick' 
                  ? 'bg-white text-[var(--foreground)] shadow-sm' 
                  : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Quick Start
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-6 py-3 rounded-[var(--radius-sm)] font-medium transition-all ${
                activeTab === 'custom' 
                  ? 'bg-white text-[var(--foreground)] shadow-sm' 
                  : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Custom Test
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-[var(--radius-base)] animate-slide-up">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-[var(--color-error)]" />
              <p className="text-[var(--color-error)] text-[var(--text-sm)]">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {generating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Generating Test...</h3>
                <p className="text-[var(--foreground-secondary)] text-center">
                  Using AI to create personalized questions based on JEE patterns. This may take 30-60 seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Start Tab */}
        {activeTab === 'quick' && (
          <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
            {quickTestPresets.map((preset) => {
              const Icon = preset.icon
              return (
                <button
                  key={preset.id}
                  onClick={() => handleQuickTest(preset)}
                  disabled={generating}
                  className="group text-left disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  <div className="card-airbnb p-6 hover-lift transition-all duration-[var(--transition-slow)]">
                    <div className={`w-full h-32 ${preset.color} rounded-[var(--radius-base)] mb-6 flex items-center justify-center`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="heading-airbnb-4 mb-2">{preset.title}</h3>
                    <p className="text-[var(--foreground-secondary)] text-[var(--text-sm)] mb-4">
                      {preset.description}
                    </p>
                    <div className="flex items-center justify-between text-[var(--text-sm)]">
                      <span className="text-[var(--foreground-muted)]">
                        {preset.questions} questions • {preset.duration} mins
                      </span>
                      <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Custom Test Tab */}
        {activeTab === 'custom' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="card-airbnb p-8">
              {/* Test Title */}
              <div className="mb-8">
                <label className="block text-[var(--text-sm)] font-medium text-[var(--foreground)] mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-[var(--border-color)] rounded-[var(--radius-base)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] transition-all duration-[var(--transition-base)] hover:border-[var(--border-color-hover)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  placeholder="Enter test title"
                />
              </div>

              {/* Topics Selection */}
              <div className="mb-8">
                <label className="block text-[var(--text-sm)] font-medium text-[var(--foreground)] mb-4">
                  Select Topics
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        const newTopics = formData.topics.includes(topic.id)
                          ? formData.topics.filter(t => t !== topic.id)
                          : [...formData.topics, topic.id]
                        setFormData({...formData, topics: newTopics})
                      }}
                      className={`p-3 rounded-[var(--radius-sm)] border transition-all ${
                        formData.topics.includes(topic.id)
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
                          : 'border-[var(--border-color)] hover:border-[var(--foreground-secondary)]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">{topic.icon}</span>
                        <span className="text-[var(--text-sm)] font-medium">{topic.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Configuration */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[var(--text-sm)] font-medium text-[var(--foreground)] mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 0
                      setFormData({
                        ...formData,
                        totalQuestions: total,
                        difficulty: {
                          easy: Math.floor(total * 0.3),
                          medium: Math.floor(total * 0.5),
                          hard: Math.floor(total * 0.2)
                        }
                      })
                    }}
                    min="5"
                    max="50"
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-[var(--radius-base)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] transition-all duration-[var(--transition-base)] hover:border-[var(--border-color-hover)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-sm)] font-medium text-[var(--foreground)] mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                    min="15"
                    max="180"
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-[var(--radius-base)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] transition-all duration-[var(--transition-base)] hover:border-[var(--border-color-hover)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Difficulty Distribution */}
              <div className="mb-8">
                <label className="block text-[var(--text-sm)] font-medium text-[var(--foreground)] mb-4">
                  Difficulty Distribution
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--background-secondary)] rounded-[var(--radius-sm)]">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[var(--color-success)]"></div>
                      <span className="text-[var(--text-sm)] font-medium">Easy</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={formData.difficulty.easy}
                        onChange={(e) => setFormData({
                          ...formData,
                          difficulty: {...formData.difficulty, easy: parseInt(e.target.value) || 0}
                        })}
                        min="0"
                        max={formData.totalQuestions}
                        className="w-16 px-2 py-1 text-center border border-[var(--border-color)] rounded-[var(--radius-sm)]"
                      />
                      <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">questions</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--background-secondary)] rounded-[var(--radius-sm)]">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]"></div>
                      <span className="text-[var(--text-sm)] font-medium">Medium</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={formData.difficulty.medium}
                        onChange={(e) => setFormData({
                          ...formData,
                          difficulty: {...formData.difficulty, medium: parseInt(e.target.value) || 0}
                        })}
                        min="0"
                        max={formData.totalQuestions}
                        className="w-16 px-2 py-1 text-center border border-[var(--border-color)] rounded-[var(--radius-sm)]"
                      />
                      <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">questions</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--background-secondary)] rounded-[var(--radius-sm)]">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[var(--color-error)]"></div>
                      <span className="text-[var(--text-sm)] font-medium">Hard</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={formData.difficulty.hard}
                        onChange={(e) => setFormData({
                          ...formData,
                          difficulty: {...formData.difficulty, hard: parseInt(e.target.value) || 0}
                        })}
                        min="0"
                        max={formData.totalQuestions}
                        className="w-16 px-2 py-1 text-center border border-[var(--border-color)] rounded-[var(--radius-sm)]"
                      />
                      <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">questions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateTest}
                disabled={generating || formData.topics.length === 0}
                className="w-full btn-airbnb btn-airbnb-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating Test...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Custom Test</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}