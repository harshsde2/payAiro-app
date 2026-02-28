import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const countryCodePickerStyles = (theme: ITheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.base,
    },
    title: {
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    searchContainer: {
      marginBottom: theme.spacing.base,
    },
    listContainer: {
      flex: 1,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.greyLight,
    },
    selectedCountryItem: {
      backgroundColor: theme.colors.primaryLight,
    },
    flag: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    countryInfo: {
      flex: 1,
    },
    countryName: {
      marginBottom: 2,
    },
    dialCode: {
      minWidth: 60,
      textAlign: 'right',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl,
    },
  });
};

