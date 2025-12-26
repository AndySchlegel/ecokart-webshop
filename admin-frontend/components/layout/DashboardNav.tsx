// ============================================================================
// Dashboard Navigation - Admin Sidebar
// ============================================================================
// Purpose: Sidebar navigation for admin dashboard with route links
//
// Features:
// - Navigation links (Analytics, Products)
// - Active route highlighting
// - Logout button
// - Responsive design
// - Icons for visual clarity
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navItems = [
    {
      name: 'Analytics (7 Tage)',
      href: '/dashboard/overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'Analytics (30 Tage)',
      href: '/dashboard/analytics-30d',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Produkte',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/overview') {
      return pathname === href;
    }
    if (href === '/dashboard/analytics-30d') {
      return pathname === href;
    }
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href;
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="w-64 bg-bg-dark border-r-2 border-accent-orange min-h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b-2 border-accent-orange">
        <h1 className="text-xl font-bold text-white uppercase tracking-wide">EcoKart Admin</h1>
        <p className="text-xs text-gray-400 mt-1">Verwaltung & Analytics</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 transition-colors
                ${active
                  ? 'bg-accent-orange/10 text-accent-orange font-medium border-l-4 border-accent-orange'
                  : 'text-gray-300 hover:bg-bg-darker hover:text-accent-orange border-l-4 border-transparent'
                }
              `}
            >
              <span className={active ? 'text-accent-orange' : 'text-gray-500'}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t-2 border-accent-orange">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-900/20 hover:text-red-500 transition-colors border-l-4 border-transparent hover:border-red-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Abmelden</span>
        </button>
      </div>
    </nav>
  );
}
