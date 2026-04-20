import React from "react";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { cryptoWithdrawStyles } from "@new-ui/styles/screens/withdrawCrypto/cryptoWithdrawStyles";
import { AppIcon } from "@new-ui/assets/svgs";
import Button from "@new-ui/components/common-components/layout/Button";

type WithdrawConfirmationModalProps = {
  visible: boolean;
  assetSymbol: string;
  assetAmount: number;
  usdAmount: number;
  walletAddress: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const WithdrawConfirmationModal: React.FC<WithdrawConfirmationModalProps> = ({
  visible,
  assetSymbol,
  assetAmount,
  usdAmount,
  walletAddress,
  isSubmitting = false,
  onClose,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const styles = cryptoWithdrawStyles(theme);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={isSubmitting ? undefined : onClose}>
        <View style={styles.modalCloseRow}>
          <Pressable
            onPress={onClose}
            disabled={isSubmitting}
            style={styles.modalCloseButton}
          >
            <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
          </Pressable>
        </View>

        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <CustomText variant="h5" fontWeight="bold" align="center">
            Confirm Withdrawal
          </CustomText>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
            style={{ marginTop: theme.spacing.sm }}
          >
            Review withdrawal details before proceeding.
          </CustomText>

          <View style={{ marginTop: theme.spacing.xl }}>
          <View style={styles.modalRow}>
            <CustomText variant="caption" style={styles.modalLabel}>
              Asset
            </CustomText>
            <CustomText variant="body" fontWeight="semiBold">
              {assetSymbol}
            </CustomText>
          </View>

          <View style={styles.modalRow}>
            <CustomText variant="caption" style={styles.modalLabel}>
              Amount
            </CustomText>
            <CustomText variant="body" fontWeight="semiBold">
              {assetAmount.toFixed(assetAmount >= 1 ? 4 : 8)} {assetSymbol}
            </CustomText>
          </View>

          <View style={styles.modalRow}>
            <CustomText variant="caption" style={styles.modalLabel}>
              Est. USD
            </CustomText>
            <CustomText variant="body" fontWeight="semiBold">
              ${usdAmount.toFixed(2)}
            </CustomText>
          </View>

          <View style={styles.modalRow}>
            <CustomText variant="caption" style={styles.modalLabel}>
              Wallet
            </CustomText>
            <CustomText variant="caption" style={styles.modalAddressText}>
              {walletAddress}
            </CustomText>
          </View>
          </View>

          <View style={styles.modalButtonArea}>
            <Button disabled={isSubmitting} onPress={onConfirm}>
              {isSubmitting ? <ActivityIndicator color={theme.colors.white} /> : "Proceed Withdraw"}
            </Button>
            <Button color={theme.colors.textSecondary} disabled={isSubmitting} onPress={onClose}>
              Cancel
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WithdrawConfirmationModal;
