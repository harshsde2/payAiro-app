import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import CommonModal from "./CommonModal";
import GenericButton from "components/GenericButton";
import { SvgIcons } from "constants/svgs";

interface PaymentTypeSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (paymentType: "ach" | "rtp") => void;
  amount: string;
}

const PaymentTypeSelectionModal: React.FC<PaymentTypeSelectionModalProps> = ({
  isVisible,
  onClose,
  onSelect,
  amount,
}) => {
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const [selectedType, setSelectedType] = useState<"ach" | "rtp" | null>(null);

  const handleConfirm = () => {
    if (selectedType) {
      // Reset selection first
      const paymentType = selectedType;
      setSelectedType(null);
      
      // Close modal first
      onClose();
      
      // Then call onSelect after a brief delay to ensure modal closes
      setTimeout(() => {
        onSelect(paymentType);
      }, 100);
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  return (
    <CommonModal
      isVisible={isVisible}
      onClose={handleClose}
      isOnOutsidePressClose={true}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={styles.modalContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <CustomText variant="h4">Select Payment Method</CustomText>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <SvgIcons.CrossIcon width={50} height={50} />
          </TouchableOpacity>
        </View>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <CustomText variant="caption" color={theme.colors.text.secondary}>
            Withdrawal Amount
          </CustomText>
          <CustomText variant="h3" fontWeight="bold">
            ${amount}
          </CustomText>
        </View>

        {/* Payment Options */}
        <View style={styles.optionsContainer}>
          {/* ACH Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === "ach" && styles.selectedOptionCard,
            ]}
            onPress={() => setSelectedType("ach")}
          >
            <View style={styles.optionHeader}>
              <View style={styles.radioButton}>
                {selectedType === "ach" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <CustomText variant="subtitle1" fontWeight="semiBold">
                ACH Transfer
              </CustomText>
            </View>
            <CustomText
              variant="caption"
              color={theme.colors.text.secondary}
              style={styles.noteText}
            >
              Payment will take 2-3 days
            </CustomText>
          </TouchableOpacity>

          {/* RTP Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === "rtp" && styles.selectedOptionCard,
            ]}
            onPress={() => setSelectedType("rtp")}
          >
            <View style={styles.optionHeader}>
              <View style={styles.radioButton}>
                {selectedType === "rtp" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <CustomText variant="subtitle1" fontWeight="semiBold">
                Instant Transfer
              </CustomText>
            </View>
            <View style={styles.noteContainer}>
              <CustomText
                variant="caption"
                color={theme.colors.text.secondary}
                style={styles.noteText}
              >
                NOTE: If you select RTP, you have to pay a transaction fee
              </CustomText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <GenericButton
          title="Confirm"
          onPress={handleConfirm}
          disabled={!selectedType}
          cStyle={styles.confirmButton}
        />
      </Pressable>
    </CommonModal>
  );
};

export default PaymentTypeSelectionModal;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    modalContent: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: theme.spacing.spacing.lg,
      borderTopRightRadius: theme.spacing.spacing.lg,
      padding: theme.spacing.spacing.lg,
      paddingBottom: theme.spacing.spacing.xl,
      maxHeight: "80%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.spacing.lg,
    },
    closeButton: {
      padding: theme.spacing.spacing.xs,
    },
    amountContainer: {
      alignItems: "center",
      paddingVertical: theme.spacing.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.grey200,
      marginBottom: theme.spacing.spacing.lg,
    },
    optionsContainer: {
      gap: theme.spacing.spacing.md,
      marginBottom: theme.spacing.spacing.lg,
    },
    optionCard: {
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300,
      borderRadius: theme.spacing.spacing.md,
      padding: theme.spacing.spacing.md,
      backgroundColor: theme.colors.palette.grey250,
    },
    selectedOptionCard: {
      borderColor: theme.colors.palette.green700,
      backgroundColor: theme.colors.palette.green50,
    },
    optionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.spacing.xs,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.palette.grey400,
      marginRight: theme.spacing.spacing.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.palette.green700,
    },
    noteContainer: {
      marginTop: theme.spacing.spacing.xs,
    },
    noteText: {
      marginTop: theme.spacing.spacing.xs,
      lineHeight: 20,
    },
    confirmButton: {
      marginTop: theme.spacing.spacing.md,
    },
  });
