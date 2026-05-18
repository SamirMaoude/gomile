// Global test setup for the GoMile mobile app.
// This file runs once before each test file (via setupFiles in jest config).
// It stubs all native modules and external dependencies that cannot run in
// a Node/Jest environment, and resets shared mutable state between tests.

// ── Expo winter runtime polyfill stubs ───────────────────────────────────────
// expo/src/winter/runtime.native.ts installs lazy getters for several globals
// (TextDecoder, URL, structuredClone, __ExpoImportMetaRegistry, etc.) via
// expo/src/winter/installGlobal.ts. Each lazy getter, when first accessed, calls
// require('./SomeModule') where SomeModule lives in the monorepo root node_modules.
// In a pnpm workspace the monorepo root is outside apps/mobile (rootDir), so
// Jest 30's runtime refuses to execute those files.
//
// Fix: override each lazy getter with a direct value (using the Node.js built-in
// or a safe fallback) BEFORE any test code triggers the getter. Since the getters
// are installed with configurable:true, Object.defineProperty can replace them.
// After our override, accessing the global returns a value immediately — no require.

const winterStubs = [
  // Expo bundler import.meta registry — not needed in Jest.
  ['__ExpoImportMetaRegistry', { registry: {}, get: () => null, register: () => {} }],
  // structuredClone — use Node.js built-in (v17+) or JSON round-trip fallback.
  ['structuredClone', global.structuredClone ?? ((v) => JSON.parse(JSON.stringify(v)))],
  // TextDecoder — Node.js built-in since v11.
  ['TextDecoder', global.TextDecoder],
  // TextDecoderStream — Node.js built-in since v18, stub for older versions.
  ['TextDecoderStream', global.TextDecoderStream ?? class TextDecoderStream {}],
  // TextEncoderStream — Node.js built-in since v18, stub for older versions.
  ['TextEncoderStream', global.TextEncoderStream ?? class TextEncoderStream {}],
  // URL — Node.js built-in since v7.
  ['URL', global.URL],
  // URLSearchParams — Node.js built-in since v7.
  ['URLSearchParams', global.URLSearchParams],
];

for (const [name, value] of winterStubs) {
  Object.defineProperty(global, name, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

// All API clients resolve the base URL from this env var.
// Set it before any module is imported so the value is stable.
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000';

// Provides a no-op fetch that individual tests override per-case.
global.fetch = jest.fn();

// ── Expo modules ──────────────────────────────────────────────────────────────

// expo-file-system: prevents real disk I/O in tests.
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
}));

// expo-file-system/legacy: used by upload-client for binary S3 uploads.
jest.mock('expo-file-system/legacy', () => ({
  uploadAsync: jest.fn().mockResolvedValue({ status: 200 }),
  FileSystemUploadType: { BINARY_CONTENT: 0 },
}));

// expo-image-picker: prevents camera/gallery dialogs from opening.
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  MediaTypeOptions: { Images: 'Images', All: 'All' },
}));

// expo-location: prevents GPS permission prompts and hardware access.
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 45.1885, longitude: 5.7245 },
  }),
  watchPositionAsync: jest.fn().mockReturnValue({ remove: jest.fn() }),
  Accuracy: { Balanced: 3, High: 4 },
}));

// expo-notifications: prevents real push token registration and channel setup.
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExpoToken[test-token]' }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  AndroidImportance: { MAX: 5 },
}));

// ── Third-party native modules ────────────────────────────────────────────────

// react-native-safe-area-context: avoids native SafeArea layout calculation.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

// react-native-maps: prevents native map SDK initialisation.
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MapView = (props) => React.createElement(View, props);
  MapView.Marker = (props) => React.createElement(View, props);
  MapView.Polyline = (props) => React.createElement(View, props);
  return { __esModule: true, default: MapView, PROVIDER_GOOGLE: 'google' };
});

// socket.io-client: prevents real WebSocket connections during unit tests.
jest.mock('socket.io-client', () => {
  const socket = {
    connected: false,
    id: 'test-socket-id',
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  return { io: jest.fn(() => socket) };
});

// @expo/vector-icons: replaces icon fonts with plain strings to avoid font loading.
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Ionicons: 'Ionicons',
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
}));

// @react-navigation/native-stack: avoids native stack module requirement.
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  })),
}));

// @react-navigation/bottom-tabs: avoids native tab bar module requirement.
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  })),
}));

// @react-navigation/native: fully stubbed to avoid loading the real package which
// transitively imports expo and triggers the winter runtime initialization.
// Only the hooks and helpers actually used in the app are mocked here.
jest.mock('@react-navigation/native', () => ({
  useIsFocused: jest.fn(() => true),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    getParent: jest.fn(() => null),
  })),
  createNavigationContainerRef: jest.fn(() => ({
    isReady: jest.fn(() => false),
    navigate: jest.fn(),
  })),
  NavigationContainer: ({ children }) => children,
  useRoute: jest.fn(() => ({ params: {} })),
}));

// src/navigation/navigationRef: used by driver-client for EMAIL_NOT_VERIFIED redirect.
jest.mock('../../src/navigation/navigationRef', () => ({
  navigationRef: {
    isReady: jest.fn(() => false),
    navigate: jest.fn(),
  },
}));

// src/lib/push-notifications: prevents real push notification dispatch in hook tests.
jest.mock('../../src/lib/push-notifications', () => ({
  notifyNewMissions: jest.fn(),
  registerDriverPushToken: jest.fn(),
}));

// ── React Native TurboModule proxy ───────────────────────────────────────────
// React Native 0.81+ resolves native modules at import time through
// TurboModuleRegistry. In tests no native binary is present, so getEnforcing()
// throws unless modules are registered in global.__turboModuleProxy.
// This proxy is captured once at module-load time by TurboModuleRegistry.js
// (const turboModuleProxy = global.__turboModuleProxy), so we set it here in
// setupFiles — before any test file can import React Native components.
//
// We use a Proxy stub that returns a safe generic mock for ANY module name
// rather than listing each module individually. Every method call is a
// jest.fn(), and getConstants() returns the known constant shapes that
// React Native reads at init time (Platform, SourceCode, FeatureFlags, etc.).

// KNOWN_CONSTANTS maps TurboModule name → the object returned by getConstants().
// These must match the exact shape that React Native internals consume so that
// modules like Dimensions, Platform, and PixelRatio initialize without crashing.
const KNOWN_CONSTANTS = {
  // Consumed by Platform.ios.js → NativePlatformConstantsIOS
  PlatformConstants: {
    isTesting: true,
    reactNativeVersion: { major: 0, minor: 81, patch: 5 },
    osVersion: '17.0',
    systemName: 'iOS',
    interfaceIdiom: 'phone',
    forceTouchAvailable: false,
    hapticFeedbackSupported: false,
  },
  // Consumed by Dimensions.js → NativeDeviceInfo.getConstants().Dimensions
  DeviceInfo: {
    Dimensions: {
      window: { fontScale: 2, height: 812, scale: 2, width: 390 },
      screen: { fontScale: 2, height: 812, scale: 2, width: 390 },
    },
  },
  // Consumed by resolveAssetSource.js → NativeSourceCode
  SourceCode: { scriptURL: null },
  // Consumed by ReactNativeFeatureFlagsBase.js
  NativeReactNativeFeatureFlags: {},
  // Consumed by I18nManager
  I18nManager: { isRTL: false, doLeftAndRightSwapInRTL: true, localeIdentifier: 'en_US' },
  // Consumed by StatusBar
  StatusBarManager: { HEIGHT: 44, DEFAULT_BACKGROUND_COLOR: 0 },
  // Consumed by KeyboardAvoidingView / Keyboard
  KeyboardObserver: {},
  // Consumed by Alert on iOS
  AlertManager: {},
  // Consumed by AccessibilityInfo
  AccessibilityManager: { reduceMotionEnabled: false, grayscaleEnabled: false },
};

function makeTurboModuleStub(name) {
  return new Proxy(
    { getConstants: () => KNOWN_CONSTANTS[name] ?? {} },
    {
      get(target, prop) {
        if (prop === 'getConstants') return target.getConstants;
        if (typeof prop === 'string' && !['then', 'catch', 'finally'].includes(prop)) {
          return jest.fn();
        }
        return undefined;
      },
    }
  );
}

global.__turboModuleProxy = (name) => makeTurboModuleStub(name);

// Legacy bridge config — some code paths still check for this even with new arch.
global.__fbBatchedBridgeConfig = { remoteModuleConfig: [], localModulesConfig: [] };
global.__fbBatchedBridge = {
  callFunctionReturnFlushedQueue: jest.fn(() => [[], [], []]),
  callFunctionReturnResultAndFlushedQueue: jest.fn(() => [null, [[], [], []]]),
  flushedQueue: jest.fn(() => [[], [], []]),
  invokeCallbackAndReturnFlushedQueue: jest.fn(() => [[], [], []]),
};
