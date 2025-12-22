'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: {
    label: 'In Vorbereitung',
    color: 'bg-orange-500',
    icon: '⏳',
    description: 'Deine Bestellung wird gerade bearbeitet'
  },
  processing: {
    label: 'In Bearbeitung',
    color: 'bg-blue-500',
    icon: '📦',
    description: 'Deine Bestellung wird für den Versand vorbereitet'
  },
  shipped: {
    label: 'Versendet',
    color: 'bg-purple-500',
    icon: '🚚',
    description: 'Deine Bestellung ist unterwegs'
  },
  delivered: {
    label: 'Zugestellt',
    color: 'bg-green-500',
    icon: '✓',
    description: 'Deine Bestellung wurde erfolgreich zugestellt'
  },
  cancelled: {
    label: 'Storniert',
    color: 'bg-red-500',
    icon: '✕',
    description: 'Diese Bestellung wurde storniert'
  }
};

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // For now: Show dummy data for tracking page
        // Backend auth will be added later when proper auth is implemented

        setLoading(false);
        setError('Diese Funktion ist derzeit in Entwicklung. Deine Bestellung wurde erfolgreich aufgegeben!');
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Fehler beim Laden der Bestellung');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Lade Bestellung...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-lg text-center border border-zinc-700">
          <div className="text-green-500 text-6xl mb-6">✓</div>
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-wider">
            Bestellung Bestätigt!
          </h1>
          <div className="bg-zinc-800 p-6 rounded-lg mb-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Bestellnummer</p>
            <p className="text-xl font-mono font-bold text-white">#{params.id}</p>
          </div>
          <p className="text-gray-300 mb-6 text-lg leading-relaxed">
            Deine Bestellung wurde erfolgreich aufgegeben! Du erhältst in Kürze eine Bestätigungs-E-Mail mit allen Details.
          </p>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700 mb-6">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2 justify-center">
              <span className="text-orange-500">📦</span>
              Nächste Schritte
            </h3>
            <ul className="text-left text-gray-400 space-y-2 max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">→</span>
                <span>Deine Bestellung wird innerhalb von 2-3 Werktagen bearbeitet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">→</span>
                <span>Du erhältst eine Tracking-Nummer per E-Mail</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">→</span>
                <span>Lieferung erfolgt in 5-7 Werktagen</span>
              </li>
            </ul>
          </div>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            Zurück zum Shop
          </a>
          <div className="mt-8 pt-6 border-t border-zinc-700">
            <p className="text-sm text-gray-600">
              AIR LEGACY - Performance Meets Style
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
