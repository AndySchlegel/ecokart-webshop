// ============================================================================
// 🔐 PASSWORD RESET PAGE - ADMIN FRONTEND
// ============================================================================
// Ermöglicht Admins ihr Passwort zurückzusetzen via Email-Code
// Datum: 26. Dezember 2025
// ============================================================================

'use client';

import { useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function ResetPasswordPage() {
  const router = useRouter();

  // Step 1: Email eingeben → Code anfordern
  // Step 2: Code + neues Passwort eingeben → Bestätigen
  const [step, setStep] = useState<'request' | 'confirm'>('request');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ----------------------------------------------------------------
  // Step 1: Reset-Code anfordern
  // ----------------------------------------------------------------
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      logger.info('Requesting password reset code', { email, component: 'ResetPasswordPage' });

      await resetPassword({ username: email });

      setSuccess(`Reset-Code wurde an ${email} gesendet. Bitte prüfe deine E-Mails.`);
      setStep('confirm');

      logger.info('Password reset code sent', { email, component: 'ResetPasswordPage' });
    } catch (err: any) {
      logger.error('Failed to request reset code', { email, component: 'ResetPasswordPage' }, err);

      if (err.name === 'UserNotFoundException') {
        setError('Kein Account mit dieser E-Mail gefunden');
      } else if (err.name === 'LimitExceededException') {
        setError('Zu viele Versuche. Bitte warte ein paar Minuten.');
      } else {
        setError(err.message || 'Code-Anfrage fehlgeschlagen');
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // Step 2: Passwort zurücksetzen mit Code
  // ----------------------------------------------------------------
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validierung
    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setLoading(true);

    try {
      logger.info('Confirming password reset', { email, component: 'ResetPasswordPage' });

      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword,
      });

      setSuccess('Passwort erfolgreich zurückgesetzt! Du wirst weitergeleitet...');

      logger.info('Password reset successful', { email, component: 'ResetPasswordPage' });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      logger.error('Failed to confirm reset', { email, component: 'ResetPasswordPage' }, err);

      if (err.name === 'CodeMismatchException') {
        setError('Falscher Code. Bitte überprüfe den Code aus deiner E-Mail.');
      } else if (err.name === 'ExpiredCodeException') {
        setError('Code ist abgelaufen. Bitte fordere einen neuen an.');
      } else if (err.name === 'InvalidPasswordException') {
        setError('Passwort erfüllt nicht die Anforderungen (mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen)');
      } else {
        setError(err.message || 'Passwort-Reset fehlgeschlagen');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-bg-dark border-2 border-bg-darker rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Passwort zurücksetzen
          </h1>
          <p className="text-gray-400">
            {step === 'request'
              ? 'Gib deine E-Mail ein um einen Reset-Code zu erhalten'
              : 'Gib den Code aus deiner E-Mail und dein neues Passwort ein'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Step 1: Request Code */}
        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-darker border border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="deine@email.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Code wird angefordert...' : 'Code anfordern'}
            </button>
          </form>
        )}

        {/* Step 2: Confirm Reset */}
        {step === 'confirm' && (
          <form onSubmit={handleConfirmReset} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                Reset-Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-darker border border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="123456"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-400">
                Prüfe deine E-Mails ({email})
              </p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Neues Passwort
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-darker border border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-darker border border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="text-sm text-gray-400">
              <p className="font-medium mb-1">Passwort-Anforderungen:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Mindestens 8 Zeichen</li>
                <li>Groß- und Kleinbuchstaben</li>
                <li>Mindestens eine Zahl</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Passwort wird zurückgesetzt...' : 'Passwort zurücksetzen'}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Zurück
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-accent hover:text-accent-dark text-sm transition-colors"
          >
            ← Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}
