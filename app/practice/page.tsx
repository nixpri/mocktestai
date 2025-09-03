'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, BookOpen, Brain, Clock, GraduationCap, Target, Zap } from 'lucide-react'
import Link from 'next/link'

interface Topic {
  id: string
  name: string
  description: string
  questionCount: number
  difficulty: 'easy' | 'medium' | 'hard'
}

const topics: Topic[] = [
  {
    id: 'mechanics',
    name: 'Mechanics',
    description: 'Kinematics, Laws of Motion, Work, Energy & Power',
    questionCount: 150,
    difficulty: 'medium'
  },
  {
    id: 'waves',
    name: 'Waves & Oscillations',
    description: 'Simple Harmonic Motion, Waves, Sound',
    questionCount: 80,
    difficulty: 'medium'
  },
  {
    id: 'thermodynamics',
    name: 'Thermodynamics',
    description: 'Heat Transfer, Laws of Thermodynamics, Kinetic Theory',
    questionCount: 100,
    difficulty: 'hard'
  },
  {
    id: 'electricity',
    name: 'Electricity & Magnetism',
    description: 'Electrostatics, Current Electricity, Magnetism',
    questionCount: 120,
    difficulty: 'hard'
  },
  {
    id: 'modern-physics',
    name: 'Modern Physics',
    description: 'Atoms, Nuclei, Quantum Physics, Semiconductors',
    questionCount: 90,
    difficulty: 'hard'
  },
  {
    id: 'optics',
    name: 'Optics',
    description: 'Ray Optics, Wave Optics, Optical Instruments',
    questionCount: 70,
    difficulty: 'medium'
  }
]

export default function PracticePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  const filteredTopics = selectedDifficulty === 'all' 
    ? topics 
    : topics.filter(t => t.difficulty === selectedDifficulty)

  const difficultyColors = {
    easy: 'var(--color-success)',
    medium: 'var(--color-warning)',
    hard: 'var(--color-error)'
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container-airbnb py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="heading-airbnb-2 flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-[var(--color-info)]" />
                Practice Mode
              </h1>
              <p className="text-[var(--foreground-secondary)] mt-1">Learn at your own pace with hints and instant feedback</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--background-elevated)] p-4 rounded-[var(--radius-base)] border border-[var(--border-color-light)]">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[var(--color-info)]" />
              <div>
                <p className="font-semibold text-sm">No Time Limit</p>
                <p className="text-xs text-[var(--foreground-secondary)]">Take your time</p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--background-elevated)] p-4 rounded-[var(--radius-base)] border border-[var(--border-color-light)]">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-[var(--color-success)]" />
              <div>
                <p className="font-semibold text-sm">Hints Available</p>
                <p className="text-xs text-[var(--foreground-secondary)]">Get help when stuck</p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--background-elevated)] p-4 rounded-[var(--radius-base)] border border-[var(--border-color-light)]">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-[var(--color-warning)]" />
              <div>
                <p className="font-semibold text-sm">Instant Feedback</p>
                <p className="text-xs text-[var(--foreground-secondary)]">Learn from mistakes</p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--background-elevated)] p-4 rounded-[var(--radius-base)] border border-[var(--border-color-light)]">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <p className="font-semibold text-sm">Detailed Solutions</p>
                <p className="text-xs text-[var(--foreground-secondary)]">Step-by-step guides</p>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedDifficulty('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDifficulty === 'all' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-[var(--background-elevated)] hover:bg-[var(--background-hover)]'
            }`}
          >
            All Topics
          </button>
          <button
            onClick={() => setSelectedDifficulty('easy')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDifficulty === 'easy' 
                ? 'bg-[var(--color-success)] text-white' 
                : 'bg-[var(--background-elevated)] hover:bg-[var(--background-hover)]'
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => setSelectedDifficulty('medium')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDifficulty === 'medium' 
                ? 'bg-[var(--color-warning)] text-white' 
                : 'bg-[var(--background-elevated)] hover:bg-[var(--background-hover)]'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setSelectedDifficulty('hard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDifficulty === 'hard' 
                ? 'bg-[var(--color-error)] text-white' 
                : 'bg-[var(--background-elevated)] hover:bg-[var(--background-hover)]'
            }`}
          >
            Hard
          </button>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map(topic => (
            <Link 
              key={topic.id} 
              href={`/practice/${topic.id}`}
              className="group"
            >
              <div className="bg-[var(--background-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-color)] hover:border-[var(--color-info)] transition-all duration-300 hover:shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-[var(--foreground)]">{topic.name}</h3>
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${difficultyColors[topic.difficulty]}20`,
                        color: difficultyColors[topic.difficulty]
                      }}
                    >
                      {topic.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground-secondary)] mb-4">{topic.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-secondary)]">
                      <Target className="h-4 w-4 inline mr-1" />
                      {topic.questionCount} questions
                    </span>
                    <span className="text-sm font-medium text-[var(--color-info)] opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Practice →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 p-8 bg-gradient-to-br from-[var(--color-info)]/10 to-[var(--color-info)]/5 rounded-[var(--radius-lg)] border border-[var(--color-info)]/20 text-center">
          <h3 className="text-xl font-bold mb-2">More Topics Coming Soon!</h3>
          <p className="text-[var(--foreground-secondary)]">
            We're continuously adding more practice questions across all JEE Physics topics.
          </p>
        </div>
      </div>
    </div>
  )
}