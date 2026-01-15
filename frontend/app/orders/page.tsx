'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../lib/config';
import { fetchAuthSession } from 'aws-amplify/auth';
import { logger } from '@/lib/logger';
import './orders.css';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        logger.error('Failed to fetch orders', { component: 'OrdersPage' }, error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get status badge color
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-badge--orange';
      case 'processing':
        return 'status-badge--blue';
      case 'shipped':
        return 'status-badge--purple';
      case 'delivered':
        return 'status-badge--green';
      case 'cancelled':
        return 'status-badge--red';
      default:
        return 'status-badge--gray';
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Ausstehend';
      case 'processing':
        return 'In Bearbeitung';
      case 'shipped':
        return 'Versandt';
      case 'delivered':
        return 'Zugestellt';
      case 'cancelled':
        return 'Storniert';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="orders-container">
        <Link href="/" className="back-to-shop">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zurück zum Shop
        </Link>
        <div className="orders-header">
          <h1 className="orders-title">MEINE BESTELLUNGEN</h1>
        </div>
        <div className="orders-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="order-card skeleton">
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <Link href="/" className="back-to-shop">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zurück zum Shop
        </Link>
        <div className="orders-header">
          <h1 className="orders-title">MEINE BESTELLUNGEN</h1>
        </div>
        <div className="orders-empty">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <h2>Noch keine Bestellungen</h2>
          <p>Du hast bisher noch keine Bestellungen aufgegeben.</p>
          <Link href="/" className="btn-primary">
            Jetzt Shoppen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <Link href="/" className="back-to-shop">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Zurück zum Shop
      </Link>
      <div className="orders-header">
        <h1 className="orders-title">MEINE BESTELLUNGEN</h1>
        <p className="orders-subtitle">
          {orders.length} {orders.length === 1 ? 'Bestellung' : 'Bestellungen'}
        </p>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="order-card"
            >
              <div className="order-card__header">
                <div className="order-info">
                  <div className="order-id">
                    <span className="order-id-label">Bestellung</span>
                    <span className="order-id-value">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <div className={`status-badge ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-card__body">
                <div className="order-items-summary">
                  <span className="item-count">
                    {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}
                  </span>
                  {order.items.length > 0 && (
                    <span className="item-preview">
                      {order.items.slice(0, 2).map((item, i) => (
                        <span key={i}>
                          {item.name}
                          {i < order.items.slice(0, 2).length - 1 && ', '}
                        </span>
                      ))}
                      {order.items.length > 2 && ` +${order.items.length - 2}`}
                    </span>
                  )}
                </div>

                <div className="order-total">
                  <span className="total-label">Gesamt:</span>
                  <span className="total-amount">€{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-card__footer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
