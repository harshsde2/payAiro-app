import { StyleSheet } from 'react-native';
import type { ITheme } from '@new-ui/styles/themes/themeTypes';

export const activityFilterModalStyles = (theme: ITheme) =>
  StyleSheet.create({
    // Modal shell — mirrors addBalanceStyles' AddDebitCardModal shell.
    modalKav: {
      flex: 1,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
      padding: theme.spacing.xl,
    },
    modalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      padding: theme.spacing.xl,
      maxHeight: '88%',
    },
    modalCloseRow: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    modalCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Sections
    scroll: {
      marginTop: theme.spacing.sm,
      flexShrink: 1,
      // Flex children default to minHeight: 'auto' (size-to-content), which silently
      // overrides flexShrink and stops this from ever shrinking below its content —
      // so overflow gets clipped by the card's maxHeight instead of scrolling. This
      // is what actually lets flexShrink do its job.
      minHeight: 0,
    },
    scrollContent: {
      paddingBottom: theme.spacing.md,
    },
    section: {
      marginTop: theme.spacing.lg,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text,
    },
    resetLink: {
      fontSize: 13,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.textSecondary,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },

    // Date range
    dateRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    dateCol: {
      flex: 1,
      minWidth: 0,
    },
    dateFieldLabel: {
      fontSize: 13,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    dateBox: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.base,
      minHeight: 52,
      justifyContent: 'center',
    },
    dateBoxText: {
      fontSize: 15,
    },
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },

    // iOS date picker overlay — rendered as its own Modal so it's always visible
    // regardless of scroll position (iOS renders it inline, not as a native popup).
    pickerBackdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    pickerCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
  });
