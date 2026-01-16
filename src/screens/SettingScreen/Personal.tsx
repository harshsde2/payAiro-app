import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Clipboard,
  ToastAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useTheme } from "../../styles/ThemeContext";
import { CustomText } from "../../tsx-components";
import { SvgIcons } from "../../constants/svgs";
import HeaderTitle from "../../components/HeaderTitle";
import { ScreenContainer } from "../../HOC";
import useSelectorAction from "../../hooks/useSelectorAction";
import useDispatchAction from "../../hooks/useDispatchAction";
import { usePatchUserDetails } from "../../query/hooks/useAPIAuth";
import { setKycStatus } from "../../redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../utils/toast";
import { getKYC } from "../../services/Services";
import { toKycMode } from "../../types/kyc";
import { NAVIGATION_SCREENS } from "../../navigations/navigationConstants";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import Share from "react-native-share";
import { useAppLock } from "../../hooks/useAppLock";

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

const Personal: React.FC = () => {
  const { theme } = useTheme();
  const { walletData, tokens } = useSelectorAction() as any;
  const kycStatus = useSelector((s: any) => s?.authenticationSlice?.kycStatus);
  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);
  const { mutate: patchUser, isPending } = usePatchUserDetails();
  const navigation = useNavigation<any>();
  const { setNativeModalVisible } = useAppLock();
  const qrViewShotRef = useRef<any>(null);

  const [kycStep, setKycStep] = useState<IKycStep | null>(null);

  useEffect(() => {
    getKycStep();
  }, []);

  const getKycStep = async () => {
    if (!tokens?.access) return;
    try {
      const kycData = await getKYC(tokens.access);
      if (kycData?.data) {
        setKycStep(kycData.data);
      }
    } catch (error) {
      console.error("Error fetching KYC data:", error);
    }
  };

  const handleStartKyc = () => {
    try {
      patchUser({ start_kyc: true } as any, {
        onSuccess: (data: any) => {
          console.log(JSON.stringify(data, null, 2), "datas");
          if (data?.status === true && data?.persona_verification_url) {
            navigation.navigate(NAVIGATION_SCREENS.CYBRID_WEB_VIEW, {
              URL: data?.persona_verification_url,
            });
            showSuccess("KYC started successfully");
            useDispatchAction(setKycStatus({ status: false, state: "pending", toast_message: "KYC started" }));
          } else {
            showSuccess("Your ID fetch successfully please click again to start KYC");
          }
        },
        onError: (error: any) => {
          console.log(JSON.stringify(error.response, null, 2), "error");
          showError("Failed to start KYC");
        },
      });
    } catch (e) {
      showError("Failed to start KYC");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else {
      Alert.alert(`${label} copied`);
    }
  };

  const handleCopyQR = async () => {
    try {
      const qrValue = JSON.stringify({
        type: "receive",
        username: walletData?.username,
        tag: walletData?.username,
      });
      copyToClipboard(qrValue, "QR Code");
    } catch (err: any) {
      console.log("Error copying QR:", err);
    }
  };

  const handleShareQR = async () => {
    setNativeModalVisible(true);
    try {
      if (qrViewShotRef.current) {
        const uri = await qrViewShotRef.current.capture({
          format: "png",
          quality: 0.9,
          result: "tmpfile",
        });

        const shareOptions: any = {
          title: "PayAiro QR Code",
          subject: "PayAiro QR Code",
          url: uri,
          type: "image/png",
          filename: `PayAiro_QR_${walletData?.username || "qr"}`,
          failOnCancel: false,
        };

        await Share.open(shareOptions);
      }
    } catch (err: any) {
      if (err?.message !== "User did not share") {
        console.log("Error sharing QR:", err);
      }
    } finally {
      setTimeout(() => {
        setNativeModalVisible(false);
      }, 1000);
    }
  };

  // Generate QR code value
  const qrValue = JSON.stringify({
    type: "receive",
    username: walletData?.username,
    tag: walletData?.username,
  });

  const profilePhoto = kycStep?.selfimage 
    ? { uri: kycStep.selfimage }
    : null;

  const initials = getInitials(walletData?.name);

  // Edit button component - using a simple text for now
  const editButton = (
    <TouchableOpacity
      style={styles(theme).editButton}
      onPress={() => {
        // Handle edit navigation - can navigate to edit screen if exists
        console.log("Edit pressed");
      }}
    >
      <CustomText variant="body2" fontWeight="medium" style={styles(theme).editText}>
        Edit
      </CustomText>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle 
        title="Personal" 
        leftIcon="true"
        rightIcon={editButton}
        onPressRight={() => {
          // Handle edit navigation
          console.log("Edit pressed");
        }}
      />
      <ScrollView
        style={styles(theme).scrollView}
        contentContainerStyle={styles(theme).scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture and Name */}
        <View style={styles(theme).profileSection}>
          <View style={styles(theme).avatarContainer}>
            {profilePhoto ? (
              <Image source={profilePhoto} style={styles(theme).avatarImage} />
            ) : (
              <View style={styles(theme).avatarPlaceholder}>
                <CustomText variant="h3" fontWeight="bold" style={styles(theme).avatarInitials}>
                  {initials}
                </CustomText>
              </View>
            )}
          </View>
          <CustomText variant="h3" fontWeight="semiBold" style={styles(theme).profileName}>
            {walletData?.name || "User"}
          </CustomText>
        </View>

        {/* Information Fields */}
        <View style={styles(theme).infoSection}>
          <View style={styles(theme).infoField}>
            <CustomText variant="caption" style={styles(theme).infoLabel}>
              Full name
            </CustomText>
            <View style={styles(theme).infoValueContainer}>
              <CustomText variant="body2" fontWeight="medium" style={styles(theme).infoValue}>
                {walletData?.name || "N/A"}
              </CustomText>
            </View>
          </View>

          <View style={styles(theme).infoField}>
            <CustomText variant="caption" style={styles(theme).infoLabel}>
              Email Address
            </CustomText>
            <View style={styles(theme).infoValueContainer}>
              <CustomText variant="body2" fontWeight="medium" style={styles(theme).infoValue}>
                {walletData?.account_email || "N/A"}
              </CustomText>
            </View>
          </View>

          <View style={styles(theme).infoField}>
            <CustomText variant="caption" style={styles(theme).infoLabel}>
              PayAiro Tag
            </CustomText>
            <View style={styles(theme).infoValueContainer}>
              <CustomText variant="body2" fontWeight="medium" style={styles(theme).infoValue}>
                {walletData?.username || "N/A"}
              </CustomText>
            </View>
          </View>
        </View>

        {/* KYC Button */}
        {mode === "not_started" && (
          <View style={styles(theme).kycButtonContainer}>
            <TouchableOpacity
              style={styles(theme).kycButton}
              onPress={handleStartKyc}
              disabled={isPending}
            >
              <CustomText variant="body1" fontWeight="semiBold" style={styles(theme).kycButtonText}>
                {isPending ? "Starting KYC..." : "Complete your KYC"}
              </CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* QR Code Section */}
        <View style={styles(theme).qrCodeSection}>
          <CustomText variant="h4" fontWeight="semiBold" style={styles(theme).qrCodeName}>
            {walletData?.name || "User"}
          </CustomText>

          <View style={styles(theme).qrCodeContainer}>
            <ViewShot
              ref={qrViewShotRef}
              options={{
                format: "png",
                quality: 0.9,
                result: "tmpfile",
              }}
              style={styles(theme).qrCodeWrapper}
            >
              <QRCode
                value={qrValue}
                size={200}
              />
            </ViewShot>
          </View>

          {/* Action Buttons */}
          <View style={styles(theme).qrActionButtons}>
            <TouchableOpacity
              style={styles(theme).qrActionButton}
              onPress={handleCopyQR}
            >
              <SvgIcons.CopyOutlineBlack width={20} height={20} />
              <CustomText variant="body2" fontWeight="medium" style={styles(theme).qrActionButtonText}>
                Copy QR
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).qrActionButton}
              onPress={handleShareQR}
            >
              <SvgIcons.ShareIcon width={20} height={20} />
              <CustomText variant="body2" fontWeight="medium" style={styles(theme).qrActionButtonText}>
                Share QR
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingHorizontal: theme.spacing.spacing[5] || 20,
      paddingBottom: theme.spacing.spacing[6] || 24,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.spacing[1] || 4,
    },
    editText: {
      color: theme.colors.palette.grey900 || "#111827",
    },
    profileSection: {
      alignItems: "center",
      marginTop: theme.spacing.spacing[4] || 16,
      marginBottom: theme.spacing.spacing[6] || 24,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: "hidden",
      marginBottom: theme.spacing.spacing[3] || 12,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    avatarPlaceholder: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.palette.green200 || "#D1FAE5",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarInitials: {
      color: theme.colors.palette.green700 || "#1a5f3f",
    },
    profileName: {
      color: theme.colors.palette.grey900 || "#111827",
    },
    infoSection: {
      marginBottom: theme.spacing.spacing[6] || 24,
      gap: theme.spacing.spacing[4] || 16,
    },
    infoField: {
      marginBottom: theme.spacing.spacing[3] || 12,
    },
    infoLabel: {
      color: theme.colors.palette.grey700 || "#374151",
      marginBottom: theme.spacing.spacing[1] || 4,
    },
    infoValueContainer: {
      backgroundColor: theme.colors.palette.green100 || "#E8F5E9",
      borderRadius: theme.spacing.spacing[2] || 8,
      padding: theme.spacing.spacing[3] || 12,
      borderWidth: 1,
      borderColor: theme.colors.palette.green200 || "#C8E6C9",
    },
    infoValue: {
      color: theme.colors.palette.grey900 || "#111827",
    },
    kycButtonContainer: {
      marginBottom: theme.spacing.spacing[6] || 24,
    },
    kycButton: {
      backgroundColor: theme.colors.palette.primary || "#4F378B",
      borderRadius: theme.spacing.spacing[2] || 8,
      paddingVertical: theme.spacing.spacing[3] || 12,
      paddingHorizontal: theme.spacing.spacing[4] || 16,
      alignItems: "center",
    },
    kycButtonText: {
      color: theme.colors.palette.white || "#FFFFFF",
    },
    qrCodeSection: {
      backgroundColor: theme.colors.palette.white || "#FFFFFF",
      borderRadius: theme.spacing.spacing[3] || 12,
      padding: theme.spacing.spacing[5] || 20,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200 || "#E5E7EB",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[6] || 24,
    },
    qrCodeName: {
      color: theme.colors.palette.grey900 || "#111827",
      marginBottom: theme.spacing.spacing[4] || 16,
    },
    qrCodeContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.spacing[5] || 20,
    },
    qrCodeWrapper: {
      backgroundColor: theme.colors.palette.white || "#FFFFFF",
      padding: theme.spacing.spacing[4] || 16,
      borderRadius: theme.spacing.spacing[2] || 8,
      borderWidth: 3,
      borderColor: theme.colors.palette.green700 || "#1a5f3f",
      alignItems: "center",
      justifyContent: "center",
    },
    qrActionButtons: {
      flexDirection: "row",
      gap: theme.spacing.spacing[3] || 12,
      width: "100%",
    },
    qrActionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.palette.white || "#FFFFFF",
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300 || "#D1D5DB",
      borderRadius: theme.spacing.spacing[2] || 8,
      paddingVertical: theme.spacing.spacing[3] || 12,
      gap: theme.spacing.spacing[2] || 8,
    },
    qrActionButtonText: {
      color: theme.colors.palette.grey900 || "#111827",
    },
  });

export default Personal;
