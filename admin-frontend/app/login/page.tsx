'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      // Login via Cognito mit Admin Group Check
      await login(email, password);

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err) {
      // If already signed in, sign out and try again
      if (err instanceof Error && err.message.includes('already a signed in user')) {
        try {
          const { signOut: amplifySignOut } = await import('aws-amplify/auth');
          await amplifySignOut();
          // Retry login
          await login(email, password);
          router.push('/dashboard');
        } catch (retryErr) {
          setIsLoading(false);
          setError(retryErr instanceof Error ? retryErr.message : 'Unbekannter Fehler beim Login.');
        }
      } else {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Login.');
      }
    }
  }

  return (
    <main className="page">
      <section className="page__content">
        <div className="card" style={{ maxWidth: '500px', margin: '6rem auto 0' }}>
          <h1>ADMIN LOGIN</h1>
          <p>
            Melde dich an, um Produkte zu verwalten
          </p>
          <div className="message message--info" style={{ fontSize: '0.875rem' }}>
            <strong>Wichtig:</strong><br />
            Nur Benutzer in der Cognito Group "admin" haben Zugriff
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
            <label>
              <span>E-Mail</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="deine-email@example.com"
              />
            </label>
            <label>
              <span>Passwort</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                placeholder="••••••••"
              />
            </label>
            {error && (
              <div className="message message--error">
                {error}
              </div>
            )}
            <button className="button" type="submit" disabled={isLoading}>
              {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
