import { StyleSheet } from "react-native";
import { Theme } from "styles";

export const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
      marginTop: theme.spacing.spacing[0],
    },
    header: {
      marginTop: 20,
      marginBottom: 10,
    },
    textInputAndFilterContainer: {
      width: "100%",
      flex: 1,
      maxHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    testInputContainer: {
      flex: 1,
      marginRight: 10,
    },
    contactItem: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      marginVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200,
      backgroundColor: theme.colors.palette.grey150,
    },
    contactLeftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.palette.green200,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 25,
    },
    initials: {
      color: theme.colors.palette.green700,
      fontSize: 18,
    },
    contactInfo: {
      marginLeft: 10,
      width: 180,
    },
    unreadBadge: {
      backgroundColor: theme.colors.palette.green700,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 5,
    },
    addButton: {
      backgroundColor: theme.colors.palette.green700,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      marginLeft: 10,
    },
    shareContainer: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },
    sectionListRenderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 10,
      marginVertical: 5,
    },
    card: {
      backgroundColor: theme.colors.palette.green150,
      borderRadius: 16,
      padding: 20,
      marginVertical: 10,
      shadowColor: theme.colors.shadow.default,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text.primary,
      textAlign: "center",
    },
    totalValue: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.text.primary,
      textAlign: "center",
      marginVertical: 10,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border.light,
      marginVertical: 15,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    infoBlock: {
      flex: 1,
      alignItems: "center",
    },
    infoLabel: {
      fontSize: 12,
      color: theme.colors.text.tertiary,
      marginBottom: 5,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text.primary,
    },
  });
