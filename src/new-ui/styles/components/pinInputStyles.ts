import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const pinInputStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    // Four boxes look stranded when stretched edge-to-edge like the 6-digit OTP row,
    // so they're centred and spaced instead of justified across the full width.
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    input: {
      width: 56,
      height: 64,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    inputText: {
      fontSize: 24,
      fontFamily: theme.typography.fontFamily.poppinsSemiBold,
      color: theme.colors.text,
    },
    inputActive: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      backgroundColor: theme.colors.surfaceElevated,
    },
    inputFilled: {
      borderColor: theme.colors.success,
      borderWidth: 1.5,
      backgroundColor: theme.colors.surfaceElevated,
    },
    inputDisabled: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      opacity: 0.7,
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: 1.5,
    },
  });
