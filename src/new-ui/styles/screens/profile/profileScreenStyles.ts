import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const profileScreenStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing['2xl'],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
    },
    headerSide: {
      width: 40,
      height: 40,
    },
    headerButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    headerButtonGlassy: {
      width: 40,
      height: 40,
    },
    headerButtonIconWrapper: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
    },
    avatarBlock: {
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      gap: 6,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 24,
      // Opaque on purpose: a translucent tile let the screen's green gradient bleed through
      // and washed the initials out (most visibly on Android).
      backgroundColor: theme.colors.greenLight2,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.7)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 4,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    avatarInitials: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 26,
      lineHeight: 32,
      letterSpacing: 0.5,
      color: theme.colors.primary,
      textAlign: 'center',
      // Android pads glyphs vertically by default, which pushes the initials off-centre.
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    name: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: 21,
      color: theme.colors.text,
    },
    caption: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    cardFirst: {
      marginTop: theme.spacing.base,
    },
    card: {
      marginTop: theme.spacing.base,
    },
    cardInner: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: 8,
    },
    kicker: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: theme.colors.primary,
      marginBottom: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    rowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    rowFirst: {
      paddingTop: 0,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
      minWidth: 0,
    },
    rowLabel: {
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: 14,
      color: theme.colors.text,
      flexShrink: 1,
    },
    pill: {
      paddingVertical: 3,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: 4,
    },
    pillAccent: {
      backgroundColor: theme.colors.greenLight2,
    },
    pillOutline: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: 'transparent',
    },
    pillText: {
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: 11,
      color: theme.colors.primary,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    addressIcon: {
      marginTop: 2,
    },
    addressText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: 14,
      lineHeight: 21,
      color: theme.colors.text,
      flex: 1,
    },
    emptyRowText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: 14,
      color: theme.colors.textSecondary,
      paddingVertical: theme.spacing.sm,
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: theme.spacing.base,
    },
  });
