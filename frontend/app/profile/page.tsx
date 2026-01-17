'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../lib/config';
import { fetchAuthSession } from 'aws-amplify/auth';
import { logger } from '@/lib/logger';
import './profile.css';

interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface UserProfile {
  userId: string;
  email: string;
  name?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch user profile and orders
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
          throw new Error('No authentication token');
        }

        // Fetch orders
        const ordersResponse = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders || []);
        }

        // Fetch user profile
        const profileResponse = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile({
            userId: profileData.userId || user.userId || '',
            email: profileData.email || user.email || '',
            name: profileData.name,
            createdAt: profileData.createdAt || new Date().toISOString(),
          });
          setEditedName(profileData.name || '');
        } else {
          // Fallback to user context if backend fails
          setProfile({
            userId: user.userId || '',
            email: user.email || '',
            name: undefined,
            createdAt: new Date().toISOString(),
          });
          setEditedName('');
        }
      } catch (error) {
        logger.error('Failed to fetch profile data', { component: 'ProfilePage' }, error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.userId]); // Bug Fix: Only depend on userId to prevent endless re-renders

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === profile?.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setSavingName(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update name');
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, name: editedName } : null);
      setIsEditingName(false);
    } catch (error) {
      logger.error('Failed to update name', { component: 'ProfilePage' }, error as Error);
      alert('Name konnte nicht aktualisiert werden');
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(profile?.name || '');
    setIsEditingName(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Calculate order statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">MEIN PROFIL</h1>
        </div>
        <div className="profile-grid">
          <div className="profile-card skeleton">
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
          <div className="profile-card skeleton">
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">MEIN PROFIL</h1>
        </div>
        <p className="error-message">Profil konnte nicht geladen werden</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Link href="/" className="back-to-shop">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Zurück zum Shop
      </Link>
      <div className="profile-header">
        <h1 className="profile-title">MEIN PROFIL</h1>
        <p className="profile-subtitle">Verwalte deine Informationen und Bestellungen</p>
      </div>

      <div className="profile-grid">
        {/* Left Column: Profile Info */}
        <div className="profile-card">
          <h2 className="card-title">Persönliche Informationen</h2>

          {/* Avatar */}
          <div className="profile-avatar">
            {profile.name ? profile.name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
          </div>

          {/* Name */}
          <div className="profile-field">
            <label>Name</label>
            {isEditingName ? (
              <div className="edit-name-container">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="edit-name-input"
                  autoFocus
                  disabled={savingName}
                />
                <div className="edit-name-actions">
                  <button
                    onClick={handleSaveName}
                    className="btn-save"
                    disabled={savingName}
                  >
                    {savingName ? 'Speichern...' : 'Speichern'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-cancel"
                    disabled={savingName}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-value-editable">
                <span>{profile.name || 'Noch nicht festgelegt'}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="btn-edit"
                  aria-label="Name bearbeiten"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="profile-field">
            <label>E-Mail</label>
            <div className="profile-value">{profile.email}</div>
          </div>

          {/* Member Since */}
          <div className="profile-field">
            <label>Mitglied seit</label>
            <div className="profile-value">{formatDate(profile.createdAt)}</div>
          </div>

          {/* Statistics */}
          <div className="profile-stats">
            <div className="stat-card stat-card--green">
              <div className="stat-value">{totalOrders}</div>
              <div className="stat-label">Bestellungen</div>
            </div>
            <div className="stat-card stat-card--orange">
              <div className="stat-value">€{totalSpent.toFixed(2)}</div>
              <div className="stat-label">Gesamt</div>
            </div>
            <div className="stat-card stat-card--blue">
              <div className="stat-value">€{averageOrder.toFixed(2)}</div>
              <div className="stat-label">Durchschnitt</div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="profile-card profile-card--links">
          <h2 className="card-title">Schnellzugriff</h2>

          <div className="quick-links">
            <Link href="/orders" className="quick-link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <div>
                <h3>Bestellungen</h3>
                <p>Verwalte und verfolge deine Bestellungen</p>
              </div>
            </Link>

            <Link href="/wishlist" className="quick-link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <div>
                <h3>Favoriten</h3>
                <p>Sehe deine gespeicherten Lieblingsprodukte</p>
              </div>
            </Link>

            <button onClick={handleLogout} className="quick-link quick-link--logout">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <div>
                <h3>Abmelden</h3>
                <p>Von deinem Konto abmelden</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
