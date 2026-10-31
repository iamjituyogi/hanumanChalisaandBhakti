/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () => {
  const data = new Map();
  const storage = {
    getItem: jest.fn(async k => (data.has(k) ? data.get(k) : null)),
    setItem: jest.fn(async (k, v) => { data.set(k, v); }),
    removeItem: jest.fn(async k => { data.delete(k); }),
    clear: jest.fn(async () => data.clear()),
  };
  return { __esModule: true, default: storage, createAsyncStorage: () => storage };
});

jest.mock('react-native-video', () => {
  const React = require('react');
  const Video = React.forwardRef((_props, _ref) => null);
  return { __esModule: true, default: Video };
});

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// Run Animated on the JS thread in tests; the native animated module is not available.
jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => {
  const actual = jest.requireActual('react-native/src/private/animated/NativeAnimatedHelper');
  return { __esModule: true, ...actual, default: { ...actual.default, shouldUseNativeDriver: () => false } };
});

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: { getVersion: () => '1.0', getBuildNumber: () => '1' },
}));

// No Firebase app in tests, so the update check is skipped and the app opens normally.
jest.mock('@react-native-firebase/app', () => ({ getApp: jest.fn(), getApps: () => [] }));
jest.mock('@react-native-firebase/database', () => ({
  get: jest.fn(),
  getDatabase: jest.fn(),
  onValue: jest.fn(),
  ref: jest.fn(),
}));
