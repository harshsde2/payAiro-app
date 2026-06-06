import React, { useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Alert,
  Clipboard,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme as useNewTheme } from "@new-ui/styles/ThemeContext";
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
import DashboardSection from "tsx-components/DashboardSection";
import { usePaymentMethodsList } from "query/hooks/usePaymentMethods";
import {
  filterDebitCards,
  formatCardLabel,
  formatExpiry,
  PAYMENT_METHODS_EMPTY_MESSAGE,
} from "@new-ui/screens/PaymentMethods/paymentMethods.utils";

function formatProfilePhone(
  sources: Record<string, unknown> | null | undefined,
  wallet: Record<string, unknown> | null | undefined
): string | null {
  const national = String(
    sources?.phone_national_number ??
      sources?.phone ??
      sources?.mobile ??
      wallet?.mobile_number ??
      wallet?.phone_national_number ??
      ""
  ).replace(/\D/g, "");
  if (!national) return null;

  const countryCode =
    String(sources?.phone_country_code ?? "1").replace(/\D/g, "") || "1";

  if (national.length === 10) {
    return `+${countryCode} (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  }
  if (national.length === 11 && national.startsWith("1")) {
    return `+1 (${national.slice(1, 4)}) ${national.slice(4, 7)}-${national.slice(7)}`;
  }
  return `+${countryCode} ${national}`;
}

const NewPersonal: React.FC = () => {
  const { theme } = useTheme();
  const { theme: newTheme } = useNewTheme();
  const customTheme = styles(theme);
  const { userData, usersMe, walletData, kycStatus } = useSelector(
    (s: any) => s.authenticationSlice
  );
  const navigation = useNavigation<any>();
  const { setNativeModalVisible } = useAppLock();
  const qrCardRef = useRef<IReceiveQRCardRef>(null);

  /** Same mapping as SettingScreen: FastAPI `/me` user + profile → ProfileHeader shape. */
  const profileWalletData = useMemo(() => {
    const u = { ...(usersMe?.user || {}), ...(userData || {}) };
    const legal = usersMe?.legal_identity || {};
    const profile = usersMe?.profile || {};
    const w = walletData || {};
    const me = (usersMe || {}) as Record<string, unknown>;
    const name = u.first_name ?? u.name ?? w.name ?? "";
    const lastName = u.last_name ?? w.last_name ?? "";
    const phoneSources = {
      phone_national_number:
        legal.phone_national_number ??
        u.phone_national_number ??
        me.phone_national_number,
      phone_country_code:
        legal.phone_country_code ?? u.phone_country_code ?? me.phone_country_code,
      phone: u.phone ?? legal.phone,
      mobile: u.mobile ?? legal.mobile,
    };
    return {
      name,
      last_name: lastName,
      username: u.username ?? w.username ?? "",
      account_email: u.email ?? w.account_email ?? "",
      account_number: w.account_number,
      mobile_number: formatProfilePhone(phoneSources, w),
      created_at: u.date_joined ?? w.created_at,
      profile_photo:
        profile.avatar_url ?? u.profile_photo ?? w.profile_photo ?? null,
    };
  }, [userData, usersMe, walletData]);

  const mobileNumber = profileWalletData.mobile_number;

  const { data: paymentMethodsData, isPending: isPaymentMethodsLoading } =
    usePaymentMethodsList(20);

  const debitCards = useMemo(
    () => filterDebitCards(paymentMethodsData?.data?.items),
    [paymentMethodsData]
  );

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
        showKycBadge={false}
        onProfilePress={() =>
          navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)
        }
        onQrPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)}
        showQrButton={false}
        showCameraButton={false}
      />
      <View style={customTheme.whiteSheetContainer}>
        {mobileNumber ? (
          <View style={customTheme.profileInfoRow}>
            <View style={customTheme.profileInfoText}>
              <CustomText variant="caption" color={newTheme.colors.textSecondary}>
                Mobile number
              </CustomText>
              <CustomText variant="body" fontWeight="semiBold">
                {mobileNumber}
              </CustomText>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(mobileNumber, "Mobile number")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <SvgIcons.CopyOutlineBlack width={20} height={20} />
            </TouchableOpacity>
          </View>
        ) : null}

        <DashboardSection
          title="Payment Methods"
          titleStyle={{ fontSize: 16 }}
          style={customTheme.paymentMethodsSection}
        >
          {isPaymentMethodsLoading ? (
            <View style={customTheme.profileInfoRow}>
              <View style={customTheme.profileInfoText}>
                <CustomText variant="body" color={newTheme.colors.textSecondary}>
                  Loading…
                </CustomText>
              </View>
            </View>
          ) : debitCards.length === 0 ? (
            <View style={customTheme.profileInfoRow}>
              <View style={customTheme.profileInfoText}>
                <CustomText variant="body" color={newTheme.colors.textSecondary}>
                  {PAYMENT_METHODS_EMPTY_MESSAGE}
                </CustomText>
              </View>
            </View>
          ) : (
            debitCards.map((card) => {
              const cardLabel = formatCardLabel(card);
              const expiry = formatExpiry(card);
              return (
                <View key={card.payment_method_id} style={customTheme.profileInfoRow}>
                  <View style={customTheme.profileInfoText}>
                    <CustomText variant="caption" color={newTheme.colors.textSecondary}>
                      Debit card
                    </CustomText>
                    <CustomText variant="body" fontWeight="semiBold">
                      {cardLabel}
                    </CustomText>
                    {expiry ? (
                      <CustomText variant="caption" color={newTheme.colors.textSecondary}>
                        Expires {expiry}
                      </CustomText>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(cardLabel, "Debit card")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <SvgIcons.CopyOutlineBlack width={20} height={20} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </DashboardSection>

        <ReceiveQRCard
          ref={qrCardRef}
          title="PayAiro"
          subtitle="Scan this QR code to receive funds"
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
    profileInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.spacing[4],
      paddingVertical: theme.spacing.spacing[3],
      paddingHorizontal: theme.spacing.spacing[3],
      borderRadius: theme.spacing.spacing[3],
      backgroundColor: theme.colors.palette.grey50 ?? "#F5F5F5",
    },
    profileInfoText: {
      flex: 1,
      marginRight: theme.spacing.spacing[3],
      gap: 4,
    },
    paymentMethodsSection: {
      marginTop: theme.spacing.spacing[2],
    },
  });

export default NewPersonal;
