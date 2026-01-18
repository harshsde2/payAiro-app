import React, { FC } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { SvgIcons } from "constants/svgs";
import Fonts from "constants/Fonts";
import KYCBadge from "tsx-components/KYCBadge";
import moment from "moment";
import type { IProfileHeaderProps } from "./types";

const IMAGE_BASE_URL = "https://app.payairo.com";

const ProfileHeader: FC<IProfileHeaderProps> = ({
  walletData,
  kycStep,
  kycBadgeStatus,
  kycMode,
  onStartKyc,
  isKycPending,
  onProfilePress,
  onQrPress,
  containerStyle,
  imageBaseUrl = IMAGE_BASE_URL,
  showKycButton: showKycButtonProp,
}) => {
  const { theme } = useTheme();
  const styles = getStyles();

  const showKycButton =
    showKycButtonProp !== false && kycMode === "not_started";

  const profileImageUri = kycStep?.selfimage
    ? kycStep.selfimage.includes(imageBaseUrl)
      ? kycStep.selfimage
      : `${imageBaseUrl}${kycStep.selfimage}`
    : null;

  const displayName =
    `${walletData?.name || ""} ${walletData?.last_name || ""}`.trim() || "User";
  const memberSince = walletData?.created_at
    ? moment(walletData.created_at).format("MMM YYYY")
    : "Jan 2025";

  return (
    <View
      style={[
        styles.profileHeaderContainer,
        { backgroundColor: theme.colors.palette.green50 },
        containerStyle,
      ]}
    >
      <View style={styles.profileContentRow}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureContainer}>
          <TouchableOpacity
            onPress={onProfilePress}
            disabled={true}
            style={[
              styles.squircleContainer,
              { backgroundColor: theme.colors.palette.green200 },
            ]}
          >
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.profileInitials}>
                {walletData?.name?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.kycBadgeContainer}>
            <KYCBadge status={kycBadgeStatus} />
          </View>
        </View>

        {/* User Information Section */}
        <View style={styles.userInfoContainer}>
          <CustomText variant="h2" fontWeight="semiBold">
            {displayName}
          </CustomText>
          <CustomText variant="caption" fontWeight="medium">
            {walletData?.username || "N/A"}
          </CustomText>
          <CustomText variant="caption" fontWeight="medium">
            Member since . {memberSince}
          </CustomText>
        </View>

        {/* QR Code Icon */}
        <TouchableOpacity onPress={onQrPress} style={styles.qrCodeContainer}>
          <SvgIcons.NewQRCode width={39} height={39} />
        </TouchableOpacity>
      </View>

      {/* KYC Button */}
      {showKycButton && (
        <View style={[styles.kycButtonContainer, { marginTop: 16 }]}>
          <TouchableOpacity
            style={[
              styles.kycButton,
              { backgroundColor: theme.colors.palette.green600 },
              isKycPending && { opacity: 0.6 },
            ]}
            onPress={onStartKyc}
            disabled={isKycPending}
          >
            <CustomText
              variant="body1"
              fontWeight="semiBold"
              style={styles.kycButtonText}
            >
              {isKycPending ? "Starting KYC..." : "Complete your KYC"}
            </CustomText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ProfileHeader;

const getStyles = () =>
  StyleSheet.create({
    profileHeaderContainer: {
      marginHorizontal: 15,
      marginBottom: 10,
      marginTop: 10,
      paddingVertical: 20,
      paddingHorizontal: 15,
      borderRadius: 16,
    },
    profileContentRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    profilePictureContainer: {
      alignItems: "flex-start",
    },
    squircleContainer: {
      width: 90,
      height: 90,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: "#C8EAD2",
    },
    profileImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    profileInitials: {
      color: "#000",
      fontSize: 36,
      fontFamily: Fonts.semibold,
    },
    kycBadgeContainer: {
      marginTop: 10,
      alignItems: "flex-start",
    },
    userInfoContainer: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "flex-start",
      paddingTop: 4,
      gap: 4,
    },
    qrCodeContainer: {
      justifyContent: "flex-start",
      alignItems: "center",
      marginLeft: 12,
      paddingTop: 4,
    },
    kycButtonContainer: {
      width: "100%",
      marginTop: 16,
    },
    kycButton: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    kycButtonText: {
      color: "#FFFFFF",
    },
  });
