import { StyleSheet, Platform } from "react-native";
import { ITheme } from "@new-ui/styles/themes/themeTypes";

export const contactSuggestionStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: 16,
      marginTop: 12,
      overflow: "hidden",
      minHeight: 120,
    },
    listWrapper: {
      width: "100%",
      overflow: "hidden",
    },
    listContainer: {
      flex: 1,
    },
    listContent: {
      paddingVertical: 8,
    },
    suggestionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
    },
    suggestionItemLast: {
      borderBottomWidth: 0,
    },
    radioContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    contactInfo: {
      flex: 1,
      justifyContent: "center",
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    loadingText: {
      marginLeft: 8,
    },
    emptyContainer: {
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
    },
  });

