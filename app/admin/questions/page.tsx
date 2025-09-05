'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

interface QuestionData {
  id: string;
  source_type: string;
  source_metadata: {
    exam?: string;
    year?: number;
    session?: string;
    question_number?: number;
  };
  question_text: string;
  question_type: string;
  subject: string;
  difficulty: string;
  has_diagram: boolean;
  diagram_url: string | null;
  marks: number;
}

export default function QuestionsPage() {
  const [tests, setTests] = useState<TestData[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

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
      // Fetch tests that are previous year papers
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .eq('test_type', 'previous_year')
        .order('published_at', { ascending: false });

      if (testsError) throw testsError;

      // Get question counts for each test
      const processedData = await Promise.all(testsData?.map(async (test) => {
        // Get question count and diagram count for this test
        const { data: questionLinks } = await supabase
          .from('test_questions')
          .select('question_id')
          .eq('test_id', test.id);

        if (questionLinks && questionLinks.length > 0) {
          const questionIds = questionLinks.map(q => q.question_id);
          
          const { data: questionsData } = await supabase
            .from('questions')
            .select('diagram_url')
            .in('id', questionIds);

          const diagramsCount = questionsData?.filter(q => q.diagram_url)?.length || 0;

          return {
            ...test,
            questions_count: questionLinks.length,
            diagrams_count: diagramsCount
          };
        }

        return {
          ...test,
          questions_count: 0,
          diagrams_count: 0
        };
      }) || []);

      setTests(processedData);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (testId: string) => {
    try {
      // First get the question IDs linked to this test
      const { data: questionLinks, error: linkError } = await supabase
        .from('test_questions')
        .select('question_id, sequence_number')
        .eq('test_id', testId)
        .order('sequence_number');

      if (linkError) throw linkError;

      if (questionLinks && questionLinks.length > 0) {
        const questionIds = questionLinks.map(q => q.question_id);
        
        // Fetch the actual questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .in('id', questionIds);

        if (questionsError) throw questionsError;

        // Sort questions by their sequence number
        const sortedQuestions = questionsData?.sort((a, b) => {
          const seqA = questionLinks.find(l => l.question_id === a.id)?.sequence_number || 0;
          const seqB = questionLinks.find(l => l.question_id === b.id)?.sequence_number || 0;
          return seqA - seqB;
        }) || [];

        setQuestions(sortedQuestions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const deleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test and all its questions?')) {
      return;
    }

    try {
      // Deleting test will cascade delete test_questions links
      // But we also need to delete the actual questions
      const { data: questionLinks } = await supabase
        .from('test_questions')
        .select('question_id')
        .eq('test_id', testId);

      // Delete the test (cascades to test_questions)
      const { error: testError } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

      if (testError) throw testError;

      // Delete the associated questions
      if (questionLinks && questionLinks.length > 0) {
        const questionIds = questionLinks.map(q => q.question_id);
        await supabase
          .from('questions')
          .delete()
          .in('id', questionIds);
      }
      
      fetchTests();
      if (selectedTest === testId) {
        setSelectedTest(null);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test');
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (test.test_metadata?.exam_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesYear = yearFilter === 'all' || test.test_metadata?.year?.toString() === yearFilter;
    
    return matchesSearch && matchesYear;
  });

  const uniqueYears = Array.from(new Set(tests.map(t => t.test_metadata?.year).filter(Boolean))).sort((a, b) => (b as number) - (a as number));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Previous Year Questions Database</h1>
                <p className="text-gray-600 mt-1">Manage all extracted papers and questions</p>
              </div>
            </div>
            <Link
              href="/admin/process-papers"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add New Paper
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Total Papers</div>
              <div className="text-2xl font-bold text-blue-800">{tests.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Total Questions</div>
              <div className="text-2xl font-bold text-green-800">
                {tests.reduce((sum, t) => sum + (t.questions_count || 0), 0)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 text-sm font-medium">With Diagrams</div>
              <div className="text-2xl font-bold text-purple-800">
                {tests.reduce((sum, t) => sum + (t.diagrams_count || 0), 0)}
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-amber-600 text-sm font-medium">Years Covered</div>
              <div className="text-2xl font-bold text-amber-800">{uniqueYears.length}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Papers List */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Extracted Papers</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading papers...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No papers found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredTests.map((test) => (
                    <div
                      key={test.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTest === test.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setSelectedTest(test.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">
                            {test.title}
                          </h3>
                          {test.test_metadata?.session && (
                            <p className="text-sm text-gray-600">Session: {test.test_metadata.session}</p>
                          )}
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-gray-500">
                              {test.questions_count} questions
                            </span>
                            <span className="text-xs text-gray-500">
                              {test.diagrams_count} diagrams
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              {test.test_type}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTest(test.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Questions View */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedTest ? 'Questions' : 'Select a Paper'}
              </h2>
              
              {!selectedTest ? (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-600">Select a paper to view its questions</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-600">No questions found for this paper</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            Q{question.source_metadata?.question_number || 'N/A'}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {question.subject}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            {question.source_metadata?.topic || 'General'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {question.difficulty}
                          </span>
                          {question.has_diagram && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                              Has Diagram
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-800 text-sm mb-2">{question.question_text || question.question}</p>
                      
                      {question.diagram_url && (
                        <div className="mt-2">
                          <img
                            src={question.diagram_url}
                            alt={`Diagram for Q${question.source_metadata?.question_number || 'N/A'}`}
                            className="max-w-xs rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}