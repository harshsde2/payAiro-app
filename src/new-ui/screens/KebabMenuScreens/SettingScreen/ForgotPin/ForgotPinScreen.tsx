import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import SettingsIconBadge from 'new-ui/components/common-components/SettingsIconBadge'
import { Button } from '@new-ui/components/common-components/layout';
import { AppIcon } from '@new-ui/assets/svgs';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { pinFlowStyles } from '@new-ui/styles/screens/settings/pinFlowStyles';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useActionOtpRequest } from 'query/hooks';
import { useRegisteredPhone } from 'hooks/useRegisteredPhone';
import { showError, showSuccess, getApiErrorMessage } from 'utils/toast';

const ForgotPinScreen = () => {
  const { theme } = useTheme();
  const styles = pinFlowStyles(theme);
  const navigation = useNavigation<any>();

  const { masked, hasPhone } = useRegisteredPhone();

  const { mutate: requestActionOtp, isPending } = useActionOtpRequest();

  const handleVerify = useCallback(() => {
    if (isPending) return;
    requestActionOtp(
      { channel: 'phone', action: 'transaction_pin_change' },
      {
        onSuccess: () => {
          showSuccess('OTP sent', 'Enter the code we sent to your registered phone.');
          navigation.navigate(NAVIGATION_SCREENS.NEW_PIN_ACTION_OTP_SCREEN, {
            mode: 'forgot',
            channel: 'phone',
          });
        },
        onError: (e) => {
          showError("Couldn't send OTP", getApiErrorMessage(e, 'Please try again.'));
        },
      }
    );
  }, [isPending, requestActionOtp, navigation]);

  return (
    <ScreenWrapper safeArea safeAreaEdges={['bottom']} scrollable contentStyle={styles.content}>
      <CustomText variant="h3" fontWeight="semiBold" style={styles.title}>
        Forgot your PIN?
      </CustomText>
      <CustomText variant="body" size={14} color={theme.colors.greyDark} style={styles.subtitle}>
        Verify your registered phone number and you can set a new PIN straight away.
      </CustomText>

      <View style={styles.destinationCard}>
        <SettingsIconBadge>
            <AppIcon.Privacy width={40} height={40} color={theme.colors.primary} />
          </SettingsIconBadge>
        <View style={styles.destinationTextWrapper}>
          <CustomText variant="h5" size={16} fontWeight="semiBold">
            {hasPhone ? masked : 'Your registered phone'}
          </CustomText>
          <CustomText variant="caption" size={12} fontWeight="light" color={theme.colors.greyDark}>
            We'll text a 6-digit code to this number
          </CustomText>
        </View>
      </View>

      <View style={styles.spacer} />

      {/* Never gated on the client knowing the number: the backend resolves the
          destination from the account itself, so a gap in the cached profile must not
          strand the user on a screen whose only button is dead. If there genuinely is
          no phone on file, the request fails and the error says so. */}
      <Button onPress={handleVerify} loading={isPending} disabled={isPending}>
        Verify with Phone
      </Button>
    </ScreenWrapper>
  );
};

export default ForgotPinScreen;
