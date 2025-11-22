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
      "@components": path.resolve(__dirname, "src/components"),
      "@screens": path.resolve(__dirname, "src/screens"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@navigations": path.resolve(__dirname, "src/navigations"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@api": path.resolve(__dirname, "src/api"),
      "@redux": path.resolve(__dirname, "src/redux"),
      "@query": path.resolve(__dirname, "src/query"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
};

module.exports = wrapWithReanimatedMetroConfig(
  mergeConfig(defaultConfig, customConfig)
);
