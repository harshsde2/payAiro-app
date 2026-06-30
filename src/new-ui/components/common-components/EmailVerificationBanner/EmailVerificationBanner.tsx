import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { useTheme } from '@new-ui/styles/ThemeContext';
import type { ITheme } from '@new-ui/styles/themes/themeTypes';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useIsEmailVerified } from 'hooks/useIsEmailVerified';

/**
 * Persistent dashboard banner shown while the user's email is unverified.
 * Tapping it opens the email verification screen; it disappears automatically
 * once `email_verified` flips true (backend-driven).
 */
const EmailVerificationBanner: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { isEmailVerified } = useIsEmailVerified();

  if (isEmailVerified) return null;

  const styles = makeStyles(theme);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.banner}
      onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_EMAIL_VERIFICATION)}
      accessibilityRole="button"
      accessibilityLabel="Verify your email"
    >
      <View style={styles.iconCircle}>
        <AppIcon.Mail width={20} height={20} color={theme.colors.primary} />
      </View>
      <View style={styles.textWrap}>
        <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text}>
          Verify your email
        </CustomText>
        <CustomText variant="caption" color={theme.colors.textSecondary} style={styles.subtitle}>
          Confirm your email to unlock transactions.
        </CustomText>
      </View>
      <View style={styles.cta}>
        <CustomText variant="caption" fontWeight="bold" color={theme.colors.primary}>
          Verify
        </CustomText>
        <AppIcon.ChevronRight width={16} height={16} />
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.greyLight,
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      marginHorizontal: 15,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.greyLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
    },
    subtitle: {
      marginTop: 2,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
  });

export default EmailVerificationBanner;
