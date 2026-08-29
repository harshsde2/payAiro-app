import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppLock } from "hooks/useAppLock";
import { useTheme } from "@new-ui/styles/ThemeContext";

interface IAppGateOverlayProps {}

/**
 * Blocks the dashboard until lock state is resolved and user has unlocked.
 * Shown from app start when blocking (splash renders on top with higher zIndex).
 * Prevents any flash of dashboard before AppLockScreen appears.
 */
const AppGateOverlay: React.FC<IAppGateOverlayProps> = () => {
  const { isLockCheckComplete, shouldShowLock, isLocked } = useAppLock();
  const { theme } = useTheme();

  const shouldBlock =
    !isLockCheckComplete || (shouldShowLock && isLocked);

  if (!shouldBlock) return null;

  return (
    <View
      style={[styles.overlay, { backgroundColor: theme.colors.background }]}
      pointerEvents="box-only"
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    elevation: 9998,
  },
});

export default AppGateOverlay;
