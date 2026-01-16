import React, { useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Clipboard,
  ToastAndroid,
} from "react-native";
import { useTheme } from "../../../styles/ThemeContext";
import { CustomText } from "../../../tsx-components";
import { SvgIcons } from "../../../constants/svgs";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import Share from "react-native-share";
import useSelectorAction from "../../../hooks/useSelectorAction";
import { useAppLock } from "hooks/useAppLock";

interface IBankDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  bankList: Array<{
    label: string;
    value: string;
    bank_name: string;
    account_number: string;
    account_type: string;
    guid: string;
  }>;
}

const BankDetailsModal: React.FC<IBankDetailsModalProps> = ({
  isVisible,
  onClose,
  bankList,
}) => {
  const { theme } = useTheme();
  const { walletData, bankLists } = useSelectorAction() as any;
  const qrViewShotRef = useRef<any>(null);
  const [showCRN, setShowCRN] = useState(false);
  const { setNativeModalVisible } = useAppLock();

  // Get the first bank account (external account if available)
  const primaryBank = bankList && bankList.length > 0 ? bankList[0] : null;
  const rawBankData = bankLists && bankLists.length > 0 ? bankLists[bankLists.length - 1] : null;

  const formatAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return "N/A";
    const last4 = accountNumber.slice(-4);
    return `•••• ${last4}`;
  };

  const formatCRN = (guid: string) => {
    if (!guid) return "N/A";
    if (showCRN) {
      return guid;
    }
    const last3 = guid.slice(-3);
    return `*******${last3}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else {
      Alert.alert(`${label} copied`);
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
    }
    finally {
      setTimeout(() => {
        setNativeModalVisible(false);
      }, 1000);
    }
  };

  const handleDownloadQR = async () => {
    setNativeModalVisible(true);
    try {
      if (qrViewShotRef.current) {
        const uri = await qrViewShotRef.current.capture({
          format: "png",
          quality: 0.9,
          result: "tmpfile",
        });

        // Use Share to allow user to save to gallery
        const shareOptions: any = {
          title: "PayAiro QR Code",
          subject: "PayAiro QR Code",
          url: uri,
          type: "image/png",
          filename: `PayAiro_QR_${walletData?.username || "qr"}`,
          failOnCancel: false,
          saveToFiles: true,
        };

        await Share.open(shareOptions);
      }
    } catch (err: any) {
      if (err?.message !== "User did not share") {
        console.log("Error downloading QR:", err);
        Alert.alert("Failed to download QR code");
      }
    }
    finally {
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
    bank_account: primaryBank?.account_number,
  });

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles(theme).modalOverlay}>
        <Pressable
          style={styles(theme).overlayBackdrop}
          onPress={onClose}
        />
        <View style={styles(theme).modalContainer}>
          {/* Header */}
          <View style={styles(theme).header}>
            <CustomText variant="h4" fontWeight="semiBold" style={{ color: theme.colors.palette.grey900 }}>
              Bank Details
            </CustomText>
            <Pressable onPress={onClose} style={styles(theme).closeButton}>
              <CustomText
                variant="h6"
                fontWeight="bold"
                style={{ color: theme.colors.palette.grey900 }}
              >
                X
              </CustomText>
            </Pressable>
          </View>

          <ScrollView
            style={styles(theme).scrollView}
            contentContainerStyle={styles(theme).scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* User Name */}
            {walletData?.name && (
              <CustomText
                variant="h3"
                fontWeight="semiBold"
                style={styles(theme).userName}
              >
                {walletData.name}
              </CustomText>
            )}

            {/* PayAiro Tag / UPI ID */}
            <View style={styles(theme).upiIdContainer}>
              <CustomText variant="body2" style={styles(theme).upiIdLabel}>
                PayAiro Tag - {walletData?.username || "N/A"}
              </CustomText>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(walletData?.username || "", "PayAiro Tag")
                }
              >
                <SvgIcons.CopyOutlineBlack width={20} height={20} />
              </TouchableOpacity>
            </View>

            {/* QR Code */}
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

            {/* Receive Money Text */}
            <CustomText
              variant="body2"
              style={styles(theme).receiveMoneyText}
            >
              Receive money from Any PayAiro Account
            </CustomText>

            {/* Payment App Logos */}
            <View style={styles(theme).paymentAppsContainer}>
              <CustomText variant="caption" style={styles(theme).paymentAppText}>
                Bank Account
              </CustomText>
              <CustomText variant="caption" style={styles(theme).paymentAppText}>
                Crypto Wallet
              </CustomText>
              <CustomText variant="caption" style={styles(theme).paymentAppText}>
                Debit Card
              </CustomText>
            </View>

            {/* Share and Download Buttons */}
            <View style={styles(theme).actionButtonsContainer}>
              <TouchableOpacity
                style={styles(theme).actionButton}
                onPress={handleShareQR}
              >
                <SvgIcons.ShareWhiteIcon width={20} height={20} color={theme.colors.palette.white} />
                <CustomText
                  variant="body2"
                  fontWeight="medium"
                  style={styles(theme).actionButtonText}
                >
                  Share QR
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme).actionButton}
                onPress={handleDownloadQR}
              >
                <SvgIcons.DownloadIcon width={20} height={20} />
                <CustomText
                  variant="body2"
                  fontWeight="medium"
                  style={styles(theme).actionButtonText}
                >
                  Download QR
                </CustomText>
              </TouchableOpacity>
            </View>

            {/* Account Details Section */}
            {primaryBank && (
              <View style={styles(theme).accountDetailsContainer}>
                {/* CRN */}
                <View style={styles(theme).accountDetailRow}>
                  <CustomText variant="caption" style={styles(theme).detailLabel}>
                    CRN
                  </CustomText>
                  <View style={styles(theme).detailValueContainer}>
                    <CustomText
                      variant="body2"
                      fontWeight="medium"
                      style={styles(theme).detailValue}
                    >
                      {formatCRN(primaryBank.guid)}
                    </CustomText>
                    <TouchableOpacity
                      onPress={() => setShowCRN(!showCRN)}
                      style={styles(theme).iconButton}
                    >
                      {showCRN ? (
                        <SvgIcons.EyeOnGreenbg width={20} height={20} />
                      ) : (
                        <SvgIcons.EyeOffOutline width={20} height={20} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(primaryBank.guid, "CRN")
                      }
                      style={styles(theme).iconButton}
                    >
                      <SvgIcons.CopyOutlineBlack width={20} height={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Account Number */}
                <View style={styles(theme).accountDetailRow}>
                  <CustomText variant="caption" style={styles(theme).detailLabel}>
                    Account number
                  </CustomText>
                  <View style={styles(theme).detailValueContainer}>
                    <CustomText
                      variant="body2"
                      fontWeight="medium"
                      style={styles(theme).detailValue}
                    >
                      {primaryBank.account_number || "N/A"}
                    </CustomText>
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(
                          primaryBank.account_number,
                          "Account number"
                        )
                      }
                      style={styles(theme).iconButton}
                    >
                      <SvgIcons.CopyOutlineBlack width={20} height={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* IFSC Code / Routing Number */}
                <View style={styles(theme).accountDetailRow}>
                  <CustomText variant="caption" style={styles(theme).detailLabel}>
                    {rawBankData?.ref_code ? "Routing Number" : "IFSC Code"}
                  </CustomText>
                  <View style={styles(theme).detailValueContainer}>
                    <CustomText
                      variant="body2"
                      fontWeight="medium"
                      style={styles(theme).detailValue}
                    >
                      {rawBankData?.ref_code || "N/A"}
                    </CustomText>
                    {rawBankData?.ref_code && (
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(
                            rawBankData.ref_code,
                            "Routing Number"
                          )
                        }
                        style={styles(theme).iconButton}
                      >
                        <SvgIcons.CopyOutlineBlack width={20} height={20} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    overlayBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.palette.overlay || "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      backgroundColor: theme.colors.palette.white || "#FFFFFF",
      // borderTopLeftRadius: theme.spacing.spacing[8] || 24,
      // borderTopRightRadius: theme.spacing.spacing[8] || 24,
      flex: 1,
      zIndex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.spacing[5] || 20,
      paddingTop: theme.spacing.spacing[5] || 20,
      paddingBottom: theme.spacing.spacing[4] || 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.grey200 || "#E5E7EB",
    },
    closeButton: {
      paddingHorizontal: theme.spacing.spacing[2] || 4,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingHorizontal: theme.spacing.spacing[5] || 20,
      paddingBottom: theme.spacing.spacing[6] || 24,
      paddingTop: theme.spacing.spacing[4] || 16,
      alignItems: "center",
    },
    userName: {
      color: theme.colors.palette.grey900 || "#111827",
      marginBottom: theme.spacing.spacing[2] || 8,
      textAlign: "center",
    },
    upiIdContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.spacing[4] || 16,
      gap: theme.spacing.spacing[2] || 8,
    },
    upiIdLabel: {
      color: theme.colors.palette.grey900 || "#111827",
    },
    qrCodeContainer: {
      alignItems: "center",
      marginVertical: theme.spacing.spacing[4] || 16,
    },
    qrCodeWrapper: {
      backgroundColor: theme.colors.palette.white || "#FFFFFF",
      padding: theme.spacing.spacing[4] || 16,
      borderRadius: theme.spacing.spacing[3] || 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200 || "#E5E7EB",
    },
    receiveMoneyText: {
      color: theme.colors.palette.grey700 || "#374151",
      textAlign: "center",
      marginTop: theme.spacing.spacing[2] || 8,
      marginBottom: theme.spacing.spacing[3] || 12,
    },
    paymentAppsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.spacing[4] || 16,
      marginBottom: theme.spacing.spacing[5] || 20,
      flexWrap: "wrap",
    },
    paymentAppText: {
      color: theme.colors.palette.grey600 || "#4B5563",
      opacity: 0.9,
    },
    actionButtonsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.spacing[3] || 12,
      marginBottom: theme.spacing.spacing[6] || 24,
      width: "100%",
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.palette.primary || "#4F378B",
      paddingVertical: theme.spacing.spacing[3] || 12,
      paddingHorizontal: theme.spacing.spacing[4] || 16,
      borderRadius: theme.spacing.spacing[2] || 8,
      gap: theme.spacing.spacing[2] || 8,
    },
    actionButtonText: {
      color: theme.colors.palette.white || "#FFFFFF",
    },
    accountDetailsContainer: {
      width: "100%",
      gap: theme.spacing.spacing[4] || 16,
    },
    accountDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[2] || 8,
    },
    detailLabel: {
      color: theme.colors.palette.grey600 || "#4B5563",
      flex: 1,
    },
    detailValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.spacing[2] || 8,
      flex: 2,
      justifyContent: "flex-end",
    },
    detailValue: {
      color: theme.colors.palette.grey900 || "#111827",
    },
    iconButton: {
      padding: theme.spacing.spacing[1] || 4,
    },
  });

export default BankDetailsModal;
