import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const kycVerifyStyles = (theme: ITheme) => {
  return StyleSheet.create({
    content: {
      flexGrow: 1,
    },
    subtitleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      color: theme.colors.text,
      textAlign: 'center',
    },
    instructionTextContainer: {
      marginBottom: theme.spacing.xl,
    },
    instructionText: {
      lineHeight: 22,
      textAlign: 'center',
    },
    sectionHeader: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    inputContainer: {
      marginBottom: theme.spacing.base,
    },
    // Locked fields (DOB, SSN, email, phone) — dimmed text + muted border so they
    // read as "we already have this" rather than an empty editable field.
    readOnlyInput: {
      color: theme.colors.textSecondary,
    },
    lockedNote: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
      lineHeight: 18,
    },
    buttonContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: theme.spacing.xl,
    },
    proceedButton: {
      marginBottom: theme.spacing.base,
    },
    startOverButton: {
      alignSelf: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
    },
    startOverText: {
      textAlign: 'center',
    },
  });
};
