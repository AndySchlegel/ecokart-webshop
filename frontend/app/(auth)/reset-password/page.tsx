'use client';

import { useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      await resetPassword({ username: email });
      setSuccess(`Reset-Code wurde an ${email} gesendet.`);
      setStep('confirm');
    } catch (err: any) {
      console.error('[ResetPassword] Request code failed:', err);
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
      console.log('[ResetPassword] Confirming reset for:', email);

      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword,
      });

      console.log('[ResetPassword] Password reset successful');
      setSuccess('Passwort erfolgreich zurückgesetzt!');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('[ResetPassword] Confirm reset failed:', err);

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>PASSWORT<br/>ZURÜCKSETZEN</h1>
          <p>
            {step === 'request'
              ? 'Gib deine E-Mail ein für einen Reset-Code'
              : 'Gib den Code und dein neues Passwort ein'
            }
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">E-MAIL</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.com"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'WIRD GESENDET...' : 'CODE ANFORDERN'}
            </button>
          </form>
        )}

        {step === 'confirm' && (
          <form onSubmit={handleConfirmReset} className="auth-form">
            <div className="form-group">
              <label htmlFor="code">RESET-CODE</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                disabled={loading}
              />
              <small style={{ color: '#999', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Prüfe deine E-Mails ({email})
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">NEUES PASSWORT</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">PASSWORT BESTÄTIGEN</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px' }}>
              <p style={{ color: 'var(--accent-green)', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.875rem' }}>PASSWORT-ANFORDERUNGEN:</p>
              <ul style={{ color: '#999', fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
                <li>Mindestens 8 Zeichen</li>
                <li>Groß- und Kleinbuchstaben</li>
                <li>Mindestens eine Zahl</li>
              </ul>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'WIRD ZURÜCKGESETZT...' : 'PASSWORT ZURÜCKSETZEN'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
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
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ← Zurück
              </button>
            </div>
          </form>
        )}

        <div className="auth-back">
          <Link href="/login">← Zurück zum Login</Link>
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

        .auth-success {
          background: rgba(0, 255, 0, 0.1);
          border: 2px solid var(--accent-green);
          color: var(--accent-green);
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
