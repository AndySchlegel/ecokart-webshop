// ============================================================================
// Dashboard Layout - Wrapper with Navigation
// ============================================================================
// Purpose: Layout for all dashboard pages with top navigation
//
// Features:
// - Horizontal top navigation (TopNav)
// - Protected route (auth check)
// - Responsive layout
// - Wraps all /dashboard/* routes
// ============================================================================

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';

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
    <div className="min-h-screen bg-bg-black">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
