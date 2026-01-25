import React, { useMemo, useRef, useState } from "react";
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
import { useTheme } from "../../styles/ThemeContext";
import HeaderTitle from "../../components/HeaderTitle";
import { ScreenContainer } from "../../HOC";
import useSelectorAction from "../../hooks/useSelectorAction";
import { KycMode, toKycMode } from "../../types/kyc";
import { NAVIGATION_SCREENS } from "../../navigations/navigationConstants";
import Share from "react-native-share";
import { useAppLock } from "../../hooks/useAppLock";
import ProfileHeader from "components/common-components/ProfileHeader/ProfileHeader";
import { ReceiveQRCard } from "components/common-components/ReceiveQRCard";
import type { IReceiveQRCardRef } from "components/common-components/ReceiveQRCard";
import { SvgIcons } from "constants/svgs";

interface IKycStep {
  mobile_number?: string;
  address2?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  selfimage?: string;
}

const NewPersonal: React.FC = () => {
  const { theme } = useTheme();
  const customTheme = styles(theme);
  const { walletData } = useSelectorAction() as any;
  const navigation = useNavigation<any>();
  const { setNativeModalVisible } = useAppLock();
  const qrCardRef = useRef<IReceiveQRCardRef>(null);

  const kycStatus = useSelector((s: any) => s.authenticationSlice?.kycStatus);
  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);

  const [kycStep, setKycStep] = useState("");

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
        filename: `PayAiro_QR_${walletData?.username || "qr"}`,
        failOnCancel: false,
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
        filename: `PayAiro_QR_${walletData?.username || "qr"}`,
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
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle
        title="Personal"
        leftIcon="true"
      />
      <View style={customTheme.container}>
        <ProfileHeader
          walletData={walletData}
          kycStep={kycStep as IKycStep}
          kycBadgeStatus={getKycBadgeStatus(mode)}
          kycMode={mode}
          showKycButton={false}
          onProfilePress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)}
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
              username: walletData?.username,
              tag: walletData?.username,
            }}
            payAiroTag={walletData?.username || "N/A"}
            onCopyTag={() =>
              copyToClipboard(walletData?.username || "", "PayAiro Tag")
            }
            leftButton={{
              text: "Download",
              icon: <SvgIcons.DownloadBlack width={20} height={20} />,
              onPress: () => qrCardRef.current?.capture(handleDownload),
            }}
            rightButton={{
              text: "Share",
              icon: <SvgIcons.ShareIcon width={20} height={20} />,
              onPress: () => qrCardRef.current?.capture(handleShare),
            }}
            onBeforeCapture={() => setNativeModalVisible(true)}
            onAfterCapture={() => {
              setTimeout(() => setNativeModalVisible(false), 1000);
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    whiteSheetContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: theme.spacing.spacing[8],
      borderTopStartRadius: theme.spacing.spacing[8],
      padding: theme.spacing.spacing[5],
      // marginTop: theme.spacing.spacing[5],
    },
  });

export default NewPersonal;
