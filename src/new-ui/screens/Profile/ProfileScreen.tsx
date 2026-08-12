import React, { useContext, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import Button from "@new-ui/components/common-components/layout/Button";
import GlassyWrapper from "@new-ui/components/common-components/GlassyWrapper";
import { ReceiveQRSheet } from "@new-ui/components/common-components/ReceiveQRSheet";
import type { IReceiveQRSheetRef } from "@new-ui/components/common-components/ReceiveQRSheet";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { profileScreenStyles } from "@new-ui/styles/screens/profile/profileScreenStyles";
import { AppIcon } from "@new-ui/assets/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { usePaymentMethodsList, type PaymentMethodItem } from "query/hooks/usePaymentMethods";
import { formatCardLabel } from "@new-ui/screens/PaymentMethods/paymentMethods.utils";
import { useTransactionLimit } from "hooks/useTransactionLimit";
import { formatUsd } from "@new-ui/screens/TransactionLimits/transactionLimits.utils";
import { useAppLock } from "hooks/useAppLock";
import { performAppLogout } from "utils/performAppLogout";
import {
  formatCountryName,
  formatMemberSince,
  formatProfilePhone,
  getInitials,
} from "./profile.utils";

type AppRouteName = (typeof NAVIGATION_SCREENS)[keyof typeof NAVIGATION_SCREENS];

const GRADIENT_COLORS = [
  "#FFFFFF",
  "#FFFFFF",
  "#EFFBF0",
  "#9FE8AC",
  "#6FD888",
  "#9FE8AC",
  "#DFF6E1",
  "#FFFFFF",
];

const Pill: React.FC<{ label: string; variant: "accent" | "outline"; styles: any }> = ({
  label,
  variant,
  styles,
}) => (
  <View style={[styles.pill, variant === "accent" ? styles.pillAccent : styles.pillOutline]}>
    <CustomText style={styles.pillText}>{label}</CustomText>
  </View>
);

const Row: React.FC<{
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  styles: any;
}> = ({ icon, label, right, isFirst, isLast, onPress, styles }) => {
  const content = (
    <View style={[styles.row, isFirst && styles.rowFirst, isLast && styles.rowLast]}>
      <View style={styles.rowLeft}>
        {icon}
        <CustomText style={styles.rowLabel} numberOfLines={1}>
          {label}
        </CustomText>
      </View>
      {right}
    </View>
  );
  if (!onPress) return content;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
};

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = profileScreenStyles(theme);
  const navigation = useNavigation<any>();

  const { userData, usersMe, walletData } = useSelector((s: any) => s.authenticationSlice);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const receiveSheetRef = useRef<IReceiveQRSheetRef>(null);
  const openQrSheet = () => receiveSheetRef.current?.open();
  // Screen is also pushed on AppStack (from the dashboard header QR/profile icon), where
  // there is no tab bar — read the context directly so it returns undefined instead of
  // throwing, and fall back to 0.
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;

  const { data: paymentMethodsData, isPending: isPaymentMethodsPending } =
    usePaymentMethodsList(20);
  const dailyLimit = useTransactionLimit("buy", "debit");
  const { isBiometricEnabled } = useAppLock();

  const profileData = useMemo(() => {
    const u = { ...(usersMe?.user || {}), ...(userData || {}) };
    const legal = usersMe?.legal_identity || {};
    const w = walletData || {};
    const me = (usersMe || {}) as Record<string, unknown>;
    const name = u.first_name ?? u.name ?? w.name ?? "";
    const lastName = u.last_name ?? w.last_name ?? "";
    const phoneSources = {
      phone_national_number:
        legal.phone_national_number ?? u.phone_national_number ?? me.phone_national_number,
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
      email_verified: !!(me.email_verified ?? (me.profile as any)?.email_verified),
      mobile_number: formatProfilePhone(phoneSources, w),
      phone_verified: !!legal.phone_verified,
      member_since: formatMemberSince(u.date_joined as string | undefined),
      profile_photo: (usersMe?.profile as any)?.avatar_url ?? u.profile_photo ?? w.profile_photo ?? null,
      address_line1: legal.address_line1 || legal.address_line_1 || legal.street || "",
      address_line2: legal.address_line2 || legal.address_line_2 || "",
      city: legal.city || "",
      state: legal.state || legal.address_state || legal.region || "",
      postal_code: legal.postal_code || legal.zip_code || "",
      country: formatCountryName(legal.country_alpha3 || legal.country || legal.country_code),
    };
  }, [userData, usersMe, walletData]);

  const displayName =
    `${profileData.name || ""} ${profileData.last_name || ""}`.trim() || "User";

  const rawProfilePhoto = profileData.profile_photo;
  const profilePhotoUri =
    rawProfilePhoto && typeof rawProfilePhoto === "string" && rawProfilePhoto.trim() !== ""
      ? rawProfilePhoto.replace(/^http:\/\//i, "https://")
      : null;

  const hasAddress = !!(profileData.address_line1 || profileData.city);
  const paymentMethods: PaymentMethodItem[] = paymentMethodsData?.data?.items ?? [];

  const handleLogoutConfirm = async () => {
    try {
      await performAppLogout();
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const goTo = (route: AppRouteName) => navigation.navigate(route);

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["top", "bottom"]}
      scrollable
      contentStyle={{ ...styles.content, paddingBottom: theme.spacing["2xl"] + tabBarHeight }}
      gradient="linear"
      gradientColors={GRADIENT_COLORS}
      gradientStart={{ x: 0, y: 1 }}
      gradientEnd={{ x: 1, y: 0 }}
    >
      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <GlassyWrapper
              style={styles.headerButtonGlassy}
              borderRadius={20}
              blurAmount={25}
              blurType="light"
              overlayOpacity={0.12}
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.6)"
            >
              <View style={styles.headerButtonIconWrapper}>
                <AppIcon.ArrowLeft width={24} height={24} />
              </View>
            </GlassyWrapper>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSide} />
        )}
        <CustomText fontWeight="bold" size={19} style={styles.headerTitle}>
          Profile
        </CustomText>
        <TouchableOpacity style={styles.headerButton} onPress={openQrSheet} activeOpacity={0.7}>
          <GlassyWrapper
            style={styles.headerButtonGlassy}
            borderRadius={20}
            blurAmount={25}
            blurType="light"
            overlayOpacity={0.12}
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.6)"
          >
            <View style={styles.headerButtonIconWrapper}>
              <AppIcon.QrCode width={24} height={24} color={theme.colors.primary} />
            </View>
          </GlassyWrapper>
        </TouchableOpacity>
      </View>

      {/* Avatar block */}
      <View style={styles.avatarBlock}>
        <View style={styles.avatar}>
          {profilePhotoUri ? (
            <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
          ) : (
            <CustomText style={styles.avatarInitials}>{getInitials(displayName)}</CustomText>
          )}
        </View>
        <CustomText style={styles.name}>{displayName}</CustomText>
        <CustomText style={styles.caption}>
          {profileData.username ? `@${profileData.username}` : ""}
          {profileData.username && profileData.member_since ? " · " : ""}
          {profileData.member_since ? `Member since ${profileData.member_since}` : ""}
        </CustomText>
      </View>

      {/* Verification card */}
      <GlassyWrapper
        style={styles.cardFirst}
        borderRadius={20}
        blurAmount={16}
        blurType="light"
        overlayOpacity={0.5}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.6)"
        padding={16}
        flowLayout
      >
        <CustomText style={styles.kicker}>Verification</CustomText>
        <Row
          styles={styles}
          isFirst
          icon={<AppIcon.Mail width={17} height={17} color={theme.colors.primary} />}
          label={profileData.account_email || "—"}
          right={
            profileData.email_verified ? <Pill label="Verified" variant="accent" styles={styles} /> : null
          }
        />
        <Row
          styles={styles}
          isLast
          icon={<AppIcon.Phone width={17} height={17} color={theme.colors.primary} />}
          label={profileData.mobile_number || "—"}
          right={
            profileData.phone_verified ? <Pill label="Verified" variant="accent" styles={styles} /> : null
          }
        />
      </GlassyWrapper>

      {/* Address card */}
      <GlassyWrapper
        style={styles.card}
        borderRadius={20}
        blurAmount={16}
        blurType="light"
        overlayOpacity={0.5}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.6)"
        padding={16}
        flowLayout
      >
        <CustomText style={styles.kicker}>Address</CustomText>
        {hasAddress ? (
          <View style={styles.addressRow}>
            <View style={styles.addressIcon}>
              <AppIcon.Home width={17} height={17} color={theme.colors.primary} />
            </View>
            <CustomText style={styles.addressText}>
              {[profileData.address_line1, profileData.address_line2].filter(Boolean).join(" ")}
              {"\n"}
              {[profileData.city, [profileData.state, profileData.postal_code].filter(Boolean).join(" ")]
                .filter(Boolean)
                .join(", ")}
              {profileData.country ? `\n${profileData.country}` : ""}
            </CustomText>
          </View>
        ) : (
          <CustomText style={styles.emptyRowText}>No address on file yet.</CustomText>
        )}
      </GlassyWrapper>

      {/* Linked payment methods card */}
      <GlassyWrapper
        style={styles.card}
        borderRadius={20}
        blurAmount={16}
        blurType="light"
        overlayOpacity={0.5}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.6)"
        padding={16}
        flowLayout
      >
        <CustomText style={styles.kicker}>Linked</CustomText>
        {isPaymentMethodsPending ? (
          <ActivityIndicator color={theme.colors.primary} style={{ paddingVertical: theme.spacing.sm }} />
        ) : paymentMethods.length > 0 ? (
          paymentMethods.map((item, index) => (
            <Row
              key={item.payment_method_id}
              styles={styles}
              isFirst={index === 0}
              isLast={index === paymentMethods.length - 1}
              icon={<AppIcon.DebitCard width={17} height={17} color={theme.colors.primary} />}
              label={formatCardLabel(item)}
              right={<AppIcon.ChevronRight width={15} height={15} />}
              onPress={() => goTo(NAVIGATION_SCREENS.PAYMENT_METHODS_SCREEN as AppRouteName)}
            />
          ))
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => goTo(NAVIGATION_SCREENS.PAYMENT_METHODS_SCREEN as AppRouteName)}
          >
            <CustomText style={styles.emptyRowText}>No payment methods linked yet.</CustomText>
          </TouchableOpacity>
        )}
      </GlassyWrapper>

      {/* Security & limits card */}
      <GlassyWrapper
        style={styles.card}
        borderRadius={20}
        blurAmount={16}
        blurType="light"
        overlayOpacity={0.5}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.6)"
        padding={16}
        flowLayout
      >
        <CustomText style={styles.kicker}>Security & limits</CustomText>
        <Row
          styles={styles}
          isFirst
          icon={<AppIcon.Privacy width={17} height={17} color={theme.colors.primary} />}
          label="Biometric login"
          right={
            <Pill
              label={isBiometricEnabled ? "On" : "Off"}
              variant={isBiometricEnabled ? "accent" : "outline"}
              styles={styles}
            />
          }
          onPress={() => goTo(NAVIGATION_SCREENS.NEW_PRIVACY_SECURITY_SCREEN as AppRouteName)}
        />
        <Row
          styles={styles}
          isLast
          icon={<AppIcon.TransactionLimit width={17} height={17} color={theme.colors.primary} />}
          label="Daily send limit"
          right={
            <Pill
              label={dailyLimit.available ? formatUsd(dailyLimit.dailyLimitUsd) : "—"}
              variant="outline"
              styles={styles}
            />
          }
          onPress={() => goTo(NAVIGATION_SCREENS.TRANSACTION_LIMIT_SCREEN as AppRouteName)}
        />
      </GlassyWrapper>

      {/* Action buttons */}
      <View style={styles.buttonsRow}>
        <Button
          color={theme.colors.primary}
          style={{ flex: 1 }}
          onPress={() => goTo(NAVIGATION_SCREENS.NEW_SETTINGS_SCREEN as AppRouteName)}
        >
          Settings
        </Button>
        <Button
          color={theme.colors.error}
          style={{ flex: 1 }}
          onPress={() => setShowLogoutConfirm(true)}
        >
          Logout
        </Button>
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
            paddingBottom: 40,
            paddingHorizontal: 15,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 28,
              paddingBottom: 40,
              gap: 20,
            }}
          >
            <CustomText variant="h4" fontWeight="bold" align="center">
              Logout
            </CustomText>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFF8E1",
                borderColor: "#FFD54F",
                borderWidth: 1,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 10,
              }}
            >
              <AppIcon.AlertTriangle width={20} height={20} />
              <CustomText
                variant="body"
                size={14}
                fontWeight="regular"
                color="#8B6914"
                style={{ flex: 1, textAlign: "center" }}
              >
                Are you sure you want to logout?
              </CustomText>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button
                color={theme.colors.primary}
                style={{ flex: 1 }}
                onPress={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button color={theme.colors.error} style={{ flex: 1 }} onPress={handleLogoutConfirm}>
                Logout
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default ProfileScreen;
