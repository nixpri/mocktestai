'use client'

import Link from 'next/link'
import { BookOpen, Brain, Target, Trophy, Zap, Users, ArrowRight, CheckCircle, Star, TrendingUp, Clock, Award, Sparkles, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 bg-[var(--background-elevated)] transition-all duration-300 ${
        scrolled ? 'shadow-md border-b border-[var(--border-color-light)]' : ''
      }`}>
        <div className="container-airbnb">
          <div className="flex justify-between h-[72px] items-center">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-[var(--color-primary)]" />
              <span className="text-[var(--text-xl)] font-bold text-[var(--foreground)]">MockTest AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth" 
                className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth" 
                className="btn-airbnb bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container-airbnb">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-[var(--text-sm)] font-medium text-[var(--color-primary)]">
                AI-Powered Learning Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
              Master JEE Physics with
              <span className="text-[var(--color-primary)] block mt-2">Intelligent Mock Tests</span>
            </h1>
            
            <p className="text-[var(--text-xl)] text-[var(--foreground-secondary)] mb-10 max-w-3xl mx-auto leading-relaxed">
              Practice with AI-generated questions that adapt to your learning pace. 
              Get personalized insights and improve your JEE Main Physics scores.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth" 
                className="btn-airbnb bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] px-8 py-4 text-lg flex items-center justify-center gap-2 group"
              >
                Start Free Practice
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features" 
                className="btn-airbnb btn-airbnb-secondary px-8 py-4 text-lg"
              >
                Learn More
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-[var(--foreground-secondary)]">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-[var(--text-sm)]">10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-[var(--color-warning)]" />
                <span className="text-[var(--text-sm)]">4.8/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <span className="text-[var(--text-sm)]">95% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[var(--background)]">
        <div className="container-airbnb">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4">
              Why Students Choose MockTest AI
            </h2>
            <p className="text-[var(--text-lg)] text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to excel in JEE Physics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-airbnb p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-cyan-500 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[var(--text-xl)] font-bold text-[var(--foreground)] mb-3">
                AI-Generated Questions
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Unique questions generated based on JEE patterns, ensuring you never run out of practice material
              </p>
            </div>

            <div className="card-airbnb p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-success)] to-emerald-500 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[var(--text-xl)] font-bold text-[var(--foreground)] mb-3">
                Adaptive Difficulty
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Questions automatically adjust to your skill level for optimal learning progression
              </p>
            </div>

            <div className="card-airbnb p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-info)] to-blue-500 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[var(--text-xl)] font-bold text-[var(--foreground)] mb-3">
                Performance Analytics
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Detailed insights into your strengths and areas for improvement with visual progress tracking
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="card-airbnb p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-warning)] to-amber-500 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[var(--text-xl)] font-bold text-[var(--foreground)] mb-3">
                Timed Practice
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Simulate real exam conditions with timed tests to improve speed and accuracy
              </p>
            </div>

            <div className="card-airbnb p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[var(--text-xl)] font-bold text-[var(--foreground)] mb-3">
                Instant Results
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Get immediate feedback with detailed solutions and explanations for every question
              </p>
            </div>

            <div className="card-airbnb p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[var(--text-xl)] font-bold text-[var(--foreground)] mb-3">
                Smart Learning
              </h3>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                AI identifies your weak areas and provides targeted practice to strengthen them
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Coverage */}
      <section className="py-20 bg-[var(--background-secondary)]">
        <div className="container-airbnb">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4">
              Complete JEE Physics Coverage
            </h2>
            <p className="text-[var(--text-lg)] text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Comprehensive practice across all topics in the JEE Main & Advanced syllabus
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { topic: 'Mechanics & Kinematics', questions: '2000+', color: 'from-blue-500 to-cyan-500' },
              { topic: 'Thermodynamics', questions: '800+', color: 'from-red-500 to-orange-500' },
              { topic: 'Electromagnetism', questions: '1500+', color: 'from-purple-500 to-pink-500' },
              { topic: 'Optics', questions: '600+', color: 'from-green-500 to-emerald-500' },
              { topic: 'Modern Physics', questions: '1000+', color: 'from-indigo-500 to-purple-500' },
              { topic: 'Waves & Oscillations', questions: '700+', color: 'from-amber-500 to-yellow-500' }
            ].map((item) => (
              <div key={item.topic} className="card-airbnb p-6 hover-lift group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-[var(--radius-base)] flex items-center justify-center`}>
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[var(--text-sm)] text-[var(--foreground-secondary)] font-medium">
                    {item.questions} Questions
                  </span>
                </div>
                <h3 className="text-[var(--text-lg)] font-semibold text-[var(--foreground)] mb-2">
                  {item.topic}
                </h3>
                <div className="flex items-center gap-1 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[var(--text-sm)] font-medium">Practice Now</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container-airbnb">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4">
              Student Success Stories
            </h2>
            <p className="text-[var(--text-lg)] text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Join thousands of students who improved their JEE scores with MockTest AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Arjun Kumar', score: '98 percentile', testimonial: 'The AI-generated questions were spot on! They helped me identify and work on my weak areas effectively.' },
              { name: 'Priya Sharma', score: '96 percentile', testimonial: 'The detailed analytics showed me exactly where I needed to focus. My scores improved by 30% in just 2 months!' },
              { name: 'Rohit Verma', score: '99 percentile', testimonial: 'The adaptive difficulty feature kept me challenged throughout my preparation. Best platform for JEE Physics!' }
            ].map((student) => (
              <div key={student.name} className="card-airbnb p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                  ))}
                </div>
                <p className="text-[var(--foreground-secondary)] mb-4 italic">
                  "{student.testimonial}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{student.name}</p>
                    <p className="text-[var(--text-sm)] text-[var(--color-success)]">{student.score}</p>
                  </div>
                  <div className="w-12 h-12 bg-[var(--background-secondary)] rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-[var(--color-warning)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--color-primary)] to-cyan-500">
        <div className="container-airbnb text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Ace JEE Physics?
            </h2>
            <p className="text-[var(--text-xl)] text-white/90 mb-10">
              Join thousands of students preparing smarter with AI. 
              Start your free trial today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth" 
                className="btn-airbnb bg-white text-[var(--color-primary)] hover:bg-gray-50 px-8 py-4 text-lg font-semibold flex items-center justify-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/auth" 
                className="btn-airbnb border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              >
                View Pricing
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-white/80 text-[var(--text-sm)]">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--foreground)] py-12">
        <div className="container-airbnb">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-6 w-6 text-white" />
                <span className="text-[var(--text-lg)] font-bold text-white">MockTest AI</span>
              </div>
              <p className="text-gray-400 text-[var(--text-sm)]">
                AI-powered test preparation platform for JEE aspirants
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-[var(--text-sm)]">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-[var(--text-sm)]">
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/guides" className="text-gray-400 hover:text-white transition-colors">Study Guides</Link></li>
                <li><Link href="/syllabus" className="text-gray-400 hover:text-white transition-colors">JEE Syllabus</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-[var(--text-sm)]">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-[var(--text-sm)]">
              &copy; 2025 MockTest AI. All rights reserved. Built with Next.js & Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}