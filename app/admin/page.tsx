'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AdminCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  available: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // TODO: Add proper admin authentication check
    // For now, we'll assume the user is admin
    setIsAdmin(true);
    setIsLoading(false);
  }, []);

  const adminCards: AdminCard[] = [
    {
      title: 'Process Previous Year Papers',
      description: 'Upload and process JEE/NEET previous year papers with OCR and AI extraction',
      href: '/admin/process-papers',
      icon: '📄',
      available: true
    },
    {
      title: 'View Extracted Questions',
      description: 'Browse and manage the extracted questions database',
      href: '/admin/questions',
      icon: '📚',
      available: true
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access the admin panel.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                Admin Access
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                User Dashboard →
              </Link>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Exit Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminCards.map((card) => (
            <Link
              key={card.href}
              href={card.available ? card.href : '#'}
              className={`group relative bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 ${
                card.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">{card.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
                </div>
                <p className="text-gray-600 mb-4">{card.description}</p>
                {card.available && (
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition">
                    <span className="text-sm font-medium">Open Tool</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/admin/process-papers')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Upload New Paper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}