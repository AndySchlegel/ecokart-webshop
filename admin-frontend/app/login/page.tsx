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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-bg-dark border-2 border-accent rounded-lg shadow-2xl p-8 animate-slideUp">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-accent via-accent-dark to-green-500 bg-clip-text text-transparent">
            ADMIN LOGIN
          </h1>
          <p className="text-gray-400">
            Melde dich an, um Produkte zu verwalten
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-900/20 border-2 border-blue-500 rounded-lg">
          <p className="text-blue-400 text-sm font-semibold text-center">
            <strong>Wichtig:</strong> Nur Benutzer in der Cognito Group "admin" haben Zugriff
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-lg">
            <p className="text-red-400 text-sm font-semibold text-center">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="deine-email@example.com"
              className="w-full px-4 py-3 bg-bg-darker border-2 border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-bg-darker border-2 border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-dark text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wider shadow-lg hover:shadow-accent/50"
          >
            {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-6 text-center">
          <Link
            href="/reset-password"
            className="text-accent hover:text-accent-dark text-sm transition-colors"
          >
            Passwort vergessen?
          </Link>
        </div>

        {/* Back to Dashboard (if needed) */}
        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Zurück zum Dashboard
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
