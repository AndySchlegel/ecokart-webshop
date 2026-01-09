// ============================================================================
// 🔍 VALIDATION UTILITIES
// ============================================================================
// Zentrale Validierungs-Funktionen für das Backend
// ============================================================================

/**
 * Validiert eine deutsche Postleitzahl (5-stellig, nur Zahlen)
 *
 * @param zipCode - Die zu validierende Postleitzahl
 * @returns true wenn gültig, false wenn ungültig
 *
 * Erlaubte Formate:
 * - Genau 5 Ziffern (z.B. "12345")
 * - Test-PLZ für Demo: "99999", "12345"
 *
 * Beispiele:
 * - ✅ "10115" (Berlin)
 * - ✅ "80331" (München)
 * - ✅ "99999" (Test-PLZ)
 * - ❌ "1234" (zu kurz)
 * - ❌ "123456" (zu lang)
 * - ❌ "1234a" (Buchstaben nicht erlaubt)
 */
export function isValidGermanZipCode(zipCode: string): boolean {
  // PLZ muss genau 5 Ziffern sein
  const zipCodeRegex = /^[0-9]{5}$/;
  return zipCodeRegex.test(zipCode);
}

/**
 * Prüft ob eine PLZ eine Test-PLZ ist (für Demo-Zwecke)
 *
 * Test-PLZ Liste:
 * - 99999: Allgemeine Test-PLZ
 * - 12345: Test-PLZ (Stripe Beispiel)
 */
export function isTestZipCode(zipCode: string): boolean {
  const testZipCodes = ['99999', '12345'];
  return testZipCodes.includes(zipCode);
}

/**
 * Validiert eine Shipping Address komplett
 *
 * @param address - Die zu validierende Adresse
 * @returns Validation Ergebnis mit success flag und error message
 */
export interface ShippingAddressValidationResult {
  success: boolean;
  error?: string;
  field?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export function validateShippingAddress(address: ShippingAddress): ShippingAddressValidationResult {
  // Prüfe auf leere Felder
  if (!address.street || address.street.trim() === '') {
    return {
      success: false,
      error: 'Straße und Hausnummer sind erforderlich',
      field: 'street'
    };
  }

  if (!address.city || address.city.trim() === '') {
    return {
      success: false,
      error: 'Stadt ist erforderlich',
      field: 'city'
    };
  }

  if (!address.zipCode || address.zipCode.trim() === '') {
    return {
      success: false,
      error: 'Postleitzahl ist erforderlich',
      field: 'zipCode'
    };
  }

  if (!address.country || address.country.trim() === '') {
    return {
      success: false,
      error: 'Land ist erforderlich',
      field: 'country'
    };
  }

  // Validiere PLZ Format
  if (!isValidGermanZipCode(address.zipCode)) {
    return {
      success: false,
      error: 'Postleitzahl muss genau 5 Ziffern haben',
      field: 'zipCode'
    };
  }

  // Alles OK
  return {
    success: true
  };
}
