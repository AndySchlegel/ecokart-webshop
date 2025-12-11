// ============================================================================
// 🔐 ADMIN AUTH CONTEXT - AWS Cognito with Group-Based Access Control
// ============================================================================
//
// WICHTIG: Admin-Zugriff nur für User in Cognito Group "admin"!
// Datum: 11. Dezember 2025
// ============================================================================

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getCurrentUser,
  signOut as amplifySignOut,
  fetchAuthSession,
  signIn,
  fetchUserAttributes
} from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminListGroupsForUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminUser {
  userId: string;         // Cognito User ID
  email: string;          // Email
  groups: string[];       // Cognito Groups (z.B. ["admin"])
  isAdmin: boolean;       // Helper: ist User in "admin" group?
  emailVerified: boolean; // Email bestätigt?
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ----------------------------------------------------------------
  // Helper: Check if user is in "admin" group
  // ----------------------------------------------------------------
  const checkAdminGroup = async (userId: string): Promise<string[]> => {
    try {
      // Get groups from Cognito Token (cognito:groups claim)
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;

      if (!idToken) {
        return [];
      }

      // Groups are in the token payload
      const groups = (idToken.payload['cognito:groups'] as string[]) || [];

      logger.debug('User groups from token', {
        userId,
        groups,
        component: 'AdminAuthContext'
      });

      return groups;
    } catch (error) {
      logger.error('Failed to get user groups', {
        userId,
        component: 'AdminAuthContext'
      }, error as Error);
      return [];
    }
  };

  // ----------------------------------------------------------------
  // Load User von Cognito + Check Admin Group
  // ----------------------------------------------------------------
  const loadUser = async () => {
    try {
      setIsLoading(true);

      // 1. Prüfe ob User eingeloggt ist
      const currentUser = await getCurrentUser();

      // 2. Hole User-Daten aus Token
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;

      if (!idToken) {
        setUser(null);
        return;
      }

      // 3. Check Group Membership
      const groups = await checkAdminGroup(currentUser.userId);
      const isAdmin = groups.includes('admin');

      // 4. User-Info extrahieren
      const userData: AdminUser = {
        userId: idToken.payload.sub as string,
        email: idToken.payload.email as string,
        groups: groups,
        isAdmin: isAdmin,
        emailVerified: idToken.payload.email_verified as boolean,
      };

      // 5. Nur Admin-User erlauben
      if (!isAdmin) {
        logger.warn('User is not in admin group - access denied', {
          email: userData.email,
          userId: userData.userId,
          groups: groups,
          component: 'AdminAuthContext'
        });

        // Sign out user da kein Admin
        await amplifySignOut();
        setUser(null);
        throw new Error('Zugriff verweigert. Nur Administratoren haben Zugang zu diesem Bereich.');
      }

      setUser(userData);
      logger.info('Admin user logged in', {
        email: userData.email,
        userId: userData.userId,
        groups: groups,
        component: 'AdminAuthContext'
      });

    } catch (error) {
      // Nicht eingeloggt oder kein Admin
      setUser(null);

      // Re-throw if it's an access denied error
      if (error instanceof Error && error.message.includes('Zugriff verweigert')) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // Login mit Cognito + Admin Group Check
  // ----------------------------------------------------------------
  const login = async (email: string, password: string) => {
    try {
      logger.debug('Admin login attempt', { email, component: 'AdminAuthContext' });

      // Cognito Sign In
      const { isSignedIn, nextStep } = await signIn({
        username: email, // Bei Cognito ist username = email
        password,
      });

      if (isSignedIn) {
        logger.info('Cognito login successful, checking admin rights', {
          email,
          component: 'AdminAuthContext'
        });

        // User-Daten neu laden (inkl. Admin Group Check)
        await loadUser();

        logger.info('Admin login successful', { email, component: 'AdminAuthContext' });
      } else {
        logger.warn('Login incomplete', { email, nextStep, component: 'AdminAuthContext' });
        throw new Error('Login konnte nicht abgeschlossen werden');
      }
    } catch (error: any) {
      logger.error('Admin login failed', {
        email,
        errorName: error.name,
        errorMessage: error.message,
        component: 'AdminAuthContext'
      }, error);

      // If it's already an access denied error, just throw it
      if (error.message?.includes('Zugriff verweigert')) {
        throw error;
      }

      // Benutzerfreundliche Fehlermeldungen (auf Deutsch)
      if (error.name === 'UserNotFoundException' || error.name === 'NotAuthorizedException') {
        throw new Error('E-Mail oder Passwort falsch');
      } else if (error.name === 'UserNotConfirmedException') {
        throw new Error('Bitte bestätige zuerst deine E-Mail');
      } else {
        throw new Error(error.message || 'Login fehlgeschlagen');
      }
    }
  };

  // ----------------------------------------------------------------
  // Logout
  // ----------------------------------------------------------------
  const handleSignOut = async () => {
    try {
      await amplifySignOut();
      setUser(null);
      logger.info('Admin user signed out', { component: 'AdminAuthContext' });
      router.push('/login');
    } catch (error) {
      logger.error('Sign out failed', { component: 'AdminAuthContext' }, error as Error);
    }
  };

  // ----------------------------------------------------------------
  // Initial Load
  // ----------------------------------------------------------------
  useEffect(() => {
    loadUser().catch((error) => {
      // Silently handle initial load errors
      logger.debug('Initial user load failed (user not logged in)', {
        component: 'AdminAuthContext'
      });
    });
  }, []);

  // ----------------------------------------------------------------
  // Context Value
  // ----------------------------------------------------------------
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    signOut: handleSignOut,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
