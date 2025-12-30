// ============================================================================
// Dashboard Layout - Wrapper with Navigation
// ============================================================================
// Purpose: Layout for all dashboard pages with sidebar navigation
//
// Features:
// - Sidebar navigation (DashboardNav)
// - Protected route (auth check)
// - Responsive layout
// - Wraps all /dashboard/* routes
// ============================================================================

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNav } from '@/components/layout/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Protect route: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('[DashboardLayout] Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-bg-black">
      {/* Sidebar Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
