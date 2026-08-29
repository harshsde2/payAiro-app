import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { AppIcon } from "@new-ui/assets/svgs";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import type { CryptoRequestStatus } from "query/hooks/cryptoRequest.types";

/**
 * Resolve the badge color + label for a request status. Colors follow the
 * integration guide's "UI Badge Colors" table.
 */
export function getStatusPresentation(
  status: CryptoRequestStatus,
  theme: ITheme
): { color: string; label: string } {
  switch (status) {
    case "PENDING":
      return { color: theme.colors.warning, label: "Pending" };
    case "FULFILLED":
      return { color: theme.colors.success, label: "Fulfilled" };
    case "CANCELLED":
      return { color: theme.colors.grey, label: "Cancelled" };
    case "EXPIRED":
      return { color: theme.colors.error, label: "Expired" };
    case "DECLINED":
      return { color: theme.colors.error, label: "Declined" };
    default:
      return { color: theme.colors.grey, label: String(status) };
  }
}

interface Props {
  status: CryptoRequestStatus;
  style?: StyleProp<ViewStyle>;
}

const CryptoRequestStatusBadge: React.FC<Props> = ({ status, style }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { color, label } = getStatusPresentation(status, theme);

  return (
    <View style={[styles.badge, { backgroundColor: color }, style]}>
      {status === "PENDING" ? (
        <AppIcon.Clock width={12} height={12} color={theme.colors.onPrimary} />
      ) : null}
      <CustomText variant="caption" fontWeight="semiBold" color={theme.colors.onPrimary}>
        {label}
      </CustomText>
    </View>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 4,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      borderRadius: theme.radius.full,
    },
  });

export default CryptoRequestStatusBadge;
