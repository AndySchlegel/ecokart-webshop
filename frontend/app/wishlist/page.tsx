'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArticleCard } from '../components/ArticleCard';
import './wishlist.css';

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user?.userId, router]); // Bug Fix: Only depend on userId to prevent endless re-renders

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="wishlist-container">
        <Link href="/profile" className="back-to-shop">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zurück zum Profil
        </Link>
        <div className="wishlist-header">
          <h1 className="wishlist-title">MEINE FAVORITEN</h1>
          <p className="wishlist-subtitle">Lade deine Favoriten...</p>
        </div>
        <div className="card-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-container">
        <Link href="/profile" className="back-to-shop">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zurück zum Profil
        </Link>
        <div className="wishlist-header">
          <h1 className="wishlist-title">MEINE FAVORITEN</h1>
        </div>
        <div className="wishlist-empty">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2>Noch keine Favoriten</h2>
          <p>Füge Produkte zu deinen Favoriten hinzu, indem du auf das Herz-Symbol klickst.</p>
          <Link href="/" className="btn-primary">
            Jetzt Shoppen
          </Link>
        </div>
      </div>
    );
  }

  // Wishlist grid
  return (
    <div className="wishlist-container">
      <Link href="/profile" className="back-to-shop">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Zurück zum Profil
      </Link>
      <div className="wishlist-header">
        <h1 className="wishlist-title">MEINE FAVORITEN</h1>
        <p className="wishlist-subtitle">{wishlistItems.length} {wishlistItems.length === 1 ? 'Produkt' : 'Produkte'}</p>
      </div>

      <div className="card-grid">
        {wishlistItems.map((product) => (
          <ArticleCard
            key={product.id}
            article={product}
            showRemoveButton={true}
            onRemove={() => handleRemove(product.id)}
            showRating={false}
            buttonText="+ Warenkorb"
            maxDescriptionLength={80}
          />
        ))}
      </div>
    </div>
  );
}
