'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  number: number;
  text: string;
  page_number: number;
  has_diagram: boolean;
  diagram_extracted?: boolean;
  diagram_path?: string;
  diagram_description?: string;
  options: { label: string; text: string }[];
  year?: string;
  exam?: string;
  subject?: string;
  topic?: string;
}

interface QuestionFile {
  fileName: string;
  metadata: {
    year: string;
    exam: string;
    subject: string;
    totalQuestions: number;
    questionsWithDiagrams: number;
    extractedDate: string;
  };
  questions: Question[];
}

export default function QuestionsPage() {
  const router = useRouter();
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [questionData, setQuestionData] = useState<QuestionFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadAvailableFiles();
  }, []);

  const loadAvailableFiles = async () => {
    try {
      const response = await fetch('/api/admin/extracted-papers');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const loadQuestionFile = async (fileName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/extracted-papers?file=${fileName}`);
      if (response.ok) {
        const result = await response.json();
        setQuestionData(result.data);
        setSelectedFile(fileName);
      }
    } catch (error) {
      console.error('Error loading question file:', error);
      alert('Failed to load question file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Extracted Questions Database</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back to Admin
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: File List */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Available Files</h2>
            <div className="space-y-2">
              {files.length === 0 ? (
                <p className="text-gray-500 text-sm">No processed papers yet</p>
              ) : (
                files.map((file) => (
                  <button
                    key={file}
                    onClick={() => loadQuestionFile(file)}
                    className={`w-full text-left p-2 rounded-lg transition ${
                      selectedFile === file
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm font-medium">{file.replace('_complete.json', '')}</div>
                  </button>
                ))
              )}
            </div>
            <Link
              href="/admin/process-papers"
              className="mt-4 block text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Process New Paper
            </Link>
          </div>

          {/* Middle: Question List */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">
              Questions {questionData && `(${questionData.questions.length})`}
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : questionData ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {questionData.questions.map((question) => (
                  <button
                    key={question.number}
                    onClick={() => setSelectedQuestion(question)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedQuestion?.number === question.number
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Q{question.number}</span>
                      {question.diagram_extracted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Has Diagram
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {question.text.substring(0, 100)}...
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a file to view questions</p>
            )}
          </div>

          {/* Right: Question Details */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Question Details</h2>
            {selectedQuestion ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-600">
                    Question {selectedQuestion.number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Page {selectedQuestion.page_number} | {selectedQuestion.topic || 'General Physics'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-700">{selectedQuestion.text}</p>
                </div>

                {selectedQuestion.options && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Options:</p>
                    {selectedQuestion.options.map((option) => (
                      <div key={option.label} className="flex items-start">
                        <span className="font-semibold mr-2">{option.label}.</span>
                        <span className="text-sm">{option.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedQuestion.diagram_extracted && selectedQuestion.diagram_path && (
                  <div>
                    <p className="font-medium text-sm mb-2">Diagram:</p>
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-2">
                        {selectedQuestion.diagram_description}
                      </p>
                      <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                        {selectedQuestion.diagram_path}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a question to view details</p>
            )}
          </div>
        </div>

        {/* Metadata Section */}
        {questionData && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">File Metadata</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Year:</span>
                <span className="ml-2 font-medium">{questionData.metadata.year}</span>
              </div>
              <div>
                <span className="text-gray-500">Exam:</span>
                <span className="ml-2 font-medium">{questionData.metadata.exam}</span>
              </div>
              <div>
                <span className="text-gray-500">Subject:</span>
                <span className="ml-2 font-medium">{questionData.metadata.subject}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Questions:</span>
                <span className="ml-2 font-medium">{questionData.metadata.totalQuestions}</span>
              </div>
              <div>
                <span className="text-gray-500">With Diagrams:</span>
                <span className="ml-2 font-medium">{questionData.metadata.questionsWithDiagrams}</span>
              </div>
              <div>
                <span className="text-gray-500">Extracted:</span>
                <span className="ml-2 font-medium">
                  {new Date(questionData.metadata.extractedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}