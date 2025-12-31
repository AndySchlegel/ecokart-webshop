// ============================================================================
// Top Navigation - Admin Header (iOS-Style Segmented Control)
// ============================================================================
// Purpose: Horizontal navigation bar with segmented control for analytics
//
// Features:
// - iOS-style segmented control for Analytics (7d/30d)
// - Clean typography-based design
// - Active state highlighting
// - Logout button
// - Responsive design
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function TopNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isAnalytics7d = pathname === '/dashboard/overview';
  const isAnalytics30d = pathname === '/dashboard/analytics-30d';
  const isProducts = pathname === '/dashboard';

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <style jsx>{`
        .top-nav {
          background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
          border-bottom: 2px solid var(--accent-orange);
          box-shadow: 0 4px 20px rgba(255, 107, 0, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
        }

        .top-nav-container {
          max-width: 1800px;
          margin: 0 auto;
          padding: 1.25rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 3rem;
        }

        @media (max-width: 1024px) {
          .top-nav-container {
            gap: 2rem;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 767px) {
          .top-nav-container {
            padding: 1rem;
            gap: 1rem;
          }
        }

        /* Brand */
        .top-nav-brand {
          font-size: 1.25rem;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }

        @media (max-width: 767px) {
          .top-nav-brand {
            font-size: 1rem;
          }
        }

        /* Navigation */
        .top-nav-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .top-nav-navigation {
            order: 3;
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 767px) {
          .top-nav-navigation {
            gap: 0.75rem;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* Nav Link - Uniform style for all navigation items */
        .nav-link {
          padding: 0.625rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--text-gray);
          background: transparent;
          border: 1px solid rgba(255, 107, 0, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          text-decoration: none;
          display: inline-block;
        }

        .nav-link:hover {
          color: var(--accent-orange);
          border-color: var(--accent-orange);
          background: rgba(255, 107, 0, 0.1);
        }

        .nav-link.active {
          color: var(--bg-black);
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(255, 107, 0, 0.3);
        }

        @media (max-width: 767px) {
          .nav-link {
            width: 100%;
            text-align: center;
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
          }
        }

        /* Logout Button */
        .top-nav-logout {
          border: 1px solid rgba(255, 68, 68, 0.5);
          border-radius: 8px;
          padding: 0.625rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          background: transparent;
          color: #ff4444;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .top-nav-logout:hover {
          background: rgba(255, 68, 68, 0.15);
          border-color: #ff4444;
          color: #ff6666;
          box-shadow: 0 2px 8px rgba(255, 68, 68, 0.2);
        }

        .top-nav-logout:active {
          transform: scale(0.98);
        }

        @media (max-width: 767px) {
          .top-nav-logout {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
          }
        }
      `}</style>

      <nav className="top-nav">
        <div className="top-nav-container">
          {/* Brand */}
          <h1 className="top-nav-brand">ECOKART</h1>

          {/* Navigation */}
          <div className="top-nav-navigation">
            {/* Analytics 7d */}
            <Link
              href="/dashboard/overview"
              className={`nav-link ${isAnalytics7d ? 'active' : ''}`}
            >
              Analytics 7d
            </Link>

            {/* Analytics 30d */}
            <Link
              href="/dashboard/analytics-30d"
              className={`nav-link ${isAnalytics30d ? 'active' : ''}`}
            >
              Analytics 30d
            </Link>

            {/* Products */}
            <Link
              href="/dashboard"
              className={`nav-link ${isProducts ? 'active' : ''}`}
            >
              Produkte
            </Link>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="top-nav-logout"
            type="button"
          >
            Abmelden
          </button>
        </div>
      </nav>
    </>
  );
}
