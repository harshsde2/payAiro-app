import React, { useContext, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
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
import { useUpdateProfileAvatar } from "query/hooks/useUpdateProfileAvatar";
import { pickImageFromGallery } from "utils/ImagePicker";
import { showError, showSuccess, getApiErrorMessage } from "utils/toast";
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

  const initials = getInitials(displayName);

  const rawProfilePhoto = profileData.profile_photo;
  const profilePhotoUri = useMemo(() => {
    if (typeof rawProfilePhoto !== "string") return null;
    const trimmed = rawProfilePhoto.trim();
    if (!trimmed) return null;
    // Only absolute, loadable sources count as a photo. A bare path ("/media/x.jpg") or a
    // stringified placeholder ("null") makes <Image> render an empty box instead of falling
    // through to the initials, which is what leaves the avatar blank.
    if (!/^(https?:|data:|file:|content:|ph:|assets-library:)/i.test(trimmed)) return null;
    return trimmed.replace(/^http:\/\//i, "https://");
  }, [rawProfilePhoto]);

  // Keyed by URI so a newly uploaded photo gets a fresh attempt without extra resetting.
  const [failedAvatarUri, setFailedAvatarUri] = useState<string | null>(null);
  const showAvatarImage = !!profilePhotoUri && profilePhotoUri !== failedAvatarUri;

  const hasAddress = !!(profileData.address_line1 || profileData.city);
  const addressText = [
    [profileData.address_line1, profileData.address_line2].filter(Boolean).join(" "),
    [profileData.city, [profileData.state, profileData.postal_code].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", "),
    profileData.country,
  ]
    .filter(Boolean)
    .join(", ");
  const paymentMethods: PaymentMethodItem[] = paymentMethodsData?.data?.items ?? [];

  const { mutateAsync: uploadAvatar, isPending: isUploadingAvatar } =
    useUpdateProfileAvatar();
  // Picked + cropped image awaiting the user's confirmation before it's uploaded.
  const [pendingAvatar, setPendingAvatar] = useState<{
    uri: string;
    name?: string;
    type?: string;
  } | null>(null);

  // Square crop sized for an avatar; the confirm sheet below previews the result.
  const pickAvatarImage = async () => {
    const file = await pickImageFromGallery({
      cropping: true,
      width: 512,
      height: 512,
      cropperToolbarTitle: "Crop photo",
      // iOS photos are often HEIC, which the avatar API rejects — force JPEG output.
      forceJpg: true,
    });
    if (file?.uri) {
      setPendingAvatar({ uri: file.uri, name: file.name, type: file.type });
    }
  };

  const handleChangeAvatar = () => {
    if (isUploadingAvatar) return;
    void pickAvatarImage();
  };

  const handleConfirmAvatar = async () => {
    if (!pendingAvatar) return;
    try {
      const res = await uploadAvatar(pendingAvatar);
      const ok = (res as any)?.ok ?? (res as any)?.status ?? true;
      if (ok) {
        setPendingAvatar(null);
        showSuccess("Photo updated", "Your profile photo has been updated.");
      } else {
        showError("Couldn't update photo", (res as any)?.message || "Please try again.");
      }
    } catch (error) {
      showError("Couldn't update photo", getApiErrorMessage(error, "Please try again."));
    }
  };

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
        <View>
          <View style={styles.avatar}>
            {/* Initials always render underneath the photo, so a slow, broken or 404'd
                avatar URL degrades to them instead of leaving an empty tile. */}
            <CustomText style={styles.avatarInitials} allowFontScaling={false} numberOfLines={1}>
              {initials}
            </CustomText>
            {showAvatarImage ? (
              <Image
                source={{ uri: profilePhotoUri as string }}
                style={[styles.avatarImage, StyleSheet.absoluteFillObject]}
                onError={() => setFailedAvatarUri(profilePhotoUri)}
              />
            ) : null}
            {isUploadingAvatar ? (
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.35)",
                  },
                ]}
              >
                <ActivityIndicator color={theme.colors.white} />
              </View>
            ) : null}
          </View>
          {/* Edit-photo badge — bottom-right, outside the avatar's overflow:hidden clip. */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleChangeAvatar}
            disabled={isUploadingAvatar}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: theme.colors.white,
            }}
          >
            <CustomText size={18} fontWeight="bold" color={theme.colors.white} style={{ lineHeight: 20 }}>
              +
            </CustomText>
          </TouchableOpacity>
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
        padding={0}
        flowLayout
      >
        <View style={styles.cardInner}>
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
        </View>
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
        padding={0}
        flowLayout
      >
        <View style={styles.cardInner}>
          <CustomText style={styles.kicker}>Address</CustomText>
          {hasAddress ? (
            <View style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <AppIcon.Home width={17} height={17} color={theme.colors.primary} />
              </View>
              <CustomText style={styles.addressText}>{addressText}</CustomText>
            </View>
          ) : (
            <CustomText style={styles.emptyRowText}>No address on file yet.</CustomText>
          )}
        </View>
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
        padding={0}
        flowLayout
      >
        <View style={styles.cardInner}>
          <CustomText style={styles.kicker}>Linked cards</CustomText>
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
        </View>
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
        padding={0}
        flowLayout
      >
        <View style={styles.cardInner}>
          <CustomText style={styles.kicker}>Security & limits</CustomText>
          <Row
            styles={styles}
            isFirst
            icon={<AppIcon.Privacy width={17} height={17} color={theme.colors.primary} />}
            label="Biometric"
            right={<AppIcon.ChevronRight width={15} height={15} />}
            onPress={() => goTo(NAVIGATION_SCREENS.NEW_PRIVACY_SECURITY_SCREEN as AppRouteName)}
          />
          <Row
            styles={styles}
            isLast
            icon={<AppIcon.TransactionLimit width={17} height={17} color={theme.colors.primary} />}
            label="Transaction Limit"
            right={<AppIcon.ChevronRight width={15} height={15} />}
            onPress={() => goTo(NAVIGATION_SCREENS.TRANSACTION_LIMIT_SCREEN as AppRouteName)}
          />
        </View>
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

      {/* Confirm the cropped photo before uploading */}
      <Modal
        visible={!!pendingAvatar}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isUploadingAvatar) setPendingAvatar(null);
        }}
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
              paddingBottom: 32,
              gap: 20,
              alignItems: "center",
            }}
          >
            <CustomText variant="h4" fontWeight="bold" align="center">
              Use this photo?
            </CustomText>

            {pendingAvatar ? (
              <Image
                source={{ uri: pendingAvatar.uri }}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 28,
                  backgroundColor: theme.colors.greyLight,
                }}
              />
            ) : null}

            <CustomText
              variant="bodySmall"
              fontFamily="inter"
              color={theme.colors.textSecondary}
              align="center"
            >
              This will replace your current profile photo.
            </CustomText>

            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <Button
                color={theme.colors.greyDark}
                style={{ flex: 1 }}
                disabled={isUploadingAvatar}
                onPress={() => setPendingAvatar(null)}
              >
                Cancel
              </Button>
              <Button
                color={theme.colors.primary}
                style={{ flex: 1 }}
                loading={isUploadingAvatar}
                disabled={isUploadingAvatar}
                onPress={handleConfirmAvatar}
              >
                Use photo
              </Button>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isUploadingAvatar}
              onPress={pickAvatarImage}
            >
              <CustomText
                variant="bodySmall"
                fontFamily="inter"
                fontWeight="semiBold"
                color={theme.colors.primary}
              >
                Choose another photo
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
