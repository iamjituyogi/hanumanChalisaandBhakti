module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: { '\\.(mp3|wav|m4a|mp4)$': '<rootDir>/__mocks__/fileMock.js' },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-device-wallpaper-manager)/)',
  ],
};
