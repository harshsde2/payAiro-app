import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const statePickerStyles = (theme: ITheme) => {
  return StyleSheet.create({
    label: {
      marginBottom: 8,
    },
    // Mirrors the layout TextInput box so the picker sits flush with the other fields.
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 46,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: theme.colors.grey,
      backgroundColor: theme.colors.white,
    },
    fieldError: {
      borderColor: theme.colors.error,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      maxHeight: '80%',
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.base,
      paddingBottom: theme.spacing.xl,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.base,
    },
    title: {
      flex: 1,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    searchContainer: {
      marginBottom: theme.spacing.base,
    },
    listContainer: {
      flexGrow: 0,
    },
    stateItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.greyLight,
    },
    selectedStateItem: {
      backgroundColor: theme.colors.primaryLight,
    },
    stateName: {
      flex: 1,
    },
    stateCode: {
      minWidth: 36,
      textAlign: 'right',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl,
    },
  });
};
