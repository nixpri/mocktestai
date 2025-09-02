'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function GenerateTestPage() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: 'JEE Physics Mock Test',
    topics: ['mechanics', 'thermodynamics', 'electromagnetism'],
    totalQuestions: 5,
    duration: 60,
    difficulty: {
      easy: 2,
      medium: 2,
      hard: 1
    }
  })

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
        // API Error details available in data
        // Provide more specific error messages
        if (data.error?.includes('overloaded')) {
          throw new Error('The AI service is currently busy. Please wait a moment and try again.')
        } else if (data.error?.includes('API key')) {
          throw new Error('AI service not configured. Please contact support.')
        } else {
          throw new Error(data.details || data.error || 'Failed to generate test')
        }
      }

      if (data.success && data.test) {
        // Store test data in localStorage for the test page to load
        localStorage.setItem(`ai_test_${data.test.id}`, JSON.stringify({
          test: data.test,
          questions: data.questions || []
        }))
        
        // Redirect to the generated test
        router.push(`/test/${data.test.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the test')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateSingleQuestion = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'single',
          params: {
            topic: 'mechanics',
            subtopic: 'kinematics',
            difficulty: 'medium',
            questionType: 'mcq'
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Provide more specific error messages for single question generation
        if (data.error?.includes('overloaded')) {
          throw new Error('The AI service is currently busy. Please wait a moment and try again.')
        } else if (data.error?.includes('API key')) {
          throw new Error('AI service not configured. Please contact support.')
        } else {
          throw new Error(data.error || 'Failed to generate question')
        }
      }

      if (data.success) {
        alert('Question generated successfully! Check the console for details.')
        // Question generated successfully
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the question')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">MockTest AI</span>
            </div>
            <Link
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Test Generator
            </h1>
            <p className="text-gray-600">
              Generate JEE Physics questions using AI
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
                {error.includes('busy') && (
                  <p className="text-sm text-red-600 mt-1">
                    The AI service is experiencing high demand. Please wait a few seconds and try again.
                  </p>
                )}
                {error.includes('configured') && (
                  <p className="text-sm text-red-600 mt-1">
                    Please ensure ANTHROPIC_API_KEY is set in your .env.local file.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Test Configuration */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter test title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics (Select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['mechanics', 'thermodynamics', 'electromagnetism', 'optics', 'modern_physics', 'waves'].map((topic) => (
                  <label key={topic} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.topics.includes(topic)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, topics: [...formData.topics, topic] })
                        } else {
                          setFormData({ ...formData, topics: formData.topics.filter(t => t !== topic) })
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700 capitalize">
                      {topic.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Questions
                </label>
                <input
                  type="number"
                  value={formData.totalQuestions}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setFormData({ ...formData, totalQuestions: isNaN(value) ? 0 : value })
                  }}
                  min="1"
                  max="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setFormData({ ...formData, duration: isNaN(value) ? 0 : value })
                  }}
                  min="10"
                  max="180"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Distribution
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Easy</label>
                  <input
                    type="number"
                    value={formData.difficulty.easy}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      setFormData({ 
                        ...formData, 
                        difficulty: { ...formData.difficulty, easy: isNaN(value) ? 0 : value }
                      })
                    }}
                    min="0"
                    max="50"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Medium</label>
                  <input
                    type="number"
                    value={formData.difficulty.medium}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      setFormData({ 
                        ...formData, 
                        difficulty: { ...formData.difficulty, medium: isNaN(value) ? 0 : value }
                      })
                    }}
                    min="0"
                    max="50"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Hard</label>
                  <input
                    type="number"
                    value={formData.difficulty.hard}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      setFormData({ 
                        ...formData, 
                        difficulty: { ...formData.difficulty, hard: isNaN(value) ? 0 : value }
                      })
                    }}
                    min="0"
                    max="50"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total should equal {formData.totalQuestions} questions
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateTest}
              disabled={generating || formData.topics.length === 0}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Test...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Full Test
                </>
              )}
            </button>

            <button
              onClick={handleGenerateSingleQuestion}
              disabled={generating}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Generate Single Question
                </>
              )}
            </button>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> AI generation requires an ANTHROPIC_API_KEY in your .env.local file.
              Each question generation uses approximately 500-1000 tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}