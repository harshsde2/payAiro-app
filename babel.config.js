module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@tsx-components': './src/tsx-components',
          '@new-ui': './src/new-ui'
        }
      }
    ],
    // react-native-worklets/plugin MUST be listed last
   'react-native-reanimated/plugin',
  ],
};
