'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useRouter } from 'next/navigation'
import { Calendar, FileText, Clock, Award, ArrowLeft, PlayCircle, BookOpen, Target } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

interface TestData {
  id: string
  title: string
  test_type: string
  test_metadata: any
  total_questions: number
  total_marks: number
  duration_minutes: number
  subject: string | null
  created_at: string
}

export default function PreviousYearsPage() {
  const [tests, setTests] = useState<TestData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<'All' | 'JEE Main' | 'JEE Advanced'>('All')
  const [selectedYear, setSelectedYear] = useState<'All' | string>('All')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTests()
  }, [selectedExam, selectedYear])

  const fetchTests = async () => {
    setLoading(true)
    try {
      // Fetch all previous year tests
      let query = supabase
        .from('tests')
        .select('*')
        .eq('test_type', 'previous_year')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Filter based on selection
      let filteredTests = data || []
      
      if (selectedExam !== 'All') {
        filteredTests = filteredTests.filter(test => 
          test.test_metadata?.exam_name === selectedExam || 
          test.title?.includes(selectedExam)
        )
      }
      
      if (selectedYear !== 'All') {
        filteredTests = filteredTests.filter(test => 
          test.test_metadata?.year?.toString() === selectedYear
        )
      }

      setTests(filteredTests)
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = (testId: string) => {
    router.push(`/test/${testId}`)
  }

  // Get unique years from tests
  const years = [...new Set(tests.map(t => t.test_metadata?.year?.toString()).filter(Boolean))].sort((a, b) => (b || '').localeCompare(a || ''))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Previous Year Papers</h1>
          <p className="mt-2 text-gray-600">Practice with authentic JEE exam papers from past years</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type
              </label>
              <Select 
                value={selectedExam}
                onValueChange={(value: any) => setSelectedExam(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Exams</SelectItem>
                  <SelectItem value="JEE Main">JEE Main</SelectItem>
                  <SelectItem value="JEE Advanced">JEE Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <Select 
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year || ''}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                className="w-full cursor-pointer"
                onClick={() => {
                  setSelectedExam('All')
                  setSelectedYear('All')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Test Papers Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Available Papers ({tests.length})
          </h2>
          
          {tests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No papers found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map(test => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {test.test_metadata?.session || 'Main Session'}
                        </CardDescription>
                      </div>
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        {test.total_questions} Questions
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {test.duration_minutes} minutes
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="h-4 w-4 mr-2" />
                        {test.total_marks} marks
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleStartTest(test.id)}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Start Test
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/test/${test.id}?mode=practice`)}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Practice
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => router.push(`/test/${test.id}?mode=view`)}
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}