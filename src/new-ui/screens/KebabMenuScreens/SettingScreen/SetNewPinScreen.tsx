import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { OtpInputRef } from 'react-native-otp-entry';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import PinInput, { PIN_LENGTH } from '@new-ui/components/common-components/PinInput';
import { Button } from '@new-ui/components/common-components/layout';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { pinFlowStyles } from '@new-ui/styles/screens/settings/pinFlowStyles';
import type { NewUIDashboardStackParamList } from '@new-ui/navigationTypes';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useSecurityPinChange, useSecurityPinReset } from 'query/hooks';
import { useAppLock } from 'hooks/useAppLock';
import { getPin, setPin } from 'storage/mmkv';
import { showError, showSuccess, getApiErrorMessage } from 'utils/toast';

type SetNewPinRouteProp = RouteProp<
  NewUIDashboardStackParamList,
  typeof NAVIGATION_SCREENS.NEW_SET_NEW_PIN_SCREEN
>;

const SetNewPinScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = pinFlowStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<SetNewPinRouteProp>();
  const params = route.params;
  const { refreshPinStatus } = useAppLock();

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const newPinRef = useRef<OtpInputRef>(null);
  const confirmPinRef = useRef<OtpInputRef>(null);

  const { mutate: changePin, isPending: isChanging } = useSecurityPinChange();
  const { mutate: resetPin, isPending: isResetting } = useSecurityPinReset();
  const isPending = isChanging || isResetting;

  const resetFields = useCallback(() => {
    newPinRef.current?.clear();
    confirmPinRef.current?.clear();
    setNewPin('');
    setConfirmPin('');
  }, []);

  const handleSuccess = useCallback(
    (savedPin: string) => {
      // Persist the value the user typed, not the response's `pin` — the settings
      // endpoint can hand back a masked value, and AppLockContext compares this
      // against what's entered on the lock screen.
      setPin(savedPin);
      refreshPinStatus();
      showSuccess('PIN updated', 'Your transaction PIN has been changed.');
      // Both flows arrive as [entry screen, this screen] — the OTP step replaced
      // itself. Popping both returns to whatever opened the flow: Privacy & Security
      // from settings, or the pre-lock screen when it came from the lock screen.
      navigation.pop(2);
    },
    [navigation, refreshPinStatus]
  );

  const handleSubmit = useCallback(() => {
    if (isPending) return;

    if (newPin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH) {
      setError('Enter and confirm your new 4-digit PIN.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      resetFields();
      return;
    }
    if (newPin === getPin()) {
      setError('New PIN cannot be the same as your current PIN.');
      resetFields();
      return;
    }

    setError('');

    if (params.mode === 'change') {
      changePin(
        { old_pin: params.oldPin, new_pin: newPin },
        {
          onSuccess: () => handleSuccess(newPin),
          onError: (e) => {
            // Covers the spec's 401 INVALID_CREDENTIALS ("Incorrect current PIN.").
            showError("Couldn't change PIN", getApiErrorMessage(e, 'Please try again.'));
            resetFields();
          },
        }
      );
      return;
    }

    resetPin(
      { action_token: params.actionToken, new_pin: newPin },
      {
        onSuccess: () => handleSuccess(newPin),
        onError: (e) => {
          showError("Couldn't reset PIN", getApiErrorMessage(e, 'Please try again.'));
          resetFields();
        },
      }
    );
  }, [isPending, newPin, confirmPin, params, changePin, resetPin, handleSuccess, resetFields]);

  return (
    <ScreenWrapper safeArea safeAreaEdges={['bottom']} scrollable contentStyle={styles.content}>
      <CustomText variant="h3" fontWeight="semiBold" style={styles.title}>
        Set a new PIN
      </CustomText>
      <CustomText variant="body" size={14} color={theme.colors.greyDark} style={styles.subtitle}>
        Choose a 4-digit PIN you'll use to approve payments. Avoid something easy to
        guess, like 1234 or your birth year.
      </CustomText>

      <View style={styles.fieldGroup}>
        <CustomText variant="label" size={14} fontWeight="semiBold" style={styles.label}>
          New PIN
        </CustomText>
        <PinInput
          ref={newPinRef}
          autoFocus
          disabled={isPending}
          hasError={!!error}
          onTextChange={(value) => {
            setNewPin(value);
            if (error) setError('');
          }}
        />
      </View>

      <View style={styles.fieldGroup}>
        <CustomText variant="label" size={14} fontWeight="semiBold" style={styles.label}>
          Confirm new PIN
        </CustomText>
        <PinInput
          ref={confirmPinRef}
          disabled={isPending}
          hasError={!!error}
          onTextChange={(value) => {
            setConfirmPin(value);
            if (error) setError('');
          }}
        />
        {error ? (
          <View style={styles.errorRow}>
            <CustomText variant="caption" size={12} color={theme.colors.error} style={styles.errorText}>
              {error}
            </CustomText>
          </View>
        ) : null}
      </View>

      <View style={styles.spacer} />

      <Button
        onPress={handleSubmit}
        loading={isPending}
        disabled={newPin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH || isPending}
      >
        Save PIN
      </Button>
    </ScreenWrapper>
  );
};

export default SetNewPinScreen;
