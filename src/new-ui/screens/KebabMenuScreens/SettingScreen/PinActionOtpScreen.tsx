import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import { removeListener, startOtpListener } from 'react-native-otp-verify';
import CustomText from '@new-ui/components/common-components/CustomText';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import { Button } from '@new-ui/components/common-components/layout';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { otpVerificationStyles } from '@new-ui/styles/screens/auth/otpVerificationStyles';
import type { NewUIDashboardStackParamList } from '@new-ui/navigationTypes';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useActionOtpRequest, useActionOtpVerify } from 'query/hooks';
import { showError, showSuccess, getApiErrorMessage } from 'utils/toast';

const OTP_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

type PinActionOtpRouteProp = RouteProp<
  NewUIDashboardStackParamList,
  typeof NAVIGATION_SCREENS.NEW_PIN_ACTION_OTP_SCREEN
>;

/**
 * OTP step for the PIN flows. Mirrors the auth OTP screen's interaction (auto-submit
 * on filled, Android SMS auto-read, 60s resend) but talks to the action-otp endpoints
 * and carries no session/token logic — the user is already logged in here.
 */
const PinActionOtpScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = otpVerificationStyles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<PinActionOtpRouteProp>();
  const params = route.params;
  const channel = params?.channel ?? 'phone';

  const [otp, setOtp] = useState('');
  // The cooldown is intentionally in-memory rather than the shared MMKV
  // OTP_RESEND_TIMESTAMP key, which the login OTP owns — sharing it would make one
  // flow's cooldown silently block the other's resend.
  const [countdown, setCountdown] = useState(OTP_COOLDOWN_SECONDS);
  const [resendEnabled, setResendEnabled] = useState(false);
  const otpInputRef = useRef<OtpInputRef>(null);
  const isVerifyingRef = useRef(false);

  const { mutate: verifyActionOtp, isPending: isVerifying } = useActionOtpVerify();
  const { mutate: requestActionOtp, isPending: isResending } = useActionOtpRequest();

  const isOtpComplete = otp.length === OTP_LENGTH;

  useEffect(() => {
    if (resendEnabled) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setResendEnabled(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendEnabled]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    startOtpListener((message) => {
      const otpMatch = /(\d{6})/g.exec(message);
      if (otpMatch?.[1]) {
        setOtp(otpMatch[1]);
        otpInputRef.current?.setValue(otpMatch[1]);
      }
    });
    return () => {
      removeListener();
    };
  }, []);

  const handleVerify = useCallback(
    (value?: string) => {
      const enteredOtp = value ?? otp;
      if (enteredOtp.length !== OTP_LENGTH || isVerifyingRef.current) return;
      isVerifyingRef.current = true;

      verifyActionOtp(
        { channel, action: 'transaction_pin_change', otp_code: enteredOtp },
        {
          onSuccess: (response) => {
            const actionToken = response?.data?.action_token;
            showSuccess('Verified', 'Now choose your new PIN.');

            if (params.mode === 'change') {
              // pin/change/ authorises on old_pin, so the action_token this step mints
              // has no use here — the OTP is the extra gate the product asked for.
              navigation.replace(NAVIGATION_SCREENS.NEW_SET_NEW_PIN_SCREEN, {
                mode: 'change',
                oldPin: params.oldPin,
              });
              return;
            }

            if (!actionToken) {
              // Without the token pin/reset/ cannot be called — fail here rather than
              // dropping the user on a screen whose submit can only ever error.
              showError('Verification failed', 'Please request a new code and try again.');
              otpInputRef.current?.clear();
              setOtp('');
              return;
            }

            navigation.replace(NAVIGATION_SCREENS.NEW_SET_NEW_PIN_SCREEN, {
              mode: 'forgot',
              actionToken,
            });
          },
          onError: (error) => {
            showError('Verification failed', getApiErrorMessage(error, 'Please try again.'));
            otpInputRef.current?.clear();
            setOtp('');
          },
          onSettled: () => {
            isVerifyingRef.current = false;
          },
        }
      );
    },
    [otp, channel, params, verifyActionOtp, navigation]
  );

  const handleResend = useCallback(() => {
    if (!resendEnabled || isResending) return;
    requestActionOtp(
      { channel, action: 'transaction_pin_change' },
      {
        onSuccess: () => {
          setCountdown(OTP_COOLDOWN_SECONDS);
          setResendEnabled(false);
          otpInputRef.current?.clear();
          setOtp('');
          showSuccess('OTP sent', 'We sent you a new code.');
        },
        onError: (error) => {
          showError("Couldn't resend code", getApiErrorMessage(error, 'Please try again.'));
        },
      }
    );
  }, [resendEnabled, isResending, requestActionOtp, channel]);

  const instructionText =
    channel === 'phone'
      ? 'Enter the 6-digit code we sent to your registered phone number.'
      : 'Enter the 6-digit code we sent to your registered email address.';

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom', 'left', 'right']}
      padding={16}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.titleContainer}>
        <CustomText variant="h2" style={styles.title} fontWeight="semiBold">
          Confirm OTP
        </CustomText>
      </View>
      <View style={styles.instructionTextContainer}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.textSecondary}
          style={styles.instructionText}
        >
          {instructionText}
        </CustomText>
      </View>

      <View style={styles.otpContainer}>
        <OtpInput
          ref={otpInputRef}
          numberOfDigits={OTP_LENGTH}
          focusColor={theme.colors.primary}
          autoFocus
          disabled={isVerifying}
          type="numeric"
          blurOnFilled
          onTextChange={setOtp}
          onFilled={handleVerify}
          textInputProps={{
            accessibilityLabel: 'One-Time Password',
            textContentType: 'oneTimeCode',
            autoComplete: 'sms-otp',
          }}
          theme={{
            containerStyle: styles.otpInputContainer,
            pinCodeContainerStyle: styles.otpInput,
            pinCodeTextStyle: styles.otpInputText,
            focusedPinCodeContainerStyle: styles.otpInputActive,
            filledPinCodeContainerStyle: styles.otpInputFilled,
            disabledPinCodeContainerStyle: styles.otpInputDisabled,
          }}
        />
      </View>

      <View style={styles.resendContainer}>
        <CustomText variant="bodySmall" color={theme.colors.textSecondary}>
          Didn't receive the code?
        </CustomText>
        <TouchableOpacity
          style={styles.resendLink}
          disabled={!resendEnabled || isVerifying || isResending}
          onPress={handleResend}
        >
          <CustomText
            variant="bodySmall"
            style={styles.resendText}
            color={resendEnabled ? theme.colors.primary : theme.colors.textSecondary}
          >
            {resendEnabled ? 'Resend OTP' : `Resend OTP in ${countdown} seconds`}
          </CustomText>
        </TouchableOpacity>
      </View>

      <Button
        onPress={() => handleVerify()}
        disabled={!isOtpComplete || isVerifying}
        loading={isVerifying}
      >
        {isVerifying ? 'Verifying...' : 'Verify'}
      </Button>
    </ScreenWrapper>
  );
};

export default PinActionOtpScreen;
