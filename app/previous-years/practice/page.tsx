'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Filter, BookOpen, Play, Clock, Target } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

interface TopicInfo {
  id: string
  name: string
  questionCount: number
  difficulty: {
    easy: number
    medium: number
    hard: number
  }
}

interface FilterOptions {
  years: string[]
  subjects: string[]
  difficulty: string[]
  topics: TopicInfo[]
}

export default function PracticeModePage() {
  const [filters, setFilters] = useState<FilterOptions>({
    years: [],
    subjects: [],
    difficulty: [],
    topics: []
  })
  const [selectedFilters, setSelectedFilters] = useState({
    years: [] as string[],
    subjects: [] as string[],
    difficulty: [] as string[],
    topics: [] as string[],
    questionCount: 10,
    mode: 'practice' as 'practice' | 'timed' | 'random'
  })
  const [loading, setLoading] = useState(true)
  const [availableQuestions, setAvailableQuestions] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Get initial filters from URL params
  useEffect(() => {
    const year = searchParams.get('year')
    const exam = searchParams.get('exam')
    const mode = searchParams.get('mode') as any

    if (year) {
      setSelectedFilters(prev => ({ ...prev, years: [year] }))
    }
    if (mode) {
      setSelectedFilters(prev => ({ ...prev, mode }))
    }

    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = async () => {
    setLoading(true)
    try {
      // Fetch all previous year questions to build filter options
      const { data, error } = await supabase
        .from('questions')
        .select('source_metadata, subject, difficulty, topic_id')
        .eq('source_type', 'previous_year')

      if (error) throw error

      // Process data to extract unique values
      const yearsSet = new Set<string>()
      const subjectsSet = new Set<string>()
      const difficultySet = new Set<string>()
      const topicsMap = new Map<string, TopicInfo>()

      data?.forEach((item) => {
        const metadata = item.source_metadata as any
        
        if (metadata?.year) yearsSet.add(metadata.year)
        if (item.subject) subjectsSet.add(item.subject)
        if (item.difficulty) difficultySet.add(item.difficulty)
        
        // Process topics (this is simplified, you might want to join with topics table)
        const topicName = metadata?.topic || 'General'
        if (!topicsMap.has(topicName)) {
          topicsMap.set(topicName, {
            id: topicName.toLowerCase().replace(/\s+/g, '-'),
            name: topicName,
            questionCount: 1,
            difficulty: {
              easy: item.difficulty === 'easy' ? 1 : 0,
              medium: item.difficulty === 'medium' ? 1 : 0,
              hard: item.difficulty === 'hard' ? 1 : 0
            }
          })
        } else {
          const topic = topicsMap.get(topicName)!
          topic.questionCount++
          if (item.difficulty === 'easy') topic.difficulty.easy++
          else if (item.difficulty === 'medium') topic.difficulty.medium++
          else if (item.difficulty === 'hard') topic.difficulty.hard++
        }
      })

      setFilters({
        years: Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a)),
        subjects: Array.from(subjectsSet).sort(),
        difficulty: Array.from(difficultySet),
        topics: Array.from(topicsMap.values()).sort((a, b) => b.questionCount - a.questionCount)
      })

      setAvailableQuestions(data?.length || 0)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAvailableQuestions = async () => {
    // Build query based on selected filters
    let query = supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('source_type', 'previous_year')

    if (selectedFilters.subjects.length > 0) {
      query = query.in('subject', selectedFilters.subjects)
    }
    if (selectedFilters.difficulty.length > 0) {
      query = query.in('difficulty', selectedFilters.difficulty)
    }

    const { count } = await query
    setAvailableQuestions(count || 0)
  }

  useEffect(() => {
    if (!loading) {
      updateAvailableQuestions()
    }
  }, [selectedFilters, loading])

  const handleStartPractice = async () => {
    // Create a practice session with selected filters
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?redirect=/previous-years/practice')
      return
    }

    // Build query for questions
    let query = supabase
      .from('questions')
      .select('*')
      .eq('source_type', 'previous_year')
      .limit(selectedFilters.questionCount)

    if (selectedFilters.subjects.length > 0) {
      query = query.in('subject', selectedFilters.subjects)
    }
    if (selectedFilters.difficulty.length > 0) {
      query = query.in('difficulty', selectedFilters.difficulty)
    }

    const { data: questions, error } = await query

    if (error || !questions || questions.length === 0) {
      alert('No questions match your criteria. Please adjust filters.')
      return
    }

    // Create a practice test
    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert({
        test_type: 'practice',
        title: `Previous Year Practice - ${new Date().toLocaleDateString()}`,
        description: `Practice session with ${questions.length} questions`,
        test_metadata: {
          filters: selectedFilters,
          source: 'previous_year_practice'
        },
        total_questions: questions.length,
        total_marks: questions.reduce((acc, q) => acc + q.marks, 0),
        duration_minutes: selectedFilters.mode === 'timed' ? questions.length * 2 : null,
        difficulty_level: 'mixed',
        is_public: false,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single()

    if (testError || !test) {
      alert('Failed to create practice session. Please try again.')
      return
    }

    // Link questions to test
    const testQuestions = questions.map((q, index) => ({
      test_id: test.id,
      question_id: q.id,
      sequence_number: index + 1,
      section: q.subject || 'General'
    }))

    await supabase.from('test_questions').insert(testQuestions)

    // Navigate to test page
    router.push(`/test/${test.id}`)
  }

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
            Back to Previous Years
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Topic-wise Practice
          </h1>
          <p className="text-gray-600">
            Practice previous year questions by selecting specific topics and filters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Years Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Years
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filters.years.map((year) => (
                      <div key={year} className="flex items-center gap-2">
                        <Checkbox
                          id={`year-${year}`}
                          checked={selectedFilters.years.includes(year)}
                          onCheckedChange={(checked) => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              years: checked 
                                ? [...prev.years, year]
                                : prev.years.filter(y => y !== year)
                            }))
                          }}
                        />
                        <label htmlFor={`year-${year}`} className="text-sm cursor-pointer">
                          {year}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subjects Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Subjects
                  </label>
                  <div className="space-y-2">
                    {filters.subjects.map((subject) => (
                      <div key={subject} className="flex items-center gap-2">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={selectedFilters.subjects.includes(subject)}
                          onCheckedChange={(checked) => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              subjects: checked 
                                ? [...prev.subjects, subject]
                                : prev.subjects.filter(s => s !== subject)
                            }))
                          }}
                        />
                        <label htmlFor={`subject-${subject}`} className="text-sm cursor-pointer">
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Difficulty
                  </label>
                  <div className="space-y-2">
                    {filters.difficulty.map((level) => (
                      <div key={level} className="flex items-center gap-2">
                        <Checkbox
                          id={`difficulty-${level}`}
                          checked={selectedFilters.difficulty.includes(level)}
                          onCheckedChange={(checked) => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              difficulty: checked 
                                ? [...prev.difficulty, level]
                                : prev.difficulty.filter(d => d !== level)
                            }))
                          }}
                        />
                        <label htmlFor={`difficulty-${level}`} className="text-sm cursor-pointer capitalize">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Number of Questions
                  </label>
                  <Select
                    value={selectedFilters.questionCount.toString()}
                    onValueChange={(value) => {
                      setSelectedFilters(prev => ({
                        ...prev,
                        questionCount: parseInt(value)
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="30">30 Questions</SelectItem>
                      <SelectItem value="50">50 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Practice Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Practice Mode</CardTitle>
                <CardDescription>
                  Choose how you want to practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFilters.mode === 'practice' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFilters(prev => ({ ...prev, mode: 'practice' }))}
                  >
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="font-semibold">Practice Mode</p>
                    <p className="text-xs text-gray-600 mt-1">No time limit, see solutions</p>
                  </button>
                  <button
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFilters.mode === 'timed' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFilters(prev => ({ ...prev, mode: 'timed' }))}
                  >
                    <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="font-semibold">Timed Practice</p>
                    <p className="text-xs text-gray-600 mt-1">2 min per question</p>
                  </button>
                  <button
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFilters.mode === 'random' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFilters(prev => ({ ...prev, mode: 'random' }))}
                  >
                    <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold">Random Mix</p>
                    <p className="text-xs text-gray-600 mt-1">Mixed difficulty & topics</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Topics Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Select Topics</CardTitle>
                <CardDescription>
                  Choose specific topics to practice (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filters.topics.slice(0, 10).map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedFilters.topics.includes(topic.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          topics: prev.topics.includes(topic.id)
                            ? prev.topics.filter(t => t !== topic.id)
                            : [...prev.topics, topic.id]
                        }))
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{topic.name}</p>
                          <p className="text-xs text-gray-600">{topic.questionCount} questions</p>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-xs bg-green-100 text-green-700 px-1 rounded">
                            {topic.difficulty.easy}E
                          </span>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">
                            {topic.difficulty.medium}M
                          </span>
                          <span className="text-xs bg-red-100 text-red-700 px-1 rounded">
                            {topic.difficulty.hard}H
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Start Practice Button */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Ready to Practice?</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {availableQuestions} questions match your criteria
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleStartPractice}
                    disabled={availableQuestions === 0}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}