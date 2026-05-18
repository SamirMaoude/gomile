// Jest configuration using jest.config.js (not package.json) so we can use
// path.resolve to include the pnpm monorepo root in Jest's execution scope.
// In pnpm workspaces, shared packages (expo, react-native, etc.) are installed
// at the monorepo root node_modules, which is outside apps/mobile (rootDir).
// Jest 30+ refuses to execute files outside rootDir by default, so we must add
// the monorepo root to `roots` to allow expo's own modules to run during tests.

const path = require('path');

const monorepoRoot = path.resolve(__dirname, '../..');

module.exports = {
  preset: 'jest-expo',
  clearMocks: true,

  // Expand execution scope to include the monorepo root where pnpm installs
  // shared packages. Without this, expo/src/winter/* cannot be executed.
  roots: [__dirname, monorepoRoot],

  setupFiles: [
    '<rootDir>/tests/setup/jest.setup.js',
  ],

  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
  ],

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|zustand|socket\\.io-client|socket\\.io-parser|engine\\.io-client)',
  ],

  moduleNameMapper: {
    // Force all imports of react and react-test-renderer to resolve from the
    // monorepo root so that pnpm symlinks don't create two separate module
    // instances in Jest's registry. Multiple instances cause "Invalid hook call"
    // because the renderer's React and the components' React are different objects.
    '^react$': path.resolve(monorepoRoot, 'node_modules/react'),
    '^react/(.*)$': path.resolve(monorepoRoot, 'node_modules/react/$1'),
    '^react-test-renderer$': path.resolve(monorepoRoot, 'node_modules/react-test-renderer'),
    '^react-test-renderer/(.*)$': path.resolve(monorepoRoot, 'node_modules/react-test-renderer/$1'),
    '^expo-constants$': '<rootDir>/tests/setup/__mocks__/expo-constants.js',
  },

  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'lib/**/*.{js,ts}',
    '!**/node_modules/**',
  ],
};
