'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      setIsLoading(false);
      router.push('/dashboard');
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Login.');
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>ADMIN<br/>LOGIN</h1>
          <p>Melde dich an, um Produkte zu verwalten</p>
        </div>

        {/* Info Box */}
        <div className="auth-info">
          <strong>Wichtig:</strong> Nur Benutzer in der Cognito Group "admin" haben Zugriff
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="deine-email@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Wird geladen...' : 'ANMELDEN'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link href="/reset-password" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontSize: '0.875rem' }}>
            Passwort vergessen?
          </Link>
        </div>

        <div className="auth-back">
          <Link href="/dashboard">← Zurück zum Dashboard</Link>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid var(--accent-orange);
          padding: 3rem;
          border-radius: 4px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 60px rgba(255, 107, 0, 0.2);
          animation: slideInUp 0.5s ease;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-header h1 {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-header p {
          color: #999;
          font-size: 1rem;
        }

        .auth-info {
          background: rgba(59, 130, 246, 0.1);
          border: 2px solid #3b82f6;
          color: #93c5fd;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
        }

        .auth-error {
          background: rgba(255, 0, 0, 0.1);
          border: 2px solid #ff0000;
          color: #ff6666;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: 600;
        }

        .auth-form {
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 1px;
          color: var(--accent-green);
        }

        .form-group input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid #333;
          border-radius: 4px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent-orange);
          background: rgba(255, 255, 255, 0.08);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-group input::placeholder {
          color: #666;
        }

        .btn-primary {
          width: 100%;
          padding: 1.25rem;
          background: var(--accent-orange);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          font-weight: 900;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }

        .btn-primary:hover:not(:disabled) {
          background: #ff8533;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 0, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-back {
          text-align: center;
          margin-top: 1.5rem;
        }

        .auth-back a {
          color: #666;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }

        .auth-back a:hover {
          color: var(--accent-green);
        }

        @media (max-width: 768px) {
          .auth-container {
            padding: 1rem;
          }

          .auth-card {
            padding: 2rem;
          }

          .auth-header h1 {
            font-size: 2rem;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
