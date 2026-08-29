import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import CryptoRequestStatusBadge from "@new-ui/components/common-components/CryptoRequestStatusBadge";
import { AppIcon } from "@new-ui/assets/svgs";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import type {
  ICryptoRequest,
  ICryptoRequestParty,
} from "query/hooks/cryptoRequest.types";

interface Props {
  request: ICryptoRequest;
  onPress?: (request: ICryptoRequest) => void;
}

/** Trim trailing zeros from a decimal-string amount (keeps it human-readable). */
export function formatRequestAmount(amount: string): string {
  if (!amount) return "0";
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  // Up to 8 dp, strip trailing zeros.
  return String(parseFloat(n.toFixed(8)));
}

/** The display name for a request party. */
export function partyName(party?: ICryptoRequestParty | null): string {
  if (!party) return "Someone";
  const full = [party.firstName, party.lastName].filter(Boolean).join(" ").trim();
  return full || party.username || "Someone";
}

/** First initial for the avatar. */
function partyInitial(party?: ICryptoRequestParty | null): string {
  const name = partyName(party);
  return name.charAt(0).toUpperCase() || "?";
}

const CryptoRequestCard: React.FC<Props> = ({ request, onPress }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const isSent = request.direction === "sent";
  // The "other" party: who I asked (sent) or who asked me (received).
  const other = isSent ? request.requestedFrom : request.requestedBy;
  const title = isSent
    ? `Requested from ${partyName(other)}`
    : `${partyName(other)} requested from you`;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPress?.(request)}
      accessibilityRole="button"
    >
      <View style={styles.avatar}>
        <CustomText variant="body" fontWeight="bold" color={theme.colors.primary}>
          {partyInitial(other)}
        </CustomText>
      </View>

      <View style={styles.body}>
        <CustomText
          variant="body"
          fontWeight="semiBold"
          color={theme.colors.text}
          numberOfLines={1}
        >
          {title}
        </CustomText>
        <CustomText
          variant="body"
          fontWeight="semiBold"
          color={theme.colors.text}
          style={styles.amount}
        >
          {formatRequestAmount(request.amount)} {request.currency}
        </CustomText>
        {!!request.note && (
          <CustomText
            variant="caption"
            color={theme.colors.textSecondary}
            numberOfLines={1}
            style={styles.note}
          >
            “{request.note}”
          </CustomText>
        )}
        <CryptoRequestStatusBadge status={request.status} style={styles.badge} />
      </View>

      <AppIcon.ChevronRight width={16} height={16} color={theme.colors.greyDark} />
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.greyLight,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.greenLight2,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      flex: 1,
      gap: 2,
    },
    amount: {
      marginTop: 1,
    },
    note: {
      fontStyle: "italic",
    },
    badge: {
      marginTop: theme.spacing.xs,
    },
  });

export default CryptoRequestCard;
