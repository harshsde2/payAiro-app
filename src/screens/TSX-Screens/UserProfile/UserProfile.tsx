import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserProfileTransactions } from "query/hooks/useUserDetails";
import { useTheme } from "styles/ThemeContext";
import moment from "moment";
import { UserTransaction } from "./types";
import type { ISendScreenRouteParams } from "screens/Dashboard/types";
import { CustomText } from "tsx-components";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { SvgIcons } from "constants/svgs";

const UserProfile = () => {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const params = route.params as {
    userDetails?: {
      id?: number | string;
      userId?: number | string;
      uuid?: string;
      username?: string;
      identifier?: string;
      profile_photo?: string | null;
    };
    /**
     * Set when this screen was reached from Send while a specific crypto was selected
     * (Crypto details → Send → profile). This screen only relays it back on Pay so the
     * chosen coin survives the detour; it is never read here.
     */
    preselectedAsset?: ISendScreenRouteParams["preselectedAsset"];
  };

  const targetUserIdRaw =
    params?.userDetails?.id ??
    params?.userDetails?.userId ??
    params?.userDetails?.uuid;
  const targetUserId = targetUserIdRaw ? Number(targetUserIdRaw) : NaN;
  const hasTargetUserId = Number.isFinite(targetUserId);

  const {
    data: response,
    isLoading,
    error,
  } = useUserProfileTransactions(
    hasTargetUserId ? targetUserId : undefined,
    50
  );

  const userEnvelope = response?.data?.user;
  const user = userEnvelope?.user;
  const legalIdentity = userEnvelope?.legal_identity;
  const transactions = response?.data?.transactions?.items || [];
  const avatarUrl =
    userEnvelope?.profile?.avatar_url || params?.userDetails?.profile_photo || null;

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD");
  };

  const formatAmount = (amount: string) => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed)) return "0.00";
    return parsed.toFixed(2);
  };

  const getPhoneNumberDisplay = () => {
    const nationalNumber = legalIdentity?.phone_national_number?.trim();
    const countryCode = legalIdentity?.phone_country_code;

    if (!nationalNumber) return "-";
    if (countryCode) return `+${countryCode} ${nationalNumber}`;
    return nationalNumber;
  };

  const renderTransactionItem = ({ item }: { item: UserTransaction }) => {
    const isIncoming = item.direction === "received";
    const statusUpper = String(item.status || "").toUpperCase();
    const isFailed = statusUpper === "FAILED";

    const displayName = isIncoming
      ? item.sentBy?.username || "Unknown"
      : item.sentTo?.username || "Unknown";

    let amountColor = theme.colors.text.primary;
    if (isFailed) amountColor = theme.colors.kycStatusLight.Rejected;
    else if (isIncoming) amountColor = theme.colors.kycStatusDark.Verified;

    const iconColor = theme.colors.button.primary.background;

    return (
      <View
        style={[
          styles.transactionItem,
          { borderBottomColor: theme.colors.border.light },
        ]}
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isFailed
                  ? theme.colors.kycStatusLight.Rejected
                  : iconColor,
              },
            ]}
          >
            {isFailed ? "X" : isIncoming ? <SvgIcons.ArrowDown width={15} height={15} /> : <SvgIcons.ArrowUp width={15} height={15} />}
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.txName, { color: theme.colors.text.primary }]}>
              {displayName}
            </Text>
            <Text
              style={[
                styles.txSubtitle,
                { color: theme.colors.text.secondary },
              ]}
            >
              {isIncoming ? "Received" : "Paid"} • {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.txAmount, { color: amountColor }]}>
            {isIncoming ? "+" : "-"}
            {formatAmount(item.amount)} {item.currency}
          </Text>
          <Text
            style={[
              styles.txStatus,
              {
                color: isFailed
                  ? theme.colors.kycStatusLight.Rejected
                  : theme.colors.kycStatusDark.Verified,
              },
            ]}
          >
            {statusUpper.charAt(0) + statusUpper.slice(1).toLowerCase()}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer scrollable padding={0}>
        <HeaderTitle title="User Profile" leftIcon="true" />
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.button.primary.background}
          />
        </View>
      </ScreenContainer>
    );
  }

  if (!hasTargetUserId) {
    return (
      <ScreenContainer scrollable padding={0}>
        <HeaderTitle title="User Profile" leftIcon="true" />
        <View style={styles.centerContainer}>
          <Text style={{ color: theme.colors.text.primary }}>
            Unable to load profile: user id missing.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error || !response?.ok || !user) {
    return (
      <ScreenContainer scrollable padding={0}>
        <HeaderTitle title="User Profile" leftIcon="true" />
        <View style={styles.centerContainer}>
          <Text style={{ color: theme.colors.text.primary }}>
            {error ? "Failed to load user details" : "User not found"}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title="User Profile" leftIcon="true" />

      <View style={styles.contentContainer}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.border.light,
            },
          ]}
        >
          <View style={styles.profileHeader}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.palette.green200 },
                ]}
              >
                <CustomText
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: theme.colors.palette.green700,
                  }}
                >
                  {user.first_name?.charAt(0)?.toUpperCase()}
                  {user.last_name?.charAt(0)?.toUpperCase() || ""}
                </CustomText>
              </View>
            )}
            <View style={styles.profileInfo}>
              <CustomText
                style={[styles.name, { color: theme.colors.text.primary }]}
              >
                {user.first_name} {user.last_name}
              </CustomText>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(NAVIGATION_SCREENS.NEW_SEND, {
                  requested: false,
                  sender: user?.username,
                  preselectedAsset: params?.preselectedAsset,
                })
              }
              style={[
                styles.btn,
                styles.btnPrimary,
                { backgroundColor: theme.colors.button.primary.background },
              ]}
            >
              <SvgIcons.ArrowUp width={15} height={15} style={{ marginRight: 10 }} />
              <Text
                style={[
                  styles.btnText,
                  { color: theme.colors.button.primary.text },
                ]}
              >
                Pay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.border.light,
              marginTop: 16,
            },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Account Details
          </Text>

          <View
            style={[
              styles.detailRow,
              { borderBottomColor: theme.colors.border.light },
            ]}
          >
            <Text
              style={[styles.detailLabel, { color: theme.colors.text.primary }]}
            >
              Payairo Tag
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: theme.colors.text.secondary },
              ]}
            >
              {user.username}
            </Text>
          </View>
          <View
            style={[
              styles.detailRow,
              { borderBottomColor: theme.colors.border.light },
            ]}
          >
            <Text
              style={[styles.detailLabel, { color: theme.colors.text.primary }]}
            >
              Email
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: theme.colors.text.secondary },
              ]}
            >
              {user.email}
            </Text>
          </View>
          <View
            style={[
              styles.detailRow,
              { borderBottomColor: theme.colors.border.light },
            ]}
          >
            <Text
              style={[styles.detailLabel, { color: theme.colors.text.primary }]}
            >
              Phone Number
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: theme.colors.text.secondary },
              ]}
            >
              {getPhoneNumberDisplay()}
            </Text>
          </View>
          <View
            style={[
              styles.detailRow,
              { borderBottomColor: theme.colors.border.light },
            ]}
          >
            <Text
              style={[styles.detailLabel, { color: theme.colors.text.primary }]}
            >
              Account Status
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.colors.text.primary }]}
            >
              {user.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.border.light,
              marginTop: 16,
              paddingBottom: 0,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text.primary },
            ]}
          >
            Recent Transactions
          </Text>

          {transactions.slice(0, 5).map((item) => (
            <View key={String(item.id)}>
              {renderTransactionItem({ item })}
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontWeight: "600",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  txName: {
    fontSize: 14,
    fontWeight: "600",
  },
  txSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  txStatus: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default UserProfile;
