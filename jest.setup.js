/**
 * Shared Jest setup.
 *
 * These modules read from native code at import time, so anything that transitively
 * imports them (config → endpoints → any API hook) crashes before a single test runs.
 * Mocking them here keeps individual test files free of boilerplate.
 */

// `src/config/env.config.ts` reads Config.* at module scope AND throws when a required
// variable is missing, so the mock has to satisfy that validation, not just exist.
jest.mock('react-native-config', () => {
  const config = {
    API_BASE_URL: 'https://test.local/api/',
    USER_API_BASE_URL: 'https://test.local/user-api/',
    ENV_NAME: 'test',
    ENV_TYPE: 'testing',
    PRIVACY_POLICY_URL: 'https://test.local/privacy',
    TERMS_AND_CONDITIONS_URL: 'https://test.local/terms',
    STATE_DISCLOSURES_URL: 'https://test.local/disclosures',
    APP_NAME: 'payAiroTest',
    APP_DISPLAY_NAME: 'PayAiro Test',
  };
  return { __esModule: true, default: config, Config: config };
});

// `src/query/queryClient.ts` wires onlineManager to NetInfo at module scope.
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { addEventListener: jest.fn(() => jest.fn()), fetch: jest.fn(async () => ({ isConnected: true })) },
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(async () => ({ isConnected: true })),
}));

// Reanimated pulls in native initializers at import time. Redux slices import it only
// for `useAnimatedStyle`, so a thin stub is enough for non-UI tests.
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {},
  useAnimatedStyle: jest.fn(() => ({})),
  useSharedValue: jest.fn((initial) => ({ value: initial })),
  withTiming: jest.fn((v) => v),
  withSpring: jest.fn((v) => v),
  runOnJS: jest.fn((fn) => fn),
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getUniqueId: jest.fn(async () => 'test-device-id'),
    getUniqueIdSync: jest.fn(() => 'test-device-id'),
  },
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key) => store.get(key),
      set: (key, value) => store.set(key, value),
      delete: (key) => store.delete(key),
      getNumber: (key) => store.get(key),
      getBoolean: (key) => store.get(key),
      contains: (key) => store.has(key),
      clearAll: () => store.clear(),
    })),
  };
});
