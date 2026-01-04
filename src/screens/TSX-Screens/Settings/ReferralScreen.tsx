import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ToastAndroid,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { Theme, useTheme } from "styles";
import HeaderTitle from "components/HeaderTitle";
import { CustomText } from "tsx-components";
import GenericButton from "components/GenericButton";
import useSelectorAction from "hooks/useSelectorAction";
import { SvgIcons } from "constants/svgs";
import Share from "react-native-share";
import { Clipboard } from "react-native";
import { showSuccess, showError } from "utils/toast";
import { useReferralData } from "query/hooks/useReferral";
import { IReferredUser } from "./types";

const ReferralScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = customStyles(theme);
  const { walletData } = useSelectorAction() as any;

  // Fetch referral data
  const {
    data: referralResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useReferralData();

  // Get referral data
  const referralData = referralResponse?.data;
  const statistics = referralData?.referral_statistics;
  const referredUsers = referralData?.referred_users_list || [];

  // Get referral code from username
  const referralCode = walletData?.username || "";
  // Use https:// link - clickable in WhatsApp, iMessage, etc.
  // For this to open the app directly, Universal Links must be configured on server
  const referralLink = `https://payairo.com/ref/${referralCode}`;

  // Handle API errors
  useEffect(() => {
    if (isError) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Failed to load referral data. Please try again.";
      showError(errorMessage);
    }
  }, [isError, error]);

  const handleCopyCode = () => {
    if (!referralCode) {
      showError("Referral code not available");
      return;
    }
    Clipboard.setString(referralCode);
    if (Platform.OS === "android") {
      ToastAndroid.show("Referral code copied!", ToastAndroid.SHORT);
    } else {
      showSuccess("Referral code copied to clipboard!");
    }
  };

  const handleCopyLink = () => {
    if (!referralLink) {
      showError("Referral link not available");
      return;
    }
    Clipboard.setString(referralLink);
    if (Platform.OS === "android") {
      ToastAndroid.show("Referral link copied!", ToastAndroid.SHORT);
    } else {
      showSuccess("Referral link copied to clipboard!");
    }
  };

  const handleShare = async () => {
    if (!referralCode) {
      showError("Referral code not available");
      return;
    }

    // Share message with clickable link and referral code
    const shareMessage = `🎉 Join PayAiro and get $5 when you make your first transaction!\n\n📱 Download the app: ${referralLink}\n\n🎁 Use my referral code during signup: ${referralCode}`;

    try {
      const shareOptions = {
        message: shareMessage,
        title: "Invite to PayAiro",
      };

      await Share.open(shareOptions);
    } catch (error: any) {
      // User cancelled or error occurred
      if (
        error?.message?.toLowerCase().includes("user did not share") ||
        error?.message === "User did not share"
      ) {
        // User cancelled, do nothing
        return;
      }
      console.log("Share error:", error);
      showError("Failed to share referral link");
    }
  };

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <HeaderTitle title="Referrals" leftIcon="true" />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <CustomText
            variant="h2"
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.title}
          >
            Invite Friends, Earn Rewards $5
          </CustomText>
          <CustomText
            variant="body2"
            style={styles.subtitle}
            color={theme.colors.text.secondary}
          >
            Share your referral code with friends and earn rewards when they
            sign up!
          </CustomText>
        </View>

        {/* Referral Code Section */}
        <View style={styles.codeSection}>
          <CustomText
            variant="body2"
            style={styles.label}
            color={theme.colors.text.secondary}
          >
            Your Referral Code
          </CustomText>
          <View style={styles.codeContainer}>
            <CustomText
              variant="h3"
              fontFamily={theme.typography.fontFamily.montserratBold}
              style={styles.codeText}
            >
              {referralCode || "Not Available"}
            </CustomText>
            <TouchableOpacity
              onPress={handleCopyCode}
              style={styles.copyButton}
              disabled={!referralCode}
            >
              <SvgIcons.Copy width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Referral Link Section */}
        <View style={styles.linkSection}>
          <CustomText
            variant="body2"
            style={styles.label}
            color={theme.colors.text.secondary}
          >
            Share Link
          </CustomText>
          <View style={styles.linkContainer}>
            <CustomText
              variant="body2"
              style={styles.linkText}
              numberOfLines={1}
            >
              {referralLink}
            </CustomText>
            <TouchableOpacity
              onPress={handleCopyLink}
              style={styles.copyButton}
              disabled={!referralCode}
            >
              <SvgIcons.Copy width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Button */}
        <GenericButton
          title="Share Referral Link"
          onPress={handleShare}
          cStyle={styles.shareButton}
          disabled={!referralCode}
          
          IconComponent={<SvgIcons.ShareWhiteIcon width={20} height={20} color={theme.colors.palette.white} style={{ marginLeft: 10 }} />}
        />

        {/* Info Section */}
        <View style={styles.infoSection}>
          <SvgIcons.InfoNote />
          <CustomText
            variant="caption"
            style={styles.infoText}
            color={theme.colors.text.secondary}
          >
            When your friends sign up using your referral code and make their first transaction, you'll both earn
            $5!
          </CustomText>
        </View>

        {/* Statistics Section */}
        {statistics && (
          <View style={styles.statisticsSection}>
            <CustomText
              variant="h3"
              fontFamily={theme.typography.fontFamily.montserratBold}
              style={styles.sectionTitle}
            >
              Your Referral Stats
            </CustomText>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <CustomText
                  variant="h2"
                  fontFamily={theme.typography.fontFamily.montserratBold}
                  color={theme.colors.palette.green600}
                >
                  {statistics.total_referred_users}
                </CustomText>
                <CustomText
                  variant="caption"
                  color={theme.colors.text.secondary}
                  style={styles.statLabel}
                >
                  Total Referrals
                </CustomText>
              </View>
              <View style={styles.statCard}>
                <CustomText
                  variant="h2"
                  fontFamily={theme.typography.fontFamily.montserratBold}
                  color={theme.colors.palette.green600}
                >
                  ${statistics.total_referral_amount_earned.toFixed(2)}
                </CustomText>
                <CustomText
                  variant="caption"
                  color={theme.colors.text.secondary}
                  style={styles.statLabel}
                >
                  Total Earned
                </CustomText>
              </View>
            </View>
            {statistics.total_referral_amount_pending > 0 && (
              <View style={styles.pendingCard}>
                <CustomText
                  variant="body2"
                  color={theme.colors.text.secondary}
                >
                  Pending: ${statistics.total_referral_amount_pending.toFixed(2)}
                </CustomText>
              </View>
            )}
          </View>
        )}

        {/* Referred Users List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.palette.green600}
            />
            <CustomText
              variant="body2"
              color={theme.colors.text.secondary}
              style={styles.loadingText}
            >
              Loading referral data...
            </CustomText>
          </View>
        ) : referredUsers.length > 0 ? (
          <View style={styles.referredUsersSection}>
            <CustomText
              variant="h3"
              fontFamily={theme.typography.fontFamily.montserratBold}
              style={styles.sectionTitle}
            >
              Referred Users ({referredUsers.length})
            </CustomText>
            <FlatList
              data={referredUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ReferredUserCard user={item} />}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : !isLoading ? (
          <View style={styles.emptyContainer}>
            <CustomText
              variant="body2"
              color={theme.colors.text.secondary}
              style={styles.emptyText}
            >
              No referrals yet. Share your code to start earning!
            </CustomText>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

// Referred User Card Component
const ReferredUserCard: React.FC<{ user: IReferredUser }> = ({ user }) => {
  const { theme } = useTheme();
  const styles = cardStyles(theme);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = () => {
    if (user.status === "completed") {
      return theme.colors.palette.green600;
    }
    return theme.colors.palette.yellow600;
  };

  const getStatusBgColor = () => {
    if (user.status === "completed") {
      return theme.colors.palette.green50;
    }
    return theme.colors.palette.yellow100;
  };

  const getInitials = () => {
    const name = user.name || user.username || user.email;
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <CustomText
            variant="subtitle2"
            fontFamily={theme.typography.fontFamily.montserratBold}
            color={theme.colors.palette.white}
          >
            {getInitials()}
          </CustomText>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <CustomText
            variant="subtitle2"
            fontFamily={theme.typography.fontFamily.montserratSemiBold}
            style={styles.userName}
            numberOfLines={1}
          >
            {user.name || user.username || user.email}
          </CustomText>
          <CustomText
            variant="caption"
            color={theme.colors.text.tertiary}
            numberOfLines={1}
          >
            {user.email}
          </CustomText>
          <CustomText
            variant="caption"
            color={theme.colors.text.tertiary}
            style={styles.dateText}
          >
            Joined: {formatDate(user.created_at)}
          </CustomText>
        </View>

        {/* Status and Amount */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBgColor() },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor() },
              ]}
            />
            <CustomText
              variant="caption"
              fontFamily={theme.typography.fontFamily.montserratSemiBold}
              style={[styles.statusText, { color: getStatusColor() }]}
            >
              {user.status === "completed" ? "Completed" : "Pending"}
            </CustomText>
          </View>
          {user.referral_amount_earned > 0 && (
            <CustomText
              variant="subtitle2"
              fontFamily={theme.typography.fontFamily.montserratBold}
              color={theme.colors.palette.green600}
              style={styles.amountText}
            >
              +${user.referral_amount_earned.toFixed(2)}
            </CustomText>
          )}
        </View>
      </View>
    </View>
  );
};

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: 20,
      marginTop: 20,
    },
    headerSection: {
      marginBottom: 30,
    },
    title: {
      marginBottom: 10,
      color: theme.colors.text.primary,
    },
    subtitle: {
      lineHeight: 22,
    },
    codeSection: {
      marginBottom: 25,
    },
    linkSection: {
      marginBottom: 30,
    },
    label: {
      marginBottom: 10,
      fontFamily: theme.typography.fontFamily.montserratSemiBold,
    },
    codeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.palette.grey100,
      borderRadius: 30,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300,
    },
    linkContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.palette.grey100,
      borderRadius: 30,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300,
    },
    codeText: {
      flex: 1,
      color: theme.colors.text.primary,
      letterSpacing: 1,
    },
    linkText: {
      flex: 1,
      color: theme.colors.text.primary,
      marginRight: 10,
    },
    copyButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.palette.black,
    },
    shareButton: {
      marginTop: 10,
      marginBottom: 20,
    },
    infoSection: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: theme.colors.palette.grey50,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    infoText: {
      flex: 1,
      lineHeight: 20,
    },
    statisticsSection: {
      marginTop: 30,
      marginBottom: 25,
    },
    sectionTitle: {
      marginBottom: 16,
      color: theme.colors.text.primary,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.palette.green50,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.palette.green100,
    },
    statLabel: {
      marginTop: 8,
      textAlign: "center",
    },
    pendingCard: {
      backgroundColor: theme.colors.palette.yellow100,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
    },
    referredUsersSection: {
      marginTop: 20,
    },
    loadingContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 12,
    },
    emptyContainer: {
      padding: 40,
      alignItems: "center",
    },
    emptyText: {
      textAlign: "center",
    },
  });

const cardStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200,
      shadowColor: theme.colors.palette.black,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    cardContent: {
      flexDirection: "row",
      padding: 16,
      alignItems: "center",
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.palette.green600,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
      marginRight: 12,
    },
    userName: {
      marginBottom: 4,
      color: theme.colors.text.primary,
    },
    dateText: {
      marginTop: 4,
    },
    statusContainer: {
      alignItems: "flex-end",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      marginBottom: 8,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    statusText: {
      fontSize: 11,
      textTransform: "capitalize",
    },
    amountText: {
      marginTop: 4,
    },
  });

export default ReferralScreen;
