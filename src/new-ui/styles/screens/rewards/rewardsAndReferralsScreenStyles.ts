import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const rewardsAndReferralsScreenStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    tabRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginVertical: theme.spacing.base,
    },
    tabChip: {
      flex: 1,
    },
    subtitle: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    shareButton: {
      borderRadius: 30,
      height: 54,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    noActivityCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.full,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      backgroundColor: theme.colors.white,
    },
    voucherGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    voucherHalf: {
      width: '48%',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 20,
      paddingTop: 18,
      paddingHorizontal: 18,
      paddingBottom: 14,
    },
    modalHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalTitleRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 18,
    },
    modalBalanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      minHeight: 44,
    },
    modalBalanceParts: {
      flexDirection: 'row',
      alignItems: 'baseline',
      maxWidth: '72%',
      flexShrink: 1,
    },
    modalCaret: {
      marginLeft: 6,
      alignSelf: 'center',
    },
    modalBreakdownCard: {
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginBottom: 12,
      borderWidth: 1,
    },
    modalBreakdownRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: '#F0F0F0',
    },
    modalBreakdownInfo: {
      flex: 1,
    },
  });
