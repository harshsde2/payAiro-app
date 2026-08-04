import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { OtpInputRef } from 'react-native-otp-entry';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import PinInput, { PIN_LENGTH } from '@new-ui/components/common-components/PinInput';
import { Button } from '@new-ui/components/common-components/layout';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { pinFlowStyles } from '@new-ui/styles/screens/settings/pinFlowStyles';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useActionOtpRequest } from 'query/hooks';
import { getPin } from 'storage/mmkv';
import { showError, showSuccess, getApiErrorMessage } from 'utils/toast';

const ChangePinScreen = () => {
  const { theme } = useTheme();
  const styles = pinFlowStyles(theme);
  const navigation = useNavigation<any>();

  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState('');
  const pinRef = useRef<OtpInputRef>(null);

  const { mutate: requestActionOtp, isPending } = useActionOtpRequest();

  const clearPin = useCallback(() => {
    pinRef.current?.clear();
    setCurrentPin('');
  }, []);

  const handleContinue = useCallback(
    (value?: string) => {
      const entered = value ?? currentPin;
      if (entered.length !== PIN_LENGTH || isPending) return;

      // Check against the local PIN first so a wrong entry fails instantly instead of
      // spending an SMS and making the user finish an OTP before finding out. The
      // server re-validates old_pin on the final change call, so this is convenience,
      // not the security boundary.
      const storedPin = getPin();
      if (storedPin && entered !== storedPin) {
        setError('Incorrect current PIN. Please try again.');
        clearPin();
        return;
      }

      setError('');
      requestActionOtp(
        { channel: 'phone', action: 'transaction_pin_change' },
        {
          onSuccess: () => {
            showSuccess('OTP sent', 'Enter the code we sent to your registered phone.');
            navigation.navigate(NAVIGATION_SCREENS.NEW_PIN_ACTION_OTP_SCREEN, {
              mode: 'change',
              channel: 'phone',
              oldPin: entered,
            });
            // Don't leave the PIN on screen behind the push — the user may come back.
            clearPin();
          },
          onError: (e) => {
            showError("Couldn't send OTP", getApiErrorMessage(e, 'Please try again.'));
          },
        }
      );
    },
    [currentPin, isPending, requestActionOtp, navigation, clearPin]
  );

  return (
    <ScreenWrapper safeArea safeAreaEdges={['bottom']} scrollable contentStyle={styles.content}>
      <CustomText variant="h3" fontWeight="semiBold" style={styles.title}>
        Change your PIN
      </CustomText>
      <CustomText variant="body" size={14} color={theme.colors.greyDark} style={styles.subtitle}>
        Enter your current 4-digit PIN. We'll send a code to your registered phone to
        verify it's you before you choose a new one.
      </CustomText>

      <View style={styles.fieldGroup}>
        <CustomText variant="label" size={14} fontWeight="semiBold" style={styles.label}>
          Current PIN
        </CustomText>
        <PinInput
          ref={pinRef}
          autoFocus
          disabled={isPending}
          hasError={!!error}
          onTextChange={(value) => {
            setCurrentPin(value);
            if (error) setError('');
          }}
          onFilled={handleContinue}
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
        onPress={() => handleContinue()}
        loading={isPending}
        disabled={currentPin.length !== PIN_LENGTH || isPending}
      >
        Continue
      </Button>
    </ScreenWrapper>
  );
};

export default ChangePinScreen;
