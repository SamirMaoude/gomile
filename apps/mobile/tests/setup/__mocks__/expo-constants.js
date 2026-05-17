// Stub for expo-constants used in all API clients to resolve the base URL.
// The test suite overrides via EXPO_PUBLIC_API_BASE_URL env var, so expoConfig
// is a safe fallback that is never actually used during test runs.
const Constants = {
  expoConfig: {
    extra: {
      apiBaseUrl: 'http://localhost:3000',
    },
  },
};

module.exports = Constants;
module.exports.default = Constants;
