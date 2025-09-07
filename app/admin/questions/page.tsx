'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { transformDatabaseQuestion, UnifiedQuestion } from '@/lib/utils/questionTransformer';
import QuestionDisplay from '@/components/test/QuestionDisplay';

interface TestData {
  id: string;
  test_type: string;
  test_metadata: {
    exam_name?: string;
    year?: number;
    session?: string | null;
    pdf_file_name?: string;
    extracted_at?: string;
  };
  title: string;
  description: string;
  subject: string | null;
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  is_active: boolean;
  published_at: string;
  questions_count?: number;
  diagrams_count?: number;
}

// Using UnifiedQuestion from transformer

export default function QuestionsPage() {
  const [tests, setTests] = useState<TestData[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [questions, setQuestions] = useState<UnifiedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [testTypeFilter, setTestTypeFilter] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchQuestions(selectedTest);
    }
  }, [selectedTest]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      // Fetch tests using admin API route (uses service role key)
      const response = await fetch('/api/admin/tests');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tests');
      }
      
      setTests(data.tests || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (testId: string) => {
    try {
      // Fetch questions using admin API route (uses service role key)
      const response = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions');
      }
      
      // Transform questions to unified format
      const transformedQuestions = (data.questions || [])
        .map((q: any) => transformDatabaseQuestion(q))
        .filter((q: UnifiedQuestion | null): q is UnifiedQuestion => q !== null);
      setQuestions(transformedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    }
  };

  // Get unique years and subjects for filters
  const years = [...new Set(tests.map(t => t.test_metadata?.year).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));
  const subjects = [...new Set(tests.map(t => t.subject).filter(Boolean))];
  const testTypes = [...new Set(tests.map(t => t.test_type))];

  // Filter tests
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || test.subject === subjectFilter;
    const matchesYear = yearFilter === 'all' || test.test_metadata?.year?.toString() === yearFilter;
    const matchesType = testTypeFilter === 'all' || test.test_type === testTypeFilter;
    
    return matchesSearch && matchesSubject && matchesYear && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Question Bank Management</h1>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
              <select
                value={testTypeFilter}
                onChange={(e) => setTestTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {testTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Subjects</option>
                {subjects.filter(subject => subject !== null).map(subject => (
                  <option key={subject} value={subject!}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Test List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tests Column */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tests ({filteredTests.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  onClick={() => setSelectedTest(test.id)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition ${
                    selectedTest === test.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{test.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {test.test_type.replace('_', ' ').toUpperCase()}
                        </span>
                        {test.subject && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            {test.subject}
                          </span>
                        )}
                        {test.test_metadata?.year && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {test.test_metadata.year}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>📝 {test.questions_count || 0} questions</span>
                        <span>🖼️ {test.diagrams_count || 0} diagrams</span>
                        <span>⏱️ {test.duration_minutes} min</span>
                        <span>📊 {test.total_marks} marks</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions Column */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Questions {selectedTest && `(${questions.length})`}
            </h2>
            {selectedTest ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-700">Q{index + 1}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          question.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty?.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          {question.questionType.toUpperCase().replace('_', ' ')}
                        </span>
                        {question.hasDiagram && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            📊 Diagram
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-green-600">+{question.marks}</span>
                        <span className="text-sm text-gray-400 mx-1">/</span>
                        <span className="text-sm font-semibold text-red-600">-{question.negativeMarks}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <QuestionDisplay
                        question={question}
                        selectedAnswer={null}
                        onAnswerSelect={() => {}}
                        showAnswer={true}
                        mode="view"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                Select a test to view its questions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}