import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserDetails } from "query/hooks/useUserDetails";
import { useTheme } from "styles/ThemeContext";
import moment from "moment";
import { UserTransaction } from "./types";
import { CustomText } from "tsx-components";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const UserProfile = () => {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  // Expecting userDetails to have at least username or identifier
  const params = route.params as {
    userDetails: { username?: string; identifier?: string };
  };
  const username =
    params?.userDetails?.username || params?.userDetails?.identifier || "";

  const { data: response, isLoading, error } = useUserDetails(username);

  // The API returns nested data: response.data.data.user / response.data.data.latest_transactions
  const user = response?.data?.data?.user;
  const transactions = response?.data?.data?.latest_transactions || [];

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD");
  };

  const renderTransactionItem = ({ item }: { item: UserTransaction }) => {
    const isIncoming = item.direction === "incoming";
    const isSuccess = item.status === "success";
    const isFailed = item.status === "failed";

    // Determine display name
    const displayName = isIncoming
      ? item.sender?.username || item.display_party?.username || "Unknown"
      : item.recipient?.username || item.display_party?.username || "Unknown";

    // Amount color
    let amountColor = theme.colors.text.primary;
    if (isFailed) amountColor = theme.colors.kycStatusLight.Rejected; // Redish
    else if (isIncoming) amountColor = theme.colors.kycStatusDark.Verified; // Greenish

    // Icon (Simple placeholder circle with initial or arrow)
    const iconColor = isIncoming
      ? theme.colors.button.primary.background
      : theme.colors.button.primary.background;

    return (
      <View
        style={[
          styles.transactionItem,
          { borderBottomColor: theme.colors.border.light },
        ]}
      >
        <View style={styles.transactionLeft}>
          {/* Icon Placeholder */}
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
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {isFailed ? "X" : isIncoming ? "↓" : "↑"}
            </Text>
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
              {isIncoming ? "Received" : "Paid"} • {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.txAmount, { color: amountColor }]}>
            {item.currency_symbol}
            {item.amount}
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
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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

  if (error || !user) {
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
        {/* Profile Card */}
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
            {user.profile_photo ? (
              <Image
                source={{ uri: user.profile_photo }}
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
                  {user.last_name?.charAt(0)?.toUpperCase()}
                </CustomText>
              </View>
            )}
            <View style={styles.profileInfo}>
              <CustomText
                style={[styles.name, { color: theme.colors.text.primary }]}
              >
                {user.first_name} {user.last_name}
              </CustomText>
              {/* <CustomText style={[styles.username, { color: theme.colors.text.secondary }]}>@{user.username}</CustomText>
                        <CustomText style={[styles.email, { color: theme.colors.text.secondary }]}>{user.email}</CustomText> */}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(NAVIGATION_SCREENS.SEND, {
                  requested: false,
                  sender: user?.username,
                })
              }
              style={[
                styles.btn,
                styles.btnPrimary,
                { backgroundColor: theme.colors.button.primary.background },
              ]}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: theme.colors.button.primary.text },
                ]}
              >
                ↑ Pay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(NAVIGATION_SCREENS.SEND, {
                  requested: true,
                  type: "requested",
                  sender: user?.username,
                })
              }
              style={[
                styles.btn,
                styles.btnSecondary,
                { backgroundColor: theme.colors.background.tertiary },
              ]}
            >
              <Text
                style={[styles.btnText, { color: theme.colors.text.primary }]}
              >
                ↓ Request
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Details */}
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
              Account Status
            </Text>
            <Text
              style={[styles.detailValue, { color: theme.colors.text.primary }]}
            >
              Active
            </Text>
          </View>
          {/* <View style={[styles.detailRow, { borderBottomColor: 'transparent' }]}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text.primary }]}>KYC Status</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.kycStatusLight.Verified }]}>Verified</Text>
                </View> */}
        </View>

        {/* Recent Transactions */}
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

          {transactions.map((item) => (
            <View key={item.transaction_id}>
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
    // flexDirection: 'row',
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
  username: {
    fontSize: 14,
    marginTop: 2,
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 12,
    marginTop: 4,
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
  btnPrimary: {},
  btnSecondary: {},
  btnText: {
    fontWeight: "600",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
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
