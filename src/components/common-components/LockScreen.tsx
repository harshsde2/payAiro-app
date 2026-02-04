/**
 * LockScreen – Full-screen app lock overlay.
 * When locked: tries native biometric first (if enabled); after 2–3 failures shows PIN screen.
 * Does not render any sensitive app content. Uses native biometric UI only.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from 'styles';
import type { Theme } from 'styles';
import { useAppLock } from 'hooks/useAppLock';
import { authenticateWithBiometric } from 'services/BiometricService';
import { LOCK_CONFIG } from 'types/appLock.types';
import AppLockScreen from 'components/common-components/AppLockScreen';

export const LockScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = lockScreenStyles(theme);
  const {
    isLocked,
    shouldShowLock,
    isBiometricEnabled,
    showPinScreen,
    unlockApp,
    requestShowPinScreen,
  } = useAppLock();

  const biometricFailureCount = useRef(0);
  const [isBiometricChecking, setIsBiometricChecking] = useState(false);

  // When locked and biometric is enabled and we're not yet showing PIN, trigger native biometric
  useEffect(() => {
    if (!shouldShowLock || !isLocked || showPinScreen || !isBiometricEnabled) return;

    let cancelled = false;
    setIsBiometricChecking(true);

    const runBiometric = async () => {
      const success = await authenticateWithBiometric('Unlock PayAiro');
      if (cancelled) return;
      setIsBiometricChecking(false);
      if (success) {
        biometricFailureCount.current = 0;
        unlockApp();
      } else {
        biometricFailureCount.current += 1;
        if (biometricFailureCount.current >= LOCK_CONFIG.MAX_BIOMETRIC_FAILURES_BEFORE_PIN) {
          requestShowPinScreen();
        }
      }
    };

    runBiometric();
    return () => {
      cancelled = true;
    };
  }, [
    shouldShowLock,
    isLocked,
    showPinScreen,
    isBiometricEnabled,
    unlockApp,
    requestShowPinScreen,
  ]);

  // Reset failure count when lock is dismissed
  useEffect(() => {
    if (!isLocked) biometricFailureCount.current = 0;
  }, [isLocked]);

  if (!shouldShowLock || !isLocked) return null;

  // Show existing PIN screen when user must use PIN (no biometric or after failures)
  if (showPinScreen || !isBiometricEnabled) {
    return <AppLockScreen />;
  }

  // Biometric path: minimal overlay, no sensitive content; native prompt is shown by the service
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>PayAiro</Text>
      <Text style={styles.subtitle}>Use Face ID or Touch ID to unlock</Text>
      {isBiometricChecking && (
        <ActivityIndicator size="small" color={theme.colors.palette.green700} style={styles.loader} />
      )}
      <TouchableOpacity
        style={styles.usePinButton}
        onPress={requestShowPinScreen}
        disabled={isBiometricChecking}
      >
        <Text style={styles.usePinText}>Use PIN instead</Text>
      </TouchableOpacity>
    </View>
  );
};

const lockScreenStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.palette.white,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    title: {
      fontSize: 24,
      fontFamily: theme.typography.fontFamily.montserratBold,
      color: theme.colors.palette.green700,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.montserrat,
      color: theme.colors.text.secondary,
    },
    loader: {
      marginTop: 24,
    },
    usePinButton: {
      marginTop: 32,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    usePinText: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      color: theme.colors.palette.green700,
      textDecorationLine: 'underline',
    },
  });

export default LockScreen;
