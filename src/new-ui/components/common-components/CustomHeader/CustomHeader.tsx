import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { customHeaderStyles } from '@new-ui/styles/components/customHeaderStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { ICustomHeaderProps } from './types';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';

const formatScreenTitle = (routeName: string): string => {
  // New UI auth screens
  if (routeName === NAVIGATION_SCREENS.NEW_LOGIN) return 'Login Account';
  if (routeName === NAVIGATION_SCREENS.NEW_CREATE_ACCOUNT) return 'Create Account';
  if (routeName === NAVIGATION_SCREENS.NEW_OTP_VERIFICATION) return 'OTP Verification';
  if (routeName === NAVIGATION_SCREENS.NEW_COINME_MOBILE_AUTH) return 'Phone verification';
  if (routeName === NAVIGATION_SCREENS.NEW_COMMON_ERROR) return 'Error';
  if (routeName === NAVIGATION_SCREENS.NEW_KYC) return 'KYC';
  if (routeName === NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD) return 'Forgot Password';
  if (routeName === NAVIGATION_SCREENS.NEW_FORGOT_PASSWORD_VERIFICATION) return 'Verification';
  if (routeName === NAVIGATION_SCREENS.TRANSACTION_LIMIT_SCREEN) return 'Transaction Limits';
  if (routeName === NAVIGATION_SCREENS.PAYMENT_METHODS_SCREEN) return 'Payment Methods';
  // Legacy / other
  if (routeName === NAVIGATION_SCREENS.OTP) return 'OTP Verification';
  if (routeName === NAVIGATION_SCREENS.LOGIN) return 'Login';
  if (routeName === NAVIGATION_SCREENS.NEW_SEND) return 'Send';
  if (routeName === NAVIGATION_SCREENS.NEW_ADD_BALANCE) return 'Add Balance';
  const title = routeName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => {
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return title;
};

const isTransparentHeaderOption = (options: ICustomHeaderProps['options']) => {
  if (options?.headerTransparent === true) {
    return true;
  }
  const hs = options?.headerStyle;
  if (hs && typeof hs === 'object' && !Array.isArray(hs) && 'backgroundColor' in hs) {
    return (hs as { backgroundColor?: string }).backgroundColor === 'transparent';
  }
  return false;
};

const CustomHeader: React.FC<ICustomHeaderProps> = ({
  route,
  navigation,
  options,
  title,
  showBackButton,
  rightButton,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = customHeaderStyles(theme);
  const headerBgTransparent = isTransparentHeaderOption(options);
  const canGoBack = navigation.canGoBack();
  const shouldShowBackButton = showBackButton !== undefined ? showBackButton : canGoBack;
  const displayTitle = title || (route?.name ? formatScreenTitle(route.name) : '');

  const handleBackPress = () => {
    if (canGoBack) {
      navigation.goBack();
    }
  };

  const handleRightButtonPress = () => {
    if (rightButton?.onPress) {
      rightButton.onPress();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: headerBgTransparent ? 'transparent' : theme.colors.background,
        },
      ]}
    >
      <View style={[styles.contentWrapper, { paddingVertical: theme.spacing.xs }]}>
        {shouldShowBackButton ? (
          <TouchableOpacity
            style={styles.leftButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <AppIcon.ArrowLeft width={24} height={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.leftButton} />
        )}

        <View style={styles.titleContainer}>
          <CustomText variant="h4" fontWeight='bold' numberOfLines={1}>
            {displayTitle}
          </CustomText>
        </View>

        {rightButton ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={handleRightButtonPress}
            activeOpacity={0.7}
          >
            {rightButton.icon || <View />}
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButton} />
        )}
      </View>
    </View>
  );
};

export default CustomHeader;

