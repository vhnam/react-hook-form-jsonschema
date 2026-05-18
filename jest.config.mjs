/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  detectOpenHandles: true,
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        diagnostics: { warnOnly: true },
      },
    ],
  },
  modulePathIgnorePatterns: ['<rootDir>/src/components/__mocks__/'],
}
