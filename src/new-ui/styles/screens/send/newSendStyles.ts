import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const newSendStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingBottom: theme.spacing.xl * 2,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    inputContainer: {
      zIndex: 10,
    },
    contactSuggestionContainer: {
      marginTop: theme.spacing.xs,
    },
    noteInputContainer: {
      marginTop: theme.spacing.sm,
    },
    contactsSection: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xl,
    },
    contactsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    contactsTitle: {
      fontFamily: theme.typography.fontFamily.interSemiBold,
      fontSize: 18,
      color: theme.colors.text,
    },
    proceedButtonContainer: {
      marginTop: theme.spacing.md,
    },
  });

