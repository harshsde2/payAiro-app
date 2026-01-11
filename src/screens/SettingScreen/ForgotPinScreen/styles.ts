import { StyleSheet } from "react-native";
import { Theme } from "styles";
import Fonts from "constants/Fonts";

export const getModalStyles = (theme: Theme) =>
  StyleSheet.create({
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFF5F5",
      paddingVertical: theme.spacing.spacing[3],
      paddingHorizontal: theme.spacing.spacing[4],
      borderRadius: 8,
      marginBottom: theme.spacing.spacing[4],
      marginTop: theme.spacing.spacing[2],
      width: "100%",
      borderWidth: 1,
      borderColor: "#C92A2A",
    },
    errorText: {
      color: "#C92A2A",
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      marginLeft: theme.spacing.spacing[2],
      flex: 1,
      textAlign: "center",
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginVertical: theme.spacing.spacing[2],
      paddingHorizontal: theme.spacing.spacing[1],
    },
    otpInputWrapper: {
      flex: 1,
      marginHorizontal: theme.spacing.spacing[1],
    },
    otpInputWrapperFirst: {
      marginLeft: 0,
    },
    otpInputWrapperLast: {
      marginRight: 0,
    },
    otpInput: {
      width: "100%",
      height: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.palette.grey300,
      textAlign: "center",
      fontSize: 20,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
    },
    otpInputActive: {
      borderColor: theme.colors.palette.green500,
      borderWidth: 2,
      backgroundColor: theme.colors.palette.green50,
    },
    otpInputError: {
      borderColor: "#C92A2A",
      borderWidth: 1.5,
    },
    modalHeader: {
      marginBottom: theme.spacing.spacing[6],
      alignItems: "center",
    },
    modalTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.spacing[2],
      color: theme.colors.text.primary,
    },
    modalSubtitle: {
      textAlign: "center",
      color: theme.colors.text.secondary,
      lineHeight: 20,
      paddingHorizontal: theme.spacing.spacing[2],
    },
    buttonContainer: {
      width: "100%",
      marginTop: theme.spacing.spacing[4],
    },
    verifyButton: {
      width: "100%",
      marginBottom: theme.spacing.spacing[3],
    },
    cancelButton: {
      width: "100%",
      backgroundColor: theme.colors.palette.black,
    },
  });

export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
    },
    title: {
      fontSize: 22,
      fontFamily: Fonts.semibold,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: "#666",
      marginBottom: 20,
      fontFamily: Fonts.regular,
      color: "black",
    },
    bold: {
      fontFamily: Fonts.semibold,
    },
    label: {
      fontSize: 14,
      fontFamily: Fonts.semibold,
      marginBottom: 5,
    },
    pinContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    pinInput: {
      width: 70,
      height: 60,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: "rgba(0, 119, 4, 0.4)",
      textAlign: "center",
      fontSize: 22,
      backgroundColor: "rgba(0, 119, 4, 0.07)",
    },
    pinInputError: {
      borderColor: "#C92A2A",
      borderWidth: 1.5,
      backgroundColor: "#FFF5F5",
    },
    pinErrorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF5F5",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginTop: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#C92A2A",
    },
    pinErrorText: {
      color: "#C92A2A",
      fontSize: 13,
      fontFamily: Fonts.semibold,
      marginLeft: 8,
      flex: 1,
    },
  });
