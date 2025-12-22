'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="success-container">
        <div className="success-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Lade Bestelldaten...</p>
          </div>
        </div>

        <style jsx>{`
          .success-container {
            min-height: 100vh;
            background: #000;
            padding: 4rem 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .success-content {
            max-width: 600px;
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            border: 2px solid var(--accent-green);
            padding: 3rem;
            border-radius: 8px;
            text-align: center;
          }

          .loading {
            text-align: center;
            padding: 3rem;
          }

          .spinner {
            width: 50px;
            height: 50px;
            margin: 0 auto 1rem;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid var(--accent-green);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .loading p {
            color: #999;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-icon">
          <svg viewBox="0 0 52 52" className="checkmark">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h1 className="success-title">BESTELLUNG BESTÄTIGT!</h1>
        <p className="success-subtitle">
          Vielen Dank für deine Bestellung bei AIR LEGACY
        </p>

        <div className="order-details">
          <h2>BESTELLDETAILS</h2>

          <div className="detail-row">
            <span className="detail-label">Bestellnummer:</span>
            <span className="detail-value">#{params.id}</span>
          </div>

          <div className="info-box">
            <p>
              📧 Du erhältst in Kürze eine Bestätigungs-E-Mail mit allen Details zu deiner Bestellung.
            </p>
            <p>
              📦 Deine Bestellung wird innerhalb von 2-3 Werktagen bearbeitet und versendet.
            </p>
            <p>
              🚚 Die Lieferung erfolgt in 5-7 Werktagen. Du erhältst eine Tracking-Nummer per E-Mail.
            </p>
          </div>
        </div>

        <div className="action-buttons">
          <Link href="/" className="back-to-shop-button">
            ← Zurück zum Shop
          </Link>
        </div>
      </div>

      <style jsx>{`
        .success-container {
          min-height: 100vh;
          background: #000;
          padding: 4rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-content {
          max-width: 600px;
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid var(--accent-green);
          padding: 3rem;
          border-radius: 8px;
          text-align: center;
          animation: fadeInUp 0.6s ease;
        }

        .success-icon {
          margin: 0 auto 2rem;
        }

        .checkmark {
          width: 100px;
          height: 100px;
          margin: 0 auto;
          animation: scaleIn 0.5s ease-in-out;
        }

        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke: var(--accent-green);
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke-width: 3;
          stroke: var(--accent-green);
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }

        .success-title {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--accent-green), var(--accent-orange));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .success-subtitle {
          color: #999;
          font-size: 1.2rem;
          margin-bottom: 3rem;
        }

        .order-details {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          border-radius: 4px;
          padding: 2rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .order-details h2 {
          font-size: 1.2rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          color: var(--accent-green);
          letter-spacing: 2px;
          text-align: center;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #222;
        }

        .detail-label {
          color: #999;
          font-size: 0.95rem;
        }

        .detail-value {
          font-weight: 700;
          color: white;
          font-family: monospace;
        }

        .info-box {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: rgba(0, 255, 136, 0.05);
          border-left: 4px solid var(--accent-green);
          border-radius: 4px;
          text-align: left;
        }

        .info-box p {
          color: #ccc;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }

        .info-box p:last-child {
          margin-bottom: 0;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }

        .back-to-shop-button {
          background: none;
          border: 2px solid var(--accent-orange);
          color: var(--accent-orange);
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          text-decoration: none;
          display: inline-block;
        }

        .back-to-shop-button:hover {
          background: var(--accent-orange);
          color: #000;
          transform: translateX(-5px);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @media (max-width: 768px) {
          .success-container {
            padding: 2rem 1rem;
          }

          .success-content {
            padding: 2rem 1.5rem;
          }

          .success-title {
            font-size: 2rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-primary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
