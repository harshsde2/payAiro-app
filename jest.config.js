module.exports = {
  preset: 'react-native',
  // `react-native-config` ships untranspiled ESM, so anything that reaches
  // `src/config/env.config.ts` (and therefore `src/api/endpoints.ts`) fails to parse
  // under the default "ignore all of node_modules" rule. Let Babel transform it.
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|react-native-config|toastify-react-native|immer|@reduxjs|react-redux)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
