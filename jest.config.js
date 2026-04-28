module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/src/__mocks__/react19ActPatch.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|zustand)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo/src/winter$': '<rootDir>/src/__mocks__/emptyMock.js',
    '^expo/src/winter/runtime(\\.native)?$': '<rootDir>/src/__mocks__/emptyMock.js',
    '^react-native/src/private/animated/NativeAnimatedHelper$': '<rootDir>/src/__mocks__/NativeAnimatedHelper.js',
    '(.*)react-native/Libraries/Animated/AnimatedExports(.*)': 'react-native/Libraries/Animated/AnimatedMock',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/navigation/**',
    '!src/screens/**',
    '!src/components/**',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
