'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './wishlist.css';

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      // Optional: Show success toast or message
    } catch (error: any) {
      alert(error.message || 'Produkt konnte nicht hinzugefügt werden');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">MEINE FAVORITEN</h1>
          <p className="wishlist-subtitle">Lade deine Favoriten...</p>
        </div>
        <div className="wishlist-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="wishlist-card skeleton">
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
      <div className="wishlist-header">
        <h1 className="wishlist-title">MEINE FAVORITEN</h1>
        <p className="wishlist-subtitle">{wishlistItems.length} {wishlistItems.length === 1 ? 'Produkt' : 'Produkte'}</p>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map((product) => {
          const availableStock = product.stock !== undefined
            ? product.stock - (product.reserved || 0)
            : null;
          const isOutOfStock = availableStock !== null && availableStock <= 0;
          const isLowStock = availableStock !== null && availableStock > 0 && availableStock <= 5;

          return (
            <div key={product.id} className="wishlist-card">
              <button
                className="remove-btn"
                onClick={() => handleRemove(product.id)}
                aria-label="Aus Favoriten entfernen"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <Link href={`/product/${product.id}`} className="wishlist-card__link">
                <div className="wishlist-card__image">
                  <Image
                    alt={`Produktbild von ${product.name}`}
                    src={product.imageUrl}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </Link>

              <div className="wishlist-card__content">
                <Link href={`/product/${product.id}`}>
                  <h3 className="wishlist-card__name">{product.name}</h3>
                </Link>

                {product.description && (
                  <p className="wishlist-card__description">
                    {product.description.length > 80
                      ? `${product.description.substring(0, 80)}...`
                      : product.description}
                  </p>
                )}

                {/* Stock Display */}
                {availableStock !== null && (
                  <div className="wishlist-card__stock">
                    {isOutOfStock ? (
                      <span className="stock-badge out-of-stock">❌ Ausverkauft</span>
                    ) : isLowStock ? (
                      <span className="stock-badge low-stock">⚠️ Nur noch {availableStock} auf Lager</span>
                    ) : (
                      <span className="stock-badge in-stock">✅ {availableStock} auf Lager</span>
                    )}
                  </div>
                )}

                <div className="wishlist-card__footer">
                  {/* Sale Price Display */}
                  {product.originalPrice ? (
                    <div className="price-container">
                      <span className="price-original">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                      <span className="price-sale">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="price">
                      €{product.price.toFixed(2)}
                    </span>
                  )}

                  <button
                    className="btn-add-to-cart"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={isOutOfStock}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    {isOutOfStock ? 'Ausverkauft' : 'In den Warenkorb'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
