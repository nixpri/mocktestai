'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import TestInterface from '@/components/test/TestInterface'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { transformDatabaseQuestion, UnifiedQuestion } from '@/lib/utils/questionTransformer'

// Using the unified question interface from questionTransformer

export default function PreviousYearTestPage({ 
  params 
}: { 
  params: Promise<{ year: string; session: string }> 
}) {
  const { year, session } = use(params)
  const [questions, setQuestions] = useState<UnifiedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testId, setTestId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const exam = searchParams.get('exam') || 'JEE Main'
  const supabase = createClient()

  useEffect(() => {
    initializeTest()
  }, [year, session])

  const initializeTest = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/previous-years')
        return
      }

      // Fetch questions for this year and session
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('source_type', 'previous_year')
        .order('id')

      if (questionError) throw questionError

      // Filter questions based on metadata
      const filteredRawQuestions = questionData?.filter((q) => {
        const metadata = q.source_metadata as any
        // Convert both to strings for comparison
        const metadataYear = metadata?.year?.toString()
        const paramYear = year.toString()
        const metadataSession = metadata?.session?.toString()
        const paramSession = session.toString()
        
        return metadataYear === paramYear && 
               metadataSession === paramSession &&
               (metadata?.exam || 'JEE Main') === exam
      }) || []

      // Transform questions to unified format
      const filteredQuestions = filteredRawQuestions
        .map(q => transformDatabaseQuestion(q))
        .filter((q): q is UnifiedQuestion => q !== null)

      if (filteredQuestions.length === 0) {
        setError('No questions found for this paper. Please check back later.')
        setLoading(false)
        return
      }

      // Create or find existing test instance
      const { data: existingTest } = await supabase
        .from('tests')
        .select('id')
        .eq('test_type', 'previous_year')
        .eq('test_metadata->year', year)
        .eq('test_metadata->session', session)
        .eq('test_metadata->exam', exam)
        .single()

      let currentTestId = existingTest?.id

      if (!currentTestId) {
        // Create new test instance
        const { data: newTest, error: testError } = await supabase
          .from('tests')
          .insert({
            test_type: 'previous_year',
            title: `${exam} ${year} - Session ${session}`,
            description: `Official ${exam} paper from ${year}`,
            test_metadata: {
              year: year,
              session: session,
              exam: exam,
              is_official: true
            },
            subject: 'Physics', // Update based on actual subjects
            total_questions: filteredQuestions.length,
            total_marks: filteredQuestions.reduce((acc, q) => acc + q.marks, 0),
            duration_minutes: 180,
            difficulty_level: 'mixed',
            is_public: true,
            is_active: true,
            created_by: user.id
          })
          .select()
          .single()

        if (testError) throw testError
        currentTestId = newTest.id

        // Link questions to test
        const testQuestions = filteredQuestions.map((q, index) => ({
          test_id: currentTestId,
          question_id: q.id,
          sequence_number: index + 1,
          section: (q as any).subject || 'General'
        }))

        const { error: linkError } = await supabase
          .from('test_questions')
          .insert(testQuestions)

        if (linkError) console.error('Error linking questions:', linkError)
      }

      setTestId(currentTestId)
      setQuestions(filteredQuestions)
    } catch (err: any) {
      console.error('Error initializing test:', err)
      setError(err.message || 'Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  const handleTestComplete = async (answers: any, timeSpent: number) => {
    if (!testId) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Calculate score
      let correctCount = 0
      let incorrectCount = 0
      let totalMarks = 0

      questions.forEach((question) => {
        const userAnswer = answers[question.id]
        if (userAnswer) {
          if (userAnswer === question.content.correctAnswer) {
            correctCount++
            totalMarks += question.marks
          } else {
            incorrectCount++
            totalMarks -= question.negativeMarks
          }
        }
      })

      // Save test result
      const { data: result, error: resultError } = await supabase
        .from('test_results')
        .insert({
          test_id: testId,
          user_id: user.id,
          score: totalMarks,
          total_marks: questions.reduce((acc, q) => acc + q.marks, 0),
          correct_answers: correctCount,
          incorrect_answers: incorrectCount,
          unattempted: questions.length - correctCount - incorrectCount,
          time_taken: timeSpent,
          answers: answers,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (resultError) throw resultError

      // Redirect to results page
      router.push(`/results/${result.id}`)
    } catch (err: any) {
      console.error('Error saving test result:', err)
      alert('Failed to save test result. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading {exam} {year} Paper...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
            Unable to Load Test
          </h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <Link href={`/previous-years/${year}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sessions
              </Button>
            </Link>
            <Button onClick={() => initializeTest()} className="flex-1">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-6">
            This paper hasn't been uploaded yet. Please check back later.
          </p>
          <Link href={`/previous-years/${year}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Questions are already in UnifiedQuestion format from the transformation above
  return (
    <TestInterface
      testId={testId || `previous-year-${year}-${session}`}
      questions={questions}
      duration={180}
      testTitle={`${exam} ${year} - Session ${session}`}
      onSubmit={async (answers, timeSpent) => {
        const totalTimeSpent = Object.values(timeSpent).reduce((acc: number, val: number) => acc + val, 0)
        await handleTestComplete(answers, totalTimeSpent)
      }}
      mode="test"
    />
  )
}