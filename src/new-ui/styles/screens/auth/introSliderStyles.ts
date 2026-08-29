import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const introSliderStyles = (theme: ITheme) =>
  StyleSheet.create({
    safeContent: {
      flex: 1,
    },
    contentScrollView: {
      flex: 1,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: 44,
      paddingHorizontal: theme.spacing.base,
    },
    skipButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    iconBadge: {
      width: 170,
      height: 170,
      marginBottom: theme.spacing.xl,
    },
    headline: {
      textAlign: 'center',
      // Matches iconBadge's marginBottom so the gap above and below the icon is equal.
      marginBottom: theme.spacing.xl,
      maxWidth: 300,
      // Explicit, more generous lineHeight than headingStyles.h3's default (tight * 24 = 28.8):
      // with fontWeight="extraBold" layered on top of the custom Poppins font, Android clips
      // the second wrapped line under the tighter default lineHeight.
      lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.normal,
    },
    tagline: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      maxWidth: 280,
    },
    subtitle: {
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 22,
    },
    bottomRow: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.base,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    dot: {
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    dotActive: {
      width: 22,
      backgroundColor: theme.colors.primary,
    },
    dotInactive: {
      width: 8,
      backgroundColor: 'rgba(0,121,63,0.25)',
    },
    button: {
      height: 52,
      borderRadius: theme.radius.xl,
    },
  });
