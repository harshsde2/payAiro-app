import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const newSendStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.lg,
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
      marginTop: theme.spacing.xs,
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
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
      backgroundColor: theme.colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
  });

