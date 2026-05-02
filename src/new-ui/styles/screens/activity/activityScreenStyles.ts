import { StyleSheet } from "react-native";
import { ITheme } from "../../themes/themeTypes";

export const activityScreenStyles = (theme: ITheme) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.white,
    },
    filterButtonLabel: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
    },
    chipScroll: {
      flexGrow: 1,
      flexShrink: 1,
    },
    chipScrollContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingRight: theme.spacing.md,
    },
    sectionBlock: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 13,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    sectionList: {
      gap: 8,
    },
    loadingBox: {
      paddingVertical: 48,
      alignItems: "center",
    },
    emptyBox: {
      paddingVertical: 48,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  });
