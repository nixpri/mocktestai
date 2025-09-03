'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, Search, Filter, Edit, Trash2, Upload, Download,
  ChevronLeft, ChevronRight, Eye, Copy, CheckCircle,
  AlertCircle, BookOpen, X, Save, FileJson
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  topic: string
  subtopic: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'mcq' | 'numerical' | 'assertion'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
  marks: number
  negativeMarks: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function QuestionBankPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [questionsPerPage] = useState(10)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Topics list
  const topics = [
    'mechanics', 'thermodynamics', 'electromagnetism', 
    'optics', 'modern_physics', 'waves_oscillations'
  ]

  useEffect(() => {
    checkAuthAndLoadQuestions()
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [searchTerm, selectedTopic, selectedDifficulty, selectedType, questions])

  const checkAuthAndLoadQuestions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    
    // Check if user is admin (you might want to add an admin check)
    await loadQuestions()
  }

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/questions')
      const data = await response.json()
      
      if (data.success) {
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Error loading questions:', error)
      setErrorMessage('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const filterQuestions = () => {
    let filtered = [...questions]
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.explanation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Topic filter
    if (selectedTopic !== 'all') {
      filtered = filtered.filter(q => q.topic === selectedTopic)
    }
    
    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty)
    }
    
    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(q => q.type === selectedType)
    }
    
    setFilteredQuestions(filtered)
    setCurrentPage(1)
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setQuestions(questions.filter(q => q.id !== id))
        setSuccessMessage('Question deleted successfully')
        setShowDeleteModal(false)
        setSelectedQuestion(null)
      } else {
        setErrorMessage('Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      setErrorMessage('Failed to delete question')
    }
  }

  const handleEditQuestion = async (question: Question) => {
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(question)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setQuestions(questions.map(q => q.id === question.id ? data.question : q))
        setSuccessMessage('Question updated successfully')
        setShowEditModal(false)
        setSelectedQuestion(null)
        await loadQuestions() // Reload to get fresh data
      } else {
        setErrorMessage('Failed to update question')
      }
    } catch (error) {
      console.error('Error updating question:', error)
      setErrorMessage('Failed to update question')
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredQuestions, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `questions_export_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion)
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage)

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Question Bank Admin</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => router.push('/admin/questions/add')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{errorMessage}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
            <div className="text-sm text-gray-500">Total Questions</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {questions.filter(q => q.difficulty === 'easy').length}
            </div>
            <div className="text-sm text-gray-500">Easy Questions</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {questions.filter(q => q.difficulty === 'medium').length}
            </div>
            <div className="text-sm text-gray-500">Medium Questions</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {questions.filter(q => q.difficulty === 'hard').length}
            </div>
            <div className="text-sm text-gray-500">Hard Questions</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>
                  {topic.replace('_', ' ').charAt(0).toUpperCase() + topic.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="numerical">Numerical</option>
              <option value="assertion">Assertion</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredQuestions.length} questions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/admin/questions/import')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        ) : currentQuestions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No questions found</p>
            <button
              onClick={() => router.push('/admin/questions/add')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add First Question
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {question.question}
                      </div>
                      {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {question.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {question.topic.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium uppercase text-gray-600">
                        {question.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      +{question.marks} / -{question.negativeMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/questions/${question.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/questions/edit/${question.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestion(question)
                            navigator.clipboard.writeText(JSON.stringify(question, null, 2))
                            setSuccessMessage('Question copied to clipboard')
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestion(question)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstQuestion + 1} to {Math.min(indexOfLastQuestion, filteredQuestions.length)} of {filteredQuestions.length} questions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedQuestion && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedQuestion(null)
              }}
            />
            
            <div className="relative min-h-full flex items-center justify-center p-4">
              {/* Modal */}
              <div className="modal-airbnb max-w-md w-full relative z-10 animate-scale-in">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[var(--color-error)]/10 rounded-full flex items-center justify-center mr-4">
                    <AlertCircle className="h-6 w-6 text-[var(--color-error)]" />
                  </div>
                  <div>
                    <h3 className="heading-airbnb-4 mb-1">Delete Question?</h3>
                    <p className="text-[var(--text-sm)] text-[var(--foreground-secondary)]">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-[var(--background-secondary)] rounded-[var(--radius-base)] p-4 mb-6">
                  <p className="text-[var(--text-sm)] text-[var(--foreground)] line-clamp-3">
                    {selectedQuestion.question}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedQuestion(null)
                    }}
                    className="btn-airbnb btn-airbnb-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                    className="btn-airbnb bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 flex-1 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}