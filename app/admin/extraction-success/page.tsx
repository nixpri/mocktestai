'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ExtractionSuccessPage() {
  const searchParams = useSearchParams();
  const [stats, setStats] = useState({
    fileName: '',
    questionsCount: 0,
    diagramsCount: 0,
    savedPath: ''
  });

  useEffect(() => {
    // Get stats from URL params
    setStats({
      fileName: searchParams.get('file') || '',
      questionsCount: parseInt(searchParams.get('questions') || '0'),
      diagramsCount: parseInt(searchParams.get('diagrams') || '0'),
      savedPath: searchParams.get('path') || ''
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Paper Processing Complete!
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Previous year paper has been successfully processed and saved.
        </p>

        {/* Stats Card */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">File Processed:</span>
              <span className="font-semibold text-gray-800">{stats.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Questions Updated:</span>
              <span className="font-semibold text-gray-800">{stats.questionsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Diagrams Extracted:</span>
              <span className="font-semibold text-gray-800">{stats.diagramsCount}</span>
            </div>
            {stats.savedPath && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">Saved to:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block break-all">
                  {stats.savedPath}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/process-papers"
            className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-center hover:bg-gray-200 transition-colors font-medium"
          >
            Process Another
          </Link>
          <Link
            href="/admin"
            className="py-2 px-4 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Admin
          </Link>
        </div>

        {/* View Data Link */}
        <div className="mt-4 text-center">
          <Link
            href={`/admin/questions`}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            View Extracted Questions →
          </Link>
        </div>
      </div>
    </div>
  );
}