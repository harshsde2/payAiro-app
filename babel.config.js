module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@styles': './src/styles',
          '@navigations': './src/navigations',
          '@assets': './src/assets',
          '@api': './src/api',
          '@redux': './src/redux',
          '@query': './src/query',
          '@utils': './src/utils',
        }
      }
    ]
  ],
};
