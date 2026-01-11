import { StyleSheet, Platform } from "react-native";
import { Theme } from "styles/theme";

export const contactSuggestionStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      backgroundColor: theme.colors.palette.white,
      borderRadius: 16,
      maxHeight: 250,
      zIndex: 1000,
      elevation: 8,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.palette.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      marginTop: 4,
      overflow: "hidden",
    },
    listContainer: {
      maxHeight: 250,
    },
    listContent: {
      paddingVertical: 8,
    },
    suggestionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    suggestionItemLast: {
      borderBottomWidth: 0,
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.palette.green100,
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
