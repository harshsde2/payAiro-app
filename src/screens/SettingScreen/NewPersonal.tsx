import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Alert,
  Clipboard,
  ToastAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useTheme } from "styles/ThemeContext";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { KycMode, toKycMode } from "types/kyc";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import Share from "react-native-share";
import { useAppLock } from "hooks/useAppLock";
import ProfileHeader from "components/common-components/ProfileHeader/ProfileHeader";
import { ReceiveQRCard } from "components/common-components/ReceiveQRCard";
import type { IReceiveQRCardRef } from "components/common-components/ReceiveQRCard";
import { SvgIcons } from "constants/svgs";

const NewPersonal: React.FC = () => {
  const { theme } = useTheme();
  const customTheme = styles(theme);
  const { userData, usersMe, walletData, kycStatus } = useSelector(
    (s: any) => s.authenticationSlice
  );
  const navigation = useNavigation<any>();
  const { setNativeModalVisible } = useAppLock();
  const qrCardRef = useRef<IReceiveQRCardRef>(null);

  /** Same mapping as SettingScreen: FastAPI `/me` user + profile → ProfileHeader shape. */
  const profileWalletData = useMemo(() => {
    const u = userData || {};
    const profile = usersMe?.profile || {};
    const w = walletData || {};
    const name = u.first_name ?? u.name ?? w.name ?? "";
    const lastName = u.last_name ?? w.last_name ?? "";
    return {
      name,
      last_name: lastName,
      username: u.username ?? w.username ?? "",
      account_email: u.email ?? w.account_email ?? "",
      account_number: w.account_number,
      created_at: u.date_joined ?? w.created_at,
      profile_photo:
        profile.avatar_url ?? u.profile_photo ?? w.profile_photo ?? null,
    };
  }, [userData, usersMe, walletData]);

  const kycForMode = useMemo(() => {
    const st = usersMe?.kyc?.status;
    if (st != null && String(st).length > 0) {
      return { kyc_status: String(st) };
    }
    return kycStatus;
  }, [usersMe, kycStatus]);

  const mode = useMemo(() => toKycMode(kycForMode), [kycForMode]);

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else {
      Alert.alert(`${label} copied`);
    }
  };

  const handleShare = async (uri: string) => {
    try {
      await Share.open({
        title: "PayAiro QR Code",
        subject: "PayAiro QR Code",
        url: uri,
        type: "image/png",
        filename: `PayAiro_QR_${profileWalletData.username || "qr"}`,
        failOnCancel: false,
        message: `PayAiro Payment Details\n\n PayAiro Tag: ${profileWalletData.username}`,
      });
    } catch (err: any) {
      if (err?.message !== "User did not share") {
        console.log("Error sharing QR:", err);
      }
    }
  };

  const handleDownload = async (uri: string) => {
    try {
      await Share.open({
        title: "PayAiro QR Code",
        subject: "PayAiro QR Code",
        url: uri,
        type: "image/png",
        filename: `PayAiro_QR_${profileWalletData.username || "qr"}`,
        failOnCancel: false,
        saveToFiles: true,
      });
    } catch (err: any) {
      if (err?.message !== "User did not share") {
        console.log("Error downloading QR:", err);
      }
    }
  };

  const getKycBadgeStatus = (kycMode: KycMode) => {
    switch (kycMode) {
      case "approved":
        return "Verified";
      case "pending":
      case "not_started":
      case "unknown":
        return "Pending";
      case "expired":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom",'top']}
      scrollable
      padding={0}
      contentStyle={customTheme.scrollContent}
    >
      <ProfileHeader
        walletData={profileWalletData}
        kycStep={null}
        kycBadgeStatus={getKycBadgeStatus(mode)}
        kycMode={mode}
        showKycButton={false}
        onProfilePress={() =>
          navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)
        }
        onQrPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)}
        showQrButton={false}
        showCameraButton={false}
      />
      <View style={customTheme.whiteSheetContainer}>
        <ReceiveQRCard
          ref={qrCardRef}
          title="PayAiro"
          subtitle="Primary account for receiving funds"
          qrValue={{
            type: "receive",
            username: profileWalletData.username,
            tag: profileWalletData.username,
          }}
          payAiroTag={profileWalletData.username || "N/A"}
          onCopyTag={() =>
            copyToClipboard(profileWalletData.username || "", "PayAiro Tag")
          }
          leftButton={{
            text: "Download",
            icon: (
              <SvgIcons.DownloadBlack width={20} height={20} color="white" />
            ),
            onPress: () => qrCardRef.current?.capture(handleDownload),
          }}
          rightButton={{
            text: "Share",
            icon: (
              <SvgIcons.ShareIcon width={20} height={20} color="white" />
            ),
            onPress: () => qrCardRef.current?.capture(handleShare),
          }}
          onBeforeCapture={() => setNativeModalVisible(true)}
          onAfterCapture={() => {
            setTimeout(() => setNativeModalVisible(false), 1000);
          }}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    whiteSheetContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme.spacing.spacing[8],
      borderTopStartRadius: theme.spacing.spacing[8],
      padding: theme.spacing.spacing[5],
    },
  });

export default NewPersonal;
