'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Calendar, FileText, Clock, PlayCircle, BookOpen } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'

interface SessionData {
  session: string
  paper_code?: string
  question_count: number
  subjects: string[]
  difficulty_distribution: {
    easy: number
    medium: number
    hard: number
  }
  has_solutions: boolean
  has_answer_key: boolean
}

export default function YearSessionPage({ params }: { params: { year: string } }) {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const exam = searchParams.get('exam') || 'JEE Main'
  const supabase = createClient()
  const year = params.year

  useEffect(() => {
    fetchSessionData()
  }, [year, exam])

  const fetchSessionData = async () => {
    setLoading(true)
    try {
      // Query questions for this specific year
      const { data, error } = await supabase
        .from('questions')
        .select('source_metadata, difficulty')
        .eq('source_type', 'previous_year')

      if (error) throw error

      // Process data to group by session
      const sessionMap = new Map<string, SessionData>()
      
      data?.forEach((item) => {
        const metadata = item.source_metadata as any
        if (metadata?.year === year && (metadata?.exam || 'JEE Main') === exam) {
          const sessionKey = metadata.session || '1'
          
          if (!sessionMap.has(sessionKey)) {
            sessionMap.set(sessionKey, {
              session: sessionKey,
              paper_code: metadata.paper_code,
              question_count: 1,
              subjects: [metadata.subject || 'Physics'],
              difficulty_distribution: {
                easy: item.difficulty === 'easy' ? 1 : 0,
                medium: item.difficulty === 'medium' ? 1 : 0,
                hard: item.difficulty === 'hard' ? 1 : 0,
              },
              has_solutions: true,
              has_answer_key: true,
            })
          } else {
            const existing = sessionMap.get(sessionKey)!
            existing.question_count++
            
            if (metadata.subject && !existing.subjects.includes(metadata.subject)) {
              existing.subjects.push(metadata.subject)
            }
            
            if (item.difficulty === 'easy') existing.difficulty_distribution.easy++
            else if (item.difficulty === 'medium') existing.difficulty_distribution.medium++
            else if (item.difficulty === 'hard') existing.difficulty_distribution.hard++
          }
        }
      })

      // Convert map to array and sort by session
      const sessionArray = Array.from(sessionMap.values()).sort((a, b) => 
        parseInt(a.session) - parseInt(b.session)
      )

      setSessions(sessionArray)
    } catch (error) {
      console.error('Error fetching session data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFullTest = (session: string) => {
    router.push(`/previous-years/${year}/${session}/test?exam=${encodeURIComponent(exam)}`)
  }

  const handlePracticeMode = (session: string) => {
    router.push(`/previous-years/${year}/${session}/practice?exam=${encodeURIComponent(exam)}`)
  }

  // Mock data for demonstration
  const mockSessions: SessionData[] = [
    {
      session: '1',
      paper_code: 'Paper 1',
      question_count: 90,
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      difficulty_distribution: { easy: 30, medium: 40, hard: 20 },
      has_solutions: true,
      has_answer_key: true,
    },
    {
      session: '2',
      paper_code: 'Paper 2',
      question_count: 90,
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      difficulty_distribution: { easy: 25, medium: 45, hard: 20 },
      has_solutions: true,
      has_answer_key: true,
    },
  ]

  // Use mock data if no real data (for development)
  const displaySessions = sessions.length > 0 ? sessions : mockSessions

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
            href="/previous-years"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Years
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {exam} {year} Papers
          </h1>
          <p className="text-gray-600">
            Select a session to start practicing or take a full mock test
          </p>
        </div>

        {/* Year Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{displaySessions.length}</p>
                <p className="text-sm text-gray-600">Sessions Available</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {displaySessions.reduce((acc, s) => acc + s.question_count, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">180</p>
                <p className="text-sm text-gray-600">Minutes per Test</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displaySessions.map((session) => (
            <Card key={session.session} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">
                    Session {session.session}
                    {session.paper_code && ` - ${session.paper_code}`}
                  </span>
                  <span className="text-sm bg-white px-3 py-1 rounded-full">
                    {session.question_count} Questions
                  </span>
                </CardTitle>
                <CardDescription>
                  Full length {exam} paper with complete solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Subjects */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Subjects Covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {session.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Difficulty Distribution */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Difficulty Distribution:</p>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>Easy: {session.difficulty_distribution.easy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <span>Medium: {session.difficulty_distribution.medium}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span>Hard: {session.difficulty_distribution.hard}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex gap-4 mb-6 text-sm text-gray-600">
                  {session.has_solutions && (
                    <div className="flex items-center gap-1">
                      <span className="text-green-600">✓</span>
                      <span>Detailed Solutions</span>
                    </div>
                  )}
                  {session.has_answer_key && (
                    <div className="flex items-center gap-1">
                      <span className="text-green-600">✓</span>
                      <span>Answer Key</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleFullTest(session.session)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Full Test (180 min)
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => handlePracticeMode(session.session)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Practice Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {displaySessions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Available</h3>
            <p className="text-gray-600">Papers for {exam} {year} are being processed.</p>
          </div>
        )}

        {/* Topic-wise Practice Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Alternative Practice Options</CardTitle>
            <CardDescription>
              Practice specific topics or mixed questions from {year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push(`/previous-years/practice?year=${year}&exam=${exam}`)}
              >
                <BookOpen className="h-6 w-6 text-blue-500" />
                <span className="font-semibold">Topic-wise Practice</span>
                <span className="text-xs text-gray-600">Practice by specific topics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push(`/previous-years/practice?year=${year}&exam=${exam}&mode=random`)}
              >
                <FileText className="h-6 w-6 text-green-500" />
                <span className="font-semibold">Random Practice</span>
                <span className="text-xs text-gray-600">Mixed questions from all topics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.push(`/previous-years/practice?year=${year}&exam=${exam}&mode=timed`)}
              >
                <Clock className="h-6 w-6 text-orange-500" />
                <span className="font-semibold">Timed Practice</span>
                <span className="text-xs text-gray-600">Practice with time pressure</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}