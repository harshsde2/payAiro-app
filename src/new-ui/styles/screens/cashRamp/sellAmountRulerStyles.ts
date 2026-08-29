import { Platform, StyleSheet } from "react-native";
import type { ITheme } from "../../themes/themeTypes";

const THUMB_SIZE = 28;

export const SELL_SLIDER_THUMB_SIZE = THUMB_SIZE;

export const sellAmountSliderStyles = (theme: ITheme) =>
  StyleSheet.create({
    block: {
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
    },
    amountRow: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 56,
      marginBottom: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
    },
    amountValue: {
      color: theme.colors.text,
      lineHeight: 48,
      ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
    },
    trackHitArea: {
      minHeight: 48,
      justifyContent: "center",
      marginBottom: theme.spacing.xs,
    },
    trackRow: {
      height: THUMB_SIZE,
      justifyContent: "center",
    },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.greyLight,
      width: "100%",
    },
    trackFill: {
      position: "absolute",
      left: 0,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    thumb: {
      position: "absolute",
      left: 0,
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
      backgroundColor: theme.colors.primary,
      borderWidth: 3,
      borderColor: theme.colors.background,
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    rangeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
    },
    rangeLabel: {
      color: theme.colors.textSecondary,
    },
    hint: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
    },
    singleStepHint: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
  });
