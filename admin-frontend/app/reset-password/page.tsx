'use client';

import { useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'confirm'>('request');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      logger.info('Requesting password reset code', { email, component: 'ResetPasswordPage' });

      await resetPassword({ username: email });

      setSuccess(`Reset-Code wurde an ${email} gesendet.`);
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

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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

      logger.info('Password reset successful', { email, component: 'ResetPasswordPage' });
      setSuccess('Passwort erfolgreich zurückgesetzt!');

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
        setError('Passwort erfüllt nicht die Anforderungen');
      } else {
        setError(err.message || 'Passwort-Reset fehlgeschlagen');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-bg-dark border-2 border-accent rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Passwort zurücksetzen
          </h1>
          <p className="text-gray-400">
            {step === 'request'
              ? 'Gib deine E-Mail ein für einen Reset-Code'
              : 'Gib den Code und dein neues Passwort ein'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-lg">
            <p className="text-red-400 text-sm font-semibold text-center">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border-2 border-green-500 rounded-lg">
            <p className="text-green-400 text-sm font-semibold text-center">{success}</p>
          </div>
        )}

        {/* Step 1: Request Code */}
        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-darker border-2 border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="deine@email.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wider"
            >
              {loading ? 'Wird gesendet...' : 'Code anfordern'}
            </button>
          </form>
        )}

        {/* Step 2: Confirm Reset */}
        {step === 'confirm' && (
          <form onSubmit={handleConfirmReset} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Reset-Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-darker border-2 border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="123456"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-gray-400">
                Prüfe deine E-Mails ({email})
              </p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Neues Passwort
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-darker border-2 border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-darker border-2 border-bg-lighter rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div className="bg-bg-darker border-2 border-bg-lighter rounded-lg p-4">
              <p className="text-accent font-semibold text-sm mb-2 uppercase tracking-wide">Passwort-Anforderungen:</p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>Mindestens 8 Zeichen</li>
                <li>Groß- und Kleinbuchstaben</li>
                <li>Mindestens eine Zahl</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wider"
            >
              {loading ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                  setSuccess('');
                }}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Zurück
              </button>
            </div>
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
