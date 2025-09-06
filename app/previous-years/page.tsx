'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Calendar, FileText, Clock, Award } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface YearData {
  year: string
  exam: string
  session_count: number
  question_count: number
  subjects: string[]
}

export default function PreviousYearsPage() {
  const [years, setYears] = useState<YearData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<'JEE Main' | 'JEE Advanced' | 'All'>('JEE Main')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchYearData()
  }, [selectedExam])

  const fetchYearData = async () => {
    setLoading(true)
    try {
      // Query questions table for previous year data
      let query = supabase
        .from('questions')
        .select('source_metadata')
        .eq('source_type', 'previous_year')

      const { data, error } = await query

      if (error) throw error

      // Process data to group by year
      const yearMap = new Map<string, YearData>()
      
      data?.forEach((item) => {
        const metadata = item.source_metadata as any
        if (metadata?.year) {
          const key = `${metadata.year}-${metadata.exam || 'JEE Main'}`
          
          if (!yearMap.has(key)) {
            yearMap.set(key, {
              year: metadata.year,
              exam: metadata.exam || 'JEE Main',
              session_count: new Set([metadata.session || '1']).size,
              question_count: 1,
              subjects: new Set([metadata.subject || 'Physics']).size === 1 
                ? [metadata.subject || 'Physics'] 
                : Array.from(new Set([metadata.subject || 'Physics']))
            })
          } else {
            const existing = yearMap.get(key)!
            existing.question_count++
            if (metadata.session) {
              const sessions = new Set<string>()
              sessions.add(metadata.session)
              existing.session_count = sessions.size
            }
            if (metadata.subject && !existing.subjects.includes(metadata.subject)) {
              existing.subjects.push(metadata.subject)
            }
          }
        }
      })

      // Convert map to array and sort by year
      const yearArray = Array.from(yearMap.values())
        .filter(y => selectedExam === 'All' || y.exam === selectedExam)
        .sort((a, b) => parseInt(b.year) - parseInt(a.year))

      setYears(yearArray)
    } catch (error) {
      console.error('Error fetching year data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleYearClick = (year: string, exam: string) => {
    router.push(`/previous-years/${year}?exam=${encodeURIComponent(exam)}`)
  }

  // Mock data for demonstration (remove when real data is available)
  const mockYears: YearData[] = [
    { year: '2024', exam: 'JEE Main', session_count: 2, question_count: 180, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2023', exam: 'JEE Main', session_count: 2, question_count: 180, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2022', exam: 'JEE Main', session_count: 2, question_count: 180, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2021', exam: 'JEE Main', session_count: 4, question_count: 360, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2020', exam: 'JEE Main', session_count: 2, question_count: 180, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2019', exam: 'JEE Main', session_count: 2, question_count: 180, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2018', exam: 'JEE Main', session_count: 1, question_count: 90, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2017', exam: 'JEE Main', session_count: 1, question_count: 90, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2016', exam: 'JEE Main', session_count: 1, question_count: 90, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2015', exam: 'JEE Main', session_count: 1, question_count: 90, subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  ]

  // Use mock data if no real data (for development)
  const displayYears = years.length > 0 ? years : mockYears.filter(y => selectedExam === 'All' || y.exam === selectedExam)

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Previous Year Papers</h1>
          <p className="text-gray-600">Practice with authentic JEE questions from past exams</p>
        </div>

        {/* Exam Filter */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={selectedExam === 'JEE Main' ? 'default' : 'outline'}
            onClick={() => setSelectedExam('JEE Main')}
          >
            JEE Main
          </Button>
          <Button
            variant={selectedExam === 'JEE Advanced' ? 'default' : 'outline'}
            onClick={() => setSelectedExam('JEE Advanced')}
          >
            JEE Advanced
          </Button>
          <Button
            variant={selectedExam === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedExam('All')}
          >
            All Exams
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{displayYears.length}</p>
                <p className="text-sm text-gray-600">Years Available</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {displayYears.reduce((acc, y) => acc + y.question_count, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {displayYears.reduce((acc, y) => acc + y.session_count, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Subjects</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayYears.map((yearData) => (
            <Card 
              key={`${yearData.year}-${yearData.exam}`}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleYearClick(yearData.year, yearData.exam)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">{yearData.year}</span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {yearData.exam}
                  </span>
                </CardTitle>
                <CardDescription>
                  {yearData.session_count} Session{yearData.session_count > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-semibold">{yearData.question_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subjects:</span>
                    <span className="font-semibold">{yearData.subjects.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {yearData.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Papers →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {displayYears.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Papers Available</h3>
            <p className="text-gray-600">Previous year papers for {selectedExam} are being added.</p>
          </div>
        )}
      </div>
    </div>
  )
}