import React, { ReactNode, useMemo } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
  Dimensions,
  // SafeAreaView,
} from "react-native";
import { useTheme } from "../styles/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { toKycMode } from "../types/kyc";
import { NAVIGATION_SCREENS } from "../navigations/navigationConstants";

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
  
  // Check if KYC banner is visible to determine safe area edges
  const kycStatus = useSelector((s: any) => s.authenticationSlice?.kycStatus);
  const currentRoute = useSelector((s: any) => s.authenticationSlice?.currentRoute);
  const kycMode = useMemo(() => toKycMode(kycStatus), [kycStatus]);
  
  // Banner is visible if KYC is pending/not_started AND not on screens where banner is hidden
  const isBannerVisible = 
    (kycMode === "pending" || kycMode === "not_started") &&
    currentRoute !== NAVIGATION_SCREENS.SETTING_SCREEN &&
    currentRoute !== NAVIGATION_SCREENS.CYBRID_WEB_VIEW;
  
  // Determine safe area edges: exclude top if banner is visible, include it if not
  const safeAreaEdges: ("top" | "bottom" | "left" | "right")[] = isBannerVisible 
    ? ["bottom", "left", "right"] 
    : ["top", "bottom", "left", "right"];

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
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  // Determine keyboard handling strategy based on platform and screen dimensions
  // - iOS: Always use KeyboardAvoidingView with "padding"
  // - Android tall screens (aspect ratio > 1.7): Use KeyboardAvoidingView with "padding"
  //   because adjustResize alone may not push content up enough
  // - Android short/square screens (aspect ratio <= 1.7): Don't use KeyboardAvoidingView
  //   because it causes double-adjustment conflicts that block touches (e.g., 1080x1280)
  const keyboardConfig = useMemo(() => {
    const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
    const aspectRatio = screenHeight / screenWidth;

    if (Platform.OS === "ios") {
      return { enabled: true, behavior: "padding" as const, offset: 0 };
    }

    // For tall Android screens (like 1080x2320, aspect ratio ~2.15)
    // Use KeyboardAvoidingView with "padding" behavior
    if (aspectRatio > 1.7) {
      return { enabled: true, behavior: "padding" as const, offset: 0 };
    }

    // For short/square Android screens (like 1080x1280, aspect ratio ~1.18)
    // Don't use KeyboardAvoidingView - rely on native adjustResize
    return { enabled: false, behavior: "padding" as const, offset: 0 };
  }, []);

  // Add keyboard avoiding if enabled
  const keyboardContent =
    avoidKeyboard && keyboardConfig.enabled ? (
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={keyboardConfig.behavior}
        keyboardVerticalOffset={keyboardConfig.offset}
        enabled={true}
      >
        {scrollContent}
      </KeyboardAvoidingView>
    ) : (
      scrollContent
    );

  // Add safe area if enabled
  // Conditionally exclude top edge: if KYC banner is visible, it handles top safe area
  // If banner is hidden (KYC approved), ScreenContainer should handle top safe area
  return (
    <>
      <StatusBar backgroundColor={barColor} barStyle={barStyle} />
      {safeArea ? (
        <SafeAreaView style={containerStyle} edges={safeAreaEdges}>
          {keyboardContent}
        </SafeAreaView>
      ) : (
        <View style={containerStyle}>
          {keyboardContent}
        </View>
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
