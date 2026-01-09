// ============================================================================
// 🧪 VALIDATION TESTS
// ============================================================================

import {
  isValidGermanZipCode,
  isTestZipCode,
  validateShippingAddress
} from '../validation';

describe('Validation Utils', () => {
  describe('isValidGermanZipCode', () => {
    it('should accept valid 5-digit zip codes', () => {
      expect(isValidGermanZipCode('10115')).toBe(true); // Berlin
      expect(isValidGermanZipCode('80331')).toBe(true); // München
      expect(isValidGermanZipCode('20095')).toBe(true); // Hamburg
      expect(isValidGermanZipCode('01067')).toBe(true); // Dresden (mit leading zero)
    });

    it('should accept test zip codes', () => {
      expect(isValidGermanZipCode('99999')).toBe(true); // Test-PLZ
      expect(isValidGermanZipCode('12345')).toBe(true); // Test-PLZ
    });

    it('should reject zip codes with wrong length', () => {
      expect(isValidGermanZipCode('1234')).toBe(false); // zu kurz
      expect(isValidGermanZipCode('123456')).toBe(false); // zu lang
      expect(isValidGermanZipCode('123')).toBe(false); // viel zu kurz
    });

    it('should reject zip codes with letters', () => {
      expect(isValidGermanZipCode('1234a')).toBe(false);
      expect(isValidGermanZipCode('A2345')).toBe(false);
      expect(isValidGermanZipCode('12a45')).toBe(false);
    });

    it('should reject zip codes with special characters', () => {
      expect(isValidGermanZipCode('12-345')).toBe(false);
      expect(isValidGermanZipCode('12 345')).toBe(false);
      expect(isValidGermanZipCode('12.345')).toBe(false);
    });

    it('should reject empty or whitespace', () => {
      expect(isValidGermanZipCode('')).toBe(false);
      expect(isValidGermanZipCode('   ')).toBe(false);
    });
  });

  describe('isTestZipCode', () => {
    it('should recognize test zip codes', () => {
      expect(isTestZipCode('99999')).toBe(true);
      expect(isTestZipCode('12345')).toBe(true);
    });

    it('should reject non-test zip codes', () => {
      expect(isTestZipCode('10115')).toBe(false); // Echte PLZ
      expect(isTestZipCode('00000')).toBe(false); // Nicht in Test-Liste
    });
  });

  describe('validateShippingAddress', () => {
    const validAddress = {
      street: 'Musterstraße 123',
      city: 'Berlin',
      zipCode: '10115',
      country: 'Deutschland'
    };

    it('should accept valid shipping address', () => {
      const result = validateShippingAddress(validAddress);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.field).toBeUndefined();
    });

    it('should accept test zip codes', () => {
      const testAddress = { ...validAddress, zipCode: '99999' };
      const result = validateShippingAddress(testAddress);
      expect(result.success).toBe(true);
    });

    it('should reject missing street', () => {
      const invalidAddress = { ...validAddress, street: '' };
      const result = validateShippingAddress(invalidAddress);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Straße');
      expect(result.field).toBe('street');
    });

    it('should reject missing city', () => {
      const invalidAddress = { ...validAddress, city: '' };
      const result = validateShippingAddress(invalidAddress);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Stadt');
      expect(result.field).toBe('city');
    });

    it('should reject missing zipCode', () => {
      const invalidAddress = { ...validAddress, zipCode: '' };
      const result = validateShippingAddress(invalidAddress);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Postleitzahl');
      expect(result.field).toBe('zipCode');
    });

    it('should reject missing country', () => {
      const invalidAddress = { ...validAddress, country: '' };
      const result = validateShippingAddress(invalidAddress);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Land');
      expect(result.field).toBe('country');
    });

    it('should reject invalid zipCode format', () => {
      const invalidAddress = { ...validAddress, zipCode: '1234' }; // zu kurz
      const result = validateShippingAddress(invalidAddress);
      expect(result.success).toBe(false);
      expect(result.error).toContain('5 Ziffern');
      expect(result.field).toBe('zipCode');
    });

    it('should reject zipCode with letters', () => {
      const invalidAddress = { ...validAddress, zipCode: '1234a' };
      const result = validateShippingAddress(invalidAddress);
      expect(result.success).toBe(false);
      expect(result.error).toContain('5 Ziffern');
      expect(result.field).toBe('zipCode');
    });

    it('should reject whitespace-only fields', () => {
      const invalidAddress = { ...validAddress, street: '   ' };
      const result = validateShippingAddress(invalidAddress);
      expect(result.success).toBe(false);
      expect(result.field).toBe('street');
    });
  });
});
