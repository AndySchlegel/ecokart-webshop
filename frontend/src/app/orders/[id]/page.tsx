'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const token = await getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aws.his4irness23.de';
        const response = await fetch(`${apiUrl}/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Bestellung nicht gefunden');
          } else if (response.status === 403) {
            setError('Zugriff verweigert');
          } else {
            setError('Fehler beim Laden der Bestellung');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Fehler beim Laden der Bestellung');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, user, getToken, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Lade Bestellung...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full bg-zinc-900 p-8 rounded-lg text-center">
          <div className="text-red-500 text-6xl mb-4">✕</div>
          <h1 className="text-2xl font-bold text-white mb-4">Fehler</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/orders')}
            className="bg-[#FF6B35] text-white px-6 py-3 rounded-full font-bold hover:bg-[#e55a2b] transition-colors"
          >
            Zurück zu Bestellungen
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status];
  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 2-3 Werktage + 2 Tage Buffer

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Zurück zum Shop
          </button>
          <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
            AIR LEGACY
          </h1>
          <p className="text-gray-400">Bestellverfolgung</p>
        </div>

        {/* Status Badge */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg p-8 mb-8 border-l-4 border-[#FF6B35]">
          <div className="flex items-center gap-4 mb-4">
            <div className={`${statusInfo.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
              {statusInfo.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{statusInfo.label}</h2>
              <p className="text-gray-400">{statusInfo.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-700">
            <div>
              <p className="text-sm text-gray-400 mb-1">Bestellnummer</p>
              <p className="font-mono font-bold">#{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Bestelldatum</p>
              <p className="font-bold">
                {new Date(order.createdAt).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="bg-zinc-900 rounded-lg p-6 mb-8 border border-zinc-800">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="text-[#FF6B35]">📅</span>
              Voraussichtliche Lieferung
            </h3>
            <p className="text-xl font-bold text-[#FF6B35]">
              {estimatedDelivery.toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Innerhalb von 2-3 Werktagen nach Bestellung
            </p>
          </div>
        )}

        {/* Products */}
        <div className="bg-zinc-900 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-xl mb-4 uppercase tracking-wider border-b-2 border-[#FF6B35] pb-2">
            Deine Produkte
          </h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-4 border-b border-zinc-800 last:border-b-0"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-400">Menge: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#FF6B35]">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t-2 border-[#FF6B35] flex justify-between items-center">
            <span className="text-lg font-bold uppercase tracking-wider">Gesamtsumme</span>
            <span className="text-3xl font-black text-[#FF6B35]">
              {order.total.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-zinc-900 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-xl mb-4 uppercase tracking-wider border-b-2 border-[#FF6B35] pb-2">
            Lieferadresse
          </h3>
          <div className="space-y-1">
            <p className="font-bold">{order.shippingAddress.name}</p>
            <p className="text-gray-400">{order.shippingAddress.street}</p>
            <p className="text-gray-400">
              {order.shippingAddress.postalCode} {order.shippingAddress.city}
            </p>
            <p className="text-gray-400">{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-zinc-800">
          <p className="text-gray-400 mb-2">
            Bei Fragen zu deiner Bestellung kannst du uns jederzeit kontaktieren.
          </p>
          <p className="text-sm text-gray-600">
            AIR LEGACY - Performance Meets Style
          </p>
        </div>
      </div>
    </div>
  );
}
