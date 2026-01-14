'use client';

import { useState } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  productId: string;
}

export default function FavoriteButton({ productId }: FavoriteButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const isFavorite = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    // Prevent event bubbling to product card
    e.preventDefault();
    e.stopPropagation();

    // If not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);

      // Toggle wishlist
      await toggleWishlist(productId);
    } catch (error) {
      // Error is handled in WishlistContext
      console.error('Failed to toggle wishlist', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`favorite-btn ${isFavorite ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
      aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      <style jsx>{`
        .favorite-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #333;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          color: #999;
        }

        .favorite-btn:hover {
          background: rgba(0, 0, 0, 0.95);
          border-color: var(--accent-orange);
          color: var(--accent-orange);
          transform: scale(1.1);
        }

        .favorite-btn.active {
          background: rgba(255, 107, 0, 0.1);
          border-color: var(--accent-orange);
          color: var(--accent-orange);
        }

        .favorite-btn.active:hover {
          background: rgba(255, 107, 0, 0.2);
          color: #ff8533;
        }

        .favorite-btn.animating {
          animation: heartBeat 0.6s ease;
        }

        .favorite-btn svg {
          width: 20px;
          height: 20px;
          transition: all 0.3s ease;
        }

        @keyframes heartBeat {
          0%, 100% {
            transform: scale(1);
          }
          10%, 30% {
            transform: scale(0.9);
          }
          20%, 40%, 60%, 80% {
            transform: scale(1.1);
          }
          50%, 70% {
            transform: scale(1.05);
          }
        }

        /* Mobile optimization */
        @media (max-width: 768px) {
          .favorite-btn {
            width: 40px;
            height: 40px;
            top: 0.75rem;
            right: 0.75rem;
          }

          .favorite-btn svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </button>
  );
}
