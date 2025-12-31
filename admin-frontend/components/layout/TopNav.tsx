// ============================================================================
// Top Navigation - Admin Header
// ============================================================================
// Purpose: Horizontal navigation bar for admin dashboard
//
// Features:
// - Navigation links (Analytics, Products)
// - Active route highlighting
// - Logout button
// - Responsive design
// - Always visible at top
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function TopNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navItems = [
    {
      name: 'Analytics (7 Tage)',
      href: '/dashboard/overview',
    },
    {
      name: 'Analytics (30 Tage)',
      href: '/dashboard/analytics-30d',
    },
    {
      name: 'Produkte',
      href: '/dashboard',
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
          max-width: 1600px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        @media (max-width: 767px) {
          .top-nav-container {
            padding: 1rem;
            gap: 1rem;
          }
        }

        .top-nav-brand {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .top-nav-brand h1 {
          font-size: 1.5rem;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .top-nav-brand p {
          font-size: 0.75rem;
          color: var(--text-gray);
          margin: 0;
        }

        @media (max-width: 767px) {
          .top-nav-brand h1 {
            font-size: 1.25rem;
          }
          .top-nav-brand p {
            display: none;
          }
        }

        .top-nav-links {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
          flex: 1;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .top-nav-links {
            order: 3;
            width: 100%;
            justify-content: flex-start;
          }
        }

        .top-nav-link {
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-gray);
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
        }

        .top-nav-link:hover {
          color: var(--accent-orange);
        }

        .top-nav-link.active {
          color: var(--accent-orange);
          border-bottom-color: var(--accent-orange);
        }

        @media (max-width: 767px) {
          .top-nav-link {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
          }
        }

        .top-nav-logout {
          border: 2px solid #ff4444;
          border-radius: 0;
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          background: transparent;
          color: #ff4444;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        .top-nav-logout::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: #ff4444;
          transition: left 0.3s ease;
          z-index: -1;
        }

        .top-nav-logout:hover {
          color: var(--bg-black);
        }

        .top-nav-logout:hover::before {
          left: 0;
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
          <div className="top-nav-brand">
            <h1>EcoKart Admin</h1>
            <p>Verwaltung & Analytics</p>
          </div>

          {/* Navigation Links */}
          <div className="top-nav-links">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`top-nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
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
