'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../lib/config';
import { fetchAuthSession } from 'aws-amplify/auth';
import { logger } from '@/lib/logger';

// ============================================================================
// 🔧 HELPER FUNCTIONS
// ============================================================================

/**
 * Holt Cognito Authentication Token aus der aktuellen Session
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    logger.error('Failed to get auth token', { component: 'WishlistContext' }, error as Error);
    return null;
  }
}

/**
 * 🇩🇪 Übersetzt Backend-Errors in user-friendly deutsche Messages
 */
function getGermanErrorMessage(errorMessage: string): string {
  // Authorization Errors
  if (errorMessage.toLowerCase().includes('unauthorized')) {
    return 'Bitte melde dich an um Favoriten zu speichern';
  }

  // Product Not Found
  if (errorMessage.includes('Product not found')) {
    return 'Produkt nicht gefunden';
  }

  // Already in Wishlist
  if (errorMessage.includes('already in wishlist')) {
    return 'Produkt ist bereits in deinen Favoriten';
  }

  // Session Expired (Token expired)
  if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('token')) {
    return 'Deine Session ist abgelaufen - bitte melde dich erneut an';
  }

  // Generic Fallbacks
  if (errorMessage.includes('Failed to add')) {
    return 'Produkt konnte nicht zu Favoriten hinzugefügt werden';
  }

  if (errorMessage.includes('Failed to remove')) {
    return 'Produkt konnte nicht aus Favoriten entfernt werden';
  }

  // Default: Zeige originale Message
  return errorMessage;
}

// ============================================================================
// 🎯 TYPES
// ============================================================================

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category?: string;
  description?: string;
  stock?: number;
  reserved?: number;
}

interface WishlistContextType {
  wishlistItems: Product[];
  wishlistIds: Set<string>;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// 🌍 CONTEXT CREATION
// ============================================================================

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// ============================================================================
// 🎁 PROVIDER COMPONENT
// ============================================================================

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // 📥 FETCH WISHLIST ON USER LOGIN
  // ============================================================================

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      // User logged out → clear wishlist
      setWishlistItems([]);
      setWishlistIds(new Set());
    }
  }, [user]);

  /**
   * Fetch user's wishlist from backend
   */
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch wishlist');
      }

      const data = await response.json();
      const items = data.items || [];

      setWishlistItems(items);
      setWishlistIds(new Set(items.map((item: Product) => item.id)));

    } catch (error: any) {
      logger.error('Failed to fetch wishlist', { component: 'WishlistContext' }, error);
      setError(getGermanErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if product is in wishlist (fast O(1) lookup)
   */
  const isInWishlist = (productId: string): boolean => {
    return wishlistIds.has(productId);
  };

  /**
   * Add product to wishlist
   */
  const addToWishlist = async (productId: string) => {
    try {
      setError(null);

      // Check if user is authenticated
      if (!user) {
        throw new Error('Unauthorized');
      }

      // Optimistic update
      setWishlistIds(prev => new Set([...prev, productId]));

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to wishlist');
      }

      // Refresh wishlist to get full product details
      await fetchWishlist();

    } catch (error: any) {
      logger.error('Failed to add to wishlist', { productId }, error);
      setError(getGermanErrorMessage(error.message));

      // Revert optimistic update on error
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      throw error; // Re-throw for component to handle
    }
  };

  /**
   * Remove product from wishlist
   */
  const removeFromWishlist = async (productId: string) => {
    try {
      setError(null);

      // Check if user is authenticated
      if (!user) {
        throw new Error('Unauthorized');
      }

      // Optimistic update
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      setWishlistItems(prev => prev.filter(item => item.id !== productId));

      const token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from wishlist');
      }

    } catch (error: any) {
      logger.error('Failed to remove from wishlist', { productId }, error);
      setError(getGermanErrorMessage(error.message));

      // Refresh on error to get correct state
      await fetchWishlist();

      throw error; // Re-throw for component to handle
    }
  };

  /**
   * Toggle product in wishlist (smart add/remove)
   */
  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  // ============================================================================
  // 🎁 PROVIDE CONTEXT
  // ============================================================================

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistIds,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        loading,
        error,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// ============================================================================
// 🪝 CUSTOM HOOK
// ============================================================================

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
