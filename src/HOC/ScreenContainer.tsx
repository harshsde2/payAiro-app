import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../styles/ThemeContext";
// import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  avoidKeyboard?: boolean;
  safeArea?: boolean;
  statusBarColor?: string;
  statusBarStyle?: "light-content" | "dark-content";
  padding?: boolean | number;
  paddingHorizontal?: boolean | number;
  paddingVertical?: boolean | number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

/**
 * A higher-order component that wraps children with common layout functionality
 * like SafeAreaView, padding, scrolling, keyboard avoiding, etc.
 */
const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  avoidKeyboard = false,
  safeArea = true,
  statusBarColor,
  statusBarStyle,
  padding = true,
  paddingHorizontal,
  paddingVertical,
  style,
  contentContainerStyle,
  backgroundColor,
}) => {
  const { theme } = useTheme();

  // Set up status bar style based on theme
  const barStyle =
    statusBarStyle ||
    (theme.mode === "dark" ? "light-content" : "dark-content");
  const barColor = statusBarColor || theme.colors.background.primary;

  // Determine padding values
  const screenPadding = theme.spacing.layout.screenPadding;
  const paddingStyle: ViewStyle = {};

  if (padding === true) {
    paddingStyle.padding = screenPadding;
  } else if (typeof padding === "number") {
    paddingStyle.padding = padding;
  }

  if (paddingHorizontal === true) {
    paddingStyle.paddingHorizontal = screenPadding;
  } else if (typeof paddingHorizontal === "number") {
    paddingStyle.paddingHorizontal = paddingHorizontal;
  }

  if (paddingVertical === true) {
    paddingStyle.paddingVertical = screenPadding;
  } else if (typeof paddingVertical === "number") {
    paddingStyle.paddingVertical = paddingVertical;
  }

  // Main container style - use green50 as default background
  const containerStyle = [
    styles.container,
    { backgroundColor: backgroundColor || theme.colors.background.primary },
    paddingStyle,
    style,
  ];

  // Content to render
  const content = (
    <View style={[styles.contentContainer, contentContainerStyle]}>
      {children}
    </View>
  );

  // Add scroll functionality if enabled
  const scrollContent = scrollable ? (
    <ScrollView
      nestedScrollEnabled
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  // Add keyboard avoiding if enabled
  const keyboardContent = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      {scrollContent}
    </KeyboardAvoidingView>
  ) : (
    scrollContent
  );

  // Add safe area if enabled
  return (
    <>
      <StatusBar backgroundColor={barColor} barStyle={barStyle} />
      {safeArea ? (
        <SafeAreaView style={containerStyle}>{keyboardContent}</SafeAreaView>
      ) : (
        <View style={containerStyle}>{keyboardContent}</View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
  },
});

export default ScreenContainer;
