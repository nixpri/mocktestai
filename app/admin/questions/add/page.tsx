'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import LatexRenderer from '@/components/test/LatexRenderer'

export default function AddQuestionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    topic: 'mechanics',
    subtopic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    type: 'mcq' as 'mcq' | 'numerical' | 'assertion',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    numericalAnswer: 0,
    numericalTolerance: 0.01,
    assertion: '',
    reason: '',
    assertionReasonAnswer: 'A',
    explanation: '',
    marks: 4,
    negativeMarks: 1,
    tags: [] as string[],
    currentTag: ''
  })

  const topics = [
    { value: 'mechanics', label: 'Mechanics' },
    { value: 'thermodynamics', label: 'Thermodynamics' },
    { value: 'electromagnetism', label: 'Electromagnetism' },
    { value: 'optics', label: 'Optics' },
    { value: 'modern_physics', label: 'Modern Physics' },
    { value: 'waves_oscillations', label: 'Waves & Oscillations' }
  ]

  const assertionReasonOptions = [
    { value: 'A', label: 'Both Assertion and Reason are true, and Reason is the correct explanation' },
    { value: 'B', label: 'Both Assertion and Reason are true, but Reason is not the correct explanation' },
    { value: 'C', label: 'Assertion is true, but Reason is false' },
    { value: 'D', label: 'Assertion is false, but Reason is true' },
    { value: 'E', label: 'Both Assertion and Reason are false' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validation
    if (!formData.question.trim()) {
      setError('Question is required')
      return
    }
    
    if (formData.type === 'mcq') {
      if (formData.options.some(opt => !opt.trim())) {
        setError('All options are required for MCQ')
        return
      }
      if (!formData.correctAnswer) {
        setError('Please select the correct answer')
        return
      }
    }
    
    if (formData.type === 'assertion') {
      if (!formData.assertion.trim() || !formData.reason.trim()) {
        setError('Both assertion and reason are required')
        return
      }
    }
    
    setLoading(true)
    
    try {
      // Prepare question data
      const questionData = {
        topic: formData.topic,
        subtopic: formData.subtopic,
        difficulty: formData.difficulty,
        type: formData.type,
        question: formData.question,
        options: formData.type === 'mcq' ? formData.options : undefined,
        correctAnswer: formData.type === 'mcq' ? formData.correctAnswer : 
                       formData.type === 'numerical' ? formData.numericalAnswer : 
                       formData.assertionReasonAnswer,
        numericalTolerance: formData.type === 'numerical' ? formData.numericalTolerance : undefined,
        assertion: formData.type === 'assertion' ? formData.assertion : undefined,
        reason: formData.type === 'assertion' ? formData.reason : undefined,
        explanation: formData.explanation,
        marks: formData.marks,
        negativeMarks: formData.negativeMarks,
        tags: formData.tags
      }
      
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess('Question added successfully!')
        setTimeout(() => {
          router.push('/admin/questions')
        }, 1500)
      } else {
        setError(data.error || 'Failed to add question')
      }
    } catch (err) {
      console.error('Error adding question:', err)
      setError('Failed to add question')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const addTag = () => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.currentTag.trim()],
        currentTag: ''
      })
    }
  }

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/questions"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Add New Question</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {preview ? (
          // Preview Mode
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Question Preview</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    formData.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    formData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formData.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">
                    +{formData.marks} / -{formData.negativeMarks}
                  </span>
                </div>
                
                <div className="mb-4">
                  <LatexRenderer content={formData.question} />
                </div>
                
                {formData.type === 'mcq' && (
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          formData.correctAnswer === String.fromCharCode(65 + index)
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <LatexRenderer content={`${String.fromCharCode(65 + index)}. ${option}`} />
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.type === 'numerical' && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Answer: {formData.numericalAnswer} ± {formData.numericalTolerance}
                    </p>
                  </div>
                )}
                
                {formData.type === 'assertion' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="font-medium text-sm text-gray-700 mb-1">Assertion:</p>
                      <LatexRenderer content={formData.assertion} />
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="font-medium text-sm text-gray-700 mb-1">Reason:</p>
                      <LatexRenderer content={formData.reason} />
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        Answer: {assertionReasonOptions.find(o => o.value === formData.assertionReasonAnswer)?.label}
                      </p>
                    </div>
                  </div>
                )}
                
                {formData.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-sm text-blue-800 mb-1">Explanation:</p>
                    <LatexRenderer content={formData.explanation} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Form Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic *
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {topics.map(topic => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtopic
                  </label>
                  <input
                    type="text"
                    value={formData.subtopic}
                    onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })}
                    placeholder="e.g., Kinematics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="numerical">Numerical</option>
                    <option value="assertion">Assertion-Reasoning</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks *
                  </label>
                  <input
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Negative Marks *
                  </label>
                  <input
                    type="number"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Question Content</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question * (LaTeX supported)
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={4}
                    placeholder="Enter question text. Use LaTeX syntax for math: $x^2 + y^2 = z^2$"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                {formData.type === 'mcq' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options * (LaTeX supported)
                    </label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={String.fromCharCode(65 + index)}
                            checked={formData.correctAnswer === String.fromCharCode(65 + index)}
                            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                            className="h-4 w-4 text-indigo-600"
                          />
                          <span className="text-sm font-medium text-gray-700 w-8">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.type === 'numerical' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correct Answer *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.numericalAnswer}
                        onChange={(e) => setFormData({ ...formData, numericalAnswer: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tolerance (±)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.numericalTolerance}
                        onChange={(e) => setFormData({ ...formData, numericalTolerance: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
                
                {formData.type === 'assertion' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assertion * (LaTeX supported)
                      </label>
                      <textarea
                        value={formData.assertion}
                        onChange={(e) => setFormData({ ...formData, assertion: e.target.value })}
                        rows={2}
                        placeholder="Enter assertion statement"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason * (LaTeX supported)
                      </label>
                      <textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        rows={2}
                        placeholder="Enter reason statement"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correct Answer *
                      </label>
                      <select
                        value={formData.assertionReasonAnswer}
                        onChange={(e) => setFormData({ ...formData, assertionReasonAnswer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {assertionReasonOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.value}. {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation (LaTeX supported)
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    rows={3}
                    placeholder="Provide detailed explanation for the answer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Tags</h2>
              
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={formData.currentTag}
                  onChange={(e) => setFormData({ ...formData, currentTag: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tags (e.g., JEE Main, Previous Year)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}