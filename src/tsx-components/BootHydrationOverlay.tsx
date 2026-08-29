import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@new-ui/styles/ThemeContext";

/**
 * Full-screen loader shown during cold-launch session hydration, AFTER the boot-splash
 * animation ends but BEFORE `getInitialData()` resolves. It keeps the UI covered so the
 * Auth stack (which mounts while Redux `isLogin` is still false) never flashes before the
 * authenticated app is ready. Purely presentational.
 */
const BootHydrationOverlay: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View
      style={[styles.overlay, { backgroundColor: theme.colors.background }]}
      pointerEvents="auto"
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9997, // just below AppGateOverlay (9998) / boot splash
  },
});

export default BootHydrationOverlay;
