'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ModalProvider } from '../contexts/ModalContext';

// Import Amplify configuration - this initializes Amplify Auth
import '../lib/amplify';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ModalProvider>
  );
}
