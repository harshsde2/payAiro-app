module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
  resolver: {
    extraNodeModules: {
      '@tsx-components': './src/tsx-components',
    },
  },
};
