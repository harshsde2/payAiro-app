import React, { useEffect, useState } from 'react'
import { Alert, Linking, StyleSheet, Switch, View } from 'react-native'
import ScreenWrapper from 'new-ui/components/common-components/ScreenWrapper'
import CustomText from 'new-ui/components/common-components/CustomText'
import { useTheme } from '@new-ui/styles/ThemeContext'
import { AppIcon } from 'new-ui/assets/svgs'
import { useAppLock } from 'hooks/useAppLock'
import { getBiometric, setBiometric } from 'services/Auth'
import {
  checkBiometricAvailability,
  authenticateWithBiometricDetailed,
} from 'services/BiometricService'
import { showError, showSuccess } from 'utils/toast'
// TODO: enable server sync once backend endpoint is finalized
// import { useUpsertUserSecurityPinSettings } from 'query/hooks'
// import { getPin as getLocalPin } from 'storage/mmkv'

const PrivacyAndSecurityScreen = () => {
  const { theme } = useTheme()
  const styles = privacyAndSecurityStyles(theme)

  const [biometricStatus, setBiometricStatus] = useState(false)
  const [isUpdatingBiometric, setIsUpdatingBiometric] = useState(false)

  const {
    setNativeModalVisible,
    refreshBiometricStatus: refreshBiometricStatusInContext,
    resetBiometricFailures,
  } = useAppLock()
  // TODO: enable server sync once backend endpoint is finalized
  // const { mutateAsync: upsertSecurityPinSettings } = useUpsertUserSecurityPinSettings();

  useEffect(() => {
    const loadBiometricStatus = async () => {
      try {
        const biometricData = await getBiometric()
        setBiometricStatus(biometricData === true)
      } catch (error) {
        console.log('Error getting biometric status:', error)
        setBiometricStatus(false)
      }
    }
    loadBiometricStatus()
  }, [])

  const handleBiometricToggle = async () => {
    if (isUpdatingBiometric) return
    setIsUpdatingBiometric(true)

    // Mark native biometric prompt as a native modal so AppState lock logic
    // doesn't accidentally lock/unlock during the system UI transition.
    setNativeModalVisible(true)

    try {
      if (biometricStatus) {
        Alert.alert(
          'Disable Biometric Unlock',
          'Are you sure you want to disable biometric unlock for PayAiro?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                try {
                  await setBiometric(false)
                  setBiometricStatus(false)
                  resetBiometricFailures()
                  await refreshBiometricStatusInContext()
                  // TODO: enable server sync once backend endpoint is finalized
                  // try {
                  //   await upsertSecurityPinSettings({
                  //     pin: getLocalPin() || null,
                  //     biometric: false,
                  //   });
                  // } catch (apiErr) {
                  //   showError('Biometric disabled locally; sync with server failed.');
                  // }
                  showSuccess('Biometric disabled', 'Biometric unlock has been turned off.')
                } catch (e) {
                  showError("Couldn't disable biometric", 'Please try again.')
                }
              },
            },
          ]
        )
        return
      }

      const availability = await checkBiometricAvailability()
      if (!availability.available) {
        const code = (availability?.errorCode || '').toLowerCase()
        const message = (availability?.error || '').toLowerCase()
        const isNotEnrolled =
          code.includes('not_enrolled') ||
          code.includes('noneenrolled') ||
          code.includes('biometrynotenrolled') ||
          message.includes('not enrolled') ||
          message.includes('no biometric')

        if (isNotEnrolled) {
          Alert.alert(
            'No biometrics enrolled',
            'To enable biometric unlock, first add Face ID / Touch ID / Fingerprint in your device settings.',
            [
              { text: 'Not now', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  // Opens the OS settings page for this app (best effort).
                  Linking.openSettings?.()
                },
              },
            ]
          )
        } else {
          showError(
            'Biometric unavailable',
            availability?.error ||
              'Biometric authentication is not available on this device.'
          )
        }
        return
      }

      const authResult = await authenticateWithBiometricDetailed(
        'Enable biometric unlock for PayAiro'
      )
      if (!authResult?.success) {
        // Security: do not enable biometric if user cancels/fails.
        const code = (authResult?.errorCode || '').toLowerCase()
        if (code.includes('user_cancel') || code.includes('cancel')) {
          showError('Cancelled', 'Biometric authentication was cancelled.')
        } else if (code.includes('lockout')) {
          showError('Biometrics locked', 'Please try again later or use your PIN.')
        } else if (code.includes('passcode_not_set')) {
          showError('Passcode required', 'Set a device passcode to use Face ID / Touch ID.')
        } else {
          showError('Authentication failed', authResult?.error || 'Biometric authentication failed.')
        }
        return
      }

      await setBiometric(true)
      setBiometricStatus(true)
      await refreshBiometricStatusInContext()
      // TODO: enable server sync once backend endpoint is finalized
      // try {
      //   await upsertSecurityPinSettings({
      //     pin: getLocalPin() || null,
      //     biometric: true,
      //   });
      // } catch (apiErr) {
      //   showError('Biometric enabled locally; sync with server failed.');
      // }
      showSuccess('Biometric enabled', 'You can now unlock with biometrics.')
    } finally {
      // Delay reset to handle multiple AppState transitions during system UI dismissal.
      setTimeout(() => setNativeModalVisible(false), 800)
      setIsUpdatingBiometric(false)
    }
  }

  return (
    <ScreenWrapper safeArea safeAreaEdges={['bottom']} scrollable contentStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <AppIcon.Privacy />
          <View style={styles.cardTextWrapper}>
            <CustomText variant="h5" size={16} fontWeight="semiBold">
              Biometric App Lock
            </CustomText>
            <CustomText variant="caption" size={12} fontWeight="light" color={theme.colors.greyDark}>
              Use Face ID / Touch ID / Fingerprint to unlock PayAiro
            </CustomText>
          </View>
        </View>
        <Switch
          value={biometricStatus}
          onValueChange={handleBiometricToggle}
          disabled={isUpdatingBiometric}
          trackColor={{ false: theme.colors.greyLight, true: theme.colors.primary }}
          thumbColor={theme.colors.white}
        />
      </View>
    </ScreenWrapper>
  )
}

const privacyAndSecurityStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: 15,
      paddingTop: theme.spacing.base,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderColor: theme.colors.greyLight,
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: theme.spacing.md,
    },
    cardTextWrapper: {
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
  })

export default PrivacyAndSecurityScreen
