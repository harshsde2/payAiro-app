import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

/**
 * Full-screen loader shown during cold-launch session hydration, AFTER the boot-splash
 * animation ends but BEFORE `getInitialData()` resolves. It keeps the UI covered so the
 * Auth stack (which mounts while Redux `isLogin` is still false) never flashes before the
 * authenticated app is ready. Purely presentational.
 */
const BRAND_GREEN = "#2C6A3F";

const BootHydrationOverlay: React.FC = () => (
  <View style={styles.overlay} pointerEvents="auto">
    <ActivityIndicator size="large" color={BRAND_GREEN} />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9997, // just below AppGateOverlay (9998) / boot splash
  },
});

export default BootHydrationOverlay;
