import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ToastAndroid,
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

const ReferralScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = customStyles(theme);
  const { walletData } = useSelectorAction() as any;

  // Get referral code from username
  const referralCode = walletData?.username || "";
  const referralLink = `https://payairo.app/ref/${referralCode}`;
  const deepLink = `payairo://ref/${referralCode}`;

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

    const shareMessage = `Join PayAiro using my referral code: ${referralCode} to get $5 when you make your first transaction\n\n Download the app: ${referralLink}`;

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
          
          icon={<SvgIcons.ShareIcon width={20} height={20} />}
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
      </View>
    </ScreenContainer>
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
  });

export default ReferralScreen;
