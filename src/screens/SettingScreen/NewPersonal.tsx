import React, { useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme as useNewTheme } from "@new-ui/styles/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { useTheme } from "styles/ThemeContext";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { AppIcon } from "@new-ui/assets/svgs";
import { ReceiveQRSheet } from "@new-ui/components/common-components/ReceiveQRSheet";
import type { IReceiveQRSheetRef } from "@new-ui/components/common-components/ReceiveQRSheet";
import { Button } from "@new-ui/components/common-components/layout";
import { performAppLogout } from "utils/performAppLogout";

type AppRouteName = (typeof NAVIGATION_SCREENS)[keyof typeof NAVIGATION_SCREENS];

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

const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  let initials = parts[0].charAt(0).toUpperCase();
  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0).toUpperCase();
  }
  return initials;
};

const NewPersonal: React.FC = () => {
  const { theme } = useTheme();
  const { theme: newTheme } = useNewTheme();
  const customTheme = styles(theme, newTheme);
  const { userData, usersMe, walletData } = useSelector(
    (s: any) => s.authenticationSlice
  );
  const navigation = useNavigation<any>();
  // The tab bar floats (position: absolute); reserve space so the last menu row
  // (Logout) clears it and the list can actually scroll to it.
  // This screen is also pushed on AppStack (from the dashboard profile icon/kebab),
  // where there is no tab bar — read the context directly so it returns undefined
  // instead of throwing, and fall back to 0.
  const tabBarHeight = React.useContext(BottomTabBarHeightContext) ?? 0;
  const receiveSheetRef = useRef<IReceiveQRSheetRef>(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /** Same mapping as SettingScreen: FastAPI `/me` user + profile → profile fields. */
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
      profile_photo:
        profile.avatar_url ?? u.profile_photo ?? w.profile_photo ?? null,
    };
  }, [userData, usersMe, walletData]);

  const displayName =
    `${profileWalletData.name || ""} ${profileWalletData.last_name || ""}`.trim() ||
    "User";

  const rawProfilePhoto = profileWalletData.profile_photo;
  const profilePhotoUri =
    rawProfilePhoto && typeof rawProfilePhoto === "string" && rawProfilePhoto.trim() !== ""
      ? rawProfilePhoto.replace(/^http:\/\//i, "https://")
      : null;

  const menuItems = useMemo(
    () => [
      {
        key: "payment",
        label: "Payment method",
        icon: <AppIcon.Profile_PaymentMethod width={22} height={22} />,
        route: NAVIGATION_SCREENS.PAYMENT_METHODS_SCREEN as AppRouteName,
      },
      {
        key: "transactionLimit",
        label: "Transaction limit",
        icon: <AppIcon.Profile_Transaction width={22} height={22} />,
        route: NAVIGATION_SCREENS.TRANSACTION_LIMIT_SCREEN as AppRouteName,
      },
      {
        key: "rewards",
        label: "Rewards and Referrals",
        icon: <AppIcon.Profile_Rewards width={22} height={22} />,
        route: NAVIGATION_SCREENS.NEW_REWARDS_AND_REFERRALS_SCREEN as AppRouteName,
      },
      {
        key: "bankStatement",
        label: "Bank Statement",
        icon: <AppIcon.Profile_Bankstatement width={22} height={22} />,
        route: NAVIGATION_SCREENS.NEW_BANK_STATEMENT_SCREEN as AppRouteName,
      },
      {
        key: "settings",
        label: "Settings",
        icon: <AppIcon.Profile_Settings width={22} height={22} />,
        route: NAVIGATION_SCREENS.NEW_SETTINGS_SCREEN as AppRouteName,
      },
      {
        key: "support",
        label: "Support",
        icon: <AppIcon.Headphones width={22} height={22} />,
        route: NAVIGATION_SCREENS.SUPPORT_SCREEN as AppRouteName,
      },
    ],
    []
  );

  const openQrSheet = () => receiveSheetRef.current?.open();

  const handleMenuPress = (route: AppRouteName) => {
    if (route) navigation.navigate(route);
  };

  const handleLogoutConfirm = async () => {
    try {
      await performAppLogout();
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["top", "bottom"]}
      scrollable
      padding={0}
      contentStyle={customTheme.scrollContent}
    >
      {/* Header (matches CustomHeader layout) */}
      <View style={customTheme.headerGreen}>
        <View style={customTheme.header}>
          {navigation.canGoBack() ? (
            <TouchableOpacity
              style={customTheme.headerSide}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <AppIcon.ArrowLeft width={24} height={24} />
            </TouchableOpacity>
          ) : (
            <View style={customTheme.headerSide} />
          )}

          <View style={customTheme.headerTitle}>
            <CustomText variant="h4" fontWeight="bold" numberOfLines={1}>
              Profile
            </CustomText>
          </View>

          <TouchableOpacity
            style={customTheme.headerSide}
            onPress={openQrSheet}
            activeOpacity={0.7}
          >
            <AppIcon.QrCode width={24} height={24} color={newTheme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={customTheme.hero}>
          <View style={customTheme.avatar}>
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={customTheme.avatarImage} />
            ) : (
              <CustomText style={customTheme.avatarText}>
                {getInitials(displayName)}
              </CustomText>
            )}
          </View>
          <CustomText variant="h3" fontWeight="bold" style={customTheme.name}>
            {displayName}
          </CustomText>
          {profileWalletData.account_email ? (
            <CustomText variant="caption" color={newTheme.colors.textSecondary}>
              {profileWalletData.account_email}
            </CustomText>
          ) : null}
          {profileWalletData.mobile_number ? (
            <CustomText variant="caption" color={newTheme.colors.textSecondary}>
              {profileWalletData.mobile_number}
            </CustomText>
          ) : null}
        </View>
      </View>

      {/* Menu list */}
      <View
        style={[
          customTheme.sheet,
          { paddingBottom: tabBarHeight + theme.spacing.spacing[4] },
        ]}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={customTheme.row}
            activeOpacity={0.7}
            onPress={() => handleMenuPress(item.route)}
          >
            <View style={customTheme.rowLeft}>
              {item.icon}
              <CustomText variant="body" fontWeight="semiBold" style={customTheme.rowLabel}>
                {item.label}
              </CustomText>
            </View>
            <AppIcon.ChevronRight width={18} height={18} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={customTheme.row}
          activeOpacity={0.7}
          onPress={() => setShowLogoutConfirm(true)}
        >
          <View style={customTheme.rowLeft}>
            <AppIcon.Profile_Logout width={22} height={22} />
            <CustomText variant="body" fontWeight="semiBold" style={customTheme.rowLabel}>
              Logout
            </CustomText>
          </View>
          <AppIcon.ChevronRight width={18} height={18} />
        </TouchableOpacity>
      </View>

      {/* QR bottom sheet (shared with the dashboard Receive action) */}
      <ReceiveQRSheet ref={receiveSheetRef} />

      {/* Logout confirm */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={customTheme.logoutBackdrop}>
          <View
            style={[customTheme.logoutSheet, { backgroundColor: newTheme.colors.white }]}
          >
            <CustomText variant="h4" fontWeight="bold" style={customTheme.logoutTitle}>
              Logout
            </CustomText>

            <View style={customTheme.warningBox}>
              <AppIcon.AlertTriangle width={20} height={20} />
              <CustomText
                variant="body"
                size={14}
                fontWeight="regular"
                color="#8B6914"
                style={customTheme.warningText}
              >
                This will remove all accounts and clear all data from the app.
              </CustomText>
            </View>

            <View style={customTheme.logoutButtonRow}>
              <Button
                color={newTheme.colors.primary}
                style={{ flex: 1 }}
                onPress={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                color={newTheme.colors.error}
                style={{ flex: 1 }}
                onPress={handleLogoutConfirm}
              >
                Logout
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = (theme: any, newTheme: any) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      backgroundColor: "#EAF6EC",
    },
    headerGreen: {
      backgroundColor: "#EAF6EC",
      paddingBottom: theme.spacing.spacing[6],
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      minHeight: 56,
      paddingHorizontal: theme.spacing.spacing[2],
      backgroundColor: newTheme.colors.background,
    },
    headerSide: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    headerTitle: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      alignItems: "center",
      marginTop: theme.spacing.spacing[4],
      gap: 4,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: newTheme.colors.greenLight2,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginBottom: theme.spacing.spacing[2],
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    avatarText: {
      fontSize: 32,
      lineHeight: 38,
      textAlign: "center",
      textAlignVertical: "center",
      includeFontPadding: false,
      fontFamily: theme.typography?.fontFamily?.bold,
      color: newTheme.colors.primary,
    },
    name: {
      marginTop: theme.spacing.spacing[1],
    },
    sheet: {
      flex: 1,
      backgroundColor: newTheme.colors.white,
      borderTopStartRadius: theme.spacing.spacing[8],
      borderTopEndRadius: theme.spacing.spacing[8],
      paddingHorizontal: theme.spacing.spacing[5],
      paddingTop: theme.spacing.spacing[5],
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.spacing[4],
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.spacing[4],
    },
    rowLabel: {
      color: newTheme.colors.text,
    },
    logoutBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
      paddingBottom: 40,
      paddingHorizontal: 15,
    },
    logoutSheet: {
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 40,
      gap: 20,
    },
    logoutTitle: {
      textAlign: "center",
    },
    warningBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF8E1",
      borderColor: "#FFD54F",
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 10,
    },
    warningText: {
      flex: 1,
      textAlign: "center",
    },
    logoutButtonRow: {
      flexDirection: "row",
      gap: 12,
    },
  });

export default NewPersonal;
