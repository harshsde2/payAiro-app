const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
    extraNodeModules: {
      "@tsx-components": path.resolve(__dirname, "src/tsx-components"),
    },
  },
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
};

module.exports = wrapWithReanimatedMetroConfig(
  mergeConfig(defaultConfig, customConfig)
);
