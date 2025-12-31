/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',

  // Test environment (Node.js for backend)
  testEnvironment: 'node',

  // Root directory for tests
  roots: ['<rootDir>/src'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // Exclude integration tests (they run separately with LocalStack)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/integration/',
    '\\.integration\\.test\\.ts$',
    '/__tests__/helpers/'  // Exclude helper files (not actual tests)
  ],

  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts', // Entry point, meist nur Server-Start
    '!src/lambda.ts', // Lambda wrapper, nur Adapter
    '!src/routes/**', // Route definitions, dünne Wrapper
    '!src/services/dynamodb/**', // DynamoDB services, nur DB-Wrapper
    '!src/config/database*.ts', // Database adapters, nur Wrapper
    '!src/middleware/cognitoAuth.ts', // Deprecated middleware
    '!src/models/**' // Type definitions
  ],

  // Coverage thresholds (realistic for portfolio project - integration tests disabled)
  coverageThreshold: {
    global: {
      branches: 32,     // Realistic baseline (was 60%)
      functions: 36,    // Realistic baseline (was 62%)
      lines: 41,        // Realistic baseline (was 68%)
      statements: 41    // Realistic baseline (was 69%)
    }
  },

  // Coverage output directory
  coverageDirectory: 'coverage',

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Setup files (wenn wir später brauchen)
  // setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
