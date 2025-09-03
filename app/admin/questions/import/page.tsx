'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileJson, AlertCircle, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'

export default function ImportQuestionsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [importMode, setImportMode] = useState<'file' | 'text'>('file')
  const [preview, setPreview] = useState<any[]>([])

  const sampleData = [
    {
      topic: 'mechanics',
      subtopic: 'Kinematics',
      difficulty: 'medium',
      type: 'mcq',
      question: 'A particle moves with velocity v = 3t^2 - 6t + 4. Find acceleration at t = 2s.',
      options: ['6 m/s²', '12 m/s²', '18 m/s²', '24 m/s²'],
      correctAnswer: 'A',
      explanation: 'Acceleration a = dv/dt = 6t - 6. At t = 2, a = 6 m/s²',
      marks: 4,
      negativeMarks: 1,
      tags: ['JEE Main', 'Kinematics']
    },
    {
      topic: 'thermodynamics',
      subtopic: 'Heat Transfer',
      difficulty: 'hard',
      type: 'numerical',
      question: 'Calculate heat transfer rate through a 50cm rod with k = 400 W/m·K',
      correctAnswer: 16,
      numericalTolerance: 0.5,
      explanation: 'Using Q = kA(ΔT/L)',
      marks: 4,
      negativeMarks: 1,
      tags: ['JEE Advanced']
    }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
        setError('Please select a JSON file')
        return
      }
      setFile(selectedFile)
      setError('')
      
      // Read and preview file
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const data = JSON.parse(content)
          if (Array.isArray(data)) {
            setPreview(data.slice(0, 3)) // Show first 3 questions as preview
          } else {
            setError('Invalid format: Expected an array of questions')
          }
        } catch (err) {
          setError('Invalid JSON file')
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleTextChange = (text: string) => {
    setJsonText(text)
    try {
      if (text.trim()) {
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          setPreview(data.slice(0, 3))
          setError('')
        } else {
          setError('Invalid format: Expected an array of questions')
        }
      } else {
        setPreview([])
      }
    } catch (err) {
      setPreview([])
      // Don't show error while typing
    }
  }

  const handleImport = async () => {
    setError('')
    setSuccess('')
    
    let questionsData: any[] = []
    
    try {
      if (importMode === 'file') {
        if (!file) {
          setError('Please select a file')
          return
        }
        const text = await file.text()
        questionsData = JSON.parse(text)
      } else {
        if (!jsonText.trim()) {
          setError('Please enter JSON data')
          return
        }
        questionsData = JSON.parse(jsonText)
      }
      
      if (!Array.isArray(questionsData)) {
        setError('Invalid format: Expected an array of questions')
        return
      }
      
      if (questionsData.length === 0) {
        setError('No questions found in the data')
        return
      }
      
      setImporting(true)
      
      // Import questions one by one (in production, you might want to batch this)
      let successCount = 0
      let failCount = 0
      
      for (const question of questionsData) {
        try {
          const response = await fetch('/api/admin/questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
          })
          
          if (response.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch (err) {
          failCount++
        }
      }
      
      if (failCount === 0) {
        setSuccess(`Successfully imported ${successCount} questions!`)
        setTimeout(() => {
          router.push('/admin/questions')
        }, 2000)
      } else {
        setSuccess(`Imported ${successCount} questions. ${failCount} failed.`)
      }
      
    } catch (err) {
      console.error('Import error:', err)
      setError('Failed to import questions. Please check the format.')
    } finally {
      setImporting(false)
    }
  }

  const downloadSample = () => {
    const dataStr = JSON.stringify(sampleData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', 'sample_questions.json')
    linkElement.click()
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
              <h1 className="text-xl font-bold text-gray-900">Import Questions</h1>
            </div>
            <button
              onClick={downloadSample}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample
            </button>
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
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Import Mode Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setImportMode('file')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                importMode === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upload JSON File
            </button>
            <button
              onClick={() => setImportMode('text')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                importMode === 'text'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paste JSON Text
            </button>
          </div>

          {importMode === 'file' ? (
            <div>
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition cursor-pointer">
                  <FileJson className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to select JSON file or drag and drop</p>
                  <p className="text-sm text-gray-500">Maximum file size: 5MB</p>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </label>
              {file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => {
                      setFile(null)
                      setPreview([])
                    }}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={jsonText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Paste your JSON array of questions here..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Preview (First {preview.length} questions)</h3>
            <div className="space-y-4">
              {preview.map((q, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {q.topic} - {q.subtopic || 'No subtopic'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2">{q.question}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>Type: {q.type?.toUpperCase()}</span>
                    <span>Marks: +{q.marks}/-{q.negativeMarks}</span>
                    {q.tags && q.tags.length > 0 && (
                      <span>Tags: {q.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Format Guide */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">JSON Format Guide</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-3">
              Your JSON file should contain an array of question objects. Each question must have:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li><strong>topic</strong>: One of: mechanics, thermodynamics, electromagnetism, optics, modern_physics, waves_oscillations</li>
              <li><strong>difficulty</strong>: One of: easy, medium, hard</li>
              <li><strong>type</strong>: One of: mcq, numerical, assertion</li>
              <li><strong>question</strong>: The question text (LaTeX supported)</li>
              <li><strong>marks</strong>: Positive marks for correct answer</li>
              <li><strong>negativeMarks</strong>: Negative marks for wrong answer</li>
            </ul>
            <p className="text-gray-600 mt-3">
              Additional fields based on question type:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li><strong>MCQ</strong>: options (array), correctAnswer (A/B/C/D)</li>
              <li><strong>Numerical</strong>: correctAnswer (number), numericalTolerance (optional)</li>
              <li><strong>Assertion</strong>: assertion, reason, correctAnswer (A/B/C/D/E)</li>
            </ul>
          </div>
        </div>

        {/* Import Button */}
        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={importing || (importMode === 'file' ? !file : !jsonText.trim())}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Upload className="h-5 w-5 mr-2" />
            {importing ? 'Importing...' : 'Import Questions'}
          </button>
        </div>
      </div>
    </div>
  )
}