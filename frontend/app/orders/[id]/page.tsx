'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-white text-lg font-bold uppercase tracking-wider">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 w-2 h-16 mb-4"></div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-widest mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            AIR LEGACY
          </h1>
          <p className="text-orange-500 font-bold uppercase tracking-wider text-sm">Performance Meets Style</p>
        </div>

        {/* Success Badge - Athletic Style */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-center gap-6 flex-col md:flex-row">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
              <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black uppercase tracking-wider mb-2">
                Bestellung Bestätigt!
              </h2>
              <p className="text-orange-100 text-lg">Deine Order ist bei uns eingegangen</p>
            </div>
          </div>
        </div>

        {/* Order ID Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 mb-8 border border-zinc-700 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-orange-500 w-1 h-12"></div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Bestellnummer</p>
              <p className="text-2xl font-mono font-black text-white break-all">#{params.id}</p>
            </div>
          </div>

          <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-zinc-800">
            <p className="text-gray-300 text-lg leading-relaxed">
              Vielen Dank für dein Vertrauen in <span className="text-orange-500 font-bold">AIR LEGACY</span>.
              Deine Bestellung wurde erfolgreich aufgegeben! Du erhältst in Kürze eine Bestätigungs-E-Mail mit allen Details.
            </p>
          </div>
        </div>

        {/* Next Steps - Athletic Cards */}
        <div className="mb-8">
          <h3 className="text-2xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
            <div className="bg-orange-500 w-1 h-8"></div>
            <span>Nächste Schritte</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-orange-500 transition-all group">
              <div className="bg-orange-500 bg-opacity-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-all">
                <span className="text-3xl">📦</span>
              </div>
              <h4 className="font-bold text-lg mb-2 uppercase tracking-wide">Bearbeitung</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Deine Bestellung wird innerhalb von 2-3 Werktagen bearbeitet
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-orange-500 transition-all group">
              <div className="bg-orange-500 bg-opacity-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-all">
                <span className="text-3xl">✉️</span>
              </div>
              <h4 className="font-bold text-lg mb-2 uppercase tracking-wide">Tracking</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Du erhältst eine Tracking-Nummer per E-Mail
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-orange-500 transition-all group">
              <div className="bg-orange-500 bg-opacity-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-all">
                <span className="text-3xl">🚚</span>
              </div>
              <h4 className="font-bold text-lg mb-2 uppercase tracking-wide">Lieferung</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Lieferung erfolgt in 5-7 Werktagen
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-12">
          <a
            href="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-5 rounded-full font-black text-base uppercase tracking-widest hover:from-orange-600 hover:to-orange-700 transition-all shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Zurück zum Shop</span>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-zinc-800">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-orange-500 w-12 h-1"></div>
            <p className="text-2xl font-black uppercase tracking-widest">AIR LEGACY</p>
            <div className="bg-orange-500 w-12 h-1"></div>
          </div>
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            Performance Meets Style
          </p>
        </div>

      </div>
    </div>
  );
}
