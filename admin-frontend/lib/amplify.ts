// ============================================================================
// 🔧 AWS AMPLIFY CONFIGURATION - ADMIN FRONTEND
// ============================================================================
//
// Was macht diese Datei?
// - Konfiguriert Amplify Auth für Cognito (gleicher User Pool wie Customer Frontend)
// - Muss EINMAL am Anfang der App aufgerufen werden
// - Verbindet Admin Frontend mit AWS Cognito User Pool
//
// Wo wird das aufgerufen?
// - In app/layout.tsx (Root Layout)
// - Vor allen anderen Komponenten
//
// WICHTIG: Admin und Customer Frontend teilen sich denselben Cognito User Pool!
// - Unterschied ist nur die Group-Membership ("admin" vs. normale User)
//
// Datum: 11. Dezember 2025
// ============================================================================

import { Amplify } from 'aws-amplify';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { logger } from './logger';

// ============================================================================
// AMPLIFY KONFIGURATION
// ============================================================================

/**
 * Konfiguriert AWS Amplify mit Cognito Settings
 *
 * WICHTIG: Diese Funktion muss VOR der Nutzung von Auth aufgerufen werden!
 * Am besten in layout.tsx oder _app.tsx
 */
export function configureAmplify() {
  // Prüfe ob alle Environment Variables gesetzt sind
  const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1';

  // Wenn Cognito nicht konfiguriert → Warnung aber kein Crash
  // Das erlaubt Development ohne Cognito
  if (!userPoolId || !userPoolClientId) {
    logger.warn('Cognito not configured - auth features will not work', {
      component: 'amplify',
      frontend: 'admin',
      missingVars: {
        userPoolId: !userPoolId,
        userPoolClientId: !userPoolClientId
      }
    });
    logger.warn('Set NEXT_PUBLIC_USER_POOL_ID and NEXT_PUBLIC_USER_POOL_CLIENT_ID in .env.local', {
      component: 'amplify',
      frontend: 'admin'
    });
    return;
  }

  // Amplify konfigurieren
  Amplify.configure({
    Auth: {
      Cognito: {
        // ----------------------------------------------------------------
        // User Pool Configuration
        // ----------------------------------------------------------------
        // Das ist dein Cognito User Pool aus Terraform
        // WICHTIG: Gleicher Pool wie Customer Frontend!
        userPoolId,                   // z.B. "eu-central-1_AbCdEfG"
        userPoolClientId,             // z.B. "1a2b3c4d5e..."

        // ----------------------------------------------------------------
        // Login Flow
        // ----------------------------------------------------------------
        // Welche Login-Methoden sind erlaubt?
        loginWith: {
          email: true,                // Login mit Email (Standard)
          username: false,            // Kein separater Username
          phone: false,               // Kein Phone Login
        },

        // ----------------------------------------------------------------
        // Sign Up Configuration
        // ----------------------------------------------------------------
        signUpVerificationMethod: 'code',  // Email mit Code (Standard)

        // ----------------------------------------------------------------
        // User Attributes
        // ----------------------------------------------------------------
        // Welche User-Daten werden bei Sign Up abgefragt?
        userAttributes: {
          email: {
            required: true,           // Email ist Pflicht
          },
        },

        // ----------------------------------------------------------------
        // Password Policy
        // ----------------------------------------------------------------
        // Muss gleich sein wie in Cognito User Pool!
        passwordFormat: {
          minLength: 8,               // Minimum 8 Zeichen
          requireLowercase: true,     // Kleinbuchstaben Pflicht
          requireUppercase: true,     // Großbuchstaben Pflicht
          requireNumbers: true,       // Zahlen Pflicht
          requireSpecialCharacters: false,  // Symbole optional
        },
      }
    }
  }, {
    // ----------------------------------------------------------------
    // SSR Configuration (Next.js specific)
    // ----------------------------------------------------------------
    ssr: true
  });

  // ----------------------------------------------------------------
  // Token Storage Configuration
  // ----------------------------------------------------------------
  // LocalStorage ist der Default und funktioniert perfekt für Single-Origin Apps
  // CookieStorage ist nur nötig für Cross-Domain Cookie Sharing (z.B. Custom Domains)
  //
  // Da Admin und Customer auf unterschiedlichen Amplify Subdomains laufen,
  // ist Cookie Sharing nicht möglich und auch nicht nötig.
  //
  // LocalStorage Vorteile:
  // - Keine ENV Var Dependencies
  // - Funktioniert out-of-the-box auf Amplify
  // - Keine Cross-Origin Probleme
  // - 100% Reproduzierbar
  //
  // Optional: CookieStorage kann später für Custom Domains aktiviert werden
  // wenn Cross-Domain Cookie Sharing benötigt wird
  logger.info('Using Amplify default storage (LocalStorage) for token persistence', {
    component: 'amplify',
    frontend: 'admin',
    note: 'LocalStorage is secure and works perfectly for Single-Origin Apps'
  });

  logger.info('Amplify Auth configured for Admin Frontend', {
    userPoolId,
    region,
    environment: process.env.NODE_ENV,
    component: 'amplify',
    frontend: 'admin'
  });
}

// ============================================================================
// AUTO-CONFIGURATION
// ============================================================================

// Konfiguriere Amplify automatisch beim Import dieser Datei
configureAmplify();

// ============================================================================
// EXPORTS
// ============================================================================

export { Amplify };

// Wiederexportiere Auth Functions
export {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  fetchUserAttributes
} from 'aws-amplify/auth';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Prüft ob User eingeloggt ist
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { getCurrentUser } = await import('aws-amplify/auth');
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Holt aktuellen Auth Token (für API Calls)
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    logger.error('Error getting auth token', {
      component: 'amplify',
      frontend: 'admin'
    }, error as Error);
    return null;
  }
}

/**
 * Holt User-Informationen inkl. Groups
 */
export async function getUserInfo() {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;

    if (!idToken) return null;

    // Token Claims enthalten User-Info + Groups
    return {
      userId: idToken.payload.sub as string,
      email: idToken.payload.email as string,
      groups: (idToken.payload['cognito:groups'] as string[]) || [],
      isAdmin: ((idToken.payload['cognito:groups'] as string[]) || []).includes('admin'),
      emailVerified: idToken.payload.email_verified as boolean,
    };
  } catch (error) {
    logger.error('Error getting user info', {
      component: 'amplify',
      frontend: 'admin'
    }, error as Error);
    return null;
  }
}
