import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const cryptoReceiveStyles = (theme: ITheme) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    cryptoIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
    },
    qrSection: {
      flex: 1,
      alignItems: 'center',
      paddingTop: theme.spacing.md,
    },
    qrCardContainer: {
      width: '100%',
      alignItems: 'center',
    },
    qrTagValue: {
      color: theme.colors.primary,
    },
    qrLoadingCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 300,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: theme.spacing.md,
    },
    noticeContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.greenLight1,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.greenLight2,
      gap: theme.spacing.sm,
      width: '100%',
    },
    noticeIconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.greenLight2,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    noticeText: {
      flex: 1,
      lineHeight: 18,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xl * 2,
      paddingHorizontal: theme.spacing.md,
    },
    errorContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    retryButton: {
      marginTop: theme.spacing.md,
    },
  });
